"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import type { PropertyObject } from '@/types/object';
import type { ObjectFinance, AdditionalWork, Payment } from '@/types/finance';
import type { PaymentMethod } from '@/types/paymentMethod';
import { formatEuro } from '@/lib/formatters';

type ViewType = 'main' | 'add-work' | 'add-payment';

export default function ObjectFinancePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const objectId = params.id as string;
  const t = messages[locale]?.finance || messages.el.finance;
  const tObjects = messages[locale]?.objects || messages.el.objects;

  const [mounted, setMounted] = useState(false);
  const [object, setObject] = useState<PropertyObject | null>(null);
  const [finance, setFinance] = useState<ObjectFinance | null>(null);
  const [view, setView] = useState<ViewType>('main');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Load object and finance data
  useEffect(() => {
    setMounted(true);

    // Load payment methods
    const storedMethods = localStorage.getItem('paymentMethods');
    if (storedMethods) {
      setPaymentMethods(JSON.parse(storedMethods));
    }

    // Load object
    const storedObjects = localStorage.getItem('propertyObjects');
    if (storedObjects) {
      const objects: PropertyObject[] = JSON.parse(storedObjects);
      const foundObject = objects.find(obj => obj.id === objectId);
      if (foundObject) {
        setObject(foundObject);
      }
    }

    // Load finance data
    const storedFinance = localStorage.getItem(`objectFinance_${objectId}`);
    if (storedFinance) {
      const parsedFinance = JSON.parse(storedFinance);
      // Convert date strings back to Date objects
      parsedFinance.additionalWorks = parsedFinance.additionalWorks.map((work: any) => ({
        ...work,
        date: new Date(work.date),
        createdAt: new Date(work.createdAt),
      }));
      parsedFinance.payments = parsedFinance.payments.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date),
        createdAt: new Date(payment.createdAt),
      }));
      setFinance(parsedFinance);
    } else if (object) {
      // Initialize empty finance
      const initialFinance: ObjectFinance = {
        objectId,
        contractPrice: object.contractPrice,
        additionalWorks: [],
        payments: [],
        totalAdditionalWorks: 0,
        totalPayments: 0,
        balance: object.contractPrice,
        balanceStatus: object.contractPrice > 0 ? 'debt' : 'closed',
      };
      setFinance(initialFinance);
    }
  }, [objectId, object]);

  // Save finance data
  const saveFinance = (updatedFinance: ObjectFinance) => {
    localStorage.setItem(`objectFinance_${objectId}`, JSON.stringify(updatedFinance));
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
  const handleAddWork = (work: Omit<AdditionalWork, 'id' | 'createdAt'>) => {
    if (!finance || !object) return;

    const newWork: AdditionalWork = {
      ...work,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedWorks = [...finance.additionalWorks, newWork];
    const updatedFinance = calculateFinance(finance.contractPrice, updatedWorks, finance.payments);
    saveFinance(updatedFinance);
    setView('main');
  };

  // Add payment
  const handleAddPayment = (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    if (!finance || !object) return;

    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedPayments = [...finance.payments, newPayment];
    const updatedFinance = calculateFinance(finance.contractPrice, finance.additionalWorks, updatedPayments);
    saveFinance(updatedFinance);
    setView('main');
  };

  // Delete additional work
  const handleDeleteWork = (workId: string) => {
    if (!finance || !confirm(t.confirmDeleteWork)) return;

    const updatedWorks = finance.additionalWorks.filter(work => work.id !== workId);
    const updatedFinance = calculateFinance(finance.contractPrice, updatedWorks, finance.payments);
    saveFinance(updatedFinance);
  };

  // Delete payment
  const handleDeletePayment = (paymentId: string) => {
    if (!finance || !confirm(t.confirmDeletePayment)) return;

    const updatedPayments = finance.payments.filter(payment => payment.id !== paymentId);
    const updatedFinance = calculateFinance(finance.contractPrice, finance.additionalWorks, updatedPayments);
    saveFinance(updatedFinance);
  };

  if (!mounted || !object || !finance) {
    return null;
  }

  // MAIN VIEW
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
                      className="text-sm px-3 py-1 rounded-lg"
                      style={{ backgroundColor: '#ff6a1a', color: 'white' }}
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
