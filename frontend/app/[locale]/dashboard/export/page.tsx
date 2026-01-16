"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";
import type { ObjectExpense } from "@/types/objectExpense";

interface Property {
  id: string;
  name: string;
}

interface ExportTexts {
  title: string;
  selectProperties: string;
  selectAll: string;
  deselectAll: string;
  period: string;
  from: string;
  to: string;
  downloadPDF: string;
  downloadExcel: string;
  loading: string;
}

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }

    setUserId(session.user.id);

    // Загружаем объекты пользователя
    const { data } = await supabase
      .from('properties')
      .select('id, name')
      .eq('user_id', session.user.id)
      .order('name', { ascending: true });

    setProperties(data || []);

    // По умолчанию выбираем все объекты
    if (data) {
      setSelectedProperties(data.map(p => p.id));
    }

    // По умолчанию период - текущий месяц
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(lastDay.toISOString().split('T')[0]);
  }

  function toggleProperty(propertyId: string) {
    if (selectedProperties.includes(propertyId)) {
      setSelectedProperties(selectedProperties.filter(id => id !== propertyId));
    } else {
      setSelectedProperties([...selectedProperties, propertyId]);
    }
  }

  function selectAll() {
    setSelectedProperties(properties.map(p => p.id));
  }

  function deselectAll() {
    setSelectedProperties([]);
  }

  function downloadPDF() {
    if (selectedProperties.length === 0) {
      alert(locale === 'el' ? 'Επιλέξτε τουλάχιστον ένα ακίνητο' : locale === 'ru' ? 'Выберите хотя бы один объект' : 'Select at least one property');
      return;
    }

    if (!dateFrom || !dateTo) {
      alert(locale === 'el' ? 'Επιλέξτε περίοδο' : locale === 'ru' ? 'Выберите период' : 'Select period');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data from localStorage
      const selectedProps = properties.filter(p => selectedProperties.includes(p.id));
      const expensesMap = new Map();

      const dateFromObj = new Date(dateFrom);
      const dateToObj = new Date(dateTo);

      selectedProps.forEach(property => {
        // Load expenses for this property from localStorage
        const storedExpenses = localStorage.getItem(`objectExpenses_${property.id}`);
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses);

          // Filter by date range
          const filteredExpenses = parsedExpenses.filter((expense: ObjectExpense) => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= dateFromObj && expenseDate <= dateToObj;
          });

          expensesMap.set(property.id, filteredExpenses);
        }
      });

      // Generate PDF (not available for Arabic)
      import('@/lib/export/generatePDF').then(({ generatePDF }) => {
        generatePDF({
          properties: selectedProps,
          expenses: expensesMap,
          dateFrom,
          dateTo,
          locale,
        });
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(locale === 'el' ? 'Σφάλμα δημιουργίας PDF' : locale === 'ru' ? 'Ошибка генерации PDF' : 'Error generating PDF');
      setIsLoading(false);
    }
  }

  function downloadExcel() {
    if (selectedProperties.length === 0) {
      alert(locale === 'el' ? 'Επιλέξτε τουλάχιστον ένα ακίνητο' : locale === 'ru' ? 'Выберите хотя бы один объект' : 'Select at least one property');
      return;
    }

    if (!dateFrom || !dateTo) {
      alert(locale === 'el' ? 'Επιλέξτε περίοδο' : locale === 'ru' ? 'Выберите период' : 'Select period');
      return;
    }

    setIsLoading(true);

    try {
      // Import Excel generation library dynamically
      import('@/lib/export/generateExcel').then(({ generateExcel }) => {
        // Prepare data from localStorage
        const selectedProps = properties.filter(p => selectedProperties.includes(p.id));
        const expensesMap = new Map();

        const dateFromObj = new Date(dateFrom);
        const dateToObj = new Date(dateTo);

        selectedProps.forEach(property => {
          // Load expenses for this property from localStorage
          const storedExpenses = localStorage.getItem(`objectExpenses_${property.id}`);
          if (storedExpenses) {
            const parsedExpenses = JSON.parse(storedExpenses);

            // Filter by date range
            const filteredExpenses = parsedExpenses.filter((expense: ObjectExpense) => {
              const expenseDate = new Date(expense.date);
              return expenseDate >= dateFromObj && expenseDate <= dateToObj;
            });

            expensesMap.set(property.id, filteredExpenses);
          }
        });

        // Generate Excel
        generateExcel({
          properties: selectedProps,
          expenses: expensesMap,
          dateFrom,
          dateTo,
          locale,
        });

        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert(locale === 'el' ? 'Σφάλμα δημιουργίας Excel' : locale === 'ru' ? 'Ошибка генерации Excel' : 'Error generating Excel');
      setIsLoading(false);
    }
  }

  // Тексты
  const texts: Record<string, ExportTexts> = {
    el: {
      title: "Εξαγωγή Εξόδων",
      selectProperties: "Επιλέξτε Ακίνητα",
      selectAll: "Επιλογή Όλων",
      deselectAll: "Αποεπιλογή Όλων",
      period: "Περίοδος",
      from: "Από",
      to: "Έως",
      downloadPDF: "Λήψη PDF",
      downloadExcel: "Λήψη Excel",
      loading: "Δημιουργία...",
    },
    ru: {
      title: "Экспорт расходов",
      selectProperties: "Выберите объекты",
      selectAll: "Выбрать все",
      deselectAll: "Снять все",
      period: "Период",
      from: "С",
      to: "По",
      downloadPDF: "Скачать PDF",
      downloadExcel: "Скачать Excel",
      loading: "Генерация...",
    },
    en: {
      title: "Export Expenses",
      selectProperties: "Select Properties",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      period: "Period",
      from: "From",
      to: "To",
      downloadPDF: "Download PDF",
      downloadExcel: "Download Excel",
      loading: "Generating...",
    },
  };

  const t = texts[locale] || texts.en;

  return (
    <BackgroundPage pageIndex={1}>
      <div className="flex min-h-screen flex-col items-center gap-8 pb-20" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}>
        <div className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Select Properties */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading font-semibold" style={{ color: 'var(--deep-teal)' }}>
                {t.selectProperties}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-button px-4 py-2 rounded-xl font-semibold"
                  style={{
                    backgroundColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                    minHeight: '52px',
                    boxShadow: '0 4px 8px var(--deep-teal)',
                  }}
                >
                  {t.selectAll}
                </button>
                <button
                  onClick={deselectAll}
                  className="text-button px-4 py-2 rounded-xl font-semibold"
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    minHeight: '52px',
                    boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {t.deselectAll}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {properties.map((property) => (
                <label
                  key={property.id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-opacity-50"
                  style={{
                    backgroundColor: selectedProperties.includes(property.id)
                      ? 'rgba(177, 209, 162, 0.3)'
                      : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => toggleProperty(property.id)}
                    className="w-5 h-5"
                  />
                  <span style={{ color: 'var(--deep-teal)' }}>{property.name}</span>
                </label>
              ))}

              {properties.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--deep-teal)' }}>
                  Нет объектов
                </p>
              )}
            </div>
          </div>

          {/* Period */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.period}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  {t.from}
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  {t.to}
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className={`grid grid-cols-1 ${locale !== 'ar' ? 'md:grid-cols-2' : ''} gap-4`}>
            {/* PDF button - not available for Arabic */}
            {locale !== 'ar' && (
              <button
                onClick={downloadPDF}
                disabled={isLoading || selectedProperties.length === 0}
                className="btn-primary text-button"
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  opacity: isLoading || selectedProperties.length === 0 ? 0.5 : 1,
                  boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
                }}
              >
                {isLoading ? t.loading : `📄 ${t.downloadPDF}`}
              </button>
            )}

            <button
              onClick={downloadExcel}
              disabled={isLoading || selectedProperties.length === 0}
              className="btn-primary text-button"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                opacity: isLoading || selectedProperties.length === 0 ? 0.5 : 1,
                boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
              }}
            >
              {isLoading ? t.loading : `📊 ${t.downloadExcel}`}
            </button>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}
