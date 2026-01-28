"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackgroundPage from '@/components/BackgroundPage';
import { messages, type Locale } from '@/lib/messages';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { formatEuro } from '@/lib/formatters';
import {
  getObjects,
  getExpenseCategories,
  getPaymentMethods,
  getGlobalExpenses,
  type PropertyObject,
  type ExpenseCategory,
  type PaymentMethod,
  type GlobalExpense,
} from '@/lib/supabase/services';
import { getUserTier } from '@/lib/subscription';

// Translations for Analysis page
const translations = {
  el: {
    title: "Οικονομική Ανάλυση",
    accessDenied: "Διαθέσιμο στο Standard ή Premium",
    upgradeButton: "Αναβάθμιση πλάνου",
    dateFrom: "Από",
    dateTo: "Έως",
    period: "Περίοδος",
    objectsSummary: "Συνολική Περίληψη Όλων των Έργων",
    totalContractPrices: "Συνολικό Ποσό Συμβατικών Τιμών",
    totalAdditionalWorks: "Συνολικό Ποσό Πρόσθετων Εργασιών",
    totalActualPrices: "Συνολικό Ποσό Πραγματικών Τιμών",
    totalBalance: "Συνολικό Υπόλοιπο",
    balance: "Υπόλοιπο",
    profit: "Κέρδος",
    statusOpen: "Ανοιχτό",
    statusClosed: "Κλειστό",
    totalDebt: "Οφειλή",
    allPaid: "Όλα πληρώθηκαν",
    totalOverpaid: "Υπερπληρωμή",
    globalExpensesTotal: "Γενικά Έξοδα",
    objectExpensesTotal: "Έξοδα ανά Έργο",
    totalProfit: "Συνολικό Κέρδος",
    profitStatus: "Κέρδος",
    lossStatus: "Ζημία",
    summaryPaymentAnalysis: "Συνολική Ανάλυση Πληρωμών",
    totalReceivedPayments: "Συνολικό Ποσό Εισπραχθεισών Πληρωμών",
    totalExpensePayments: "Συνολικό Ποσό Πληρωμών Εξόδων",
    income: "ΕΣΟΔΑ",
    receivedFromClients: "Λήφθηκαν από πελάτες",
    byPaymentMethod: "Ανά Τρόπο Πληρωμής",
    objectExpenses: "ΕΞΟΔΑ ΕΡΓΩΝ",
    globalExpenses: "ΓΕΝΙΚΑ ΕΞΟΔΑ",
    totalExpenses: "ΣΥΝΟΛΟ ΕΞΟΔΩΝ",
    result: "ΑΠΟΤΕΛΕΣΜΑ",
    netProfit: "Καθαρό κέρδος",
    clientDebts: "ΟΦΕΙΛΕΣ ΠΕΛΑΤΩΝ",
    totalOwed: "Συνολική οφειλή",
    objects: "ΕΡΓΑ",
    totalObjects: "Σύνολο",
    openObjects: "Ανοιχτά",
    closedObjects: "Κλειστά",
    closedInPeriod: "Κλεισμένα στην περίοδο",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Δεν υπάρχουν δεδομένα",
    loading: "Φόρτωση...",
    back: "← Πίσω",
    emailSent: "Η αναφορά εστάλη στο email σας!",
    emailError: "Σφάλμα αποστολής email",
    sendReport: "Αποστολή αναφοράς",
    emailRecipient: "Email παραλήπτη",
    selectFormat: "Επιλέξτε μορφή",
    send: "Αποστολή",
    cancel: "Ακύρωση",
  },
  ru: {
    title: "Финансовый Анализ",
    accessDenied: "Доступно в Standard или Premium",
    upgradeButton: "Улучшить план",
    dateFrom: "От",
    dateTo: "До",
    period: "Период",
    objectsSummary: "Общая Сводка по Всем Объектам",
    totalContractPrices: "Общая Сумма Договорных Цен",
    totalAdditionalWorks: "Общая Сумма Дополнительных Работ",
    totalActualPrices: "Общая Сумма Фактических Цен",
    totalBalance: "Общий Баланс",
    balance: "Баланс",
    profit: "Прибыль",
    statusOpen: "Открыт",
    statusClosed: "Закрыт",
    totalDebt: "Долг",
    allPaid: "Всё оплачено",
    totalOverpaid: "Переплата",
    globalExpensesTotal: "Общие Расходы",
    objectExpensesTotal: "Расходы по Объектам",
    totalProfit: "Общая Прибыль",
    profitStatus: "Прибыль",
    lossStatus: "Убыток",
    summaryPaymentAnalysis: "Суммарный Платежный Анализ",
    totalReceivedPayments: "Общая Сумма Поступивших Оплат",
    totalExpensePayments: "Общая Сумма Платежей по Расходам",
    income: "ДОХОДЫ",
    receivedFromClients: "Получено от клиентов",
    byPaymentMethod: "По способу оплаты",
    objectExpenses: "РАСХОДЫ ПО ОБЪЕКТАМ",
    globalExpenses: "ГЛОБАЛЬНЫЕ РАСХОДЫ",
    totalExpenses: "ВСЕГО РАСХОДОВ",
    result: "РЕЗУЛЬТАТ",
    netProfit: "Чистая прибыль",
    clientDebts: "ДОЛГИ КЛИЕНТОВ",
    totalOwed: "Всего должны",
    objects: "ОБЪЕКТЫ",
    totalObjects: "Всего объектов",
    openObjects: "Открытых",
    closedObjects: "Закрытых",
    closedInPeriod: "Закрыто за период",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Нет данных",
    loading: "Загрузка...",
    back: "← Назад",
    emailSent: "Отчёт отправлен на ваш email!",
    emailError: "Ошибка отправки email",
    sendReport: "Отправить отчёт",
    emailRecipient: "Email получателя",
    selectFormat: "Выберите формат",
    send: "Отправить",
    cancel: "Отмена",
  },
  en: {
    title: "Financial Analysis",
    accessDenied: "Available in Standard or Premium",
    upgradeButton: "Upgrade plan",
    dateFrom: "From",
    dateTo: "To",
    period: "Period",
    objectsSummary: "Overall Summary of All Objects",
    totalContractPrices: "Total Contract Prices",
    totalAdditionalWorks: "Total Additional Works",
    totalActualPrices: "Total Actual Prices",
    totalBalance: "Total Balance",
    balance: "Balance",
    profit: "Profit",
    statusOpen: "Open",
    statusClosed: "Closed",
    totalDebt: "Debt",
    allPaid: "All paid",
    totalOverpaid: "Overpaid",
    globalExpensesTotal: "Global Expenses",
    objectExpensesTotal: "Object Expenses",
    totalProfit: "Total Profit",
    profitStatus: "Profit",
    lossStatus: "Loss",
    summaryPaymentAnalysis: "Summary Payment Analysis",
    totalReceivedPayments: "Total Received Payments",
    totalExpensePayments: "Total Expense Payments",
    income: "INCOME",
    receivedFromClients: "Received from clients",
    byPaymentMethod: "By Payment Method",
    objectExpenses: "PROJECT EXPENSES",
    globalExpenses: "GLOBAL EXPENSES",
    totalExpenses: "TOTAL EXPENSES",
    result: "RESULT",
    netProfit: "Net profit",
    clientDebts: "CLIENT DEBTS",
    totalOwed: "Total owed",
    objects: "PROJECTS",
    totalObjects: "Total objects",
    openObjects: "Open",
    closedObjects: "Closed",
    closedInPeriod: "Closed in period",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "No data",
    loading: "Loading...",
    back: "← Back",
    emailSent: "Report sent to your email!",
    emailError: "Email sending error",
    sendReport: "Send Report",
    emailRecipient: "Recipient Email",
    selectFormat: "Select Format",
    send: "Send",
    cancel: "Cancel",
  },
  uk: {
    title: "Фінансовий Аналіз",
    accessDenied: "Доступно в Standard або Premium",
    upgradeButton: "Покращити план",
    dateFrom: "Від",
    dateTo: "До",
    period: "Період",
    objectsSummary: "Загальна Зведення по Всіх Об'єктах",
    totalContractPrices: "Загальна Сума Договірних Цін",
    totalAdditionalWorks: "Загальна Сума Додаткових Робіт",
    totalActualPrices: "Загальна Сума Фактичних Цін",
    totalBalance: "Загальний Баланс",
    balance: "Баланс",
    profit: "Прибуток",
    statusOpen: "Відкрито",
    statusClosed: "Закрито",
    totalDebt: "Борг",
    allPaid: "Все сплачено",
    totalOverpaid: "Переплата",
    income: "ДОХОДИ",
    receivedFromClients: "Отримано від клієнтів",
    byPaymentMethod: "За способом оплати",
    objectExpenses: "ВИТРАТИ ПО ОБ'ЄКТАХ",
    globalExpenses: "ГЛОБАЛЬНІ ВИТРАТИ",
    totalExpenses: "ВСЬОГО ВИТРАТ",
    result: "РЕЗУЛЬТАТ",
    netProfit: "Чистий прибуток",
    clientDebts: "БОРГИ КЛІЄНТІВ",
    totalOwed: "Всього боргу",
    objects: "ОБ'ЄКТИ",
    totalObjects: "Всього об'єктів",
    openObjects: "Відкритих",
    closedObjects: "Закритих",
    closedInPeriod: "Закрито за період",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Немає даних",
    loading: "Завантаження...",
    back: "← Назад",
    emailSent: "Звіт надіслано на вашу пошту!",
    emailError: "Помилка надсилання email",
    globalExpensesTotal: "Загальні Витрати",
    objectExpensesTotal: "Витрати по Об'єктах",
    totalProfit: "Загальний Прибуток",
    profitStatus: "Прибуток",
    lossStatus: "Збиток",
    summaryPaymentAnalysis: "Сумарний Платіжний Аналіз",
    totalReceivedPayments: "Загальна Сума Отриманих Оплат",
    totalExpensePayments: "Загальна Сума Платежів по Витратах",
    sendReport: "Надіслати звіт",
    emailRecipient: "Email отримувача",
    selectFormat: "Виберіть формат",
    send: "Надіслати",
    cancel: "Скасувати",
  },
  sq: {
    title: "Analiza Financiare",
    accessDenied: "E disponueshme në Standard ose Premium",
    upgradeButton: "Përmirëso planin",
    dateFrom: "Nga",
    dateTo: "Deri",
    period: "Periudha",
    objectsSummary: "Përmbledhje e Përgjithshme e të Gjitha Projekteve",
    totalContractPrices: "Shuma Totale e Çmimeve të Kontratës",
    totalAdditionalWorks: "Shuma Totale e Punëve Shtesë",
    totalActualPrices: "Shuma Totale e Çmimeve Aktuale",
    totalBalance: "Bilanci Total",
    balance: "Bilanci",
    profit: "Fitimi",
    statusOpen: "Hapur",
    statusClosed: "Mbyllur",
    totalDebt: "Borxhi",
    allPaid: "Të gjitha paguar",
    totalOverpaid: "Mbipagesë",
    income: "TË ARDHURAT",
    receivedFromClients: "Marrë nga klientët",
    byPaymentMethod: "Sipas metodës së pagesës",
    objectExpenses: "SHPENZIMET E PROJEKTEVE",
    globalExpenses: "SHPENZIMET GLOBALE",
    totalExpenses: "TOTALI I SHPENZIMEVE",
    result: "REZULTATI",
    netProfit: "Fitimi neto",
    clientDebts: "BORXHET E KLIENTËVE",
    totalOwed: "Totali i borxhit",
    objects: "PROJEKTET",
    totalObjects: "Totali i projekteve",
    openObjects: "Të hapura",
    closedObjects: "Të mbyllura",
    closedInPeriod: "Të mbyllura në periudhë",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Nuk ka të dhëna",
    loading: "Duke ngarkuar...",
    back: "← Prapa",
    emailSent: "Raporti u dërgua në email tuaj!",
    emailError: "Gabim në dërgimin e email",
    globalExpensesTotal: "Shpenzimet Globale",
    objectExpensesTotal: "Shpenzimet e Projekteve",
    totalProfit: "Fitimi Total",
    profitStatus: "Fitim",
    lossStatus: "Humbje",
    summaryPaymentAnalysis: "Analiza Përmbledhëse e Pagesave",
    totalReceivedPayments: "Shuma Totale e Pagesave të Marra",
    totalExpensePayments: "Shuma Totale e Pagesave të Shpenzimeve",
    sendReport: "Dërgo raportin",
    emailRecipient: "Email i marrësit",
    selectFormat: "Zgjidhni formatin",
    send: "Dërgo",
    cancel: "Anulo",
  },
  bg: {
    title: "Финансов Анализ",
    accessDenied: "Налично в Standard или Premium",
    upgradeButton: "Подобри плана",
    dateFrom: "От",
    dateTo: "До",
    period: "Период",
    objectsSummary: "Обща Сводка по Всички Обекти",
    totalContractPrices: "Обща Сума на Договорните Цени",
    totalAdditionalWorks: "Обща Сума на Допълнителните Работи",
    totalActualPrices: "Обща Сума на Фактическите Цени",
    totalBalance: "Общ Баланс",
    balance: "Баланс",
    profit: "Печалба",
    statusOpen: "Отворен",
    statusClosed: "Затворен",
    totalDebt: "Дълг",
    allPaid: "Всичко платено",
    totalOverpaid: "Надплащане",
    income: "ПРИХОДИ",
    receivedFromClients: "Получени от клиенти",
    byPaymentMethod: "По метод на плащане",
    objectExpenses: "РАЗХОДИ ПО ОБЕКТИ",
    globalExpenses: "ГЛОБАЛНИ РАЗХОДИ",
    totalExpenses: "ОБЩО РАЗХОДИ",
    result: "РЕЗУЛТАТ",
    netProfit: "Нетна печалба",
    clientDebts: "ДЪЛГОВЕ НА КЛИЕНТИ",
    totalOwed: "Общо дълг",
    objects: "ОБЕКТИ",
    totalObjects: "Общо обекти",
    openObjects: "Отворени",
    closedObjects: "Затворени",
    closedInPeriod: "Затворени за периода",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Няма данни",
    loading: "Зареждане...",
    back: "← Назад",
    emailSent: "Докладът е изпратен на вашия имейл!",
    emailError: "Грешка при изпращане на имейл",
    globalExpensesTotal: "Общи Разходи",
    objectExpensesTotal: "Разходи по Обекти",
    totalProfit: "Обща Печалба",
    profitStatus: "Печалба",
    lossStatus: "Загуба",
    summaryPaymentAnalysis: "Обобщен Анализ на Плащанията",
    totalReceivedPayments: "Обща Сума на Получени Плащания",
    totalExpensePayments: "Обща Сума на Плащания по Разходи",
    sendReport: "Изпрати доклад",
    emailRecipient: "Email на получателя",
    selectFormat: "Изберете формат",
    send: "Изпрати",
    cancel: "Отказ",
  },
  ro: {
    title: "Analiză Financiară",
    accessDenied: "Disponibil în Standard sau Premium",
    upgradeButton: "Îmbunătățește planul",
    dateFrom: "De la",
    dateTo: "Până la",
    period: "Perioada",
    objectsSummary: "Rezumat General al Tuturor Proiectelor",
    totalContractPrices: "Suma Totală a Prețurilor Contractuale",
    totalAdditionalWorks: "Suma Totală a Lucrărilor Suplimentare",
    totalActualPrices: "Suma Totală a Prețurilor Actuale",
    totalBalance: "Balanța Totală",
    balance: "Balanță",
    profit: "Profit",
    statusOpen: "Deschis",
    statusClosed: "Închis",
    totalDebt: "Datorie",
    allPaid: "Totul plătit",
    totalOverpaid: "Supraplată",
    income: "VENITURI",
    receivedFromClients: "Primite de la clienți",
    byPaymentMethod: "După metoda de plată",
    objectExpenses: "CHELTUIELI PROIECTE",
    globalExpenses: "CHELTUIELI GLOBALE",
    totalExpenses: "TOTAL CHELTUIELI",
    result: "REZULTAT",
    netProfit: "Profit net",
    clientDebts: "DATORII CLIENȚI",
    totalOwed: "Total datorie",
    objects: "PROIECTE",
    totalObjects: "Total proiecte",
    openObjects: "Deschise",
    closedObjects: "Închise",
    closedInPeriod: "Închise în perioadă",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Nu există date",
    loading: "Se încarcă...",
    back: "← Înapoi",
    emailSent: "Raportul a fost trimis pe email!",
    emailError: "Eroare la trimiterea email-ului",
    globalExpensesTotal: "Cheltuieli Globale",
    objectExpensesTotal: "Cheltuieli Proiecte",
    totalProfit: "Profit Total",
    profitStatus: "Profit",
    lossStatus: "Pierdere",
    summaryPaymentAnalysis: "Analiza Sumară a Plăților",
    totalReceivedPayments: "Suma Totală a Plăților Primite",
    totalExpensePayments: "Suma Totală a Plăților pentru Cheltuieli",
    sendReport: "Trimite raportul",
    emailRecipient: "Email destinatar",
    selectFormat: "Selectați formatul",
    send: "Trimite",
    cancel: "Anulare",
  },
  ar: {
    title: "التحليل المالي",
    accessDenied: "متاح في Standard أو Premium",
    upgradeButton: "ترقية الخطة",
    dateFrom: "من",
    dateTo: "إلى",
    period: "الفترة",
    objectsSummary: "ملخص عام لجميع المشاريع",
    totalContractPrices: "إجمالي أسعار العقود",
    totalAdditionalWorks: "إجمالي الأعمال الإضافية",
    totalActualPrices: "إجمالي الأسعار الفعلية",
    totalBalance: "الرصيد الإجمالي",
    balance: "الرصيد",
    profit: "الربح",
    statusOpen: "مفتوح",
    statusClosed: "مغلق",
    totalDebt: "الدين",
    allPaid: "تم الدفع بالكامل",
    totalOverpaid: "دفع زائد",
    income: "الدخل",
    receivedFromClients: "المستلم من العملاء",
    byPaymentMethod: "حسب طريقة الدفع",
    objectExpenses: "مصاريف المشاريع",
    globalExpenses: "المصاريف العامة",
    totalExpenses: "إجمالي المصاريف",
    result: "النتيجة",
    netProfit: "صافي الربح",
    clientDebts: "ديون العملاء",
    totalOwed: "إجمالي المستحق",
    objects: "المشاريع",
    totalObjects: "إجمالي المشاريع",
    openObjects: "مفتوحة",
    closedObjects: "مغلقة",
    closedInPeriod: "مغلقة في الفترة",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "لا توجد بيانات",
    loading: "جاري التحميل...",
    back: "← رجوع",
    emailSent: "تم إرسال التقرير إلى بريدك الإلكتروني!",
    emailError: "خطأ في إرسال البريد الإلكتروني",
    globalExpensesTotal: "المصاريف العامة",
    objectExpensesTotal: "مصاريف المشاريع",
    totalProfit: "إجمالي الربح",
    profitStatus: "ربح",
    lossStatus: "خسارة",
    summaryPaymentAnalysis: "تحليل المدفوعات الإجمالي",
    totalReceivedPayments: "إجمالي المدفوعات المستلمة",
    totalExpensePayments: "إجمالي مدفوعات المصروفات",
    sendReport: "إرسال التقرير",
    emailRecipient: "بريد المستلم",
    selectFormat: "اختر الصيغة",
    send: "إرسال",
    cancel: "إلغاء",
  },
};

// Types for analysis data
interface ObjectDetail {
  id: string;
  name: string;
  status: string;
  balance: number;
  profit: number;
}

interface AnalysisData {
  // New fields for design
  totalContractPrices: number;
  totalAdditionalWorks: number;
  totalActualPrices: number;
  totalBalance: number;
  objectsWithDetails: ObjectDetail[];

  // Income
  totalIncome: number;
  incomeByPaymentMethod: { [key: string]: number };

  // Object Expenses
  totalObjectExpenses: number;
  objectExpensesByCategory: { [key: string]: number };

  // Global Expenses
  totalGlobalExpenses: number;
  globalExpensesByCategory: { [key: string]: number };

  // Totals
  totalExpenses: number;
  expensesByPaymentMethod: { [key: string]: number };

  // Profit
  netProfit: number;

  // Debts
  totalDebts: number;
  debtsByObject: { objectName: string; debt: number }[];

  // Objects
  totalObjects: number;
  openObjects: number;
  closedObjects: number;
  closedInPeriod: number;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = translations[locale] || translations.el;
  const { user } = useAuth();

  // Date range state (default: current month)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [dateFrom, setDateFrom] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(lastDayOfMonth.toISOString().split('T')[0]);

  // Subscription state
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Data state
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Expanded state for summary
  const [expandedSummary, setExpandedSummary] = useState(false);

  // Expanded state for expenses blocks (blocks 9-10)
  const [expandedGlobalExpenses, setExpandedGlobalExpenses] = useState(false);
  const [expandedObjectExpenses, setExpandedObjectExpenses] = useState(false);

  // Expanded state for payment analysis blocks (blocks 13-14)
  const [expandedReceivedPayments, setExpandedReceivedPayments] = useState(false);
  const [expandedExpensePayments, setExpandedExpensePayments] = useState(false);

  // Expanded state for total balance block (block 8)
  const [expandedTotalBalance, setExpandedTotalBalance] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');

  // Check subscription and load data
  useEffect(() => {
    const checkSubscriptionAndLoadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Get user profile with subscription info
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, subscription_status, subscription_tier, account_purchased, demo_expires_at, subscription_expires_at, vip_expires_at, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Use getUserTier to properly detect VIP status
          const userTier = getUserTier(profile);
          setSubscriptionPlan(userTier);
          setUserEmail(profile.email || '');

          // Check if user has Demo, Basic, Standard, Premium or VIP
          const hasAccess = ['demo', 'basic', 'standard', 'premium', 'vip'].includes(userTier);
          setHasAccess(hasAccess);

          if (hasAccess) {
            await loadAnalysisData();
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionAndLoadData();
  }, [user?.id]);

  // Reload data when date range changes
  useEffect(() => {
    if (hasAccess && user?.id) {
      loadAnalysisData();
    }
  }, [dateFrom, dateTo, hasAccess, user?.id]);

  const loadAnalysisData = async () => {
    if (!user?.id) return;

    try {
      const supabase = createClient();

      // Load all required data in parallel
      const [
        objectsData,
        categoriesData,
        paymentMethodsData,
        globalExpensesData,
      ] = await Promise.all([
        getObjects(user.id),
        getExpenseCategories(user.id),
        getPaymentMethods(user.id),
        getGlobalExpenses(user.id),
      ]);

      setPaymentMethods(paymentMethodsData);
      setCategories(categoriesData);

      // Get all object IDs for this user
      const objectIds = objectsData.map(obj => obj.id);

      // Fetch object payments, expenses, and extras for the date range
      const { data: objectPaymentsData } = await supabase
        .from('object_payments')
        .select('*, objects!inner(user_id)')
        .in('object_id', objectIds.length > 0 ? objectIds : [''])
        .gte('date', dateFrom)
        .lte('date', dateTo);

      const { data: objectExpensesData } = await supabase
        .from('object_expenses')
        .select('*, objects!inner(user_id)')
        .in('object_id', objectIds.length > 0 ? objectIds : [''])
        .gte('date', dateFrom)
        .lte('date', dateTo);

      const { data: objectExtrasData } = await supabase
        .from('object_extras')
        .select('*, objects!inner(user_id)')
        .in('object_id', objectIds.length > 0 ? objectIds : ['']);

      // Filter global expenses by date
      const filteredGlobalExpenses = globalExpensesData.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= new Date(dateFrom) && expDate <= new Date(dateTo);
      });

      // Calculate income (from client payments)
      let totalIncome = 0;
      const incomeByPaymentMethod: { [key: string]: number } = {};

      (objectPaymentsData || []).forEach((payment: any) => {
        totalIncome += Number(payment.amount) || 0;
        const pmId = payment.payment_method_id || 'unknown';
        incomeByPaymentMethod[pmId] = (incomeByPaymentMethod[pmId] || 0) + (Number(payment.amount) || 0);
      });

      // Calculate object expenses
      let totalObjectExpenses = 0;
      const objectExpensesByCategory: { [key: string]: number } = {};
      const expensesByPaymentMethod: { [key: string]: number } = {};

      (objectExpensesData || []).forEach((expense: any) => {
        totalObjectExpenses += Number(expense.amount) || 0;
        const catId = expense.category_id || 'unknown';
        objectExpensesByCategory[catId] = (objectExpensesByCategory[catId] || 0) + (Number(expense.amount) || 0);

        const pmId = expense.payment_method_id || 'unknown';
        expensesByPaymentMethod[pmId] = (expensesByPaymentMethod[pmId] || 0) + (Number(expense.amount) || 0);
      });

      // Calculate global expenses
      let totalGlobalExpenses = 0;
      const globalExpensesByCategory: { [key: string]: number } = {};

      filteredGlobalExpenses.forEach((expense: GlobalExpense) => {
        totalGlobalExpenses += Number(expense.amount) || 0;
        const catId = expense.category_id || 'unknown';
        globalExpensesByCategory[catId] = (globalExpensesByCategory[catId] || 0) + (Number(expense.amount) || 0);

        const pmId = expense.payment_method_id || 'unknown';
        expensesByPaymentMethod[pmId] = (expensesByPaymentMethod[pmId] || 0) + (Number(expense.amount) || 0);
      });

      // Calculate totals
      const totalExpenses = totalObjectExpenses + totalGlobalExpenses;
      const netProfit = totalIncome - totalExpenses;

      // Calculate new design fields
      let totalContractPrices = 0;
      let totalAdditionalWorks = 0;
      let totalDebts = 0;
      const debtsByObject: { objectName: string; debt: number }[] = [];
      const objectsWithDetails: ObjectDetail[] = [];

      // Sum all extras
      totalAdditionalWorks = (objectExtrasData || [])
        .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

      for (const obj of objectsData) {
        const contractPrice = Number(obj.contract_price) || 0;
        totalContractPrices += contractPrice;

        // Sum extras for this object
        const objExtras = (objectExtrasData || [])
          .filter((e: any) => e.object_id === obj.id)
          .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

        // Sum all payments for this object (not just in period)
        const { data: allPayments } = await supabase
          .from('object_payments')
          .select('amount')
          .eq('object_id', obj.id);

        const objPayments = (allPayments || [])
          .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

        // Sum all expenses for this object
        const { data: allObjExpenses } = await supabase
          .from('object_expenses')
          .select('amount')
          .eq('object_id', obj.id);

        const objExpensesTotal = (allObjExpenses || [])
          .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

        // Calculate object balance (remaining to pay)
        const objActualPrice = contractPrice + objExtras;
        const objBalance = objActualPrice - objPayments;

        // Calculate object profit
        const objProfit = objActualPrice - objExpensesTotal;

        // Add to objects with details
        objectsWithDetails.push({
          id: obj.id,
          name: obj.name,
          status: obj.status,
          balance: objBalance,
          profit: objProfit,
        });

        // Track debts
        if (objBalance > 0.01) {
          totalDebts += objBalance;
          debtsByObject.push({ objectName: obj.name, debt: objBalance });
        }
      }

      // Calculate totals
      const totalActualPrices = totalContractPrices + totalAdditionalWorks;
      const totalBalance = totalActualPrices - totalIncome;

      // Calculate objects stats
      const totalObjects = objectsData.length;
      const openObjects = objectsData.filter(obj => obj.status === 'open').length;
      const closedObjects = objectsData.filter(obj => obj.status === 'closed').length;

      // Closed in period
      const closedInPeriod = objectsData.filter(obj => {
        if (obj.status !== 'closed') return false;
        const updatedAt = new Date(obj.updated_at);
        return updatedAt >= new Date(dateFrom) && updatedAt <= new Date(dateTo);
      }).length;

      setAnalysisData({
        // New design fields
        totalContractPrices,
        totalAdditionalWorks,
        totalActualPrices,
        totalBalance,
        objectsWithDetails,
        // Original fields
        totalIncome,
        incomeByPaymentMethod,
        totalObjectExpenses,
        objectExpensesByCategory,
        totalGlobalExpenses,
        globalExpensesByCategory,
        totalExpenses,
        expensesByPaymentMethod,
        netProfit,
        totalDebts,
        debtsByObject,
        totalObjects,
        openObjects,
        closedObjects,
        closedInPeriod,
      });

    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    if (categoryId === 'unknown') return 'Unknown';
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return categoryId;
    // Handle multilingual name
    if (typeof cat.name === 'string') return cat.name;
    return (cat.name as any)?.[locale] || (cat.name as any)?.el || (cat.name as any)?.en || 'Unknown';
  };

  // Get payment method name by ID
  const getPaymentMethodName = (pmId: string): string => {
    if (pmId === 'unknown') return 'Unknown';
    const pm = paymentMethods.find(p => p.id === pmId);
    return pm?.name || pmId;
  };

  // Export to Excel
  const handleExportExcel = async () => {
    if (!analysisData) return;
    setIsExporting(true);

    try {
      // Dynamic import XLSX
      const XLSX = (await import('xlsx')).default;

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        [t.title, `${dateFrom} - ${dateTo}`],
        [],
        [t.income, formatEuro(analysisData.totalIncome)],
        [t.totalExpenses, formatEuro(analysisData.totalExpenses)],
        [t.netProfit, formatEuro(analysisData.netProfit)],
        [t.totalOwed, formatEuro(analysisData.totalDebts)],
        [],
        [t.totalObjects, analysisData.totalObjects],
        [t.openObjects, analysisData.openObjects],
        [t.closedInPeriod, analysisData.closedInPeriod],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // Income by payment method
      const incomeData = [
        [t.byPaymentMethod, t.income],
        ...Object.entries(analysisData.incomeByPaymentMethod).map(([pmId, amount]) => [
          getPaymentMethodName(pmId),
          formatEuro(amount),
        ]),
      ];
      const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
      XLSX.utils.book_append_sheet(wb, incomeSheet, 'Income');

      // Object expenses by category
      const objExpensesData = [
        [t.objectExpenses, ''],
        ...Object.entries(analysisData.objectExpensesByCategory).map(([catId, amount]) => [
          getCategoryName(catId),
          formatEuro(amount),
        ]),
      ];
      const objExpensesSheet = XLSX.utils.aoa_to_sheet(objExpensesData);
      XLSX.utils.book_append_sheet(wb, objExpensesSheet, 'Object Expenses');

      // Global expenses by category
      const globalExpensesData = [
        [t.globalExpenses, ''],
        ...Object.entries(analysisData.globalExpensesByCategory).map(([catId, amount]) => [
          getCategoryName(catId),
          formatEuro(amount),
        ]),
      ];
      const globalExpensesSheet = XLSX.utils.aoa_to_sheet(globalExpensesData);
      XLSX.utils.book_append_sheet(wb, globalExpensesSheet, 'Global Expenses');

      // Client debts
      const debtsData = [
        [t.clientDebts, ''],
        ...analysisData.debtsByObject.map(d => [d.objectName, formatEuro(d.debt)]),
      ];
      const debtsSheet = XLSX.utils.aoa_to_sheet(debtsData);
      XLSX.utils.book_append_sheet(wb, debtsSheet, 'Debts');

      // Download
      XLSX.writeFile(wb, `analysis_${dateFrom}_${dateTo}.xlsx`);

    } catch (error) {
      console.error('Export Excel error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleExportPdf = async () => {
    if (!analysisData) return;
    setIsExporting(true);

    try {
      // Dynamic import jsPDF
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF();
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.text(t.title, 20, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(`${dateFrom} - ${dateTo}`, 20, y);
      y += 15;

      // Summary
      doc.setFontSize(14);
      doc.text(`${t.income}: ${formatEuro(analysisData.totalIncome)}`, 20, y);
      y += 8;
      doc.text(`${t.totalExpenses}: ${formatEuro(analysisData.totalExpenses)}`, 20, y);
      y += 8;
      doc.text(`${t.netProfit}: ${formatEuro(analysisData.netProfit)}`, 20, y);
      y += 8;
      doc.text(`${t.totalOwed}: ${formatEuro(analysisData.totalDebts)}`, 20, y);
      y += 15;

      // Objects
      doc.text(`${t.totalObjects}: ${analysisData.totalObjects}`, 20, y);
      y += 8;
      doc.text(`${t.openObjects}: ${analysisData.openObjects}`, 20, y);
      y += 8;
      doc.text(`${t.closedInPeriod}: ${analysisData.closedInPeriod}`, 20, y);
      y += 15;

      // Income by payment method
      doc.setFontSize(12);
      doc.text(t.byPaymentMethod + ':', 20, y);
      y += 8;
      Object.entries(analysisData.incomeByPaymentMethod).forEach(([pmId, amount]) => {
        doc.text(`  ${getPaymentMethodName(pmId)}: ${formatEuro(amount)}`, 20, y);
        y += 6;
      });
      y += 10;

      // Object expenses
      doc.text(t.objectExpenses + ':', 20, y);
      y += 8;
      Object.entries(analysisData.objectExpensesByCategory).forEach(([catId, amount]) => {
        doc.text(`  ${getCategoryName(catId)}: ${formatEuro(amount)}`, 20, y);
        y += 6;
      });
      y += 10;

      // Global expenses
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(t.globalExpenses + ':', 20, y);
      y += 8;
      Object.entries(analysisData.globalExpensesByCategory).forEach(([catId, amount]) => {
        doc.text(`  ${getCategoryName(catId)}: ${formatEuro(amount)}`, 20, y);
        y += 6;
      });

      // Download
      doc.save(`analysis_${dateFrom}_${dateTo}.pdf`);

    } catch (error) {
      console.error('Export PDF error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Send email report
  const handleSendEmail = async () => {
    if (!analysisData || !userEmail) return;
    setIsExporting(true);

    try {
      const response = await fetch('/api/send-analysis-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          dateFrom,
          dateTo,
          data: analysisData,
          locale,
        }),
      });

      if (response.ok) {
        alert(t.emailSent);
      } else {
        alert(t.emailError);
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert(t.emailError);
    } finally {
      setIsExporting(false);
    }
  };

  // Send report email with format selection
  const handleSendReportEmail = async () => {
    if (!analysisData || !emailTo) return;
    setIsExporting(true);

    try {
      const response = await fetch('/api/send-analysis-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTo,
          dateFrom,
          dateTo,
          data: analysisData,
          locale,
          format: reportFormat,
        }),
      });

      if (response.ok) {
        setShowEmailModal(false);
        alert(t.emailSent);
      } else {
        alert(t.emailError);
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert(t.emailError);
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <BackgroundPage pageIndex={5}>
        <div className="min-h-screen flex items-center justify-center">
          <p style={{ color: 'var(--polar)' }}>{t.loading}</p>
        </div>
      </BackgroundPage>
    );
  }

  // Access denied for Basic plan
  if (!hasAccess) {
    return (
      <BackgroundPage pageIndex={5}>
        <div className="flex flex-col items-center gap-8" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>
          {/* Back */}
          <p
            onClick={() => router.push(`/${locale}/page-pay`)}
            className="text-button cursor-pointer w-full"
            style={{ color: 'var(--polar)' }}
          >
            {t.back}
          </p>

          {/* Title */}
          <div
            className="w-full text-button flex items-center justify-center text-center"
            style={{
              minHeight: '52px',
              borderRadius: '1rem',
              backgroundColor: 'var(--deep-teal)',
              color: 'var(--zanah)',
              boxShadow: '0 4px 8px var(--zanah)',
            }}
          >
            📊 {t.title}
          </div>

          {/* Access Denied Message */}
          <div
            className="w-full p-6 rounded-2xl text-center"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <p className="text-xl mb-4" style={{ color: 'var(--deep-teal)' }}>
              🔒
            </p>
            <p className="text-lg font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.accessDenied}
            </p>
            <button
              onClick={() => router.push(`/${locale}/subscription`)}
              className="btn-primary text-button w-full"
              style={{
                minHeight: '52px',
                backgroundColor: '#ff8f0a',
                color: 'white',
                boxShadow: '0 4px 8px rgba(255, 143, 10, 0.4)',
              }}
            >
              {t.upgradeButton}
            </button>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // Format date for display (DD.MM.YYYY)
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'el' ? 'el-GR' : locale === 'ru' ? 'ru-RU' : 'en-GB');
  };

  // Get balance status
  const getBalanceStatus = (balance: number) => {
    if (balance > 0.01) return 'debt';
    if (balance < -0.01) return 'overpaid';
    return 'closed';
  };

  return (
    <BackgroundPage specialPage="objekt">
      <div className="min-h-screen flex flex-col gap-12" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>
        {/* 1. Back */}
        <p
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="text-button cursor-pointer"
          style={{ color: 'var(--polar)' }}
        >
          {t.back}
        </p>

        {/* 2. Title */}
        <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
          {t.title}
        </h1>

        {/* 3. Period Selector */}
        <div
          className="btn-universal w-full flex items-center justify-center gap-3 flex-wrap"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', padding: '12px 16px' }}
        >
          <span style={{ fontSize: '20px' }}>📅</span>
          <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>{t.period}:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1 rounded-xl text-center"
            style={{ backgroundColor: 'var(--polar)', color: 'var(--orange)', fontWeight: 700, border: 'none', minWidth: '130px' }}
          />
          <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1 rounded-xl text-center"
            style={{ backgroundColor: 'var(--polar)', color: 'var(--orange)', fontWeight: 700, border: 'none', minWidth: '130px' }}
          />
        </div>

        {analysisData && (
          <>
            {/* 4. Objects Summary Block */}
            <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
              {/* Header */}
              <button
                onClick={() => setExpandedSummary(!expandedSummary)}
                className="w-full flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '20px' }}>📊</span>
                  <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                    {t.objectsSummary}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                    {t.totalObjects}: {analysisData.totalObjects}
                  </span>
                  <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                    {expandedSummary ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Counters */}
              <div className="flex justify-center gap-6 mt-4">
                <span className="text-sm" style={{ color: 'var(--deep-teal)' }}>
                  {t.openObjects}: <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{analysisData.openObjects}</span>
                </span>
                <span className="text-sm" style={{ color: 'var(--deep-teal)' }}>
                  {t.closedObjects}: <span style={{ color: '#25D366', fontWeight: 700 }}>{analysisData.closedObjects}</span>
                </span>
              </div>

              {/* Expanded Objects List */}
              {expandedSummary && analysisData.objectsWithDetails.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--deep-teal)' }}>
                  {analysisData.objectsWithDetails.map((obj, index) => (
                    <div
                      key={obj.id}
                      className="rounded-2xl"
                      style={{ backgroundColor: 'var(--zanah)', padding: '16px 20px' }}
                    >
                      {/* First row: №, Name, Status */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
                            №{index + 1}
                          </span>
                          <span style={{ color: 'var(--orange)', fontWeight: 700 }}>
                            {obj.name}
                          </span>
                        </div>
                        <span
                          className="text-sm font-semibold px-2 py-1 rounded-lg"
                          style={{
                            backgroundColor: obj.status === 'closed' ? '#25D366' : 'var(--orange)',
                            color: 'white'
                          }}
                        >
                          {obj.status === 'closed' ? t.statusClosed : t.statusOpen}
                        </span>
                      </div>
                      {/* Second row: Balance, Profit */}
                      <div className="flex justify-between mt-2 flex-wrap gap-2">
                        <span style={{ color: 'var(--deep-teal)' }}>
                          {t.balance}: <span style={{ fontWeight: 700 }}>{formatEuro(obj.balance)}</span>
                        </span>
                        <span style={{ color: 'var(--deep-teal)' }}>
                          {t.profit}: <span style={{ fontWeight: 700 }}>{formatEuro(obj.profit)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {expandedSummary && analysisData.objectsWithDetails.length === 0 && (
                <p className="text-center mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)', color: 'var(--orange)' }}>
                  {t.noData}
                </p>
              )}
            </div>

            {/* 5. Total Contract Prices */}
            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
                {t.totalContractPrices}
              </h2>
              <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
                {formatEuro(analysisData.totalContractPrices)}
              </p>
            </div>

            {/* 6. Total Additional Works */}
            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
                {t.totalAdditionalWorks}
              </h2>
              <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
                {formatEuro(analysisData.totalAdditionalWorks)}
              </p>
            </div>

            {/* 7. Total Actual Prices */}
            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
                {t.totalActualPrices}
              </h2>
              <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
                {formatEuro(analysisData.totalActualPrices)}
              </p>
            </div>

            {/* 8. Total Balance - Expandable with Debtors */}
            <div
              className="rounded-2xl"
              style={{
                backgroundColor: getBalanceStatus(analysisData.totalBalance) === 'debt' ? '#ff6a1a' :
                                 getBalanceStatus(analysisData.totalBalance) === 'closed' ? '#25D366' : 'var(--zanah)',
                padding: '16px 20px'
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedTotalBalance(!expandedTotalBalance)}
                className="w-full flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '20px' }}>💰</span>
                  <span
                    className="font-bold"
                    style={{
                      color: getBalanceStatus(analysisData.totalBalance) === 'overpaid' ? 'var(--deep-teal)' : 'white',
                      fontSize: '16px'
                    }}
                  >
                    {t.totalBalance}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color: getBalanceStatus(analysisData.totalBalance) === 'overpaid' ? 'var(--deep-teal)' : 'white'
                    }}
                  >
                    {formatEuro(analysisData.totalBalance)}
                  </span>
                  <span
                    style={{
                      color: getBalanceStatus(analysisData.totalBalance) === 'overpaid' ? 'var(--deep-teal)' : 'white',
                      fontSize: '18px'
                    }}
                  >
                    {expandedTotalBalance ? '▲' : '▼'}
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: getBalanceStatus(analysisData.totalBalance) === 'overpaid' ? 'var(--deep-teal)' : 'white'
                  }}
                >
                  {getBalanceStatus(analysisData.totalBalance) === 'debt' ? t.totalDebt :
                   getBalanceStatus(analysisData.totalBalance) === 'closed' ? t.allPaid : t.totalOverpaid}
                </span>
              </button>

              {/* Expanded Debtors List */}
              {expandedTotalBalance && analysisData.debtsByObject.length > 0 && (
                <div
                  className="mt-4 pt-4 border-t space-y-3"
                  style={{
                    borderColor: getBalanceStatus(analysisData.totalBalance) === 'overpaid' ? 'var(--deep-teal)' : 'rgba(255,255,255,0.3)'
                  }}
                >
                  {analysisData.debtsByObject.map((debtor, index) => (
                    <div
                      key={index}
                      className="rounded-2xl flex justify-between items-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px 16px' }}
                    >
                      <span style={{ color: 'white', fontWeight: 600 }}>
                        {debtor.objectName}
                      </span>
                      <span style={{ color: 'white', fontWeight: 700 }}>
                        {formatEuro(debtor.debt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {expandedTotalBalance && analysisData.debtsByObject.length === 0 && (
                <p
                  className="text-center mt-4 pt-4 border-t"
                  style={{
                    borderColor: getBalanceStatus(analysisData.totalBalance) === 'overpaid' ? 'var(--deep-teal)' : 'rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  {t.allPaid}
                </p>
              )}
            </div>

            {/* 9. Global Expenses Block - Expandable by Category */}
            <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
              {/* Header */}
              <button
                onClick={() => setExpandedGlobalExpenses(!expandedGlobalExpenses)}
                className="w-full flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '20px' }}>💸</span>
                  <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                    {t.globalExpensesTotal}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
                    {formatEuro(analysisData.totalGlobalExpenses)}
                  </span>
                  <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                    {expandedGlobalExpenses ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded Categories List */}
              {expandedGlobalExpenses && Object.keys(analysisData.globalExpensesByCategory).length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--deep-teal)' }}>
                  {Object.entries(analysisData.globalExpensesByCategory).map(([catId, amount]) => (
                    <div
                      key={catId}
                      className="rounded-2xl flex justify-between items-center"
                      style={{ backgroundColor: 'var(--zanah)', padding: '12px 16px' }}
                    >
                      <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
                        {getCategoryName(catId)}
                      </span>
                      <span style={{ color: 'var(--orange)', fontWeight: 700 }}>
                        {formatEuro(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {expandedGlobalExpenses && Object.keys(analysisData.globalExpensesByCategory).length === 0 && (
                <p className="text-center mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)', color: 'var(--orange)' }}>
                  {t.noData}
                </p>
              )}
            </div>

            {/* 10. Object Expenses Block - Expandable by Category */}
            <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
              {/* Header */}
              <button
                onClick={() => setExpandedObjectExpenses(!expandedObjectExpenses)}
                className="w-full flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '20px' }}>💸</span>
                  <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                    {t.objectExpensesTotal}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
                    {formatEuro(analysisData.totalObjectExpenses)}
                  </span>
                  <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                    {expandedObjectExpenses ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded Categories List */}
              {expandedObjectExpenses && Object.keys(analysisData.objectExpensesByCategory).length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--deep-teal)' }}>
                  {Object.entries(analysisData.objectExpensesByCategory).map(([catId, amount]) => (
                    <div
                      key={catId}
                      className="rounded-2xl flex justify-between items-center"
                      style={{ backgroundColor: 'var(--zanah)', padding: '12px 16px' }}
                    >
                      <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
                        {getCategoryName(catId)}
                      </span>
                      <span style={{ color: 'var(--orange)', fontWeight: 700 }}>
                        {formatEuro(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {expandedObjectExpenses && Object.keys(analysisData.objectExpensesByCategory).length === 0 && (
                <p className="text-center mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)', color: 'var(--orange)' }}>
                  {t.noData}
                </p>
              )}
            </div>

            {/* 11. Total Profit Block - Balance Style */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                backgroundColor: analysisData.netProfit >= 0 ? '#25D366' : '#ff6a1a'
              }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: 'white' }}
              >
                {t.totalProfit}
              </h2>
              <p
                className="text-3xl font-bold"
                style={{ color: 'white' }}
              >
                {formatEuro(analysisData.netProfit)}
              </p>
              <p
                className="text-2xl font-bold mt-2"
                style={{ color: 'white' }}
              >
                {analysisData.netProfit >= 0 ? t.profitStatus : t.lossStatus}
              </p>
            </div>

            {/* 12. Summary Payment Analysis - Section Title */}
            <h2
              className="text-xl font-bold text-center"
              style={{ color: 'var(--polar)' }}
            >
              {t.summaryPaymentAnalysis}
            </h2>

            {/* 13. Total Received Payments Block - Expandable by Payment Method */}
            <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
              {/* Header */}
              <button
                onClick={() => setExpandedReceivedPayments(!expandedReceivedPayments)}
                className="w-full flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '20px' }}>💰</span>
                  <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                    {t.totalReceivedPayments}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--deep-teal)' }}>
                    {formatEuro(analysisData.totalIncome)}
                  </span>
                  <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                    {expandedReceivedPayments ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded Payment Methods List */}
              {expandedReceivedPayments && Object.keys(analysisData.incomeByPaymentMethod).length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--deep-teal)' }}>
                  {Object.entries(analysisData.incomeByPaymentMethod).map(([pmId, amount]) => (
                    <div
                      key={pmId}
                      className="rounded-2xl flex justify-between items-center"
                      style={{ backgroundColor: 'var(--zanah)', padding: '12px 16px' }}
                    >
                      <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
                        {getPaymentMethodName(pmId)}
                      </span>
                      <span style={{ color: 'var(--deep-teal)', fontWeight: 700 }}>
                        {formatEuro(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {expandedReceivedPayments && Object.keys(analysisData.incomeByPaymentMethod).length === 0 && (
                <p className="text-center mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)', color: 'var(--orange)' }}>
                  {t.noData}
                </p>
              )}
            </div>

            {/* 14. Total Expense Payments Block - Expandable by Payment Method */}
            <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
              {/* Header */}
              <button
                onClick={() => setExpandedExpensePayments(!expandedExpensePayments)}
                className="w-full flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '20px' }}>💸</span>
                  <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                    {t.totalExpensePayments}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
                    {formatEuro(analysisData.totalExpenses)}
                  </span>
                  <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                    {expandedExpensePayments ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded Payment Methods List */}
              {expandedExpensePayments && Object.keys(analysisData.expensesByPaymentMethod).length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--deep-teal)' }}>
                  {Object.entries(analysisData.expensesByPaymentMethod).map(([pmId, amount]) => (
                    <div
                      key={pmId}
                      className="rounded-2xl flex justify-between items-center"
                      style={{ backgroundColor: 'var(--zanah)', padding: '12px 16px' }}
                    >
                      <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
                        {getPaymentMethodName(pmId)}
                      </span>
                      <span style={{ color: 'var(--orange)', fontWeight: 700 }}>
                        {formatEuro(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {expandedExpensePayments && Object.keys(analysisData.expensesByPaymentMethod).length === 0 && (
                <p className="text-center mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)', color: 'var(--orange)' }}>
                  {t.noData}
                </p>
              )}
            </div>

            {/* Original blocks below - keeping for additional info */}

            {/* Income Block */}
            <div className="w-full rounded-2xl p-4" style={{ backgroundColor: 'var(--zanah)' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                💰 {t.income}
              </h3>
              <p className="text-2xl font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                {formatEuro(analysisData.totalIncome)}
              </p>
              <p className="text-sm mb-2" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
                {t.byPaymentMethod}:
              </p>
              <div className="space-y-1">
                {Object.entries(analysisData.incomeByPaymentMethod).map(([pmId, amount]) => (
                  <div key={pmId} className="flex justify-between text-sm" style={{ color: 'var(--deep-teal)' }}>
                    <span>{getPaymentMethodName(pmId)}</span>
                    <span>{formatEuro(amount)}</span>
                  </div>
                ))}
                {Object.keys(analysisData.incomeByPaymentMethod).length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.6 }}>{t.noData}</p>
                )}
              </div>
            </div>

            {/* Object Expenses Block */}
            <div className="w-full rounded-2xl p-4" style={{ backgroundColor: 'var(--polar)' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                💸 {t.objectExpenses}
              </h3>
              <p className="text-2xl font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                {formatEuro(analysisData.totalObjectExpenses)}
              </p>
              <div className="space-y-1">
                {Object.entries(analysisData.objectExpensesByCategory).map(([catId, amount]) => (
                  <div key={catId} className="flex justify-between text-sm" style={{ color: 'var(--deep-teal)' }}>
                    <span>{getCategoryName(catId)}</span>
                    <span>{formatEuro(amount)}</span>
                  </div>
                ))}
                {Object.keys(analysisData.objectExpensesByCategory).length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.6 }}>{t.noData}</p>
                )}
              </div>
            </div>

            {/* Global Expenses Block */}
            <div className="w-full rounded-2xl p-4" style={{ backgroundColor: 'var(--polar)' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                💸 {t.globalExpenses}
              </h3>
              <p className="text-2xl font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                {formatEuro(analysisData.totalGlobalExpenses)}
              </p>
              <div className="space-y-1">
                {Object.entries(analysisData.globalExpensesByCategory).map(([catId, amount]) => (
                  <div key={catId} className="flex justify-between text-sm" style={{ color: 'var(--deep-teal)' }}>
                    <span>{getCategoryName(catId)}</span>
                    <span>{formatEuro(amount)}</span>
                  </div>
                ))}
                {Object.keys(analysisData.globalExpensesByCategory).length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.6 }}>{t.noData}</p>
                )}
              </div>
            </div>

            {/* Total Expenses Block */}
            <div className="w-full rounded-2xl p-4" style={{ backgroundColor: 'var(--polar)' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                💸 {t.totalExpenses}
              </h3>
              <p className="text-2xl font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                {formatEuro(analysisData.totalExpenses)}
              </p>
              <p className="text-sm mb-2" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
                {t.byPaymentMethod}:
              </p>
              <div className="space-y-1">
                {Object.entries(analysisData.expensesByPaymentMethod).map(([pmId, amount]) => (
                  <div key={pmId} className="flex justify-between text-sm" style={{ color: 'var(--deep-teal)' }}>
                    <span>{getPaymentMethodName(pmId)}</span>
                    <span>{formatEuro(amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Block */}
            <div
              className="w-full rounded-2xl p-4"
              style={{
                backgroundColor: analysisData.netProfit >= 0 ? 'var(--zanah)' : '#ff6a1a',
              }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ color: analysisData.netProfit >= 0 ? 'var(--deep-teal)' : 'white' }}>
                📊 {t.result}
              </h3>
              <p className="text-sm mb-2" style={{ color: analysisData.netProfit >= 0 ? 'var(--deep-teal)' : 'white', opacity: 0.8 }}>
                {t.netProfit}:
              </p>
              <p className="text-3xl font-bold" style={{ color: analysisData.netProfit >= 0 ? 'var(--deep-teal)' : 'white' }}>
                {formatEuro(analysisData.netProfit)}
              </p>
            </div>

            {/* Client Debts Block */}
            <div className="w-full rounded-2xl p-4" style={{ backgroundColor: 'var(--polar)' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                ⏳ {t.clientDebts}
              </h3>
              <p className="text-2xl font-bold mb-3" style={{ color: '#ff6a1a' }}>
                {formatEuro(analysisData.totalDebts)}
              </p>
              {analysisData.debtsByObject.length > 0 && (
                <div className="space-y-1 mt-2">
                  {analysisData.debtsByObject.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex justify-between text-sm" style={{ color: 'var(--deep-teal)' }}>
                      <span>{d.objectName}</span>
                      <span>{formatEuro(d.debt)}</span>
                    </div>
                  ))}
                  {analysisData.debtsByObject.length > 5 && (
                    <p className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.6 }}>
                      +{analysisData.debtsByObject.length - 5} more...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Objects Block */}
            <div className="w-full rounded-2xl p-4" style={{ backgroundColor: 'var(--polar)' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                📦 {t.objects}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--deep-teal)' }}>
                    {analysisData.totalObjects}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                    {t.totalObjects}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--zanah)' }}>
                    {analysisData.openObjects}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                    {t.openObjects}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#ff6a1a' }}>
                    {analysisData.closedInPeriod}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                    {t.closedInPeriod}
                  </p>
                </div>
              </div>
            </div>

            {/* Send Report Button */}
            <button
              onClick={() => {
                setEmailTo(userEmail);
                setShowEmailModal(true);
              }}
              disabled={isExporting}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)'
              }}
            >
              📧 {t.sendReport}
            </button>
          </>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm mx-4"
            style={{ backgroundColor: 'var(--polar)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title */}
            <h3 className="text-lg font-bold text-center mb-6" style={{ color: 'var(--deep-teal)' }}>
              📧 {t.sendReport}
            </h3>

            {/* Email Input */}
            <label className="text-button mb-2 block" style={{ color: 'var(--deep-teal)' }}>
              {t.emailRecipient}
            </label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-2xl text-button mb-6"
              style={{
                border: '2px solid var(--deep-teal)',
                color: 'var(--deep-teal)',
                backgroundColor: 'white',
                minHeight: '52px',
                padding: '12px'
              }}
            />

            {/* Format Selection */}
            <label className="text-button mb-2 block" style={{ color: 'var(--deep-teal)' }}>
              {t.selectFormat}
            </label>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setReportFormat('pdf')}
                className="flex-1 rounded-2xl text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: reportFormat === 'pdf' ? 'var(--zanah)' : 'transparent',
                  border: reportFormat === 'pdf' ? 'none' : '2px solid var(--deep-teal)',
                  color: 'var(--deep-teal)'
                }}
              >
                📄 PDF
              </button>
              <button
                onClick={() => setReportFormat('excel')}
                className="flex-1 rounded-2xl text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: reportFormat === 'excel' ? 'var(--zanah)' : 'transparent',
                  border: reportFormat === 'excel' ? 'none' : '2px solid var(--deep-teal)',
                  color: 'var(--deep-teal)'
                }}
              >
                📥 Excel
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 rounded-2xl text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: 'transparent',
                  border: '2px solid var(--deep-teal)',
                  color: 'var(--deep-teal)'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSendReportEmail}
                disabled={isExporting || !emailTo}
                className="flex-1 rounded-2xl text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: 'var(--zanah)',
                  color: 'var(--deep-teal)',
                  opacity: (!emailTo || isExporting) ? 0.5 : 1
                }}
              >
                {isExporting ? '...' : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </BackgroundPage>
  );
}
