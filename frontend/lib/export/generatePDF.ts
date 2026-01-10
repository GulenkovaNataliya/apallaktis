// Client-side PDF generation from localStorage data
// =================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

// Translations for PDF
const translations: Record<Locale, any> = {
  el: {
    title: 'Αναφορά Εξόδων',
    period: 'Περίοδος',
    date: 'Ημερομηνία',
    property: 'Ακίνητο',
    category: 'Κατηγορία',
    description: 'Περιγραφή',
    amount: 'Ποσό',
    paymentMethod: 'Τρόπος Πληρωμής',
    total: 'ΣΥΝΟΛΟ',
    byPaymentMethod: 'Ανάλυση ανά Τρόπο Πληρωμής',
    method: 'Τρόπος',
    percent: 'Ποσοστό',
  },
  ru: {
    title: 'Отчет по расходам',
    period: 'Период',
    date: 'Дата',
    property: 'Объект',
    category: 'Категория',
    description: 'Описание',
    amount: 'Сумма',
    paymentMethod: 'Способ оплаты',
    total: 'ИТОГО',
    byPaymentMethod: 'Разбивка по способам оплаты',
    method: 'Способ',
    percent: 'Процент',
  },
  uk: {
    title: 'Звіт про витрати',
    period: 'Період',
    date: 'Дата',
    property: 'Об\'єкт',
    category: 'Категорія',
    description: 'Опис',
    amount: 'Сума',
    paymentMethod: 'Спосіб оплати',
    total: 'РАЗОМ',
    byPaymentMethod: 'Розбивка за способами оплати',
    method: 'Спосіб',
    percent: 'Відсоток',
  },
  sq: {
    title: 'Raporti i Shpenzimeve',
    period: 'Periudha',
    date: 'Data',
    property: 'Prona',
    category: 'Kategoria',
    description: 'Përshkrimi',
    amount: 'Shuma',
    paymentMethod: 'Mënyra e Pagesës',
    total: 'TOTALI',
    byPaymentMethod: 'Ndarje sipas mënyrës së pagesës',
    method: 'Mënyra',
    percent: 'Përqindja',
  },
  bg: {
    title: 'Отчет за разходи',
    period: 'Период',
    date: 'Дата',
    property: 'Имот',
    category: 'Категория',
    description: 'Описание',
    amount: 'Сума',
    paymentMethod: 'Начин на плащане',
    total: 'ОБЩО',
    byPaymentMethod: 'Разбивка по начини на плащане',
    method: 'Начин',
    percent: 'Процент',
  },
  ro: {
    title: 'Raport de cheltuieli',
    period: 'Perioadă',
    date: 'Data',
    property: 'Proprietate',
    category: 'Categorie',
    description: 'Descriere',
    amount: 'Sumă',
    paymentMethod: 'Metodă de plată',
    total: 'TOTAL',
    byPaymentMethod: 'Defalcare pe metode de plată',
    method: 'Metodă',
    percent: 'Procent',
  },
  en: {
    title: 'Expenses Report',
    period: 'Period',
    date: 'Date',
    property: 'Property',
    category: 'Category',
    description: 'Description',
    amount: 'Amount',
    paymentMethod: 'Payment Method',
    total: 'TOTAL',
    byPaymentMethod: 'Breakdown by payment method',
    method: 'Method',
    percent: 'Percent',
  },
  ar: {
    title: 'تقرير المصروفات',
    period: 'الفترة',
    date: 'التاريخ',
    property: 'العقار',
    category: 'الفئة',
    description: 'الوصف',
    amount: 'المبلغ',
    paymentMethod: 'طريقة الدفع',
    total: 'المجموع',
    byPaymentMethod: 'التوزيع حسب طريقة الدفع',
    method: 'الطريقة',
    percent: 'النسبة المئوية',
  },
};

export function generatePDF(data: ExportData): void {
  const { properties, expenses, dateFrom, dateTo, locale } = data;
  const t = translations[locale] || translations.en;

  // Create PDF
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(t.title, 105, 20, { align: 'center' });

  // Period
  doc.setFontSize(12);
  doc.text(`${t.period}: ${dateFrom} - ${dateTo}`, 105, 30, { align: 'center' });

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

  // Expenses table
  const expenseRows = allExpenses.map(expense => [
    new Date(expense.date).toLocaleDateString(locale === 'el' ? 'el-GR' : locale === 'ru' ? 'ru-RU' : 'en-GB'),
    expense.propertyName,
    expense.category,
    expense.description,
    `€${expense.amount.toFixed(2)}`,
    expense.paymentMethod,
  ]);

  autoTable(doc, {
    head: [[t.date, t.property, t.category, t.description, t.amount, t.paymentMethod]],
    body: expenseRows,
    startY: 40,
    theme: 'grid',
    headStyles: {
      fillColor: [1, 49, 45], // deep-teal
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      4: { halign: 'right' }, // Amount
    },
    foot: [['', '', '', t.total, `€${totalAmount.toFixed(2)}`, '']],
    footStyles: {
      fillColor: [177, 209, 162], // zanah
      textColor: [1, 49, 45],
      fontStyle: 'bold',
    },
  });

  // Payment methods breakdown
  if (Object.keys(paymentMethods).length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(14);
    doc.text(t.byPaymentMethod, 14, finalY + 15);

    const paymentRows = Object.entries(paymentMethods).map(([method, amount]) => [
      method,
      `€${amount.toFixed(2)}`,
      `${((amount / totalAmount) * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      head: [[t.method, t.amount, t.percent]],
      body: paymentRows,
      startY: finalY + 20,
      theme: 'grid',
      headStyles: {
        fillColor: [1, 49, 45],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
      },
    });
  }

  // Download
  doc.save(`expenses_${dateFrom}_${dateTo}.pdf`);
}
