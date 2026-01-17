"use client";

import { useState } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import type { PaymentMethod, PaymentMethodType } from '@/types/paymentMethod';

export default function PaymentMethodsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.paymentMethods || messages.el.paymentMethods;

  // Временное хранилище в localStorage (позже будет API)
  const [methods, setMethods] = useState<PaymentMethod[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('paymentMethods');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const handleDelete = (id: string) => {
    if (confirm(t.confirmDelete)) {
      const updated = methods.filter(m => m.id !== id);
      setMethods(updated);
      localStorage.setItem('paymentMethods', JSON.stringify(updated));
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setShowForm(true);
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'cash':
        return '💵';
      case 'credit_card':
        return '💳';
      case 'debit_card':
        return '💳';
      case 'bank_account':
        return '🏦';
    }
  };

  if (showForm) {
    return (
      <BackgroundPage pageIndex={3}>
        <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
          <div className="w-full max-w-sm">

          {/* Back Button */}
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingMethod(null);
              }}
              className="text-button"
              style={{ color: 'var(--polar)', fontSize: '18px' }}
            >
              {t.backToPayPage}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
            {editingMethod ? t.edit : t.addNew}
          </h1>
          <PaymentMethodForm
            method={editingMethod}
            onSave={(method) => {
              let updated;
              if (editingMethod) {
                updated = methods.map(m => m.id === editingMethod.id ? method : m);
              } else {
                updated = [...methods, method];
              }
              setMethods(updated);
              localStorage.setItem('paymentMethods', JSON.stringify(updated));
              setShowForm(false);
              setEditingMethod(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingMethod(null);
            }}
            locale={locale}
          />
          </div>
        </div>
      </BackgroundPage>
    );
  }

  return (
    <BackgroundPage pageIndex={3}>
      <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '40px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="w-full flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ marginTop: '120px' }}>
          <button
            onClick={() => router.push(`/${locale}/page-pay`)}
            style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
          >
            {t.backToPayPage}
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--polar)' }}>
          {t.title}
        </h1>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="btn-universal w-full text-button"
          style={{ minHeight: '52px', marginBottom: '40px', marginTop: '40px' }}
        >
          {t.addNew}
        </button>

        {/* Methods List */}
        <div className="flex flex-col gap-4 flex-1">
          {methods.length === 0 ? (
            <p className="text-center text-body" style={{ color: 'var(--orange)' }}>
              {t.noMethods}
            </p>
          ) : (
            methods.map(method => (
              <div
                key={method.id}
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--polar)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMethodIcon(method.type)}</span>
                  <div>
                    <p className="text-button" style={{ color: 'var(--deep-teal)' }}>
                      {method.name}
                    </p>
                    <p className="text-link" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                      {t.types[method.type]}
                      {method.lastFourDigits && ` •••• ${method.lastFourDigits}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(method)}
                    className="px-4 rounded-lg"
                    style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="px-4 rounded-lg"
                    style={{ backgroundColor: 'var(--orange)', color: 'white', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
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

// Payment Method Form Component
function PaymentMethodForm({
  method,
  onSave,
  onCancel,
  locale,
}: {
  method: PaymentMethod | null;
  onSave: (method: PaymentMethod) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.paymentMethods || messages.el.paymentMethods;
  const [formData, setFormData] = useState({
    type: (method?.type || 'cash') as PaymentMethodType,
    name: method?.name || '',
    lastFourDigits: method?.lastFourDigits || '',
    iban: method?.iban || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMethod: PaymentMethod = {
      id: method?.id || Date.now().toString(),
      userId: 'current-user', // TODO: Get from auth context
      type: formData.type,
      name: formData.name,
      lastFourDigits: formData.lastFourDigits || undefined,
      iban: formData.iban || undefined,
      createdAt: method?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newMethod);
  };

  const showLastFourDigits = formData.type === 'credit_card' || formData.type === 'debit_card';
  const showIban = formData.type === 'bank_account';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      {/* Type Select */}
      <div style={{ marginTop: '20px' }}>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.type}
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethodType })}
          className="w-full rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
        >
          <option value="cash" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.cash}</option>
          <option value="credit_card" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.credit_card}</option>
          <option value="debit_card" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.debit_card}</option>
          <option value="bank_account" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.bank_account}</option>
        </select>
      </div>

      {/* Name Input */}
      <div style={{ marginTop: '20px' }}>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.name}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 8) })}
          maxLength={8}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.name}
        />
      </div>

      {/* Last 4 Digits (for cards) */}
      {showLastFourDigits && (
        <div style={{ marginTop: '20px' }}>
          <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
            {t.lastFourDigits}
          </label>
          <input
            type="text"
            value={formData.lastFourDigits}
            onChange={(e) => setFormData({ ...formData, lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            maxLength={4}
            className="w-full p-3 rounded-lg text-body"
            style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent' }}
            placeholder="1234"
          />
        </div>
      )}

      {/* IBAN (for bank accounts) */}
      {showIban && (
        <div style={{ marginTop: '20px' }}>
          <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
            {t.iban}
          </label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
            className="w-full p-3 rounded-lg text-body"
            style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent' }}
            placeholder="GR1234567890123456789012345"
          />
        </div>
      )}

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
