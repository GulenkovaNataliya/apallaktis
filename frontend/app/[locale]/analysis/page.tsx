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
import * as XLSX from 'xlsx';

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
    downloadExcel: "Λήψη Excel",
    downloadPdf: "Λήψη PDF",
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
    downloadExcel: "Скачать Excel",
    downloadPdf: "Скачать PDF",
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
    downloadExcel: "Download Excel",
    downloadPdf: "Download PDF",
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
    downloadExcel: "Завантажити Excel",
    downloadPdf: "Завантажити PDF",
    globalExpensesTotal: "Загальні Витрати",
    objectExpensesTotal: "Витрати по Об'єктах",
    totalProfit: "Загальний Прибуток",
    profitStatus: "Прибуток",
    lossStatus: "Збиток",
    summaryPaymentAnalysis: "Сумарний Платіжний Аналіз",
    totalReceivedPayments: "Загальна Сума Отриманих Оплат",
    totalExpensePayments: "Загальна Сума Платежів по Витратах",
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
    downloadExcel: "Shkarko Excel",
    downloadPdf: "Shkarko PDF",
    globalExpensesTotal: "Shpenzimet Globale",
    objectExpensesTotal: "Shpenzimet e Projekteve",
    totalProfit: "Fitimi Total",
    profitStatus: "Fitim",
    lossStatus: "Humbje",
    summaryPaymentAnalysis: "Analiza Përmbledhëse e Pagesave",
    totalReceivedPayments: "Shuma Totale e Pagesave të Marra",
    totalExpensePayments: "Shuma Totale e Pagesave të Shpenzimeve",
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
    downloadExcel: "Изтегли Excel",
    downloadPdf: "Изтегли PDF",
    globalExpensesTotal: "Общи Разходи",
    objectExpensesTotal: "Разходи по Обекти",
    totalProfit: "Обща Печалба",
    profitStatus: "Печалба",
    lossStatus: "Загуба",
    summaryPaymentAnalysis: "Обобщен Анализ на Плащанията",
    totalReceivedPayments: "Обща Сума на Получени Плащания",
    totalExpensePayments: "Обща Сума на Плащания по Разходи",
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
    downloadExcel: "Descarcă Excel",
    downloadPdf: "Descarcă PDF",
    globalExpensesTotal: "Cheltuieli Globale",
    objectExpensesTotal: "Cheltuieli Proiecte",
    totalProfit: "Profit Total",
    profitStatus: "Profit",
    lossStatus: "Pierdere",
    summaryPaymentAnalysis: "Analiza Sumară a Plăților",
    totalReceivedPayments: "Suma Totală a Plăților Primite",
    totalExpensePayments: "Suma Totală a Plăților pentru Cheltuieli",
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
    downloadExcel: "تحميل Excel",
    downloadPdf: "تحميل PDF",
    globalExpensesTotal: "المصاريف العامة",
    objectExpensesTotal: "مصاريف المشاريع",
    totalProfit: "إجمالي الربح",
    profitStatus: "ربح",
    lossStatus: "خسارة",
    summaryPaymentAnalysis: "تحليل المدفوعات الإجمالي",
    totalReceivedPayments: "إجمالي المدفوعات المستلمة",
    totalExpensePayments: "إجمالي مدفوعات المصروفات",
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
          .select('subscription_plan, subscription_status, account_purchased, demo_expires_at, subscription_expires_at, vip_expires_at, email')
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
  const handleExportExcel = () => {
    if (!analysisData) return;
    setIsExporting(true);

    try {
      // Create workbook (using static import for mobile compatibility)
      const wb = XLSX.utils.book_new();

      // Summary sheet - Full analysis
      const summaryData = [
        ['ΑΠΑΛΛΑΚΤΗΣ', ''],
        ['Financial Analysis / Οικονομική Ανάλυση', ''],
        [],
        [t.title, `${dateFrom} - ${dateTo}`],
        [],
        ['=== ' + t.objectsSummary + ' ===', ''],
        [t.totalObjects, analysisData.totalObjects],
        [t.openObjects, analysisData.openObjects],
        [t.closedObjects, analysisData.closedObjects],
        [t.closedInPeriod, analysisData.closedInPeriod],
        [],
        [t.totalContractPrices, formatEuro(analysisData.totalContractPrices)],
        [t.totalAdditionalWorks, formatEuro(analysisData.totalAdditionalWorks)],
        [t.totalActualPrices, formatEuro(analysisData.totalActualPrices)],
        [t.totalBalance, formatEuro(analysisData.totalBalance)],
        [],
        ['=== ' + t.globalExpensesTotal + ' ===', ''],
        [t.globalExpensesTotal, formatEuro(analysisData.totalGlobalExpenses)],
        [],
        ['=== ' + t.objectExpensesTotal + ' ===', ''],
        [t.objectExpensesTotal, formatEuro(analysisData.totalObjectExpenses)],
        [],
        ['=== ' + t.totalProfit + ' ===', ''],
        [t.netProfit, formatEuro(analysisData.netProfit)],
        [analysisData.netProfit >= 0 ? t.profitStatus : t.lossStatus, ''],
        [],
        ['=== ' + t.summaryPaymentAnalysis + ' ===', ''],
        [t.totalReceivedPayments, formatEuro(analysisData.totalIncome)],
        [t.totalExpensePayments, formatEuro(analysisData.totalExpenses)],
        [],
        ['=== ' + t.clientDebts + ' ===', ''],
        [t.totalOwed, formatEuro(analysisData.totalDebts)],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // Objects details sheet
      const objectsData = [
        ['#', t.objects, t.statusOpen + '/' + t.statusClosed, t.balance, t.profit],
        ...analysisData.objectsWithDetails.map((obj, index) => [
          index + 1,
          obj.name,
          obj.status === 'closed' ? t.statusClosed : t.statusOpen,
          formatEuro(obj.balance),
          formatEuro(obj.profit),
        ]),
      ];
      const objectsSheet = XLSX.utils.aoa_to_sheet(objectsData);
      XLSX.utils.book_append_sheet(wb, objectsSheet, 'Objects');

      // Income by payment method
      const incomeData = [
        [t.totalReceivedPayments, ''],
        [t.byPaymentMethod, ''],
        ...Object.entries(analysisData.incomeByPaymentMethod).map(([pmId, amount]) => [
          getPaymentMethodName(pmId),
          formatEuro(amount),
        ]),
        [],
        ['Total', formatEuro(analysisData.totalIncome)],
      ];
      const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
      XLSX.utils.book_append_sheet(wb, incomeSheet, 'Income');

      // Global expenses by category
      const globalExpensesData = [
        [t.globalExpenses, ''],
        ...Object.entries(analysisData.globalExpensesByCategory).map(([catId, amount]) => [
          getCategoryName(catId),
          formatEuro(amount),
        ]),
        [],
        ['Total', formatEuro(analysisData.totalGlobalExpenses)],
      ];
      const globalExpensesSheet = XLSX.utils.aoa_to_sheet(globalExpensesData);
      XLSX.utils.book_append_sheet(wb, globalExpensesSheet, 'Global Expenses');

      // Object expenses by category
      const objExpensesData = [
        [t.objectExpenses, ''],
        ...Object.entries(analysisData.objectExpensesByCategory).map(([catId, amount]) => [
          getCategoryName(catId),
          formatEuro(amount),
        ]),
        [],
        ['Total', formatEuro(analysisData.totalObjectExpenses)],
      ];
      const objExpensesSheet = XLSX.utils.aoa_to_sheet(objExpensesData);
      XLSX.utils.book_append_sheet(wb, objExpensesSheet, 'Object Expenses');

      // Expenses by payment method
      const expensesByPmData = [
        [t.totalExpensePayments, ''],
        [t.byPaymentMethod, ''],
        ...Object.entries(analysisData.expensesByPaymentMethod).map(([pmId, amount]) => [
          getPaymentMethodName(pmId),
          formatEuro(amount),
        ]),
        [],
        ['Total', formatEuro(analysisData.totalExpenses)],
      ];
      const expensesByPmSheet = XLSX.utils.aoa_to_sheet(expensesByPmData);
      XLSX.utils.book_append_sheet(wb, expensesByPmSheet, 'Expenses by PM');

      // Client debts
      if (analysisData.debtsByObject.length > 0) {
        const debtsData = [
          [t.clientDebts, ''],
          ...analysisData.debtsByObject.map(d => [d.objectName, formatEuro(d.debt)]),
          [],
          [t.totalOwed, formatEuro(analysisData.totalDebts)],
        ];
        const debtsSheet = XLSX.utils.aoa_to_sheet(debtsData);
        XLSX.utils.book_append_sheet(wb, debtsSheet, 'Debts');
      }

      // Download - improved for mobile compatibility
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = `analysis_${dateFrom}_${dateTo}.xlsx`;

      // Try using navigator.msSaveBlob for IE/Edge (legacy)
      if (typeof (navigator as any).msSaveBlob !== 'undefined') {
        (navigator as any).msSaveBlob(blob, filename);
        setIsExporting(false);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        // Clean up after download starts
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsExporting(false);
        }, 150);
      }

    } catch (error) {
      console.error('Export Excel error:', error);
      alert('Error exporting Excel: ' + (error as Error).message);
      setIsExporting(false);
    }
  };

  // Export to PDF using html2canvas for Unicode support
  const handleExportPdf = async () => {
    if (!analysisData) return;
    setIsExporting(true);

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Create hidden HTML element for PDF content
      const container = document.createElement('div');
      container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; padding: 40px; font-family: Arial, sans-serif; background: white;';

      const profitColor = analysisData.netProfit >= 0 ? '#25D366' : '#ff6a1a';
      const balanceColor = analysisData.totalBalance > 0.01 ? '#ff6a1a' : '#25D366';

      container.innerHTML = `
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/Apallaktis.photos/apallaktis-logo-orange@2x.png" style="width: 50%; max-width: 400px; height: auto;" alt="ΑΠΑΛΛΑΚΤΗΣ" />
        </div>

        <h1 style="color: #01312d; font-size: 24px; margin-bottom: 10px; text-align: center;">${t.title}</h1>
        <p style="color: #666; font-size: 14px; margin-bottom: 30px; text-align: center;">${dateFrom} - ${dateTo}</p>

        <!-- Objects Summary -->
        <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #01312d; font-size: 18px; margin: 0 0 15px 0;">${t.objectsSummary}</h2>
          <div style="display: flex; gap: 20px; margin-bottom: 10px;">
            <span>${t.totalObjects}: <strong>${analysisData.totalObjects}</strong></span>
            <span style="color: #ff6a1a;">${t.openObjects}: <strong>${analysisData.openObjects}</strong></span>
            <span style="color: #25D366;">${t.closedObjects}: <strong>${analysisData.closedObjects}</strong></span>
          </div>
        </div>

        <!-- Contract Prices -->
        <div style="background: #daf3f6; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <p style="margin: 0;"><strong>${t.totalContractPrices}:</strong> <span style="color: #ff6a1a; font-size: 20px;">${formatEuro(analysisData.totalContractPrices)}</span></p>
        </div>

        <!-- Additional Works -->
        <div style="background: #daf3f6; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <p style="margin: 0;"><strong>${t.totalAdditionalWorks}:</strong> <span style="color: #ff6a1a; font-size: 20px;">${formatEuro(analysisData.totalAdditionalWorks)}</span></p>
        </div>

        <!-- Actual Prices -->
        <div style="background: #daf3f6; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <p style="margin: 0;"><strong>${t.totalActualPrices}:</strong> <span style="color: #ff6a1a; font-size: 20px;">${formatEuro(analysisData.totalActualPrices)}</span></p>
        </div>

        <!-- Total Balance -->
        <div style="background: ${balanceColor}; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="margin: 0; color: white;"><strong>${t.totalBalance}:</strong> <span style="font-size: 24px;">${formatEuro(analysisData.totalBalance)}</span></p>
          <p style="margin: 5px 0 0 0; color: white; font-size: 14px;">${analysisData.totalBalance > 0.01 ? t.totalDebt : t.allPaid}</p>
        </div>

        <!-- Global Expenses -->
        <div style="background: #daf3f6; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <h3 style="color: #01312d; margin: 0 0 10px 0;">${t.globalExpensesTotal}: <span style="color: #ff6a1a;">${formatEuro(analysisData.totalGlobalExpenses)}</span></h3>
          ${Object.entries(analysisData.globalExpensesByCategory).map(([catId, amount]) =>
            `<p style="font-size: 14px; margin: 4px 0 4px 20px;">${getCategoryName(catId)}: ${formatEuro(amount)}</p>`
          ).join('')}
        </div>

        <!-- Object Expenses -->
        <div style="background: #daf3f6; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <h3 style="color: #01312d; margin: 0 0 10px 0;">${t.objectExpensesTotal}: <span style="color: #ff6a1a;">${formatEuro(analysisData.totalObjectExpenses)}</span></h3>
          ${Object.entries(analysisData.objectExpensesByCategory).map(([catId, amount]) =>
            `<p style="font-size: 14px; margin: 4px 0 4px 20px;">${getCategoryName(catId)}: ${formatEuro(amount)}</p>`
          ).join('')}
        </div>

        <!-- Total Profit -->
        <div style="background: ${profitColor}; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">${t.totalProfit}</h2>
          <p style="color: white; font-size: 32px; font-weight: bold; margin: 10px 0;">${formatEuro(analysisData.netProfit)}</p>
          <p style="color: white; font-size: 18px; margin: 0;">${analysisData.netProfit >= 0 ? t.profitStatus : t.lossStatus}</p>
        </div>

        <!-- Payment Analysis -->
        <h2 style="color: #01312d; font-size: 18px; margin: 25px 0 15px 0;">${t.summaryPaymentAnalysis}</h2>

        <!-- Received Payments -->
        <div style="background: #daf3f6; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <h3 style="color: #01312d; margin: 0 0 10px 0;">${t.totalReceivedPayments}: <span style="color: #01312d;">${formatEuro(analysisData.totalIncome)}</span></h3>
          ${Object.entries(analysisData.incomeByPaymentMethod).map(([pmId, amount]) =>
            `<p style="font-size: 14px; margin: 4px 0 4px 20px;">${getPaymentMethodName(pmId)}: ${formatEuro(amount)}</p>`
          ).join('')}
        </div>

        <!-- Expense Payments -->
        <div style="background: #daf3f6; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <h3 style="color: #01312d; margin: 0 0 10px 0;">${t.totalExpensePayments}: <span style="color: #ff6a1a;">${formatEuro(analysisData.totalExpenses)}</span></h3>
          ${Object.entries(analysisData.expensesByPaymentMethod).map(([pmId, amount]) =>
            `<p style="font-size: 14px; margin: 4px 0 4px 20px;">${getPaymentMethodName(pmId)}: ${formatEuro(amount)}</p>`
          ).join('')}
        </div>

        ${analysisData.debtsByObject.length > 0 ? `
          <!-- Client Debts -->
          <div style="background: #ffebe1; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <h3 style="color: #01312d; margin: 0 0 10px 0;">${t.clientDebts}: <span style="color: #ff6a1a;">${formatEuro(analysisData.totalDebts)}</span></h3>
            ${analysisData.debtsByObject.map(d =>
              `<p style="font-size: 14px; margin: 4px 0 4px 20px;">${d.objectName}: <span style="color: #ff6a1a;">${formatEuro(d.debt)}</span></p>`
            ).join('')}
          </div>
        ` : ''}

        <!-- Objects List -->
        ${analysisData.objectsWithDetails.length > 0 ? `
          <h2 style="color: #01312d; font-size: 18px; margin: 25px 0 15px 0;">${t.objects}</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #01312d; color: white;">
                <th style="padding: 8px; text-align: left;">#</th>
                <th style="padding: 8px; text-align: left;">${t.objects}</th>
                <th style="padding: 8px; text-align: center;">Status</th>
                <th style="padding: 8px; text-align: right;">${t.balance}</th>
                <th style="padding: 8px; text-align: right;">${t.profit}</th>
              </tr>
            </thead>
            <tbody>
              ${analysisData.objectsWithDetails.map((obj, index) => `
                <tr style="background: ${index % 2 === 0 ? '#f5f5f5' : 'white'};">
                  <td style="padding: 8px;">${index + 1}</td>
                  <td style="padding: 8px; color: #ff6a1a; font-weight: bold;">${obj.name}</td>
                  <td style="padding: 8px; text-align: center;"><span style="background: ${obj.status === 'closed' ? '#25D366' : '#ff6a1a'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${obj.status === 'closed' ? t.statusClosed : t.statusOpen}</span></td>
                  <td style="padding: 8px; text-align: right;">${formatEuro(obj.balance)}</td>
                  <td style="padding: 8px; text-align: right;">${formatEuro(obj.profit)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, { scale: 2 });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multiple pages if content is too long
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();
        while (position < pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
          position += pageHeight;
          if (position < pdfHeight) {
            pdf.addPage();
          }
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`analysis_${dateFrom}_${dateTo}.pdf`);

    } catch (error) {
      console.error('Export PDF error:', error);
      alert('Error exporting PDF: ' + (error as Error).message);
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

            {/* Download Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="btn-universal flex-1 text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: 'var(--zanah)',
                  color: 'var(--deep-teal)',
                  opacity: isExporting ? 0.5 : 1
                }}
              >
                📥 {t.downloadExcel}
              </button>
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="btn-universal flex-1 text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  opacity: isExporting ? 0.5 : 1
                }}
              >
                📄 {t.downloadPdf}
              </button>
            </div>
          </>
        )}
      </div>
    </BackgroundPage>
  );
}
