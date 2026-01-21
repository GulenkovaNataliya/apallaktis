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

// Translations for Analysis page
const translations = {
  el: {
    title: "Οικονομική Ανάλυση",
    accessDenied: "Διαθέσιμο στο Standard ή Premium",
    upgradeButton: "Αναβάθμιση πλάνου",
    dateFrom: "Από",
    dateTo: "Έως",
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
    closedInPeriod: "Κλεισμένα στην περίοδο",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Δεν υπάρχουν δεδομένα",
    loading: "Φόρτωση...",
    back: "← Πίσω",
    emailSent: "Η αναφορά εστάλη στο email σας!",
    emailError: "Σφάλμα αποστολής email",
  },
  ru: {
    title: "Финансовый анализ",
    accessDenied: "Доступно в Standard или Premium",
    upgradeButton: "Улучшить план",
    dateFrom: "От",
    dateTo: "До",
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
    totalObjects: "Всего",
    openObjects: "Открытых",
    closedInPeriod: "Закрыто за период",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Нет данных",
    loading: "Загрузка...",
    back: "← Назад",
    emailSent: "Отчёт отправлен на ваш email!",
    emailError: "Ошибка отправки email",
  },
  en: {
    title: "Financial Analysis",
    accessDenied: "Available in Standard or Premium",
    upgradeButton: "Upgrade plan",
    dateFrom: "From",
    dateTo: "To",
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
    totalObjects: "Total",
    openObjects: "Open",
    closedInPeriod: "Closed in period",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "No data",
    loading: "Loading...",
    back: "← Back",
    emailSent: "Report sent to your email!",
    emailError: "Email sending error",
  },
  uk: {
    title: "Фінансовий аналіз",
    accessDenied: "Доступно в Standard або Premium",
    upgradeButton: "Покращити план",
    dateFrom: "Від",
    dateTo: "До",
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
    totalObjects: "Всього",
    openObjects: "Відкритих",
    closedInPeriod: "Закрито за період",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Немає даних",
    loading: "Завантаження...",
    back: "← Назад",
    emailSent: "Звіт надіслано на вашу пошту!",
    emailError: "Помилка надсилання email",
  },
  sq: {
    title: "Analiza Financiare",
    accessDenied: "E disponueshme në Standard ose Premium",
    upgradeButton: "Përmirëso planin",
    dateFrom: "Nga",
    dateTo: "Deri",
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
    totalObjects: "Totali",
    openObjects: "Të hapura",
    closedInPeriod: "Të mbyllura në periudhë",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Nuk ka të dhëna",
    loading: "Duke ngarkuar...",
    back: "← Prapa",
    emailSent: "Raporti u dërgua në email tuaj!",
    emailError: "Gabim në dërgimin e email",
  },
  bg: {
    title: "Финансов анализ",
    accessDenied: "Налично в Standard или Premium",
    upgradeButton: "Подобри плана",
    dateFrom: "От",
    dateTo: "До",
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
    totalObjects: "Общо",
    openObjects: "Отворени",
    closedInPeriod: "Затворени за периода",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Няма данни",
    loading: "Зареждане...",
    back: "← Назад",
    emailSent: "Докладът е изпратен на вашия имейл!",
    emailError: "Грешка при изпращане на имейл",
  },
  ro: {
    title: "Analiză Financiară",
    accessDenied: "Disponibil în Standard sau Premium",
    upgradeButton: "Îmbunătățește planul",
    dateFrom: "De la",
    dateTo: "Până la",
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
    totalObjects: "Total",
    openObjects: "Deschise",
    closedInPeriod: "Închise în perioadă",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "Nu există date",
    loading: "Se încarcă...",
    back: "← Înapoi",
    emailSent: "Raportul a fost trimis pe email!",
    emailError: "Eroare la trimiterea email-ului",
  },
  ar: {
    title: "التحليل المالي",
    accessDenied: "متاح في Standard أو Premium",
    upgradeButton: "ترقية الخطة",
    dateFrom: "من",
    dateTo: "إلى",
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
    totalObjects: "الإجمالي",
    openObjects: "مفتوحة",
    closedInPeriod: "مغلقة في الفترة",
    exportExcel: "Excel",
    exportPdf: "PDF",
    exportEmail: "Email",
    noData: "لا توجد بيانات",
    loading: "جاري التحميل...",
    back: "← رجوع",
    emailSent: "تم إرسال التقرير إلى بريدك الإلكتروني!",
    emailError: "خطأ في إرسال البريد الإلكتروني",
  },
};

// Types for analysis data
interface AnalysisData {
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
          .select('subscription_plan, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          setSubscriptionPlan(profile.subscription_plan);
          setUserEmail(profile.email || '');

          // Check if user has Standard or Premium
          const hasAccess = ['standard', 'premium', 'vip'].includes(profile.subscription_plan || '');
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

      // Calculate debts (contract + extras - payments > 0)
      let totalDebts = 0;
      const debtsByObject: { objectName: string; debt: number }[] = [];

      for (const obj of objectsData) {
        const contractPrice = Number(obj.contract_price) || 0;

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

        const debt = contractPrice + objExtras - objPayments;

        if (debt > 0.01) {
          totalDebts += debt;
          debtsByObject.push({ objectName: obj.name, debt });
        }
      }

      // Calculate objects stats
      const totalObjects = objectsData.length;
      const openObjects = objectsData.filter(obj => obj.status === 'open').length;

      // Closed in period
      const closedInPeriod = objectsData.filter(obj => {
        if (obj.status !== 'closed') return false;
        const updatedAt = new Date(obj.updated_at);
        return updatedAt >= new Date(dateFrom) && updatedAt <= new Date(dateTo);
      }).length;

      setAnalysisData({
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

  // Loading state
  if (isLoading) {
    return (
      <BackgroundPage pageIndex={1}>
        <div className="min-h-screen flex items-center justify-center">
          <p style={{ color: 'var(--polar)' }}>{t.loading}</p>
        </div>
      </BackgroundPage>
    );
  }

  // Access denied for Basic plan
  if (!hasAccess) {
    return (
      <BackgroundPage pageIndex={1}>
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

  return (
    <BackgroundPage pageIndex={1}>
      <div className="flex flex-col items-center gap-6" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>
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

        {/* Date Range Selector */}
        <div className="w-full flex gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-2" style={{ color: 'var(--polar)' }}>{t.dateFrom}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl p-3"
              style={{ backgroundColor: 'var(--polar)', color: 'var(--deep-teal)', border: 'none' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-2" style={{ color: 'var(--polar)' }}>{t.dateTo}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl p-3"
              style={{ backgroundColor: 'var(--polar)', color: 'var(--deep-teal)', border: 'none' }}
            />
          </div>
        </div>

        {analysisData && (
          <>
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

            {/* Export Buttons */}
            <div className="w-full flex gap-3">
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: '#25D366', color: 'white' }}
              >
                📥 {t.exportExcel}
              </button>
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: '#ef4444', color: 'white' }}
              >
                📄 {t.exportPdf}
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isExporting || !userEmail}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: '#3b82f6', color: 'white' }}
              >
                📧 {t.exportEmail}
              </button>
            </div>
          </>
        )}
      </div>
    </BackgroundPage>
  );
}
