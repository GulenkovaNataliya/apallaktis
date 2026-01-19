"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import type { PaymentMethod, PaymentMethodType } from '@/types/paymentMethod';
import { useAuth } from '@/lib/auth-context';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod as deletePaymentMethodApi,
  type PaymentMethod as SupabasePaymentMethod,
} from '@/lib/supabase/services';

// Конвертер из Supabase формата в локальный
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

export default function PaymentMethodsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.paymentMethods || messages.el.paymentMethods;
  const { user, isLoading: authLoading } = useAuth();


  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Загрузка данных из Supabase
  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getPaymentMethods(user.id);
        setMethods(data.map(toLocalPaymentMethod));
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    if (!confirm(t.confirmDelete)) return;

    try {
      await deletePaymentMethodApi(id, user.id);
      setMethods(methods.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method');
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
        <div className="min-h-screen flex flex-col items-center" style={{ paddingTop: '40px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full">

          {/* Back - phrase, not a button */}
          <p
            onClick={() => {
              setShowForm(false);
              setEditingMethod(null);
            }}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)', marginTop: '120px', marginBottom: '48px' }}
          >
            {t.backToPayPage}
          </p>

          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {editingMethod ? t.edit : t.addNew}
          </h1>
          <PaymentMethodForm
            method={editingMethod}
            userId={user?.id || ''}
            onSave={(method) => {
              if (editingMethod) {
                setMethods(methods.map(m => m.id === editingMethod.id ? method : m));
              } else {
                setMethods([...methods, method]);
              }
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

  // Loading state (wait for both auth and data)
  if (authLoading || isLoading) {
    return (
      <BackgroundPage pageIndex={3}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center" style={{ color: 'var(--polar)' }}>
            <div className="text-2xl mb-2">⏳</div>
            <p>Loading... {authLoading ? '(auth)' : '(data)'}</p>
          </div>
        </div>
      </BackgroundPage>
    );
  }

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

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="btn-universal w-full text-button flex items-center justify-center"
          style={{ minHeight: '52px', textTransform: 'capitalize' }}
        >
          {t.addNew}
        </button>

        {/* Methods List */}
        <div className="flex flex-col gap-4 flex-1">
          {methods.length === 0 ? (
            <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
              {t.noMethods}
            </p>
          ) : (
            methods.map(method => (
              <div
                key={method.id}
                className="px-4 rounded-2xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--polar)', height: '52px' }}
              >
                <div className="flex items-center gap-3" style={{ paddingLeft: '5px' }}>
                  <span style={{ fontSize: '18px' }}>{getMethodIcon(method.type)}</span>
                  <p className="text-button" style={{ color: 'var(--deep-teal)', fontSize: '18px', fontWeight: 600 }}>
                    {method.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(method)}
                    className="px-3 rounded-2xl"
                    style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', height: '40px', fontSize: '16px', fontWeight: 600 }}
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
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

// Payment Method Form Component
function PaymentMethodForm({
  method,
  userId,
  onSave,
  onCancel,
  locale,
}: {
  method: PaymentMethod | null;
  userId: string;
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
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('Error: User not authenticated. Please log in again.');
      return;
    }

    setIsSaving(true);

    try {
      let savedMethod: PaymentMethod;

      if (method?.id) {
        // Обновление существующего
        const updated = await updatePaymentMethod(method.id, userId, {
          type: formData.type,
          name: formData.name,
          last_four_digits: formData.lastFourDigits || undefined,
          iban: formData.iban || undefined,
        });
        savedMethod = toLocalPaymentMethod(updated);
      } else {
        // Создание нового
        const created = await createPaymentMethod(userId, {
          type: formData.type,
          name: formData.name,
          last_four_digits: formData.lastFourDigits || undefined,
          iban: formData.iban || undefined,
        });
        savedMethod = toLocalPaymentMethod(created);
      }

      onSave(savedMethod);
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      alert(`Failed to save: ${error?.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const showLastFourDigits = formData.type === 'credit_card' || formData.type === 'debit_card';
  const showIban = formData.type === 'bank_account';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-12" style={{ marginTop: '48px' }}>
      {/* Type Select */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.type}
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethodType })}
          className="w-full rounded-2xl text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
        >
          <option value="cash" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.cash}</option>
          <option value="credit_card" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.credit_card}</option>
          <option value="debit_card" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.debit_card}</option>
          <option value="bank_account" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.types.bank_account}</option>
        </select>
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.name}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 8) })}
          maxLength={8}
          required
          className="w-full rounded-2xl text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
          placeholder={t.name}
        />
      </div>

      {/* Last 4 Digits (for cards) */}
      {showLastFourDigits && (
        <div>
          <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
            {t.lastFourDigits}
          </label>
          <input
            type="text"
            value={formData.lastFourDigits}
            onChange={(e) => setFormData({ ...formData, lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            maxLength={4}
            className="w-full rounded-2xl text-body"
            style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
            placeholder="1234"
          />
        </div>
      )}

      {/* IBAN (for bank accounts) */}
      {showIban && (
        <div>
          <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
            {t.iban}
          </label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
            className="w-full rounded-2xl text-body"
            style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px' }}
            placeholder="GR1234567890123456789012345"
          />
        </div>
      )}

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
