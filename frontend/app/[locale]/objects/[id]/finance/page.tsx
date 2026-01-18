"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { messages, type Locale } from '@/lib/messages';
import type { PropertyObject } from '@/types/object';
import type { ObjectFinance, AdditionalWork, Payment } from '@/types/finance';
import type { PaymentMethod } from '@/types/paymentMethod';
import type { ObjectExpense } from '@/types/objectExpense';
import type { ExpenseCategory } from '@/types/globalExpense';
import { formatEuro } from '@/lib/formatters';
import { useAuth } from '@/lib/auth-context';
import {
  getExpenseCategories,
  createExpenseCategory,
  getPaymentMethods,
  getObjectById,
  getObjectExpenses,
  createObjectExpense,
  deleteObjectExpense as deleteObjectExpenseApi,
  getObjectExtras,
  createObjectExtra,
  deleteObjectExtra,
  getObjectPayments,
  createObjectPayment,
  deleteObjectPayment,
  type ExpenseCategory as SupabaseCategory,
  type PaymentMethod as SupabasePaymentMethod,
  type ObjectExpense as SupabaseObjectExpense,
  type PropertyObject as SupabasePropertyObject,
  type ObjectExtra as SupabaseObjectExtra,
  type ObjectPayment as SupabaseObjectPayment,
} from '@/lib/supabase/services';

type ViewType = 'main' | 'add-work' | 'add-payment' | 'add-expense';

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

function toLocalObjectExpense(exp: SupabaseObjectExpense, categories: ExpenseCategory[], paymentMethods: PaymentMethod[]): ObjectExpense {
  const category = categories.find(c => c.id === exp.category_id);
  const paymentMethod = paymentMethods.find(pm => pm.id === exp.payment_method_id);
  return {
    id: exp.id,
    objectId: exp.object_id,
    categoryId: exp.category_id || '',
    categoryName: category?.name,
    paymentMethodId: exp.payment_method_id || '',
    paymentMethodName: paymentMethod?.name,
    amount: Number(exp.amount),
    description: exp.description || undefined,
    date: new Date(exp.date),
    inputMethod: exp.input_method as 'manual' | 'voice' | 'photo' | undefined,
    createdAt: new Date(exp.created_at),
    updatedAt: new Date(exp.created_at),
  };
}

function toLocalObject(obj: SupabasePropertyObject): PropertyObject {
  return {
    id: obj.id,
    userId: obj.user_id,
    name: obj.name,
    address: obj.address || '',
    clientName: obj.client_name || '',
    clientContact: obj.client_contact || '',
    contractPrice: Number(obj.contract_price),
    status: obj.status,
    color: obj.color || undefined,
    createdAt: new Date(obj.created_at),
    updatedAt: new Date(obj.updated_at),
  };
}

function toLocalAdditionalWork(extra: SupabaseObjectExtra): AdditionalWork {
  return {
    id: extra.id,
    objectId: extra.object_id,
    date: new Date(extra.date),
    amount: Number(extra.amount),
    description: extra.description || '',
    createdAt: new Date(extra.created_at),
  };
}

function toLocalPayment(payment: SupabaseObjectPayment): Payment {
  return {
    id: payment.id,
    objectId: payment.object_id,
    date: new Date(payment.date),
    amount: Number(payment.amount),
    paymentMethodId: payment.payment_method_id || '',
    createdAt: new Date(payment.created_at),
  };
}

export default function ObjectFinancePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const objectId = params.id as string;
  const t = messages[locale]?.finance || messages.el.finance;
  const tObjects = messages[locale]?.objects || messages.el.objects;
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [object, setObject] = useState<PropertyObject | null>(null);
  const [finance, setFinance] = useState<ObjectFinance | null>(null);
  const [view, setView] = useState<ViewType>('main');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Object expenses state
  const [expenses, setExpenses] = useState<ObjectExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedPaymentMethods, setExpandedPaymentMethods] = useState<Set<string>>(new Set());

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      setMounted(true);

      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Загружаем все данные из Supabase параллельно
        const [
          categoriesData,
          methodsData,
          expensesData,
          objectData,
          extrasData,
          paymentsData,
        ] = await Promise.all([
          getExpenseCategories(user.id),
          getPaymentMethods(user.id),
          getObjectExpenses(objectId),
          getObjectById(objectId, user.id),
          getObjectExtras(objectId),
          getObjectPayments(objectId),
        ]);

        const localCategories = categoriesData.map(toLocalCategory);
        const localMethods = methodsData.map(toLocalPaymentMethod);

        setCategories(localCategories);
        setPaymentMethods(localMethods);
        setExpenses(expensesData.map(exp => toLocalObjectExpense(exp, localCategories, localMethods)));

        // Загружаем объект
        if (objectData) {
          const foundObject = toLocalObject(objectData);
          setObject(foundObject);

          // Загружаем additionalWorks и payments
          const additionalWorks = extrasData.map(toLocalAdditionalWork);
          const payments = paymentsData.map(toLocalPayment);

          // Рассчитываем finance
          const calculatedFinance = calculateFinance(
            foundObject.contractPrice,
            additionalWorks,
            payments
          );
          setFinance(calculatedFinance);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }

      setIsLoading(false);
    }

    loadData();
  }, [objectId, user?.id]);

  // Recalculate and update finance state (no localStorage needed - data in Supabase)
  const updateFinanceState = (
    additionalWorks: AdditionalWork[],
    payments: Payment[]
  ) => {
    if (!object) return;
    const updatedFinance = calculateFinance(object.contractPrice, additionalWorks, payments);
    setFinance(updatedFinance);
  };

  // Calculate balance
  const calculateFinance = (
    contractPrice: number,
    additionalWorks: AdditionalWork[],
    payments: Payment[]
  ): ObjectFinance => {
    const totalAdditionalWorks = additionalWorks.reduce((sum, work) => sum + work.amount, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = contractPrice + totalAdditionalWorks - totalPayments;

    let balanceStatus: 'debt' | 'closed' | 'overpaid';
    if (balance > 0.01) {
      balanceStatus = 'debt';
    } else if (balance < -0.01) {
      balanceStatus = 'overpaid';
    } else {
      balanceStatus = 'closed';
    }

    return {
      objectId,
      contractPrice,
      additionalWorks,
      payments,
      totalAdditionalWorks,
      totalPayments,
      balance,
      balanceStatus,
    };
  };

  // Add additional work
  const handleAddWork = async (work: Omit<AdditionalWork, 'id' | 'createdAt'>) => {
    if (!finance || !object) return;

    try {
      const created = await createObjectExtra({
        object_id: objectId,
        amount: work.amount,
        description: work.description || null,
        date: work.date instanceof Date ? work.date.toISOString().split('T')[0] : work.date,
      });

      const newWork = toLocalAdditionalWork(created);
      const updatedWorks = [...finance.additionalWorks, newWork];
      updateFinanceState(updatedWorks, finance.payments);
      setView('main');
    } catch (error) {
      console.error('Error adding work:', error);
      alert('Failed to add additional work');
    }
  };

  // Add payment
  const handleAddPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    if (!finance || !object) return;

    try {
      const created = await createObjectPayment({
        object_id: objectId,
        payment_method_id: payment.paymentMethodId || null,
        amount: payment.amount,
        date: payment.date instanceof Date ? payment.date.toISOString().split('T')[0] : payment.date,
      });

      const newPayment = toLocalPayment(created);
      const updatedPayments = [...finance.payments, newPayment];
      updateFinanceState(finance.additionalWorks, updatedPayments);
      setView('main');
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    }
  };

  // Delete additional work
  const handleDeleteWork = async (workId: string) => {
    if (!finance || !confirm(t.confirmDeleteWork)) return;

    try {
      await deleteObjectExtra(workId, objectId);
      const updatedWorks = finance.additionalWorks.filter(work => work.id !== workId);
      updateFinanceState(updatedWorks, finance.payments);
    } catch (error) {
      console.error('Error deleting work:', error);
      alert('Failed to delete additional work');
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!finance || !confirm(t.confirmDeletePayment)) return;

    try {
      await deleteObjectPayment(paymentId, objectId);
      const updatedPayments = finance.payments.filter(payment => payment.id !== paymentId);
      updateFinanceState(finance.additionalWorks, updatedPayments);
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    }
  };

  // Add expense
  const handleAddExpense = async (expense: Omit<ObjectExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await createObjectExpense({
        object_id: objectId,
        category_id: expense.categoryId || null,
        payment_method_id: expense.paymentMethodId || null,
        name: expense.categoryName || 'Expense',
        amount: expense.amount,
        description: expense.description || null,
        date: expense.date instanceof Date ? expense.date.toISOString().split('T')[0] : expense.date,
        input_method: expense.inputMethod || 'manual',
      });

      const newExpense = toLocalObjectExpense(created, categories, paymentMethods);
      setExpenses([...expenses, newExpense]);
      setView('main');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm(t.confirmDeleteExpense)) return;

    try {
      await deleteObjectExpenseApi(expenseId, objectId);
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle payment method expansion
  const togglePaymentMethod = (methodId: string) => {
    const newExpanded = new Set(expandedPaymentMethods);
    if (newExpanded.has(methodId)) {
      newExpanded.delete(methodId);
    } else {
      newExpanded.add(methodId);
    }
    setExpandedPaymentMethods(newExpanded);
  };

  // Group expenses by category
  const groupByCategory = () => {
    const groups: { [key: string]: ObjectExpense[] } = {};
    expenses.forEach(expense => {
      const catId = expense.categoryId || 'unknown';
      if (!groups[catId]) {
        groups[catId] = [];
      }
      groups[catId].push(expense);
    });
    return groups;
  };

  // Group expenses by payment method
  const groupByPaymentMethod = () => {
    const groups: { [key: string]: ObjectExpense[] } = {};
    expenses.forEach(expense => {
      const pmId = expense.paymentMethodId || 'unknown';
      if (!groups[pmId]) {
        groups[pmId] = [];
      }
      groups[pmId].push(expense);
    });
    return groups;
  };

  if (!mounted || !object || !finance) {
    return null;
  }

  // MAIN VIEW
  // Loading state
  if (isLoading || !finance) {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center" style={{ color: 'var(--polar)' }}>
            <div className="text-2xl mb-2">⏳</div>
            <p>Loading...</p>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  if (view === 'main') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen flex flex-col" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6" style={{ marginTop: '120px' }}>
            <button
              onClick={() => router.push(`/${locale}/objects`)}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToObject}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--polar)' }}>
            {t.title}
          </h1>

          {/* Contract Price Section */}
          <div className="rounded-xl mb-6" style={{ backgroundColor: 'var(--polar)', padding: '24px 24px 24px 32px' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
              {t.contractPrice}
            </h2>
            <p className="text-2xl font-bold" style={{ color: 'var(--deep-teal)' }}>
              {formatEuro(finance.contractPrice)}
            </p>
          </div>

          {/* Additional Works Section */}
          <div className="rounded-xl mb-6" style={{ backgroundColor: 'var(--polar)', padding: '24px 24px 24px 32px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
                {tObjects.additionalWorks}
              </h2>
              <button
                onClick={() => setView('add-work')}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
              >
                <span className="text-2xl font-bold">+</span>
              </button>
            </div>

            {finance.additionalWorks.length === 0 ? (
              <p className="text-sm opacity-70" style={{ color: 'var(--deep-teal)' }}>
                {t.noAdditionalWorks}
              </p>
            ) : (
              <div className="space-y-3">
                {finance.additionalWorks.map((work) => (
                  <div key={work.id} className="flex justify-between items-start rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '12px 12px 12px 20px' }}>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--deep-teal)' }}>
                        {work.description}
                      </p>
                      <p className="text-sm opacity-70" style={{ color: 'var(--deep-teal)' }}>
                        {new Date(work.date).toLocaleDateString(locale)}
                      </p>
                      <p className="text-lg font-bold mt-1" style={{ color: 'var(--deep-teal)' }}>
                        +{formatEuro(work.amount)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteWork(work.id)}
                      className="text-button px-4 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: '#ff6a1a', color: 'white', minHeight: '52px', boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)' }}
                    >
                      {t.delete}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)' }}>
              <div className="flex justify-between">
                <span className="font-semibold" style={{ color: 'var(--deep-teal)' }}>
                  {t.total}
                </span>
                <span className="text-xl font-bold" style={{ color: 'var(--deep-teal)' }}>
                  {formatEuro(finance.totalAdditionalWorks)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div className="rounded-xl mb-6" style={{ backgroundColor: 'var(--polar)', padding: '24px 24px 24px 32px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
                {t.payment}
              </h2>
              <button
                onClick={() => setView('add-payment')}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ff6a1a', color: 'white' }}
              >
                <span className="text-2xl font-bold">-</span>
              </button>
            </div>

            {finance.payments.length === 0 ? (
              <p className="text-sm opacity-70" style={{ color: 'var(--deep-teal)' }}>
                {t.noPayments}
              </p>
            ) : (
              <div className="space-y-3">
                {finance.payments.map((payment) => {
                  const method = paymentMethods.find(m => m.id === payment.paymentMethodId);
                  const methodName = method ? method.name : payment.paymentMethodId;

                  return (
                    <div key={payment.id} className="flex justify-between items-start rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '12px 12px 12px 20px' }}>
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: 'var(--deep-teal)' }}>
                          {methodName}
                        </p>
                        <p className="text-sm opacity-70" style={{ color: 'var(--deep-teal)' }}>
                          {new Date(payment.date).toLocaleDateString(locale)}
                        </p>
                        {payment.description && (
                          <p className="text-sm mt-1" style={{ color: 'var(--deep-teal)' }}>
                            {payment.description}
                          </p>
                        )}
                        <p className="text-lg font-bold mt-1" style={{ color: 'var(--deep-teal)' }}>
                          -{formatEuro(payment.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-sm px-3 py-1 rounded-lg"
                        style={{ backgroundColor: '#ff6a1a', color: 'white' }}
                      >
                        {t.delete}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)' }}>
              <div className="flex justify-between">
                <span className="font-semibold" style={{ color: 'var(--deep-teal)' }}>
                  {t.total}
                </span>
                <span className="text-xl font-bold" style={{ color: 'var(--deep-teal)' }}>
                  {formatEuro(finance.totalPayments)}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Section */}
          <div className="rounded-xl" style={{
            backgroundColor: finance.balanceStatus === 'debt' ? '#ff6a1a' :
                           finance.balanceStatus === 'overpaid' ? 'var(--zanah)' :
                           'var(--polar)',
            padding: '24px 24px 24px 32px'
          }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: finance.balanceStatus === 'debt' ? 'white' : 'var(--deep-teal)' }}>
              {t.balance}
            </h2>
            <p className="text-3xl font-bold" style={{ color: finance.balanceStatus === 'debt' ? 'white' : 'var(--deep-teal)' }}>
              {formatEuro(finance.balance)}
            </p>
            <p className="text-sm mt-2" style={{ color: finance.balanceStatus === 'debt' ? 'white' : 'var(--deep-teal)', opacity: 0.9 }}>
              {finance.balanceStatus === 'debt' && t.debt}
              {finance.balanceStatus === 'closed' && t.closed}
              {finance.balanceStatus === 'overpaid' && t.overpaid}
            </p>
          </div>

          {/* Divider */}
          <div className="my-8" style={{ height: '2px', backgroundColor: 'var(--polar)', opacity: 0.3 }} />

          {/* Object Expenses Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--polar)' }}>
              {t.expenses}
            </h2>

            {expenses.length === 0 ? (
              <p className="text-center text-sm mb-6" style={{ color: 'var(--polar)', opacity: 0.7 }}>
                {t.noExpenses}
              </p>
            ) : (
              <>
                {/* Grouped by Category */}
                <div className="space-y-3 mb-6">
                  {Object.entries(groupByCategory()).map(([categoryId, categoryExpenses]) => {
                    const category = categories.find(c => c.id === categoryId);
                    const categoryName = category?.name || 'Unknown';
                    const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                    const count = categoryExpenses.length;
                    const isExpanded = expandedCategories.has(categoryId);

                    return (
                      <div key={categoryId} className="rounded-xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
                        {/* Category Header */}
                        <button
                          onClick={() => toggleCategory(categoryId)}
                          className="w-full flex justify-between items-center text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: '20px' }}>📦</span>
                            <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                              {categoryName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                              ({count}x)
                            </span>
                            <span className="text-lg font-bold" style={{ color: 'var(--deep-teal)' }}>
                              {formatEuro(totalAmount)}
                            </span>
                            <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </button>

                        {/* Expanded Items */}
                        {isExpanded && (
                          <div className="mt-4 space-y-3 pl-8 border-l-2" style={{ borderColor: 'rgba(1, 49, 45, 0.2)' }}>
                            {categoryExpenses.map((expense) => {
                              const paymentMethod = paymentMethods.find(pm => pm.id === expense.paymentMethodId);
                              const paymentMethodName = paymentMethod ? paymentMethod.name : expense.paymentMethodName || '-';

                              return (
                                <div key={expense.id} className="rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '12px 16px' }}>
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <div className="flex gap-2 items-center flex-wrap mb-1">
                                        <p className="text-xs font-semibold" style={{ color: 'var(--deep-teal)' }}>
                                          {formatEuro(expense.amount)}
                                        </p>
                                        <span style={{ color: 'var(--deep-teal)', opacity: 0.5 }}>•</span>
                                        <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                          {paymentMethodName}
                                        </p>
                                        <span style={{ color: 'var(--deep-teal)', opacity: 0.5 }}>•</span>
                                        <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                          {new Date(expense.date).toLocaleDateString(locale)}
                                        </p>
                                        {expense.inputMethod && (
                                          <>
                                            <span style={{ color: 'var(--deep-teal)', opacity: 0.5 }}>•</span>
                                            <p className="text-xs" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                              {expense.inputMethod === 'voice' ? '🎤' : expense.inputMethod === 'photo' ? '📸' : '⌨️'}
                                            </p>
                                          </>
                                        )}
                                      </div>
                                      {expense.description && (
                                        <p className="text-sm mt-1" style={{ color: 'var(--deep-teal)' }}>
                                          {expense.description}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleDeleteExpense(expense.id)}
                                      className="text-button px-4 py-2 rounded-lg ml-2 font-semibold"
                                      style={{ backgroundColor: '#ff6a1a', color: 'white', minHeight: '52px', boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)' }}
                                    >
                                      {t.delete}
                                    </button>
                                  </div>
                                  {expense.receiptPhotoUrl && (
                                    <div className="mt-2">
                                      <img
                                        src={expense.receiptPhotoUrl}
                                        alt="Receipt"
                                        className="rounded-lg max-w-full"
                                        style={{ maxHeight: '150px', objectFit: 'cover' }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Grouped by Payment Method */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--polar)' }}>
                    {t.byPaymentMethod}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(groupByPaymentMethod()).map(([methodId, methodExpenses]) => {
                      const method = paymentMethods.find(pm => pm.id === methodId);
                      const methodName = method?.name || 'Unknown';
                      const totalAmount = methodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                      const count = methodExpenses.length;
                      const isExpanded = expandedPaymentMethods.has(methodId);

                      return (
                        <div key={methodId} className="rounded-xl" style={{ backgroundColor: 'var(--polar)', padding: '12px 20px' }}>
                          <button
                            onClick={() => togglePaymentMethod(methodId)}
                            className="w-full flex justify-between items-center text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: '16px' }}>💳</span>
                              <span className="font-semibold" style={{ color: 'var(--deep-teal)', fontSize: '14px' }}>
                                {methodName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                ({count}x)
                              </span>
                              <span className="text-md font-bold" style={{ color: 'var(--deep-teal)' }}>
                                {formatEuro(totalAmount)}
                              </span>
                              <span style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="mt-3 pl-6 text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
                              {methodExpenses.map((exp, idx) => {
                                const cat = categories.find(c => c.id === exp.categoryId);
                                return (
                                  <div key={exp.id} className="py-1">
                                    • {cat?.name || 'Unknown'}: {formatEuro(exp.amount)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Add Expense Button */}
            <button
              onClick={() => setView('add-expense')}
              className="btn-universal w-full text-button mb-6"
              style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
            >
              + {t.addExpense}
            </button>

            {/* Total Expenses */}
            {expenses.length > 0 && (
              <div className="rounded-xl mb-6" style={{ backgroundColor: 'var(--polar)', padding: '20px 24px' }}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
                    Έξοδα Έργου
                  </span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--deep-teal)' }}>
                    {formatEuro(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Detailed Analytics Button */}
            {expenses.length > 0 && (
              <button
                onClick={() => {
                  // TODO: Link to personal cabinet analytics page
                  alert(t.detailedAnalytics);
                }}
                className="btn-universal w-full text-button mb-6"
                style={{ minHeight: '52px', backgroundColor: 'var(--polar)', color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}
              >
                📊 {t.detailedAnalytics}
              </button>
            )}

            {/* Calculate Profit Button */}
            {expenses.length > 0 && (
              <button
                onClick={() => {
                  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                  const profit = finance.contractPrice - totalExpenses;
                  const profitMessage = `
Τιμή Σύμβασης: ${formatEuro(finance.contractPrice)}
Έξοδα Έργου: ${formatEuro(totalExpenses)}
Κέρδος: ${formatEuro(profit)}

Θέλετε να κλείσετε το έργο;
                  `.trim();

                  if (confirm(profitMessage)) {
                    // Close object logic here
                    alert('Η λειτουργία κλεισίματος έργου θα προστεθεί σύντομα.');
                  }
                }}
                className="btn-universal w-full text-button"
                style={{ minHeight: '64px', backgroundColor: '#ff6a1a', color: 'white', fontSize: '20px', fontWeight: 600 }}
              >
                Υπολογισμός Κέρδους
              </button>
            )}
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // ADD WORK VIEW
  if (view === 'add-work') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => setView('main')}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToObject}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
            {t.addAdditionalWork}
          </h1>

          <AddWorkForm
            objectId={objectId}
            onSave={handleAddWork}
            onCancel={() => setView('main')}
            locale={locale}
          />
        </div>
      </BackgroundPage>
    );
  }

  // ADD PAYMENT VIEW
  if (view === 'add-payment') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => setView('main')}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToObject}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
            {t.addPayment}
          </h1>

          <AddPaymentForm
            objectId={objectId}
            paymentMethods={paymentMethods}
            onSave={handleAddPayment}
            onCancel={() => setView('main')}
            locale={locale}
          />
        </div>
      </BackgroundPage>
    );
  }

  // ADD EXPENSE VIEW
  if (view === 'add-expense') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => setView('main')}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToObject}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
            {t.addExpense}
          </h1>

          <AddExpenseForm
            objectId={objectId}
            userId={user?.id || ''}
            categories={categories}
            setCategories={setCategories}
            paymentMethods={paymentMethods}
            onSave={handleAddExpense}
            onCancel={() => setView('main')}
            locale={locale}
          />
        </div>
      </BackgroundPage>
    );
  }

  return null;
}

// Add Work Form Component
function AddWorkForm({
  objectId,
  onSave,
  onCancel,
  locale,
}: {
  objectId: string;
  onSave: (work: Omit<AdditionalWork, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.finance || messages.el.finance;
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      objectId,
      date: new Date(formData.date),
      amount: formData.amount,
      description: formData.description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.date}
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
        />
      </div>

      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.amount}
        </label>
        <input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder="€"
        />
      </div>

      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.description}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '104px' }}
          rows={3}
        />
      </div>

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

// Add Payment Form Component
function AddPaymentForm({
  objectId,
  paymentMethods,
  onSave,
  onCancel,
  locale,
}: {
  objectId: string;
  paymentMethods: PaymentMethod[];
  onSave: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.finance || messages.el.finance;
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paymentMethodId) {
      alert(t.selectPaymentMethod);
      return;
    }
    onSave({
      objectId,
      date: new Date(formData.date),
      amount: formData.amount,
      paymentMethodId: formData.paymentMethodId,
      description: formData.description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.date}
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
        />
      </div>

      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.paymentMethod}
        </label>
        {paymentMethods.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--polar)', opacity: 0.7 }}>
            {messages[locale]?.paymentMethods?.noMethods || 'No payment methods available'}
          </p>
        ) : (
          <select
            value={formData.paymentMethodId}
            onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
            className="w-full rounded-lg text-body"
            style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
          >
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id} style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>
                {method.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.amount}
        </label>
        <input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder="€"
        />
      </div>

      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.description}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '104px' }}
          rows={3}
        />
      </div>

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
          disabled={paymentMethods.length === 0}
        >
          {t.save}
        </button>
      </div>
    </form>
  );
}

// Add Expense Form Component
function AddExpenseForm({
  objectId,
  userId,
  categories,
  setCategories,
  paymentMethods,
  onSave,
  onCancel,
  locale,
}: {
  objectId: string;
  userId: string;
  categories: ExpenseCategory[];
  setCategories: (categories: ExpenseCategory[]) => void;
  paymentMethods: PaymentMethod[];
  onSave: (expense: Omit<ObjectExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.finance || messages.el.finance;
  const tPayments = messages[locale]?.paymentMethods || messages.el.paymentMethods;
  const [formData, setFormData] = useState({
    categoryId: categories.length > 0 ? categories[0].id : '',
    paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'voice' | 'photo'>('manual');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(t.voiceInputNotSupported);
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

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData({ ...formData, description: transcript });
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      alert(t.voiceInputFailed);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !userId) return;

    try {
      const created = await createExpenseCategory(userId, { name: newCategoryName.trim() });
      const newCategory = toLocalCategory(created);

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);

      setFormData({ ...formData, categoryId: newCategory.id });
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert(t.selectCategory);
      return;
    }

    if (!formData.paymentMethodId) {
      alert(t.selectPaymentMethod);
      return;
    }

    setIsUploading(true);

    const category = categories.find(c => c.id === formData.categoryId);
    const paymentMethod = paymentMethods.find(pm => pm.id === formData.paymentMethodId);

    // Determine input method (photo is used for OCR only, not stored)
    let finalInputMethod: 'manual' | 'voice' | 'photo' = inputMethod;
    if (photoFile && !isRecording) {
      finalInputMethod = 'photo';
    }

    onSave({
      objectId,
      categoryId: formData.categoryId,
      categoryName: category?.name,
      paymentMethodId: formData.paymentMethodId,
      paymentMethodName: paymentMethod?.name,
      amount: formData.amount,
      description: formData.description || undefined,
      date: new Date(formData.date),
      inputMethod: finalInputMethod,
    });

    setIsUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      {/* Category Selection */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.category}
        </label>
        {!showNewCategory ? (
          <div className="flex gap-2">
            {categories.length === 0 ? (
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: 'var(--polar)', opacity: 0.7 }}>
                  {messages[locale]?.globalExpenses?.noCategories || 'No categories'}
                </p>
              </div>
            ) : (
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="flex-1 rounded-lg text-body"
                style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id} style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setShowNewCategory(true)}
              className="rounded-lg px-4 text-button"
              style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t.createNewCategory}
              className="flex-1 p-3 rounded-lg text-body"
              style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              className="rounded-lg px-4 text-button"
              style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', minHeight: '52px' }}
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewCategory(false);
                setNewCategoryName('');
              }}
              className="rounded-lg px-4 text-button"
              style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.paymentMethod}
        </label>
        {paymentMethods.length === 0 ? (
          <Link
            href={`/${locale}/payment-methods`}
            className="block text-sm p-3 rounded-lg text-center"
            style={{ color: 'var(--polar)', backgroundColor: 'rgba(255,255,255,0.1)', border: '2px dashed var(--polar)' }}
          >
            {tPayments.noMethods} →
          </Link>
        ) : (
          <select
            value={formData.paymentMethodId}
            onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
            className="w-full rounded-lg text-body"
            style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
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
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.date}
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.amount}
        </label>
        <input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder="€"
        />
      </div>

      {/* Description */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-button" style={{ color: 'var(--polar)' }}>
            {t.description}
          </label>
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isRecording}
            className="px-4 py-2 rounded-lg text-button font-semibold flex items-center gap-2"
            style={{
              backgroundColor: isRecording ? '#ff6a1a' : 'var(--zanah)',
              color: isRecording ? 'white' : 'var(--deep-teal)',
              minHeight: '52px',
              boxShadow: isRecording ? '0 4px 8px rgba(255, 255, 255, 0.3)' : '0 4px 8px var(--deep-teal)',
            }}
          >
            🎤 {isRecording ? '...' : t.voiceButton}
          </button>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (e.target.value) setInputMethod('manual');
          }}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '104px' }}
          rows={3}
          placeholder={isRecording ? 'Listening...' : ''}
        />
      </div>

      {/* Receipt Photo */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.receiptPhoto}
        </label>
        {!photoPreview ? (
          <label className="block w-full p-4 rounded-lg text-center cursor-pointer"
            style={{ border: '2px dashed var(--polar)', color: 'var(--polar)' }}>
            <span className="text-button">{t.uploadPhoto}</span>
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
              className="rounded-lg w-full"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 px-4 py-2 rounded-lg text-button font-semibold"
              style={{ backgroundColor: '#ff6a1a', color: 'white', minHeight: '52px', boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)' }}
            >
              {t.removePhoto}
            </button>
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
          disabled={isUploading}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', fontSize: '18px', fontWeight: 600 }}
          disabled={isUploading || categories.length === 0 || paymentMethods.length === 0}
        >
          {isUploading ? '...' : t.save}
        </button>
      </div>
    </form>
  );
}
