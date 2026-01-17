"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { messages, type Locale } from '@/lib/messages';
import type { GlobalExpense, ExpenseCategory } from '@/types/globalExpense';
import type { PaymentMethod } from '@/types/paymentMethod';
import { formatEuro } from '@/lib/formatters';
import { uploadReceiptPhoto, deleteReceiptPhoto } from '@/lib/supabase/storage';

type ViewType = 'expenses' | 'categories' | 'add-expense' | 'edit-expense' | 'add-category' | 'edit-category';

export default function GlobalExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.globalExpenses || messages.el.globalExpenses;

  // Categories state
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  // Expenses state
  const [expenses, setExpenses] = useState<GlobalExpense[]>([]);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Load from localStorage on client side only
  useEffect(() => {
    const storedCategories = localStorage.getItem('expenseCategories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }

    const storedExpenses = localStorage.getItem('globalExpenses');
    if (storedExpenses) {
      const parsedExpenses = JSON.parse(storedExpenses);
      // Convert date strings back to Date objects
      const expensesWithDates = parsedExpenses.map((expense: GlobalExpense) => ({
        ...expense,
        date: expense.date ? new Date(expense.date) : undefined,
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt),
      }));
      setExpenses(expensesWithDates);
    }

    const storedMethods = localStorage.getItem('paymentMethods');
    if (storedMethods) {
      setPaymentMethods(JSON.parse(storedMethods));
    }
  }, []);

  const [view, setView] = useState<ViewType>('expenses');
  const [editingExpense, setEditingExpense] = useState<GlobalExpense | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    // Delete photo from storage if exists
    if (expense.receiptPhotoPath) {
      await deleteReceiptPhoto(expense.receiptPhotoPath);
    }

    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem('globalExpenses', JSON.stringify(updated));
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm(t.confirmDeleteCategory)) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('expenseCategories', JSON.stringify(updated));
    }
  };

  // EXPENSES VIEW
  if (view === 'expenses') {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col flex-1 gap-12">

          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/${locale}/page-pay`)}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToPayPage}
            </button>
          </div>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t.title}
          </h1>

          {/* Manage Categories Button */}
          <button
            onClick={() => setView('categories')}
            className="btn-universal w-full text-button flex items-center justify-center"
            style={{ minHeight: '52px', textTransform: 'capitalize' }}
          >
            {t.manageCategories}
          </button>

          {/* No Categories Message */}
          {categories.length === 0 && (
            <p className="text-center text-body" style={{ color: 'var(--orange)' }}>
              {t.noCategories}
            </p>
          )}

          {/* Add Expense Button */}
          <button
            onClick={() => setView('add-expense')}
            className="btn-universal w-full text-button flex items-center justify-center"
            style={{ minHeight: '52px', textTransform: 'capitalize' }}
          >
            {t.addNew}
          </button>

          {/* Expenses List */}
          <div className="flex flex-col gap-4 flex-1">
            {expenses.length === 0 ? (
              <p className="text-center text-body" style={{ color: 'var(--orange)' }}>
                {t.noExpenses}
              </p>
            ) : (
              expenses.map(expense => {
                const category = categories.find(c => c.id === expense.categoryId);
                const paymentMethod = paymentMethods.find(pm => pm.id === expense.paymentMethodId);
                return (
                  <div
                    key={expense.id}
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: 'var(--polar)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1" style={{ paddingLeft: '30px' }}>
                        <p className="text-button" style={{ color: 'var(--deep-teal)' }}>
                          {expense.name}
                        </p>
                        <p className="text-link" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                          {category?.name || 'Uncategorized'}
                        </p>
                        {expense.amount && (
                          <p className="text-link" style={{ color: '#ff8f0a', fontWeight: 600 }}>
                            {formatEuro(expense.amount)}
                          </p>
                        )}
                        {(expense.date || expense.paymentMethodId || expense.inputMethod) && (
                          <div className="flex gap-2 items-center flex-wrap mt-2">
                            {expense.date && (
                              <>
                                <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                  {new Date(expense.date).toLocaleDateString(locale)}
                                </p>
                                <span style={{ color: 'var(--deep-teal)', opacity: 0.5 }}>•</span>
                              </>
                            )}
                            {paymentMethod && (
                              <>
                                <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                  {paymentMethod.name}
                                </p>
                                <span style={{ color: 'var(--deep-teal)', opacity: 0.5 }}>•</span>
                              </>
                            )}
                            {expense.inputMethod && (
                              <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                {expense.inputMethod === 'voice' ? '🎤' : expense.inputMethod === 'photo' ? '📸' : '⌨️'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingExpense(expense);
                            setView('edit-expense');
                          }}
                          className="px-4 rounded-2xl"
                          style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="px-4 rounded-2xl"
                          style={{ backgroundColor: 'var(--orange)', color: 'white', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                    {expense.receiptPhotoUrl && (
                      <div className="mt-2" style={{ paddingLeft: '30px' }}>
                        <img
                          src={expense.receiptPhotoUrl}
                          alt="Receipt"
                          className="rounded-2xl max-w-full"
                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // CATEGORIES VIEW
  if (view === 'categories') {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col flex-1 gap-12">

          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('expenses')}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToExpenses}
            </button>
          </div>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t.manageCategories}
          </h1>

          {/* Add Category Button */}
          <button
            onClick={() => setView('add-category')}
            className="btn-universal w-full text-button flex items-center justify-center"
            style={{ minHeight: '52px', textTransform: 'capitalize' }}
          >
            {t.addCategory}
          </button>

          {/* Categories List */}
          <div className="flex flex-col gap-4 flex-1">
            {categories.length === 0 ? (
              <p className="text-center text-body" style={{ color: 'var(--orange)' }}>
                {t.noCategories}
              </p>
            ) : (
              categories.map(category => (
                <div
                  key={category.id}
                  className="px-4 rounded-2xl flex items-center justify-between"
                  style={{ backgroundColor: 'var(--polar)', height: '52px' }}
                >
                  <p className="text-button" style={{ color: 'var(--deep-teal)', fontSize: '18px', fontWeight: 600, paddingLeft: '5px' }}>
                    {category.name}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setView('edit-category');
                      }}
                      className="px-3 rounded-2xl"
                      style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', height: '40px', fontSize: '16px', fontWeight: 600 }}
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-3 rounded-2xl"
                      style={{ backgroundColor: 'var(--orange)', color: 'white', height: '40px', fontSize: '16px', fontWeight: 600 }}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // ADD/EDIT CATEGORY FORM
  if (view === 'add-category' || view === 'edit-category') {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col gap-12">

          {/* Back Button */}
          <button
            onClick={() => {
              setView('categories');
              setEditingCategory(null);
            }}
            className="btn-universal w-full text-button flex items-center justify-center"
            style={{ minHeight: '52px' }}
          >
            {t.backToExpenses}
          </button>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {editingCategory ? t.edit : t.addCategory}
          </h1>

          <CategoryForm
            category={editingCategory}
            onSave={(category) => {
              let updated;
              if (editingCategory) {
                updated = categories.map(c => c.id === editingCategory.id ? category : c);
              } else {
                updated = [...categories, category];
              }
              setCategories(updated);
              localStorage.setItem('expenseCategories', JSON.stringify(updated));
              setView('categories');
              setEditingCategory(null);
            }}
            onCancel={() => {
              setView('categories');
              setEditingCategory(null);
            }}
            locale={locale}
          />
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // ADD/EDIT EXPENSE FORM
  if (view === 'add-expense' || view === 'edit-expense') {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col gap-12">

          {/* Back Button */}
          <button
            onClick={() => {
              setView('expenses');
              setEditingExpense(null);
            }}
            className="btn-universal w-full text-button flex items-center justify-center"
            style={{ minHeight: '52px' }}
          >
            {t.backToExpenses}
          </button>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {editingExpense ? t.edit : t.addNew}
          </h1>

          <ExpenseForm
            expense={editingExpense}
            categories={categories}
            paymentMethods={paymentMethods}
            onSave={(expense) => {
              let updated;
              if (editingExpense) {
                updated = expenses.map(e => e.id === editingExpense.id ? expense : e);
              } else {
                updated = [...expenses, expense];
              }
              setExpenses(updated);
              localStorage.setItem('globalExpenses', JSON.stringify(updated));
              setView('expenses');
              setEditingExpense(null);
            }}
            onCancel={() => {
              setView('expenses');
              setEditingExpense(null);
            }}
            locale={locale}
          />
          </div>
        </div>
      </BackgroundPage>
    );
  }

  return null;
}

// Category Form Component
function CategoryForm({
  category,
  onSave,
  onCancel,
  locale,
}: {
  category: ExpenseCategory | null;
  onSave: (category: ExpenseCategory) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.globalExpenses || messages.el.globalExpenses;
  const [formData, setFormData] = useState({
    name: category?.name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCategory: ExpenseCategory = {
      id: category?.id || Date.now().toString(),
      userId: 'current-user',
      name: formData.name,
      createdAt: category?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newCategory);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name Input */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.name}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          maxLength={10}
          className="w-full p-3 rounded-2xl text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.name}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', fontSize: '18px', fontWeight: 600 }}
        >
          {t.save}
        </button>
      </div>
    </form>
  );
}

// Expense Form Component
function ExpenseForm({
  expense,
  categories,
  paymentMethods,
  onSave,
  onCancel,
  locale,
}: {
  expense: GlobalExpense | null;
  categories: ExpenseCategory[];
  paymentMethods: PaymentMethod[];
  onSave: (expense: GlobalExpense) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.globalExpenses || messages.el.globalExpenses;
  const tPayments = messages[locale]?.paymentMethods || messages.el.paymentMethods;
  const [formData, setFormData] = useState({
    categoryId: expense?.categoryId || (categories[0]?.id || ''),
    paymentMethodId: expense?.paymentMethodId || (paymentMethods[0]?.id || ''),
    name: expense?.name || '',
    amount: expense?.amount || 0,
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(expense?.receiptPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'manual' | 'voice' | 'photo'>(expense?.inputMethod || 'manual');

  // Анализ чека с помощью AI
  const analyzeReceipt = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, locale }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        // Автозаполнение формы
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          amount: data.amount || prev.amount,
          description: data.description || prev.description,
          date: data.date || prev.date,
        }));

        // Попытка найти подходящую категорию
        if (data.suggestedCategory && categories.length > 0) {
          const categoryMap: Record<string, string[]> = {
            groceries: ['продукты', 'groceries', 'τρόφιμα', 'food', 'supermarket', 'супермаркет'],
            transport: ['транспорт', 'transport', 'μεταφορά', 'fuel', 'бензин', 'parking'],
            utilities: ['коммунальные', 'utilities', 'κοινωφελείς', 'electric', 'water', 'phone'],
            entertainment: ['развлечения', 'entertainment', 'ψυχαγωγία', 'restaurant', 'cinema'],
            healthcare: ['здоровье', 'healthcare', 'υγεία', 'pharmacy', 'аптека', 'doctor'],
            education: ['образование', 'education', 'εκπαίδευση', 'school', 'books', 'курсы'],
          };

          const keywords = categoryMap[data.suggestedCategory] || [];
          const matchedCategory = categories.find(cat =>
            keywords.some(kw => cat.name.toLowerCase().includes(kw.toLowerCase()))
          );

          if (matchedCategory) {
            setFormData(prev => ({ ...prev, categoryId: matchedCategory.id }));
          }
        }

        setInputMethod('photo');
      } else {
        setAnalyzeError(result.error || 'Не удалось распознать чек');
      }
    } catch (error) {
      console.error('Analyze error:', error);
      setAnalyzeError('Ошибка при анализе чека');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview and analyze
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        // Автоматически анализируем чек
        analyzeReceipt(base64);
      };
      reader.readAsDataURL(file);
      setInputMethod('photo');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setInputMethod('manual');
  };

  // Анализ голосового текста с помощью AI
  const analyzeVoiceText = async (transcript: string) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const response = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, locale }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        // Автозаполнение формы
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          amount: data.amount || prev.amount,
          description: data.description || transcript,
          date: data.date || prev.date,
        }));

        // Попытка найти подходящую категорию
        if (data.suggestedCategory && categories.length > 0) {
          const categoryMap: Record<string, string[]> = {
            groceries: ['продукты', 'groceries', 'τρόφιμα', 'food', 'supermarket', 'супермаркет'],
            transport: ['транспорт', 'transport', 'μεταφορά', 'fuel', 'бензин', 'parking'],
            utilities: ['коммунальные', 'utilities', 'κοινωφελείς', 'electric', 'water', 'phone'],
            entertainment: ['развлечения', 'entertainment', 'ψυχαγωγία', 'restaurant', 'cinema'],
            healthcare: ['здоровье', 'healthcare', 'υγεία', 'pharmacy', 'аптека', 'doctor'],
            education: ['образование', 'education', 'εκπαίδευση', 'school', 'books', 'курсы'],
          };

          const keywords = categoryMap[data.suggestedCategory] || [];
          const matchedCategory = categories.find(cat =>
            keywords.some(kw => cat.name.toLowerCase().includes(kw.toLowerCase()))
          );

          if (matchedCategory) {
            setFormData(prev => ({ ...prev, categoryId: matchedCategory.id }));
          }
        }

        setInputMethod('voice');
      } else {
        // Если AI не смог распознать, просто записываем текст в описание
        setFormData(prev => ({ ...prev, description: transcript }));
        setAnalyzeError(result.error || 'Не удалось распознать данные');
      }
    } catch (error) {
      console.error('Voice analyze error:', error);
      // Если ошибка, просто записываем текст в описание
      setFormData(prev => ({ ...prev, description: transcript }));
      setAnalyzeError('Ошибка при анализе голоса');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = locale === 'el' ? 'el-GR' :
                      locale === 'ru' ? 'ru-RU' :
                      locale === 'uk' ? 'uk-UA' :
                      locale === 'sq' ? 'sq-AL' :
                      locale === 'bg' ? 'bg-BG' :
                      locale === 'ro' ? 'ro-RO' :
                      locale === 'ar' ? 'ar-SA' : 'en-US';

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setInputMethod('voice');
    };

    recognition.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      // Анализируем текст с помощью AI
      analyzeVoiceText(transcript);
    };

    recognition.onerror = (event: Event & { error: string }) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      alert('Voice input failed. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert(t.noCategories);
      return;
    }

    if (!formData.paymentMethodId) {
      alert('Please select a payment method');
      return;
    }

    setIsUploading(true);

    let receiptPhotoUrl: string | undefined = expense?.receiptPhotoUrl;
    let receiptPhotoPath: string | undefined = expense?.receiptPhotoPath;

    // Upload photo if new file selected
    if (photoFile) {
      const uploadResult = await uploadReceiptPhoto(photoFile, 'global');
      if (uploadResult) {
        // Delete old photo if exists
        if (expense?.receiptPhotoPath) {
          await deleteReceiptPhoto(expense.receiptPhotoPath);
        }
        receiptPhotoUrl = uploadResult.url;
        receiptPhotoPath = uploadResult.path;
      } else {
        alert('Failed to upload photo. Please try again.');
        setIsUploading(false);
        return;
      }
    }

    const category = categories.find(c => c.id === formData.categoryId);
    const paymentMethod = paymentMethods.find(pm => pm.id === formData.paymentMethodId);

    // Determine input method
    let finalInputMethod: 'manual' | 'voice' | 'photo' = inputMethod;
    if (photoFile && !isRecording) {
      finalInputMethod = 'photo';
    }

    const newExpense: GlobalExpense = {
      id: expense?.id || Date.now().toString(),
      userId: 'current-user',
      categoryId: formData.categoryId,
      categoryName: category?.name,
      paymentMethodId: formData.paymentMethodId,
      paymentMethodName: paymentMethod?.name,
      name: formData.name,
      amount: formData.amount,
      description: formData.description || undefined,
      date: new Date(formData.date),
      receiptPhotoUrl,
      receiptPhotoPath,
      inputMethod: finalInputMethod,
      createdAt: expense?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newExpense);
    setIsUploading(false);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center" style={{ marginTop: '96px' }}>
        <p className="text-body mb-4" style={{ color: 'var(--polar)' }}>
          {t.noCategories}
        </p>
        <button
          onClick={onCancel}
          className="btn-universal"
          style={{ minHeight: '52px', fontSize: '18px', fontWeight: 600 }}
        >
          {t.backToExpenses}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
      {/* Category Select */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
          {t.category}
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full rounded-2xl"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px', fontWeight: 600 }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id} style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
          {t.paymentMethod}
        </label>
        {paymentMethods.length === 0 ? (
          <Link
            href={`/${locale}/payment-methods`}
            className="block rounded-2xl text-center flex items-center justify-center"
            style={{ color: 'var(--orange)', backgroundColor: 'var(--polar)', minHeight: '52px', fontSize: '18px', fontWeight: 600 }}
          >
            {tPayments.noMethods} →
          </Link>
        ) : (
          <select
            value={formData.paymentMethodId}
            onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
            className="w-full rounded-2xl"
            style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px', fontWeight: 600 }}
          >
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id} style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>
                {method.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
          {t.date}
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="w-full p-3 rounded-2xl"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', fontSize: '18px', fontWeight: 600 }}
        />
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
          {t.name}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full p-3 rounded-2xl"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', fontSize: '18px', fontWeight: 600 }}
          placeholder={t.name}
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
          {t.amount}
        </label>
        <input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          className="w-full p-3 rounded-2xl"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', fontSize: '18px', fontWeight: 600 }}
          placeholder="€"
        />
      </div>

      {/* Description Input with Voice */}
      <div>
        <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
          <label className="text-button" style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}>
            {t.description}
          </label>
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isRecording || isAnalyzing}
            className="px-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              backgroundColor: isRecording ? '#ff6a1a' : isAnalyzing ? 'var(--polar)' : 'var(--zanah)',
              color: isRecording ? 'white' : 'var(--deep-teal)',
              minHeight: '40px',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            {isRecording ? '🎤 ...' : isAnalyzing ? '🤖 ...' : `🎤 ${t.voiceButton}`}
          </button>
        </div>
        {(isRecording || isAnalyzing) && (
          <div
            className="mb-2 p-3 rounded-2xl text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--polar)' }}
          >
            {isRecording ? (t.listening || '🎤 Слушаю...') : (t.analyzingVoice || '🤖 Анализирую...')}
          </div>
        )}
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (e.target.value) setInputMethod('manual');
          }}
          className="w-full p-3 rounded-2xl"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
          placeholder={isRecording ? (t.listening || 'Слушаю...') : t.description}
          rows={3}
        />
      </div>

      {/* Receipt Photo */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
          {t.receiptPhoto} {isAnalyzing && '🔄'}
        </label>
        {!photoPreview ? (
          <label className="block w-full rounded-2xl text-center cursor-pointer flex items-center justify-center"
            style={{ border: '2px dashed var(--polar)', color: 'var(--polar)', minHeight: '52px', fontSize: '18px', fontWeight: 600 }}>
            <span>{t.uploadPhoto}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Receipt preview"
              className="rounded-2xl w-full"
              style={{ maxHeight: '300px', objectFit: 'cover', opacity: isAnalyzing ? 0.5 : 1 }}
            />
            {isAnalyzing && (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <div className="text-center" style={{ color: 'white' }}>
                  <div className="text-2xl mb-2">🤖</div>
                  <p style={{ fontSize: '16px', fontWeight: 600 }}>{t.analyzing || 'Анализируем чек...'}</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isAnalyzing}
              className="absolute top-2 right-2 px-4 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--orange)', color: 'white', minHeight: '40px', fontSize: '16px', fontWeight: 600 }}
            >
              {t.removePhoto}
            </button>
          </div>
        )}
        {analyzeError && (
          <p className="mt-2 text-center" style={{ color: 'var(--orange)', fontSize: '14px' }}>
            {analyzeError}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
          disabled={isUploading || isAnalyzing}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', fontSize: '18px', fontWeight: 600 }}
          disabled={isUploading || isAnalyzing || categories.length === 0 || paymentMethods.length === 0}
        >
          {isUploading ? '...' : isAnalyzing ? '🤖' : t.save}
        </button>
      </div>
    </form>
  );
}
