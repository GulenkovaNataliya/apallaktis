"use client";

import { useState, useEffect, useRef } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { messages, type Locale } from '@/lib/messages';
import type { GlobalExpense, ExpenseCategory } from '@/types/globalExpense';
import type { PaymentMethod } from '@/types/paymentMethod';
import { formatEuro } from '@/lib/formatters';
import { useAuth } from '@/lib/auth-context';
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory as deleteExpenseCategoryApi,
  getPaymentMethods,
  getGlobalExpenses,
  createGlobalExpense,
  updateGlobalExpense,
  deleteGlobalExpense as deleteGlobalExpenseApi,
  type ExpenseCategory as SupabaseCategory,
  type PaymentMethod as SupabasePaymentMethod,
  type GlobalExpense as SupabaseGlobalExpense,
} from '@/lib/supabase/services';
import { createClient } from '@/lib/supabase/client';
import { getUserTier, canUseFeature, type SubscriptionTier } from '@/lib/subscription';

type ViewType = 'expenses' | 'categories' | 'add-expense' | 'edit-expense' | 'add-category' | 'edit-category';

// Конвертеры из Supabase формата в локальный
function toLocalCategory(cat: SupabaseCategory): ExpenseCategory {
  const name = typeof cat.name === 'string' ? cat.name : (cat.name as any)?.el || (cat.name as any)?.en || '';
  return {
    id: cat.id,
    userId: cat.user_id,
    name,
    createdAt: new Date(cat.created_at),
    updatedAt: new Date(cat.created_at),
  };
}

function toLocalPaymentMethod(pm: SupabasePaymentMethod): PaymentMethod {
  return {
    id: pm.id,
    userId: pm.user_id,
    type: pm.type,
    name: pm.name,
    lastFourDigits: pm.last_four_digits || undefined,
    iban: pm.iban || undefined,
    createdAt: new Date(pm.created_at),
    updatedAt: new Date(pm.created_at),
  };
}

function toLocalExpense(exp: SupabaseGlobalExpense, categories: ExpenseCategory[], paymentMethods: PaymentMethod[]): GlobalExpense {
  const category = categories.find(c => c.id === exp.category_id);
  const paymentMethod = paymentMethods.find(pm => pm.id === exp.payment_method_id);
  return {
    id: exp.id,
    userId: exp.user_id,
    categoryId: exp.category_id || '',
    categoryName: category?.name,
    paymentMethodId: exp.payment_method_id || '',
    paymentMethodName: paymentMethod?.name,
    name: exp.name,
    amount: Number(exp.amount),
    description: exp.description || undefined,
    date: new Date(exp.date),
    inputMethod: exp.input_method as 'manual' | 'voice' | 'photo' | undefined,
    createdAt: new Date(exp.created_at),
    updatedAt: new Date(exp.created_at),
  };
}

export default function GlobalExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.globalExpenses || messages.el.globalExpenses;
  const { user } = useAuth();

  // User subscription state
  const [userTier, setUserTier] = useState<SubscriptionTier>('demo');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  // Check user subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createClient();
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_tier, account_purchased, demo_expires_at, subscription_expires_at, vip_expires_at')
            .eq('id', supabaseUser.id)
            .single();

          if (profile) {
            const tier = getUserTier(profile);
            setUserTier(tier);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  // Check if user has access to voice input and photo receipt
  const voiceCheck = canUseFeature(userTier, 'voiceInput');
  const photoCheck = canUseFeature(userTier, 'photoReceipt');
  const hasVoiceAndPhoto = voiceCheck.allowed && photoCheck.allowed;

  // Subscription upgrade messages
  const subscriptionMessages = {
    el: {
      voiceNotAvailable: 'Η φωνητική εισαγωγή δεν είναι διαθέσιμη στο τιμολόγιο Basic. Αναβαθμίστε σε Standard ή Premium.',
      photoNotAvailable: 'Η σάρωση αποδείξεων δεν είναι διαθέσιμη στο τιμολόγιο Basic. Αναβαθμίστε σε Standard ή Premium.',
      upgradePlan: 'Αναβάθμιση τιμολογίου',
    },
    ru: {
      voiceNotAvailable: 'Голосовой ввод недоступен в тарифе Basic. Улучшите до Standard или Premium.',
      photoNotAvailable: 'Сканирование чеков недоступно в тарифе Basic. Улучшите до Standard или Premium.',
      upgradePlan: 'Улучшить тариф',
    },
    uk: {
      voiceNotAvailable: 'Голосовий ввід недоступний в тарифі Basic. Покращіть до Standard або Premium.',
      photoNotAvailable: 'Сканування чеків недоступне в тарифі Basic. Покращіть до Standard або Premium.',
      upgradePlan: 'Покращити тариф',
    },
    sq: {
      voiceNotAvailable: 'Hyrja me zë nuk është e disponueshme në planin Basic. Përmirësoni në Standard ose Premium.',
      photoNotAvailable: 'Skanimi i faturave nuk është i disponueshëm në planin Basic. Përmirësoni në Standard ose Premium.',
      upgradePlan: 'Përmirëso planin',
    },
    bg: {
      voiceNotAvailable: 'Гласовото въвеждане не е налично в плана Basic. Надградете до Standard или Premium.',
      photoNotAvailable: 'Сканирането на касови бележки не е налично в плана Basic. Надградете до Standard или Premium.',
      upgradePlan: 'Надгради плана',
    },
    ro: {
      voiceNotAvailable: 'Introducerea vocală nu este disponibilă în planul Basic. Actualizați la Standard sau Premium.',
      photoNotAvailable: 'Scanarea chitanțelor nu este disponibilă în planul Basic. Actualizați la Standard sau Premium.',
      upgradePlan: 'Actualizare plan',
    },
    en: {
      voiceNotAvailable: 'Voice input is not available in Basic plan. Upgrade to Standard or Premium.',
      photoNotAvailable: 'Receipt scanning is not available in Basic plan. Upgrade to Standard or Premium.',
      upgradePlan: 'Upgrade plan',
    },
    ar: {
      voiceNotAvailable: 'الإدخال الصوتي غير متاح في الخطة الأساسية. قم بالترقية إلى Standard أو Premium.',
      photoNotAvailable: 'مسح الإيصالات غير متاح في الخطة الأساسية. قم بالترقية إلى Standard أو Premium.',
      upgradePlan: 'ترقية الخطة',
    },
  };

  const tSub = subscriptionMessages[locale] || subscriptionMessages.en;

  // Categories state
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  // Expenses state
  const [expenses, setExpenses] = useState<GlobalExpense[]>([]);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Загружаем параллельно
        const [categoriesData, methodsData, expensesData] = await Promise.all([
          getExpenseCategories(user.id),
          getPaymentMethods(user.id),
          getGlobalExpenses(user.id),
        ]);

        const localCategories = categoriesData.map(toLocalCategory);
        const localMethods = methodsData.map(toLocalPaymentMethod);

        setCategories(localCategories);
        setPaymentMethods(localMethods);
        setExpenses(expensesData.map(exp => toLocalExpense(exp, localCategories, localMethods)));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const [view, setView] = useState<ViewType>('expenses');
  const [editingExpense, setEditingExpense] = useState<GlobalExpense | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  const handleDeleteExpense = async (id: string) => {
    if (!user?.id) return;
    if (!confirm(t.confirmDelete)) return;

    try {
      await deleteGlobalExpenseApi(id, user.id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user?.id) return;
    if (!confirm(t.confirmDeleteCategory)) return;

    try {
      await deleteExpenseCategoryApi(id, user.id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <BackgroundPage pageIndex={3}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center" style={{ color: 'var(--polar)' }}>
            <div className="text-2xl mb-2">⏳</div>
            <p>Loading...</p>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // EXPENSES VIEW
  if (view === 'expenses') {
    return (
      <BackgroundPage pageIndex={3}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col flex-1 gap-12">

          {/* Back - phrase, not a button */}
          <p
            onClick={() => router.push(`/${locale}/page-pay`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToPayPage}
          </p>

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

          {/* No Categories Message - follows button law */}
          {categories.length === 0 && (
            <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
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
          <div className="flex flex-col gap-12 flex-1">
            {expenses.length === 0 ? (
              <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
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
                      <div className="flex-1" style={{ paddingLeft: '6px' }}>
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
                      <div className="mt-2" style={{ paddingLeft: '6px' }}>
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
      <BackgroundPage pageIndex={3}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col flex-1 gap-12">

          {/* Back - phrase, not a button */}
          <p
            onClick={() => setView('expenses')}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToExpenses}
          </p>

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
          <div className="flex flex-col gap-12 flex-1">
            {categories.length === 0 ? (
              <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
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
      <BackgroundPage pageIndex={3}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col gap-12">

          {/* Back - phrase, not a button */}
          <p
            onClick={() => {
              setView('categories');
              setEditingCategory(null);
            }}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToExpenses}
          </p>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {editingCategory ? t.edit : t.addCategory}
          </h1>

          <CategoryForm
            category={editingCategory}
            userId={user?.id || ''}
            onSave={(category) => {
              if (editingCategory) {
                setCategories(categories.map(c => c.id === editingCategory.id ? category : c));
              } else {
                setCategories([...categories, category]);
              }
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
      <BackgroundPage pageIndex={3}>
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full flex flex-col gap-12">

          {/* Back - phrase, not a button */}
          <p
            onClick={() => {
              setView('expenses');
              setEditingExpense(null);
            }}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToExpenses}
          </p>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {editingExpense ? t.edit : t.addNew}
          </h1>

          <ExpenseForm
            expense={editingExpense}
            categories={categories}
            paymentMethods={paymentMethods}
            userId={user?.id || ''}
            onSave={(expense) => {
              if (editingExpense) {
                setExpenses(expenses.map(e => e.id === editingExpense.id ? expense : e));
              } else {
                setExpenses([...expenses, expense]);
              }
              setView('expenses');
              setEditingExpense(null);
            }}
            onCancel={() => {
              setView('expenses');
              setEditingExpense(null);
            }}
            locale={locale}
            hasVoiceAndPhoto={hasVoiceAndPhoto}
            userTier={userTier}
            onUpgradeVoice={() => {
              setUpgradeMessage(tSub.voiceNotAvailable);
              setShowUpgradeModal(true);
            }}
            onUpgradePhoto={() => {
              setUpgradeMessage(tSub.photoNotAvailable);
              setShowUpgradeModal(true);
            }}
          />

          {/* Upgrade Modal */}
          {showUpgradeModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
              onClick={() => setShowUpgradeModal(false)}
            >
              <div
                className="rounded-2xl p-8 mx-4 max-w-sm"
                style={{ backgroundColor: 'var(--deep-teal)', border: '2px solid var(--orange)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-button text-center mb-6" style={{ color: 'var(--polar)' }}>
                  {upgradeMessage}
                </p>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      router.push(`/${locale}/pricing`);
                    }}
                    className="btn-universal w-full text-button"
                    style={{
                      minHeight: '52px',
                      backgroundColor: 'var(--orange)',
                      color: 'var(--deep-teal)',
                    }}
                  >
                    {tSub.upgradePlan}
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="btn-universal w-full text-button"
                    style={{
                      minHeight: '52px',
                      backgroundColor: 'transparent',
                      border: '2px solid var(--polar)',
                      color: 'var(--polar)',
                    }}
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          )}
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
  userId,
  onSave,
  onCancel,
  locale,
}: {
  category: ExpenseCategory | null;
  userId: string;
  onSave: (category: ExpenseCategory) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.globalExpenses || messages.el.globalExpenses;
  const [formData, setFormData] = useState({
    name: category?.name || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);

    try {
      let savedCategory: ExpenseCategory;

      if (category?.id) {
        // Обновление
        const updated = await updateExpenseCategory(category.id, userId, { name: formData.name });
        savedCategory = toLocalCategory(updated);
      } else {
        // Создание
        const created = await createExpenseCategory(userId, { name: formData.name });
        savedCategory = toLocalCategory(created);
      }

      onSave(savedCategory);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-12">
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
          className="w-full rounded-2xl text-button"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
          placeholder={t.name}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', fontSize: '18px', fontWeight: 600 }}
        >
          {isSaving ? '...' : t.save}
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
  userId,
  onSave,
  onCancel,
  locale,
  hasVoiceAndPhoto,
  userTier,
  onUpgradeVoice,
  onUpgradePhoto,
}: {
  expense: GlobalExpense | null;
  categories: ExpenseCategory[];
  paymentMethods: PaymentMethod[];
  userId: string;
  onSave: (expense: GlobalExpense) => void;
  onCancel: () => void;
  locale: Locale;
  hasVoiceAndPhoto: boolean;
  userTier: SubscriptionTier;
  onUpgradeVoice: () => void;
  onUpgradePhoto: () => void;
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
          name: data.name ? data.name.slice(0, 10) : prev.name,
          amount: data.amount || prev.amount,
          description: data.description || prev.description,
          date: data.date || prev.date,
        }));

        // Попытка найти подходящую категорию
        if (data.suggestedCategory && categories.length > 0) {
          const categoryMap: Record<string, string[]> = {
            // === КАТЕГОРИИ ДЛЯ МАСТЕРОВ ===
            materials: [
              'material', 'supply', 'supplies', 'paint', 'cement', 'wood', 'lumber', 'tile', 'pipe', 'wire', 'cable',
              'υλικ', 'μπογιά', 'χρώμα', 'τσιμέντο', 'ξύλο', 'πλακάκ', 'σωλήν', 'καλώδ', 'προμήθ',
              'материал', 'краск', 'цемент', 'дерев', 'древес', 'плитк', 'труб', 'провод', 'кабел', 'гипс', 'шпакл',
              'матеріал', 'фарб', 'цемент', 'дерев', 'плитк', 'труб', 'провід', 'кабел', 'гіпс', 'шпакл',
              'материал', 'боя', 'цимент', 'дърв', 'плочк', 'тръб', 'кабел', 'гипс',
              'material', 'vopsea', 'ciment', 'lemn', 'țiglă', 'țeavă', 'cablu', 'gips',
              'material', 'bojë', 'çimento', 'dru', 'pllakë', 'tub', 'kabllo', 'gips',
              'مواد', 'طلاء', 'أسمنت', 'خشب', 'بلاط', 'أنبوب', 'كابل', 'جبس'
            ],
            tools: [
              'tool', 'equipment', 'drill', 'hammer', 'saw', 'screwdriver', 'machine',
              'εργαλεί', 'τρυπάνι', 'σφυρί', 'πριόνι', 'κατσαβίδι', 'μηχάνημα',
              'инструмент', 'оборудован', 'дрель', 'молоток', 'пила', 'отвёртк', 'отвертк', 'станок', 'шуруповёрт',
              'інструмент', 'обладнан', 'дриль', 'молоток', 'пилк', 'викрутк', 'станок', 'шуруповерт',
              'инструмент', 'оборудван', 'бормашин', 'чук', 'трион', 'отвертк',
              'unealtă', 'sculă', 'echipament', 'bormaşină', 'ciocan', 'fierăstrău', 'şurubelniţă',
              'vegël', 'pajisje', 'trapan', 'çekiç', 'sharrë', 'kaçavidë',
              'أداة', 'معدات', 'مثقاب', 'مطرقة', 'منشار', 'مفك'
            ],
            work: [
              'work', 'service', 'labor', 'subcontract', 'contractor', 'worker', 'job', 'repair',
              'εργασί', 'υπηρεσί', 'εργάτ', 'υπεργολάβ', 'επισκευ', 'δουλει',
              'работ', 'услуг', 'субподряд', 'подрядчик', 'рабочи', 'ремонт', 'монтаж', 'установк',
              'робот', 'послуг', 'субпідряд', 'підрядник', 'робітник', 'ремонт', 'монтаж', 'встановл',
              'работ', 'услуг', 'подизпълнител', 'работник', 'ремонт', 'монтаж',
              'muncă', 'serviciu', 'subcontract', 'contractor', 'lucrător', 'reparație', 'montaj',
              'punë', 'shërbim', 'nënkontratë', 'kontraktor', 'punëtor', 'riparim', 'montim',
              'عمل', 'خدمة', 'مقاول', 'عامل', 'إصلاح', 'تركيب'
            ],
            // === СТАНДАРТНЫЕ КАТЕГОРИИ ===
            groceries: [
              'grocery', 'food', 'supermarket', 'shop', 'store',
              'τρόφιμ', 'σούπερ', 'μαγαζί', 'σκλαβενίτ', 'λιδλ', 'φαγητ',
              'продукт', 'еда', 'магазин', 'супермаркет', 'лидл', 'покупк', 'питан', 'питание',
              'продукт', 'їжа', 'їж', 'магазин', 'супермаркет',
              'храна', 'хран', 'магазин', 'супермаркет', 'продукт',
              'aliment', 'mâncare', 'mâncar', 'magazin', 'supermarket',
              'ushqim', 'dyqan', 'supermarket',
              'طعام', 'بقالة', 'سوبرماركت', 'متجر', 'غذاء'
            ],
            transport: [
              'transport', 'fuel', 'gas', 'parking', 'taxi', 'bus', 'metro', 'petrol', 'diesel',
              'μεταφορ', 'βενζίν', 'καύσιμ', 'πάρκινγκ', 'ταξί', 'λεωφορ', 'μετρό', 'πετρέλαιο', 'ντίζελ',
              'транспорт', 'бензин', 'топливо', 'парковк', 'такси', 'автобус', 'метро', 'горюч', 'дизель', 'солярк',
              'транспорт', 'бензин', 'паливо', 'парковк', 'таксі', 'автобус', 'метро', 'дизель',
              'транспорт', 'бензин', 'гориво', 'паркинг', 'такси', 'автобус', 'метро', 'дизел',
              'transport', 'benzină', 'combustibil', 'parcare', 'taxi', 'autobuz', 'metrou', 'motorină',
              'transport', 'benzinë', 'karburant', 'parking', 'taksi', 'autobus', 'metro', 'naftë',
              'نقل', 'بنزين', 'وقود', 'موقف', 'تاكسي', 'باص', 'مترو', 'ديزل'
            ],
            utilities: [
              'utilit', 'electric', 'water', 'phone', 'internet', 'bill',
              'κοινωφελ', 'ρεύμα', 'νερό', 'τηλέφωνο', 'ίντερνετ', 'δεη', 'λογαριασμ',
              'коммунал', 'электрич', 'свет', 'вода', 'телефон', 'интернет', 'счет', 'счёт',
              'комунал', 'електрик', 'світло', 'вода', 'телефон', 'інтернет', 'рахунок',
              'комунал', 'електрич', 'ток', 'вода', 'телефон', 'интернет', 'сметка',
              'utilități', 'electric', 'apă', 'telefon', 'internet', 'factură',
              'komunal', 'elektrik', 'ujë', 'telefon', 'internet', 'faturë',
              'مرافق', 'كهرباء', 'ماء', 'هاتف', 'إنترنت', 'فاتورة'
            ],
            entertainment: [
              'entertain', 'restaurant', 'cafe', 'cinema', 'movie', 'leisure',
              'ψυχαγωγ', 'εστιατόρ', 'καφέ', 'σινεμά', 'ταινία',
              'развлеч', 'рестор', 'кафе', 'кино', 'фильм', 'отдых',
              'розваг', 'рестор', 'кафе', 'кіно', 'фільм', 'відпочин',
              'развлеч', 'рестор', 'кафе', 'кино', 'филм', 'отдих',
              'divertisment', 'restaurant', 'cafenea', 'cinema', 'film',
              'argëtim', 'restorant', 'kafe', 'kinema', 'film',
              'ترفيه', 'مطعم', 'مقهى', 'سينما', 'فيلم'
            ],
            healthcare: [
              'health', 'pharmacy', 'doctor', 'hospital', 'medicine', 'medical',
              'υγεί', 'φαρμακ', 'γιατρ', 'νοσοκομ', 'φάρμακο',
              'здоров', 'аптек', 'врач', 'больниц', 'лекарств', 'медиц',
              'здоров', 'аптек', 'лікар', 'лікарн', 'ліки', 'медиц',
              'здрав', 'аптек', 'лекар', 'болниц', 'лекарств', 'медиц',
              'sănătate', 'farmacie', 'doctor', 'spital', 'medicament', 'medical',
              'shëndet', 'farmaci', 'doktor', 'spital', 'ilaç', 'mjekësor',
              'صحة', 'صيدلية', 'طبيب', 'مستشفى', 'دواء', 'طبي'
            ],
            education: [
              'educat', 'school', 'course', 'book', 'university', 'college',
              'εκπαίδευ', 'σχολ', 'μάθημα', 'βιβλί', 'πανεπιστ',
              'образован', 'школ', 'курс', 'книг', 'универ', 'учеб',
              'освіт', 'школ', 'курс', 'книг', 'універ', 'навчан',
              'образован', 'учил', 'курс', 'книг', 'универ', 'обучен',
              'educație', 'școală', 'curs', 'carte', 'universitate',
              'arsim', 'shkollë', 'kurs', 'libër', 'universitet',
              'تعليم', 'مدرسة', 'دورة', 'كتاب', 'جامعة'
            ],
          };

          const keywords = categoryMap[data.suggestedCategory] || [];
          const matchedCategory = categories.find(cat =>
            keywords.some(kw => cat.name.toLowerCase().includes(kw.toLowerCase()))
          );

          if (matchedCategory) {
            setFormData(prev => ({ ...prev, categoryId: matchedCategory.id }));
          } else if (categories.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
          }
        }

        // Установка способа оплаты для Photo (fallback на первый)
        if (paymentMethods.length > 0) {
          setFormData(prev => ({ ...prev, paymentMethodId: paymentMethods[0].id }));
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

        // Автозаполнение формы - используем данные если они есть
        setFormData(prev => ({
          ...prev,
          name: data.name && data.name !== 'null' ? data.name.slice(0, 10) : prev.name,
          amount: data.amount !== null && data.amount !== undefined ? data.amount : prev.amount,
          description: data.description || transcript,
          date: data.date || prev.date,
        }));

        // Выбор категории
        if (categories.length > 0) {
          const categoryMap: Record<string, string[]> = {
            // === КАТЕГОРИИ ДЛЯ МАСТЕРОВ ===
            materials: [
              'material', 'supply', 'supplies', 'paint', 'cement', 'wood', 'lumber', 'tile', 'pipe', 'wire', 'cable',
              'υλικ', 'μπογιά', 'χρώμα', 'τσιμέντο', 'ξύλο', 'πλακάκ', 'σωλήν', 'καλώδ', 'προμήθ',
              'материал', 'краск', 'цемент', 'дерев', 'древес', 'плитк', 'труб', 'провод', 'кабел', 'гипс', 'шпакл',
              'матеріал', 'фарб', 'цемент', 'дерев', 'плитк', 'труб', 'провід', 'кабел', 'гіпс', 'шпакл',
              'материал', 'боя', 'цимент', 'дърв', 'плочк', 'тръб', 'кабел', 'гипс',
              'material', 'vopsea', 'ciment', 'lemn', 'țiglă', 'țeavă', 'cablu', 'gips',
              'material', 'bojë', 'çimento', 'dru', 'pllakë', 'tub', 'kabllo', 'gips',
              'مواد', 'طلاء', 'أسمنت', 'خشب', 'بلاط', 'أنبوب', 'كابل', 'جبس'
            ],
            tools: [
              'tool', 'equipment', 'drill', 'hammer', 'saw', 'screwdriver', 'machine',
              'εργαλεί', 'τρυπάνι', 'σφυρί', 'πριόνι', 'κατσαβίδι', 'μηχάνημα',
              'инструмент', 'оборудован', 'дрель', 'молоток', 'пила', 'отвёртк', 'отвертк', 'станок', 'шуруповёрт',
              'інструмент', 'обладнан', 'дриль', 'молоток', 'пилк', 'викрутк', 'станок', 'шуруповерт',
              'инструмент', 'оборудван', 'бормашин', 'чук', 'трион', 'отвертк',
              'unealtă', 'sculă', 'echipament', 'bormaşină', 'ciocan', 'fierăstrău', 'şurubelniţă',
              'vegël', 'pajisje', 'trapan', 'çekiç', 'sharrë', 'kaçavidë',
              'أداة', 'معدات', 'مثقاب', 'مطرقة', 'منشار', 'مفك'
            ],
            work: [
              'work', 'service', 'labor', 'subcontract', 'contractor', 'worker', 'job', 'repair',
              'εργασί', 'υπηρεσί', 'εργάτ', 'υπεργολάβ', 'επισκευ', 'δουλει',
              'работ', 'услуг', 'субподряд', 'подрядчик', 'рабочи', 'ремонт', 'монтаж', 'установк',
              'робот', 'послуг', 'субпідряд', 'підрядник', 'робітник', 'ремонт', 'монтаж', 'встановл',
              'работ', 'услуг', 'подизпълнител', 'работник', 'ремонт', 'монтаж',
              'muncă', 'serviciu', 'subcontract', 'contractor', 'lucrător', 'reparație', 'montaj',
              'punë', 'shërbim', 'nënkontratë', 'kontraktor', 'punëtor', 'riparim', 'montim',
              'عمل', 'خدمة', 'مقاول', 'عامل', 'إصلاح', 'تركيب'
            ],
            // === СТАНДАРТНЫЕ КАТЕГОРИИ ===
            groceries: [
              'grocery', 'food', 'supermarket', 'shop', 'store',
              'τρόφιμ', 'σούπερ', 'μαγαζί', 'σκλαβενίτ', 'λιδλ', 'φαγητ',
              'продукт', 'еда', 'магазин', 'супермаркет', 'лидл', 'покупк', 'питан', 'питание',
              'продукт', 'їжа', 'їж', 'магазин', 'супермаркет',
              'храна', 'хран', 'магазин', 'супермаркет', 'продукт',
              'aliment', 'mâncare', 'mâncar', 'magazin', 'supermarket',
              'ushqim', 'dyqan', 'supermarket',
              'طعام', 'بقالة', 'سوبرماركت', 'متجر', 'غذاء'
            ],
            transport: [
              'transport', 'fuel', 'gas', 'parking', 'taxi', 'bus', 'metro', 'petrol', 'diesel',
              'μεταφορ', 'βενζίν', 'καύσιμ', 'πάρκινγκ', 'ταξί', 'λεωφορ', 'μετρό', 'πετρέλαιο', 'ντίζελ',
              'транспорт', 'бензин', 'топливо', 'парковк', 'такси', 'автобус', 'метро', 'горюч', 'дизель', 'солярк',
              'транспорт', 'бензин', 'паливо', 'парковк', 'таксі', 'автобус', 'метро', 'дизель',
              'транспорт', 'бензин', 'гориво', 'паркинг', 'такси', 'автобус', 'метро', 'дизел',
              'transport', 'benzină', 'combustibil', 'parcare', 'taxi', 'autobuz', 'metrou', 'motorină',
              'transport', 'benzinë', 'karburant', 'parking', 'taksi', 'autobus', 'metro', 'naftë',
              'نقل', 'بنزين', 'وقود', 'موقف', 'تاكسي', 'باص', 'مترو', 'ديزل'
            ],
            utilities: [
              'utilit', 'electric', 'water', 'phone', 'internet', 'bill',
              'κοινωφελ', 'ρεύμα', 'νερό', 'τηλέφωνο', 'ίντερνετ', 'δεη', 'λογαριασμ',
              'коммунал', 'электрич', 'свет', 'вода', 'телефон', 'интернет', 'счет', 'счёт',
              'комунал', 'електрик', 'світло', 'вода', 'телефон', 'інтернет', 'рахунок',
              'комунал', 'електрич', 'ток', 'вода', 'телефон', 'интернет', 'сметка',
              'utilități', 'electric', 'apă', 'telefon', 'internet', 'factură',
              'komunal', 'elektrik', 'ujë', 'telefon', 'internet', 'faturë',
              'مرافق', 'كهرباء', 'ماء', 'هاتف', 'إنترنت', 'فاتورة'
            ],
            entertainment: [
              'entertain', 'restaurant', 'cafe', 'cinema', 'movie', 'leisure',
              'ψυχαγωγ', 'εστιατόρ', 'καφέ', 'σινεμά', 'ταινία',
              'развлеч', 'рестор', 'кафе', 'кино', 'фильм', 'отдых',
              'розваг', 'рестор', 'кафе', 'кіно', 'фільм', 'відпочин',
              'развлеч', 'рестор', 'кафе', 'кино', 'филм', 'отдих',
              'divertisment', 'restaurant', 'cafenea', 'cinema', 'film',
              'argëtim', 'restorant', 'kafe', 'kinema', 'film',
              'ترفيه', 'مطعم', 'مقهى', 'سينما', 'فيلم'
            ],
            healthcare: [
              'health', 'pharmacy', 'doctor', 'hospital', 'medicine', 'medical',
              'υγεί', 'φαρμακ', 'γιατρ', 'νοσοκομ', 'φάρμακο',
              'здоров', 'аптек', 'врач', 'больниц', 'лекарств', 'медиц',
              'здоров', 'аптек', 'лікар', 'лікарн', 'ліки', 'медиц',
              'здрав', 'аптек', 'лекар', 'болниц', 'лекарств', 'медиц',
              'sănătate', 'farmacie', 'doctor', 'spital', 'medicament', 'medical',
              'shëndet', 'farmaci', 'doktor', 'spital', 'ilaç', 'mjekësor',
              'صحة', 'صيدلية', 'طبيب', 'مستشفى', 'دواء', 'طبي'
            ],
            education: [
              'educat', 'school', 'course', 'book', 'university', 'college',
              'εκπαίδευ', 'σχολ', 'μάθημα', 'βιβλί', 'πανεπιστ',
              'образован', 'школ', 'курс', 'книг', 'универ', 'учеб',
              'освіт', 'школ', 'курс', 'книг', 'універ', 'навчан',
              'образован', 'учил', 'курс', 'книг', 'универ', 'обучен',
              'educație', 'școală', 'curs', 'carte', 'universitate',
              'arsim', 'shkollë', 'kurs', 'libër', 'universitet',
              'تعليم', 'مدرسة', 'دورة', 'كتاب', 'جامعة'
            ],
          };

          let matchedCategory: ExpenseCategory | undefined;

          // Сначала ищем по suggestedCategory от AI
          if (data.suggestedCategory) {
            const keywords = categoryMap[data.suggestedCategory] || [];
            matchedCategory = categories.find(cat =>
              keywords.some(kw => cat.name.toLowerCase().includes(kw.toLowerCase()))
            );
          }

          // Если не нашли, ищем по имени из data.name
          if (!matchedCategory && data.name) {
            matchedCategory = categories.find(cat =>
              cat.name.toLowerCase().includes(data.name.toLowerCase()) ||
              data.name.toLowerCase().includes(cat.name.toLowerCase())
            );
          }

          // Если всё ещё не нашли, берем первую категорию
          if (!matchedCategory) {
            matchedCategory = categories[0];
          }

          if (matchedCategory) {
            setFormData(prev => ({ ...prev, categoryId: matchedCategory!.id }));
          }
        }

        // Выбор способа оплаты
        if (paymentMethods.length > 0) {
          let matchedPayment: PaymentMethod | undefined;

          if (data.paymentMethod) {
            // Ищем по типу
            if (data.paymentMethod === 'card') {
              matchedPayment = paymentMethods.find(pm =>
                pm.type === 'credit_card' || pm.type === 'debit_card'
              );
            } else if (data.paymentMethod === 'cash') {
              matchedPayment = paymentMethods.find(pm => pm.type === 'cash');
            } else if (data.paymentMethod === 'bank') {
              matchedPayment = paymentMethods.find(pm => pm.type === 'bank_account');
            }

            // Если не нашли по типу, ищем по имени
            if (!matchedPayment) {
              const paymentKeywords: Record<string, string[]> = {
                cash: [
                  'cash', 'μετρητ', 'μετρητά', 'наличн', 'наличные', 'кэш', 'нал',
                  'готівк', 'готівка', 'кеш', 'брой', 'в брой', 'numerar', 'para', 'نقد', 'كاش'
                ],
                card: [
                  'card', 'credit', 'debit', 'visa', 'master', 'mastercard',
                  'κάρτ', 'κάρτα', 'πιστωτ', 'χρεωστ',
                  'карт', 'карта', 'картой', 'кредит', 'дебет',
                  'картк', 'кредит', 'дебет',
                  'carte', 'kartë', 'بطاقة', 'كارت', 'ائتمان', 'فيزا', 'ماستر'
                ],
                bank: [
                  'bank', 'transfer', 'wire', 'iban',
                  'τράπεζ', 'έμβασμα', 'μεταφορ',
                  'банк', 'перевод', 'ибан', 'счет', 'счёт',
                  'переказ', 'рахунок', 'превод', 'сметка',
                  'bancă', 'cont', 'bankë', 'transfertë', 'llogari',
                  'بنك', 'تحويل', 'حساب'
                ],
              };
              const keywords = paymentKeywords[data.paymentMethod] || [];
              matchedPayment = paymentMethods.find(pm =>
                keywords.some(kw => pm.name.toLowerCase().includes(kw.toLowerCase()))
              );
            }
          }

          // Если AI не предложил или не нашли, берем первый способ оплаты
          if (!matchedPayment) {
            matchedPayment = paymentMethods[0];
          }

          if (matchedPayment) {
            setFormData(prev => ({ ...prev, paymentMethodId: matchedPayment!.id }));
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

  // Ref для хранения recognition instance
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  const handleVoiceInput = () => {
    // Если уже записываем - останавливаем
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    transcriptRef.current = '';

    recognition.lang = locale === 'el' ? 'el-GR' :
                      locale === 'ru' ? 'ru-RU' :
                      locale === 'uk' ? 'uk-UA' :
                      locale === 'sq' ? 'sq-AL' :
                      locale === 'bg' ? 'bg-BG' :
                      locale === 'ro' ? 'ro-RO' :
                      locale === 'ar' ? 'ar-SA' : 'en-US';

    // Включаем непрерывную запись для более длинных фраз
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setInputMethod('voice');
    };

    recognition.onresult = (event: any) => {
      // Используем event.resultIndex чтобы не дублировать результаты
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Добавляем только НОВЫЕ финальные результаты
          transcriptRef.current += result[0].transcript + ' ';
        }
      }

      // Собираем текущий interim для отображения
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Показываем финальный + промежуточный текст
      setFormData(prev => ({
        ...prev,
        description: (transcriptRef.current + interimTranscript).trim() || prev.description
      }));
    };

    recognition.onerror = (event: Event & { error: string }) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;

      // Анализируем собранный текст
      const finalText = transcriptRef.current;
      if (finalText && finalText.length > 0) {
        analyzeVoiceText(finalText);
      }
    };

    recognition.start();

    // Автоматическая остановка через 30 секунд
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 30000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) return;

    if (!formData.categoryId) {
      alert(t.noCategories);
      return;
    }

    if (!formData.paymentMethodId) {
      alert('Please select a payment method');
      return;
    }

    setIsUploading(true);

    const category = categories.find(c => c.id === formData.categoryId);
    const paymentMethod = paymentMethods.find(pm => pm.id === formData.paymentMethodId);

    // Determine input method
    let finalInputMethod: 'manual' | 'voice' | 'photo' = inputMethod;
    if (photoFile && !isRecording) {
      finalInputMethod = 'photo';
    }

    try {
      let savedExpense: GlobalExpense;

      if (expense?.id) {
        // Обновление существующего
        const updated = await updateGlobalExpense(expense.id, userId, {
          category_id: formData.categoryId || null,
          payment_method_id: formData.paymentMethodId || null,
          name: formData.name,
          amount: formData.amount,
          description: formData.description || null,
          date: formData.date,
          input_method: finalInputMethod,
        });
        savedExpense = toLocalExpense(updated, categories, paymentMethods);
      } else {
        // Создание нового
        const created = await createGlobalExpense(userId, {
          category_id: formData.categoryId || null,
          payment_method_id: formData.paymentMethodId || null,
          name: formData.name,
          amount: formData.amount,
          description: formData.description || null,
          date: formData.date,
          input_method: finalInputMethod,
        });
        savedExpense = toLocalExpense(created, categories, paymentMethods);
      }

      onSave(savedExpense);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    } finally {
      setIsUploading(false);
    }
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
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-12">
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
            className="rounded-2xl text-center flex items-center justify-center"
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
          className="w-full rounded-2xl text-button"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
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
          maxLength={10}
          className="w-full rounded-2xl text-button"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
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
          className="w-full rounded-2xl text-button"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
          placeholder="€"
        />
      </div>

      {/* Description Input with Voice */}
      <div>
        <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
          <label className="text-button" style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}>
            {t.description}
          </label>
          {/* Voice button - shown for all, but triggers upgrade for Basic */}
          <button
            type="button"
            onClick={hasVoiceAndPhoto ? handleVoiceInput : onUpgradeVoice}
            disabled={isAnalyzing}
            className="px-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              backgroundColor: isRecording ? '#ff6a1a' : isAnalyzing ? 'var(--polar)' : hasVoiceAndPhoto ? 'var(--zanah)' : 'var(--polar)',
              color: isRecording ? 'white' : 'var(--deep-teal)',
              minHeight: '40px',
              fontSize: '16px',
              fontWeight: 600,
              opacity: hasVoiceAndPhoto ? 1 : 0.7,
            }}
          >
            {isRecording ? '⏹️ STOP' : isAnalyzing ? '🤖 ...' : `🎤 ${t.voiceButton}`}
          </button>
        </div>
        {(isRecording || isAnalyzing) && (
          <div
            className="mb-2 p-3 rounded-2xl text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--polar)' }}
          >
            {isRecording ? (t.listeningTapStop || '🎤 Говорите... (нажмите STOP когда закончите)') : (t.analyzingVoice || '🤖 Анализирую...')}
          </div>
        )}
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (e.target.value) setInputMethod('manual');
          }}
          className="w-full rounded-2xl text-button"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '104px', padding: '12px' }}
          placeholder={isRecording ? (t.listening || 'Слушаю...') : t.description}
          rows={3}
        />
      </div>

      {/* Receipt Photo - shown for all, but triggers upgrade for Basic */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
          {t.receiptPhoto} {isAnalyzing && '🔄'}
        </label>
        {!photoPreview ? (
          hasVoiceAndPhoto ? (
            <label className="w-full rounded-2xl text-center cursor-pointer flex items-center justify-center"
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
            <button
              type="button"
              onClick={onUpgradePhoto}
              className="w-full rounded-2xl text-center flex items-center justify-center"
              style={{ border: '2px dashed var(--polar)', color: 'var(--polar)', minHeight: '52px', fontSize: '18px', fontWeight: 600, opacity: 0.7 }}>
              {t.uploadPhoto}
            </button>
          )
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
            {!isAnalyzing && (
              <p className="absolute bottom-0 left-0 right-0 text-center py-2 rounded-b-2xl"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--orange)', fontSize: '18px', fontWeight: 600 }}>
                {t.deletePhotoToSave}
              </p>
            )}
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
