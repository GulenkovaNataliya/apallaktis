// RTL PDF generation using pdfmake (for Arabic)
// ================================================

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import type { ObjectExpense } from '@/types/objectExpense';

// Simple property type for export (only id and name needed)
interface ExportProperty {
  id: string;
  name: string;
}

// Try to import Arabic font (optional, will fallback to Roboto if not available)
let NotoSansArabicRegularBase64: string | undefined;
try {
  const fontModule = require('@/lib/fonts/NotoSansArabic-Regular');
  NotoSansArabicRegularBase64 = fontModule.NotoSansArabicRegularBase64;
  console.log('✅ Arabic font loaded successfully');
} catch (error) {
  console.warn('⚠️ Arabic font not found, using fallback font. See: ADD_ARABIC_FONT_STEPS.md');
}

// Register fonts - handle both default and named exports
const vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).default?.pdfMake?.vfs || {};
pdfMake.vfs = vfs;

// Register custom Arabic font if available
if (NotoSansArabicRegularBase64) {
  pdfMake.fonts = {
    Roboto: {
      normal: vfs['Roboto-Regular.ttf'] || 'Roboto-Regular.ttf',
      bold: vfs['Roboto-Medium.ttf'] || 'Roboto-Medium.ttf',
    },
    NotoSansArabic: {
      normal: NotoSansArabicRegularBase64,
      bold: NotoSansArabicRegularBase64, // Use Regular for Bold too
    },
  };
}

interface ExportData {
  properties: ExportProperty[];
  expenses: Map<string, ObjectExpense[]>;
  dateFrom: string;
  dateTo: string;
  locale: 'ar'; // Only Arabic
}

// Arabic translations
const translations = {
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
};

export function generatePDFArabic(data: ExportData): void {
  const { properties, expenses, dateFrom, dateTo } = data;
  const t = translations;

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

  // Sort by date (descending)
  allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Prepare expense table data (RTL order - columns reversed)
  const expenseTableBody = [
    // Header row
    [
      { text: t.paymentMethod, style: 'tableHeader', alignment: 'right' },
      { text: t.amount, style: 'tableHeader', alignment: 'right' },
      { text: t.description, style: 'tableHeader', alignment: 'right' },
      { text: t.category, style: 'tableHeader', alignment: 'right' },
      { text: t.property, style: 'tableHeader', alignment: 'right' },
      { text: t.date, style: 'tableHeader', alignment: 'right' },
    ],
    // Data rows
    ...allExpenses.map(expense => [
      { text: expense.paymentMethod, alignment: 'right' },
      { text: `€${expense.amount.toFixed(2)}`, alignment: 'right' },
      { text: expense.description, alignment: 'right' },
      { text: expense.category, alignment: 'right' },
      { text: expense.propertyName, alignment: 'right' },
      { text: new Date(expense.date).toLocaleDateString('ar-SA'), alignment: 'right' },
    ]),
    // Total row
    [
      { text: '', border: [false, true, false, false] },
      { text: `€${totalAmount.toFixed(2)}`, style: 'tableFooter', alignment: 'right' },
      { text: '', border: [false, true, false, false] },
      { text: '', border: [false, true, false, false] },
      { text: t.total, style: 'tableFooter', alignment: 'right' },
      { text: '', border: [false, true, false, false] },
    ],
  ] as TableCell[][];

  // Prepare payment methods table (RTL order)
  const paymentTableBody = [
    // Header
    [
      { text: t.percent, style: 'tableHeader', alignment: 'right' },
      { text: t.amount, style: 'tableHeader', alignment: 'right' },
      { text: t.method, style: 'tableHeader', alignment: 'right' },
    ],
    // Data
    ...Object.entries(paymentMethods).map(([method, amount]) => [
      { text: `${((amount / totalAmount) * 100).toFixed(1)}%`, alignment: 'right' },
      { text: `€${amount.toFixed(2)}`, alignment: 'right' },
      { text: method, alignment: 'right' },
    ]),
    // Total
    [
      { text: '100%', style: 'tableFooter', alignment: 'right' },
      { text: `€${totalAmount.toFixed(2)}`, style: 'tableFooter', alignment: 'right' },
      { text: t.total, style: 'tableFooter', alignment: 'right' },
    ],
  ] as TableCell[][];

  // Document definition with RTL support
  const docDefinition: TDocumentDefinitions = {
    pageOrientation: 'portrait',
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    // RTL support
    defaultStyle: {
      font: NotoSansArabicRegularBase64 ? 'NotoSansArabic' : 'Roboto', // Use Arabic font if available
      fontSize: 10,
      alignment: 'right', // RTL alignment
    },

    content: [
      // Title
      {
        text: t.title,
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      },

      // Period
      {
        text: `${t.period}: ${dateFrom} - ${dateTo}`,
        style: 'period',
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },

      // Expenses table
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
          body: expenseTableBody,
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex === 0 ? '#01312d' : null;
          },
          hLineWidth: function () {
            return 0.5;
          },
          vLineWidth: function () {
            return 0.5;
          },
          hLineColor: function () {
            return '#cccccc';
          },
          vLineColor: function () {
            return '#cccccc';
          },
        },
        margin: [0, 0, 0, 20],
      },

      // Payment methods breakdown
      {
        text: t.byPaymentMethod,
        style: 'subtitle',
        margin: [0, 10, 0, 10],
      },

      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*'],
          body: paymentTableBody,
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex === 0 ? '#01312d' : null;
          },
          hLineWidth: function () {
            return 0.5;
          },
          vLineWidth: function () {
            return 0.5;
          },
          hLineColor: function () {
            return '#cccccc';
          },
          vLineColor: function () {
            return '#cccccc';
          },
        },
      },
    ],

    styles: {
      title: {
        fontSize: 20,
        bold: true,
        color: '#ff8f0a',
      },
      period: {
        fontSize: 12,
        color: '#01312d',
      },
      subtitle: {
        fontSize: 14,
        bold: true,
        color: '#01312d',
        alignment: 'right',
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'white',
        fillColor: '#01312d',
      },
      tableFooter: {
        bold: true,
        fontSize: 10,
        fillColor: '#b1d1a2',
        color: '#01312d',
      },
    },
  };

  // Generate and download
  pdfMake.createPdf(docDefinition).download(`expenses_${dateFrom}_${dateTo}_ar.pdf`);
}
