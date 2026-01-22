"use client";

import { useState, useEffect, useRef } from 'react';
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
  updateObject,
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
  const [expandedPaymentReceived, setExpandedPaymentReceived] = useState(false);
  const [expandedExpensesPaid, setExpandedExpensesPaid] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  // Send object finance report email
  const handleSendReportEmail = async () => {
    if (!object || !finance || !emailTo) return;
    setIsSendingEmail(true);

    try {
      const actualPrice = object.contractPrice + finance.totalAdditionalWorks;
      const response = await fetch('/api/send-object-finance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTo,
          objectName: object.name,
          contractPrice: object.contractPrice,
          additionalWorks: finance.additionalWorks,
          totalAdditionalWorks: finance.totalAdditionalWorks,
          actualPrice: actualPrice,
          payments: finance.payments,
          totalPayments: finance.totalPayments,
          balance: finance.balance,
          expenses: expenses,
          totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
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
      setIsSendingEmail(false);
    }
  };

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
        <div className="min-h-screen flex flex-col gap-12" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>

          {/* Back - phrase, not a button */}
          <p
            onClick={() => router.push(`/${locale}/objects`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToObject}
          </p>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t.objectFinanceTitle}
          </h1>

          {/* Object Name */}
          <div className="btn-universal w-full text-2xl font-bold flex items-center justify-center gap-2" style={{ minHeight: '52px', backgroundColor: 'var(--zanah)' }}>
            <span style={{ color: 'var(--deep-teal)' }}>{t.objectLabel}</span>
            <span style={{ color: 'var(--orange)' }}>{object?.name || '—'}</span>
          </div>

          {/* Contract Price Section */}
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
              {t.contractPrice}
            </h2>
            <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
              {formatEuro(finance.contractPrice)}
            </p>
          </div>

          {/* Additional Works Section */}
          <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
            <h2 className="text-lg font-semibold text-center mb-4" style={{ color: 'var(--deep-teal)' }}>
              {tObjects.additionalWorks}
            </h2>

            {finance.additionalWorks.length === 0 ? (
              <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
                {t.noAdditionalWorks}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {finance.additionalWorks.map((work) => (
                  <div key={work.id} className="flex justify-between items-center rounded-2xl" style={{ backgroundColor: 'var(--zanah)', padding: '16px 20px' }}>
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
                      className="text-button px-4 py-2 rounded-2xl font-semibold"
                      style={{ backgroundColor: '#ff6a1a', color: 'white', minHeight: '52px' }}
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

          {/* Add Additional Work Button */}
          <button
            onClick={() => setView('add-work')}
            className="btn-universal w-full text-button"
            style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
          >
            + {t.addButton}
          </button>

          {/* Actual Price Section */}
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
              {t.actualPrice}
            </h2>
            <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
              {formatEuro(finance.contractPrice + finance.totalAdditionalWorks)}
            </p>
          </div>

          {/* Payments Section */}
          <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
            <h2 className="text-lg font-semibold text-center mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.payment}
            </h2>

            {finance.payments.length === 0 ? (
              <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
                {t.noPayments}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {finance.payments.map((payment) => {
                  const method = paymentMethods.find(m => m.id === payment.paymentMethodId);
                  const methodName = method ? method.name : payment.paymentMethodId;

                  return (
                    <div key={payment.id} className="flex justify-between items-center rounded-2xl" style={{ backgroundColor: 'var(--zanah)', padding: '16px 20px' }}>
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
                        className="text-button px-4 py-2 rounded-2xl font-semibold"
                        style={{ backgroundColor: '#ff6a1a', color: 'white', minHeight: '52px' }}
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

          {/* Add Payment Button */}
          <button
            onClick={() => setView('add-payment')}
            className="btn-universal w-full text-button"
            style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
          >
            + {t.addButton}
          </button>

          {/* Balance Section */}
          <div className="rounded-2xl p-4 text-center" style={{
            backgroundColor: finance.balanceStatus === 'debt' ? '#ff6a1a' :
                           finance.balanceStatus === 'closed' ? '#25D366' :
                           'var(--zanah)'
          }}>
            <h2 className="text-lg font-semibold" style={{ color: finance.balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white' }}>
              {t.balance}
            </h2>
            <p className="text-3xl font-bold" style={{ color: finance.balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white' }}>
              {formatEuro(finance.balance)}
            </p>
            <p className="text-2xl font-bold mt-2" style={{ color: finance.balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white' }}>
              {finance.balanceStatus === 'debt' && t.debt}
              {finance.balanceStatus === 'closed' && t.closed}
              {finance.balanceStatus === 'overpaid' && t.overpaid}
            </p>
          </div>

          {/* Object Expenses Section */}
          <div className="flex flex-col gap-12">
            <h2 className="text-xl font-bold text-center" style={{ color: 'var(--polar)' }}>
              {t.expenses}
            </h2>

            {/* Add Expense Button - moved up */}
            <button
              onClick={() => setView('add-expense')}
              className="btn-universal w-full text-button"
              style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
            >
              + {t.addButton}
            </button>

            {expenses.length === 0 ? (
              <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
                {t.noExpenses}
              </p>
            ) : (
              <>
                {/* Expense Analysis by Category Title */}
                <h3 className="text-lg font-semibold text-center" style={{ color: 'var(--polar)' }}>
                  {t.expenseAnalysisByCategory}
                </h3>

                {/* Grouped by Category */}
                <div className="flex flex-col gap-12">
                  {Object.entries(groupByCategory()).map(([categoryId, categoryExpenses]) => {
                    const category = categories.find(c => c.id === categoryId);
                    const categoryName = category?.name || 'Unknown';
                    const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                    const count = categoryExpenses.length;
                    const isExpanded = expandedCategories.has(categoryId);

                    return (
                      <div key={categoryId} className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
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
              </>
            )}

            {/* Total Expenses */}
            {expenses.length > 0 && (
              <div className="btn-universal w-full text-lg flex justify-between items-center px-4" style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}>
                <span className="font-semibold">
                  {t.totalExpensesTitle}
                </span>
                <span className="font-bold" style={{ color: 'var(--orange)' }}>
                  {formatEuro(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </span>
              </div>
            )}

            {/* Payment Analysis Section */}
            {(finance.payments.length > 0 || expenses.length > 0) && (
              <div className="flex flex-col gap-12">
                <h3 className="text-lg font-semibold text-center" style={{ color: 'var(--polar)' }}>
                  {t.paymentAnalysis}
                </h3>

                {/* Payment Received Block */}
                {finance.payments.length > 0 && (
                  <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
                    <button
                      onClick={() => setExpandedPaymentReceived(!expandedPaymentReceived)}
                      className="w-full flex flex-col items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '20px' }}>💰</span>
                        <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                          {t.paymentReceived}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold" style={{ color: 'var(--deep-teal)' }}>
                          {formatEuro(finance.totalPayments)}
                        </span>
                        <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                          {expandedPaymentReceived ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>

                    {expandedPaymentReceived && (
                      <div className="mt-4 space-y-3 pl-8 border-l-2" style={{ borderColor: 'rgba(1, 49, 45, 0.2)' }}>
                        {/* Group payments by payment method */}
                        {Object.entries(
                          finance.payments.reduce((acc, payment) => {
                            const methodId = payment.paymentMethodId || 'unknown';
                            if (!acc[methodId]) acc[methodId] = { total: 0, count: 0 };
                            acc[methodId].total += payment.amount;
                            acc[methodId].count += 1;
                            return acc;
                          }, {} as Record<string, { total: number; count: number }>)
                        ).map(([methodId, data]) => {
                          const method = paymentMethods.find(pm => pm.id === methodId);
                          const methodName = method?.name || 'Unknown';
                          return (
                            <div key={methodId} className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: '16px' }}>💳</span>
                                <span style={{ color: 'var(--deep-teal)' }}>{methodName}</span>
                                <span className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                  ({data.count}x)
                                </span>
                              </div>
                              <span className="font-bold" style={{ color: 'var(--deep-teal)' }}>
                                {formatEuro(data.total)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Expenses Paid Block */}
                {expenses.length > 0 && (
                  <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
                    <button
                      onClick={() => setExpandedExpensesPaid(!expandedExpensesPaid)}
                      className="w-full flex flex-col items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '20px' }}>📤</span>
                        <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
                          {t.expensesPaid}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold" style={{ color: 'var(--deep-teal)' }}>
                          {formatEuro(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                        </span>
                        <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                          {expandedExpensesPaid ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>

                    {expandedExpensesPaid && (
                      <div className="mt-4 space-y-3 pl-8 border-l-2" style={{ borderColor: 'rgba(1, 49, 45, 0.2)' }}>
                        {/* Group expenses by payment method */}
                        {Object.entries(groupByPaymentMethod()).map(([methodId, methodExpenses]) => {
                          const method = paymentMethods.find(pm => pm.id === methodId);
                          const methodName = method?.name || 'Unknown';
                          const totalAmount = methodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                          const count = methodExpenses.length;
                          return (
                            <div key={methodId} className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: '16px' }}>💳</span>
                                <span style={{ color: 'var(--deep-teal)' }}>{methodName}</span>
                                <span className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                                  ({count}x)
                                </span>
                              </div>
                              <span className="font-bold" style={{ color: 'var(--deep-teal)' }}>
                                {formatEuro(totalAmount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Calculate Profit Button */}
            {expenses.length > 0 && (
              <button
                onClick={async () => {
                  const actualPrice = finance.contractPrice + finance.totalAdditionalWorks;
                  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                  const profit = actualPrice - totalExpenses;
                  const profitMessage = `
${t.actualPrice}: ${formatEuro(actualPrice)}
${t.profitExpenses}: ${formatEuro(totalExpenses)}
${t.profitResult}: ${formatEuro(profit)}

${t.closeProjectQuestion}
                  `.trim();

                  if (confirm(profitMessage)) {
                    try {
                      if (user?.id && object) {
                        await updateObject(object.id, user.id, { status: 'closed' });
                        alert(t.objectClosed);
                        router.push(`/${locale}/objects`);
                      }
                    } catch (error) {
                      console.error('Error closing object:', error);
                      alert('Error closing object');
                    }
                  }
                }}
                className="btn-universal w-full text-lg font-semibold"
                style={{ minHeight: '52px', backgroundColor: '#ff6a1a', color: 'white' }}
              >
                {t.calculateProfit}
              </button>
            )}

            {/* Send Report Button */}
            <button
              onClick={() => {
                setEmailTo(object?.clientContact || '');
                setShowEmailModal(true);
              }}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)'
              }}
            >
              📧 {t.sendReport}
            </button>
          </div>
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
                  disabled={isSendingEmail || !emailTo}
                  className="flex-1 rounded-2xl text-button"
                  style={{
                    minHeight: '52px',
                    backgroundColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                    opacity: (!emailTo || isSendingEmail) ? 0.5 : 1
                  }}
                >
                  {isSendingEmail ? '...' : t.sendButton}
                </button>
              </div>
            </div>
          </div>
        )}
      </BackgroundPage>
    );
  }

  // ADD WORK VIEW
  if (view === 'add-work') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen flex flex-col gap-12" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>

          {/* Back - text, not a button */}
          <p
            onClick={() => setView('main')}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToObject}
          </p>

          {/* Add Additional Work Button (title) */}
          <button
            type="button"
            className="btn-universal w-full text-button"
            style={{
              minHeight: '52px',
              backgroundColor: 'var(--polar)',
              color: 'var(--deep-teal)',
            }}
          >
            {t.addAdditionalWork}
          </button>

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
        <div className="min-h-screen flex flex-col gap-12" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>

          {/* Back - text, not a button */}
          <p
            onClick={() => setView('main')}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToObject}
          </p>

          {/* Add Payment Button (title) */}
          <button
            type="button"
            className="btn-universal w-full text-button"
            style={{
              minHeight: '52px',
              backgroundColor: 'var(--polar)',
              color: 'var(--deep-teal)',
            }}
          >
            {t.addPayment}
          </button>

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
        <div className="min-h-screen flex flex-col gap-12" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '160px', paddingBottom: '120px' }}>
          {/* Back - phrase, not a button */}
          <p
            onClick={() => setView('main')}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToObject}
          </p>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
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
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  const handleVoiceInput = () => {
    // Если уже записываем - останавливаем
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(t.voiceInputNotSupported);
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

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
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

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();

    // Автоматическая остановка через 30 секунд
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 30000);
  };

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
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-12">
      {/* Date Button */}
      <div>
        <button
          type="button"
          className="btn-universal w-full text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'transparent',
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
          }}
        >
          {t.date}
        </button>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            marginTop: '12px',
            padding: '12px'
          }}
        />
      </div>

      {/* Amount Button */}
      <div>
        <button
          type="button"
          className="btn-universal w-full text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'transparent',
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
          }}
        >
          {t.amount}
        </button>
        <input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            marginTop: '12px',
            padding: '12px'
          }}
          placeholder="€"
        />
      </div>

      {/* Description Button with Voice */}
      <div>
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isRecording}
          className="btn-universal w-full text-button"
          style={{
            minHeight: '52px',
            backgroundColor: isRecording ? '#ff6a1a' : 'var(--zanah)',
            color: isRecording ? 'white' : 'var(--deep-teal)',
          }}
        >
          🎤 {t.description} {isRecording ? '...' : ''}
        </button>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '104px',
            marginTop: '12px',
            padding: '12px'
          }}
          rows={3}
          placeholder={isRecording ? 'Listening...' : ''}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-universal flex-1 text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--polar)',
            color: 'var(--deep-teal)'
          }}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="btn-universal flex-1 text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--zanah)',
            color: 'var(--deep-teal)'
          }}
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
  const tPayments = messages[locale]?.paymentMethods || messages.el.paymentMethods;
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : '',
    description: '',
  });
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  const handleVoiceInput = () => {
    // Если уже записываем - останавливаем
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(t.voiceInputNotSupported);
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

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
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

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();

    // Автоматическая остановка через 30 секунд
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 30000);
  };

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
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-12">
      {/* Date Button */}
      <div>
        <button
          type="button"
          className="btn-universal w-full text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'transparent',
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
          }}
        >
          {t.date}
        </button>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            marginTop: '12px',
            padding: '12px'
          }}
        />
      </div>

      {/* Payment Method Button */}
      <div>
        <button
          type="button"
          className="btn-universal w-full text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'transparent',
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
          }}
        >
          {t.paymentMethod}
        </button>
        {paymentMethods.length === 0 ? (
          <Link
            href={`/${locale}/payment-methods`}
            className="block text-sm p-3 rounded-lg text-center"
            style={{
              color: 'var(--polar)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px dashed var(--polar)',
              marginTop: '12px'
            }}
          >
            {tPayments.noMethods} →
          </Link>
        ) : (
          <select
            value={formData.paymentMethodId}
            onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
            className="w-full rounded-2xl text-body"
            style={{
              border: '2px solid var(--polar)',
              color: 'var(--polar)',
              backgroundColor: 'transparent',
              minHeight: '52px',
              padding: '12px',
              fontSize: '18px',
              marginTop: '12px'
            }}
          >
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id} style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>
                {method.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Amount Button */}
      <div>
        <button
          type="button"
          className="btn-universal w-full text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'transparent',
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
          }}
        >
          {t.amount}
        </button>
        <input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            marginTop: '12px',
            padding: '12px'
          }}
          placeholder="€"
        />
      </div>

      {/* Description Button with Voice */}
      <div>
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isRecording}
          className="btn-universal w-full text-button"
          style={{
            minHeight: '52px',
            backgroundColor: isRecording ? '#ff6a1a' : 'var(--zanah)',
            color: isRecording ? 'white' : 'var(--deep-teal)',
          }}
        >
          🎤 {t.description} {isRecording ? '...' : ''}
        </button>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '104px',
            marginTop: '12px',
            padding: '12px'
          }}
          rows={3}
          placeholder={isRecording ? 'Listening...' : ''}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-universal flex-1 text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--polar)',
            color: 'var(--deep-teal)'
          }}
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="btn-universal flex-1 text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--zanah)',
            color: 'var(--deep-teal)'
          }}
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
  const tGlobal = messages[locale]?.globalExpenses || messages.el.globalExpenses;
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Refs для голосового ввода
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // categoryMap (10 категорий, 8 языков)
  const categoryMap: Record<string, string[]> = {
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

  // Анализ фото чека через AI
  const analyzeReceipt = async (base64Image: string) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image, locale }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        // Автозаполнение формы
        setFormData(prev => ({
          ...prev,
          amount: data.amount || prev.amount,
          description: data.description || prev.description,
          date: data.date || prev.date,
        }));

        // Выбор категории
        if (categories.length > 0 && data.suggestedCategory) {
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

        // Способ оплаты (fallback на первый)
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

  // Анализ голосового текста через AI
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
          amount: data.amount !== null && data.amount !== undefined ? data.amount : prev.amount,
          description: data.description || transcript,
          date: data.date || prev.date,
        }));

        // Выбор категории
        if (categories.length > 0) {
          let matchedCategory: ExpenseCategory | undefined;

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

  const handleVoiceInput = () => {
    // Если уже записываем - останавливаем
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(t.voiceInputNotSupported || 'Voice input is not supported');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-12" style={{ marginTop: '96px' }}>
      {/* Category Selection */}
      <div>
        <label className="block mb-3 text-button" style={{ color: 'var(--polar)' }}>
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
                className="flex-1 rounded-2xl text-body"
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
              className="flex-1 rounded-2xl text-body"
              style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
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
        <label className="block mb-3 text-button" style={{ color: 'var(--polar)' }}>
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
            className="w-full rounded-2xl text-body"
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
        <label className="block mb-3 text-button" style={{ color: 'var(--polar)' }}>
          {t.date}
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="w-full rounded-2xl text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block mb-3 text-button" style={{ color: 'var(--polar)' }}>
          {t.amount}
        </label>
        <input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full rounded-2xl text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
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
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-2xl text-button font-semibold flex items-center gap-2"
            style={{
              backgroundColor: isRecording ? '#ff6a1a' : isAnalyzing ? 'var(--polar)' : 'var(--zanah)',
              color: isRecording ? 'white' : 'var(--deep-teal)',
              minHeight: '52px',
            }}
          >
            {isRecording ? '⏹️ STOP' : isAnalyzing ? '🤖 ...' : `🎤 ${t.voiceButton || 'Voice'}`}
          </button>
        </div>
        {(isRecording || isAnalyzing) && (
          <div
            className="mb-2 p-3 rounded-2xl text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--polar)' }}
          >
            {isRecording ? (tGlobal.listeningTapStop || '🎤 Говорите... (нажмите STOP когда закончите)') : (tGlobal.analyzingVoice || '🤖 Анализирую...')}
          </div>
        )}
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (e.target.value) setInputMethod('manual');
          }}
          className="w-full rounded-2xl text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '104px', padding: '12px' }}
          rows={3}
          placeholder={isRecording ? (tGlobal.listening || 'Слушаю...') : ''}
        />
      </div>

      {/* Receipt Photo */}
      <div>
        <label className="block mb-3 text-button" style={{ color: 'var(--polar)' }}>
          {t.receiptPhoto} {isAnalyzing && '🔄'}
        </label>
        {!photoPreview ? (
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
          <div className="relative">
            <img
              src={photoPreview}
              alt="Receipt preview"
              className="rounded-2xl w-full"
              style={{ maxHeight: '300px', objectFit: 'cover', opacity: isAnalyzing ? 0.5 : 1 }}
            />
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl animate-pulse">🔄</div>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isAnalyzing}
              className="absolute top-2 right-2 px-4 py-2 rounded-2xl text-button font-semibold"
              style={{ backgroundColor: '#ff6a1a', color: 'white', minHeight: '44px' }}
            >
              {t.removePhoto}
            </button>
            {!isAnalyzing && (
              <p className="absolute bottom-0 left-0 right-0 text-center py-2 rounded-b-2xl"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--orange)', fontSize: '18px', fontWeight: 600 }}>
                {tGlobal.deletePhotoToSave || 'Удалите фото, чтобы сохранить'}
              </p>
            )}
          </div>
        )}
        {analyzeError && (
          <p className="mt-2 text-center" style={{ color: 'var(--orange)' }}>
            {analyzeError}
          </p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 mt-4">
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
