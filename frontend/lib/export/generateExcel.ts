// Client-side Excel generation from localStorage data
// ===================================================

import * as XLSX from 'xlsx';
import type { PropertyObject } from '@/types/object';
import type { ObjectExpense } from '@/types/objectExpense';
import type { Locale } from '@/lib/messages';

interface ExportData {
  properties: PropertyObject[];
  expenses: Map<string, ObjectExpense[]>; // propertyId -> expenses[]
  dateFrom: string;
  dateTo: string;
  locale: Locale;
}

// Translations for Excel
const translations: Record<Locale, any> = {
  el: {
    sheetExpenses: 'Έξοδα',
    sheetPayments: 'Τρόποι Πληρωμής',
    sheetStats: 'Στατιστικά',
    date: 'Ημερομηνία',
    property: 'Ακίνητο',
    category: 'Κατηγορία',
    description: 'Περιγραφή',
    amount: 'Ποσό (€)',
    paymentMethod: 'Τρόπος Πληρωμής',
    total: 'ΣΥΝΟΛΟ',
    method: 'Τρόπος',
    percent: 'Ποσοστό',
    period: 'Περίοδος',
    totalExpenses: 'Σύνολο εξόδων',
    totalAmount: 'Συνολικό ποσό',
    avgExpense: 'Μέσος όρος εξόδων',
    properties: 'Ακίνητα',
  },
  ru: {
    sheetExpenses: 'Расходы',
    sheetPayments: 'Способы оплаты',
    sheetStats: 'Статистика',
    date: 'Дата',
    property: 'Объект',
    category: 'Категория',
    description: 'Описание',
    amount: 'Сумма (€)',
    paymentMethod: 'Способ оплаты',
    total: 'ИТОГО',
    method: 'Способ',
    percent: 'Процент',
    period: 'Период',
    totalExpenses: 'Всего расходов',
    totalAmount: 'Общая сумма',
    avgExpense: 'Средний расход',
    properties: 'Объектов',
  },
  uk: {
    sheetExpenses: 'Витрати',
    sheetPayments: 'Способи оплати',
    sheetStats: 'Статистика',
    date: 'Дата',
    property: 'Об\'єкт',
    category: 'Категорія',
    description: 'Опис',
    amount: 'Сума (€)',
    paymentMethod: 'Спосіб оплати',
    total: 'РАЗОМ',
    method: 'Спосіб',
    percent: 'Відсоток',
    period: 'Період',
    totalExpenses: 'Всього витрат',
    totalAmount: 'Загальна сума',
    avgExpense: 'Середня витрата',
    properties: 'Об\'єктів',
  },
  sq: {
    sheetExpenses: 'Shpenzimet',
    sheetPayments: 'Mënyrat e Pagesës',
    sheetStats: 'Statistika',
    date: 'Data',
    property: 'Prona',
    category: 'Kategoria',
    description: 'Përshkrimi',
    amount: 'Shuma (€)',
    paymentMethod: 'Mënyra e Pagesës',
    total: 'TOTALI',
    method: 'Mënyra',
    percent: 'Përqindja',
    period: 'Periudha',
    totalExpenses: 'Totali i shpenzimeve',
    totalAmount: 'Shuma totale',
    avgExpense: 'Shpenzimi mesatar',
    properties: 'Pronat',
  },
  bg: {
    sheetExpenses: 'Разходи',
    sheetPayments: 'Начини на плащане',
    sheetStats: 'Статистика',
    date: 'Дата',
    property: 'Имот',
    category: 'Категория',
    description: 'Описание',
    amount: 'Сума (€)',
    paymentMethod: 'Начин на плащане',
    total: 'ОБЩО',
    method: 'Начин',
    percent: 'Процент',
    period: 'Период',
    totalExpenses: 'Общо разходи',
    totalAmount: 'Обща сума',
    avgExpense: 'Средна стойност',
    properties: 'Имоти',
  },
  ro: {
    sheetExpenses: 'Cheltuieli',
    sheetPayments: 'Metode de plată',
    sheetStats: 'Statistici',
    date: 'Data',
    property: 'Proprietate',
    category: 'Categorie',
    description: 'Descriere',
    amount: 'Sumă (€)',
    paymentMethod: 'Metodă de plată',
    total: 'TOTAL',
    method: 'Metodă',
    percent: 'Procent',
    period: 'Perioadă',
    totalExpenses: 'Total cheltuieli',
    totalAmount: 'Suma totală',
    avgExpense: 'Cheltuială medie',
    properties: 'Proprietăți',
  },
  en: {
    sheetExpenses: 'Expenses',
    sheetPayments: 'Payment Methods',
    sheetStats: 'Statistics',
    date: 'Date',
    property: 'Property',
    category: 'Category',
    description: 'Description',
    amount: 'Amount (€)',
    paymentMethod: 'Payment Method',
    total: 'TOTAL',
    method: 'Method',
    percent: 'Percent',
    period: 'Period',
    totalExpenses: 'Total expenses',
    totalAmount: 'Total amount',
    avgExpense: 'Average expense',
    properties: 'Properties',
  },
  ar: {
    sheetExpenses: 'المصروفات',
    sheetPayments: 'طرق الدفع',
    sheetStats: 'الإحصائيات',
    date: 'التاريخ',
    property: 'العقار',
    category: 'الفئة',
    description: 'الوصف',
    amount: 'المبلغ (€)',
    paymentMethod: 'طريقة الدفع',
    total: 'المجموع',
    method: 'الطريقة',
    percent: 'النسبة المئوية',
    period: 'الفترة',
    totalExpenses: 'إجمالي المصروفات',
    totalAmount: 'المبلغ الإجمالي',
    avgExpense: 'متوسط المصروف',
    properties: 'العقارات',
  },
};

export function generateExcel(data: ExportData): void {
  const { properties, expenses, dateFrom, dateTo, locale } = data;
  const t = translations[locale] || translations.en;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Collect all expenses
  const allExpenses: any[] = [];
  const paymentMethods: Record<string, number> = {};
  let totalAmount = 0;

  properties.forEach(property => {
    const propertyExpenses = expenses.get(property.id) || [];
    propertyExpenses.forEach(expense => {
      allExpenses.push({
        date: expense.date,
        propertyName: property.name,
        category: expense.categoryName || '-',
        description: expense.description || '-',
        amount: expense.amount,
        paymentMethod: expense.paymentMethodName || '-',
      });

      const method = expense.paymentMethodName || t.method;
      paymentMethods[method] = (paymentMethods[method] || 0) + expense.amount;
      totalAmount += expense.amount;
    });
  });

  // Sort by date
  allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Sheet 1: Expenses
  const expenseData = [
    [t.date, t.property, t.category, t.description, t.amount, t.paymentMethod],
    ...allExpenses.map(expense => [
      new Date(expense.date).toLocaleDateString(locale === 'el' ? 'el-GR' : locale === 'ru' ? 'ru-RU' : 'en-GB'),
      expense.propertyName,
      expense.category,
      expense.description,
      expense.amount.toFixed(2),
      expense.paymentMethod,
    ]),
    [],
    ['', '', '', t.total, totalAmount.toFixed(2), ''],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(expenseData);

  // Set column widths
  ws1['!cols'] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Property
    { wch: 15 }, // Category
    { wch: 30 }, // Description
    { wch: 12 }, // Amount
    { wch: 15 }, // Payment method
  ];

  XLSX.utils.book_append_sheet(wb, ws1, t.sheetExpenses);

  // Sheet 2: Payment methods
  const paymentData = [
    [t.method, t.amount, t.percent],
    ...Object.entries(paymentMethods).map(([method, amount]) => [
      method,
      amount.toFixed(2),
      `${((amount / totalAmount) * 100).toFixed(1)}%`,
    ]),
    [],
    [t.total, totalAmount.toFixed(2), '100%'],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(paymentData);

  ws2['!cols'] = [
    { wch: 20 }, // Method
    { wch: 12 }, // Amount
    { wch: 10 }, // Percent
  ];

  XLSX.utils.book_append_sheet(wb, ws2, t.sheetPayments);

  // Sheet 3: Statistics
  const statsData = [
    [t.period, `${dateFrom} - ${dateTo}`],
    [t.totalExpenses, allExpenses.length],
    [t.totalAmount, `€${totalAmount.toFixed(2)}`],
    [t.avgExpense, `€${(totalAmount / (allExpenses.length || 1)).toFixed(2)}`],
    [],
    [t.properties, properties.length],
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(statsData);

  ws3['!cols'] = [
    { wch: 20 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws3, t.sheetStats);

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses_${dateFrom}_${dateTo}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
