"use client";

import { useState } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import type { GlobalExpense, ExpenseCategory } from '@/types/globalExpense';
import { formatEuro } from '@/lib/formatters';

type ViewType = 'expenses' | 'categories' | 'add-expense' | 'edit-expense' | 'add-category' | 'edit-category';

export default function GlobalExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.globalExpenses || messages.el.globalExpenses;

  // Categories state
  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('expenseCategories');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Expenses state
  const [expenses, setExpenses] = useState<GlobalExpense[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('globalExpenses');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [view, setView] = useState<ViewType>('expenses');
  const [editingExpense, setEditingExpense] = useState<GlobalExpense | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  const handleDeleteExpense = (id: string) => {
    if (confirm(t.confirmDelete)) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      localStorage.setItem('globalExpenses', JSON.stringify(updated));
    }
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
        <div className="min-h-screen flex flex-col" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>

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

          {/* Add Expense Button */}
          <button
            onClick={() => setView('add-expense')}
            className="btn-universal w-full"
            style={{ minHeight: '104px', marginTop: '50px', marginBottom: '52px', fontSize: '18px', fontWeight: 600 }}
          >
            {t.addNew}
          </button>

          {/* Manage Categories Button */}
          <button
            onClick={() => setView('categories')}
            className="btn-universal w-full mb-8"
            style={{ minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
          >
            {t.manageCategories}
          </button>

          {/* Expenses List */}
          <div className="flex flex-col gap-4 flex-1" style={{ marginTop: '52px' }}>
            {expenses.length === 0 ? (
              <p className="text-center text-body" style={{ color: 'var(--polar)', opacity: 0.9 }}>
                {t.noExpenses}
              </p>
            ) : (
              expenses.map(expense => {
                const category = categories.find(c => c.id === expense.categoryId);
                return (
                  <div
                    key={expense.id}
                    className="p-4 rounded-2xl flex items-center justify-between"
                    style={{ backgroundColor: 'var(--polar)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-button" style={{ color: 'var(--deep-teal)' }}>
                          {expense.name}
                        </p>
                        <p className="text-link" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                          {category?.name || 'Uncategorized'}
                          {expense.amount && ` • ${formatEuro(parseFloat(expense.amount))}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setView('edit-expense');
                        }}
                        className="px-4 rounded-lg"
                        style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="px-4 rounded-lg"
                        style={{ backgroundColor: 'var(--orange)', color: 'white', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // CATEGORIES VIEW
  if (view === 'categories') {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="min-h-screen flex flex-col" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6" style={{ marginTop: '120px' }}>
            <button
              onClick={() => setView('expenses')}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToExpenses}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--polar)' }}>
            {t.manageCategories}
          </h1>

          {/* Add Category Button */}
          <button
            onClick={() => setView('add-category')}
            className="btn-universal w-full mb-8"
            style={{ minHeight: '104px', marginTop: '50px', fontSize: '18px', fontWeight: 600 }}
          >
            {t.addCategory}
          </button>

          {/* Categories List */}
          <div className="flex flex-col gap-4 flex-1" style={{ marginTop: '52px' }}>
            {categories.length === 0 ? (
              <p className="text-center text-body" style={{ color: 'var(--polar)', opacity: 0.9 }}>
                {t.noCategories}
              </p>
            ) : (
              categories.map(category => (
                <div
                  key={category.id}
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ backgroundColor: 'var(--polar)' }}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-button" style={{ color: 'var(--deep-teal)' }}>
                        {category.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setView('edit-category');
                      }}
                      className="px-4 rounded-lg"
                      style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', minHeight: '104px', fontSize: '18px', fontWeight: 600 }}
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
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
      </BackgroundPage>
    );
  }

  // ADD/EDIT CATEGORY FORM
  if (view === 'add-category' || view === 'edit-category') {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="min-h-screen" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>

          {/* Back Button */}
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => {
                setView('categories');
                setEditingCategory(null);
              }}
              className="text-button"
              style={{ color: 'var(--polar)', fontSize: '18px' }}
            >
              {t.backToExpenses}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
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
      </BackgroundPage>
    );
  }

  // ADD/EDIT EXPENSE FORM
  if (view === 'add-expense' || view === 'edit-expense') {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="min-h-screen" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>

          {/* Back Button */}
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => {
                setView('expenses');
                setEditingExpense(null);
              }}
              className="text-button"
              style={{ color: 'var(--polar)', fontSize: '18px' }}
            >
              {t.backToPayPage}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
            {editingExpense ? t.edit : t.addNew}
          </h1>

          <ExpenseForm
            expense={editingExpense}
            categories={categories}
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      {/* Name Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.name}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
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
  onSave,
  onCancel,
  locale,
}: {
  expense: GlobalExpense | null;
  categories: ExpenseCategory[];
  onSave: (expense: GlobalExpense) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.globalExpenses || messages.el.globalExpenses;
  const [formData, setFormData] = useState({
    categoryId: expense?.categoryId || (categories[0]?.id || ''),
    name: expense?.name || '',
    amount: expense?.amount || '',
    description: expense?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert(t.noCategories);
      return;
    }

    const category = categories.find(c => c.id === formData.categoryId);

    const newExpense: GlobalExpense = {
      id: expense?.id || Date.now().toString(),
      userId: 'current-user',
      categoryId: formData.categoryId,
      categoryName: category?.name,
      name: formData.name,
      amount: formData.amount || undefined,
      description: formData.description || undefined,
      createdAt: expense?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newExpense);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      {/* Category Select */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.category}
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id} style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Name Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.name}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.name}
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.amount}
        </label>
        <input
          type="text"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder="€"
        />
      </div>

      {/* Description Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.description}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.description}
          rows={3}
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
