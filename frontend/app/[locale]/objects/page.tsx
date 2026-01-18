"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import ObjectCarousel from '@/components/ObjectCarousel';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import type { PropertyObject, ObjectStatus } from '@/types/object';
import { formatEuro } from '@/lib/formatters';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import {
  getObjects,
  createObject,
  updateObject,
  deleteObject as deleteObjectApi,
  type PropertyObject as SupabasePropertyObject,
} from '@/lib/supabase/services';

type ViewType = 'list' | 'add-object' | 'edit-object';

// Конвертер из Supabase формата в локальный
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

export default function ObjectsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.objects || messages.el.objects;
  const tDemo = messages[locale]?.demoExpired || messages.el.demoExpired;
  const { user } = useAuth();

  // Objects state
  const [objects, setObjects] = useState<PropertyObject[]>([]);
  const [mounted, setMounted] = useState(false);

  const [view, setView] = useState<ViewType>('list');
  const [filter, setFilter] = useState<'all' | ObjectStatus>('all');
  const [editingObject, setEditingObject] = useState<PropertyObject | null>(null);

  // User subscription state
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load objects from Supabase
  useEffect(() => {
    async function loadObjects() {
      setMounted(true);

      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getObjects(user.id);
        setObjects(data.map(toLocalObject));
      } catch (error) {
        console.error('Error loading objects:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadObjects();
  }, [user?.id]);

  // Check user subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createClient();
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, account_purchased')
            .eq('id', supabaseUser.id)
            .single();

          if (profile) {
            setIsDemo(profile.subscription_status === 'demo' && !profile.account_purchased);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  const handleAddObjectClick = () => {
    // Check DEMO limit (3 objects max)
    if (isDemo && objects.length >= 3) {
      const demoLimitMessage = locale === 'el'
        ? 'Στο DEMO μπορείτε να δημιουργήσετε μέχρι 3 αντικείμενα. Αγοράστε πλήρη λογαριασμό για απεριόριστα αντικείμενα.'
        : locale === 'ru'
        ? 'В DEMO можно создать до 3 объектов. Купите полный аккаунт для неограниченного количества объектов.'
        : locale === 'uk'
        ? 'У DEMO можна створити до 3 об\'єктів. Придбайте повний акаунт для необмеженої кількості об\'єктів.'
        : locale === 'sq'
        ? 'Në DEMO mund të krijoni deri në 3 objekte. Blini llogari të plotë për objekte të pakufizuara.'
        : locale === 'bg'
        ? 'В DEMO можете да създадете до 3 обекта. Купете пълен акаунт за неограничен брой обекти.'
        : locale === 'ro'
        ? 'În DEMO puteți crea până la 3 obiecte. Cumpărați cont complet pentru obiecte nelimitate.'
        : locale === 'ar'
        ? 'في DEMO يمكنك إنشاء ما يصل إلى 3 كائنات. اشترِ حسابًا كاملاً للكائنات غير المحدودة.'
        : 'In DEMO you can create up to 3 objects. Purchase full account for unlimited objects.';

      alert(demoLimitMessage);
      return;
    }

    setView('add-object');
  };

  const handleDeleteObject = async (id: string) => {
    if (!user?.id) return;
    if (!confirm(t.confirmDelete)) return;

    try {
      await deleteObjectApi(id, user.id);
      setObjects(objects.filter(obj => obj.id !== id));
    } catch (error) {
      console.error('Error deleting object:', error);
      alert('Failed to delete object');
    }
  };

  // Filter objects based on status
  const filteredObjects = filter === 'all'
    ? objects
    : objects.filter(obj => obj.status === filter);

  // Loading state
  if (isLoading) {
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

  // OBJECTS LIST VIEW
  if (view === 'list') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
          <div className="w-full max-w-sm">

          {/* Header */}
          <div className="flex items-center justify-between mb-6" style={{ marginTop: '120px' }}>
            <button
              onClick={() => router.push(`/${locale}/page-pay`)}
              className="text-subheading"
              style={{ color: 'var(--polar)' }}
            >
              {t.backToDashboard}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--polar)' }}>
            {t.title}
          </h1>

          {/* Filter Toggle */}
          <div className="flex gap-6" style={{ marginTop: '48px', marginBottom: '48px' }}>
            <button
              onClick={() => setFilter('all')}
              className="flex-1 rounded-lg text-button px-6 py-3"
              style={{
                minHeight: '52px',
                backgroundColor: filter === 'all' ? 'var(--zanah)' : 'var(--polar)',
                color: 'var(--deep-teal)',
                opacity: filter === 'all' ? 1 : 0.6,
              }}
            >
              {t.filterAll || 'Όλα'}
            </button>
            <button
              onClick={() => setFilter('open')}
              className="flex-1 rounded-lg text-button px-6 py-3"
              style={{
                minHeight: '52px',
                backgroundColor: filter === 'open' ? 'var(--zanah)' : 'var(--polar)',
                color: 'var(--deep-teal)',
                opacity: filter === 'open' ? 1 : 0.6,
              }}
            >
              {t.filterOpen}
            </button>
            <button
              onClick={() => setFilter('closed')}
              className="flex-1 rounded-lg text-button px-6 py-3"
              style={{
                minHeight: '52px',
                backgroundColor: filter === 'closed' ? 'var(--zanah)' : 'var(--polar)',
                color: 'var(--deep-teal)',
                opacity: filter === 'closed' ? 1 : 0.6,
              }}
            >
              {t.filterClosed}
            </button>
          </div>

          {/* Add Object Button */}
          <button
            onClick={handleAddObjectClick}
            className="btn-universal w-full text-button"
            style={{ minHeight: '52px', marginBottom: '48px' }}
          >
            {t.addNew}
            {isDemo && objects.length >= 2 && (
              <span className="text-small" style={{ marginLeft: '8px', opacity: 0.8 }}>
                ({objects.length}/3)
              </span>
            )}
          </button>

          {/* Objects Carousel */}
          <div className="flex-1" style={{ marginTop: '52px' }}>
            {filteredObjects.length === 0 ? (
              <p className="text-center text-body" style={{ color: 'var(--polar)', opacity: 0.9 }}>
                {t.noObjects}
              </p>
            ) : (
              <ObjectCarousel
                objects={filteredObjects}
                onObjectClick={(object) => {
                  // Navigate to object finance page
                  router.push(`/${locale}/objects/${object.id}/finance`);
                }}
                onEdit={(object) => {
                  setEditingObject(object);
                  setView('edit-object');
                }}
                onDelete={handleDeleteObject}
                editLabel={t.edit}
                deleteLabel={t.delete}
                clientLabel={t.client}
                addressLabel={t.address}
                priceLabel={t.contractPrice}
              />
            )}
          </div>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // ADD/EDIT OBJECT FORM
  if (view === 'add-object' || view === 'edit-object') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
          <div className="w-full max-w-sm">

          {/* Back Button */}
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => {
                setView('list');
                setEditingObject(null);
              }}
              className="text-subheading"
              style={{ color: 'var(--polar)' }}
            >
              {t.backToDashboard}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
            {editingObject ? t.edit : t.addNew}
          </h1>

          <ObjectForm
            object={editingObject}
            userId={user?.id || ''}
            onSave={(object) => {
              if (editingObject) {
                setObjects(objects.map(obj => obj.id === editingObject.id ? object : obj));
              } else {
                setObjects([...objects, object]);
              }
              setView('list');
              setEditingObject(null);
            }}
            onCancel={() => {
              setView('list');
              setEditingObject(null);
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

// Object Form Component
function ObjectForm({
  object,
  userId,
  onSave,
  onCancel,
  locale,
}: {
  object: PropertyObject | null;
  userId: string;
  onSave: (object: PropertyObject) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.objects || messages.el.objects;
  const [formData, setFormData] = useState({
    name: object?.name || '',
    address: object?.address || '',
    clientName: object?.clientName || '',
    clientContact: object?.clientContact || '',
    contractPrice: object?.contractPrice || 0,
    status: object?.status || 'open' as ObjectStatus,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);

    try {
      let savedObject: PropertyObject;

      if (object?.id) {
        // Обновление существующего
        const updated = await updateObject(object.id, userId, {
          name: formData.name,
          address: formData.address || null,
          client_name: formData.clientName || null,
          client_contact: formData.clientContact || null,
          contract_price: formData.contractPrice,
          status: formData.status,
        });
        savedObject = toLocalObject(updated);
      } else {
        // Создание нового
        const created = await createObject(userId, {
          name: formData.name,
          address: formData.address || null,
          client_name: formData.clientName || null,
          client_contact: formData.clientContact || null,
          contract_price: formData.contractPrice,
          status: formData.status,
        });
        savedObject = toLocalObject(created);
      }

      onSave(savedObject);
    } catch (error) {
      console.error('Error saving object:', error);
      alert('Failed to save object');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      {/* Name Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.name || 'Όνομα'}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.name || 'Όνομα'}
        />
      </div>

      {/* Address Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.address}
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.address}
        />
      </div>

      {/* Client Name Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.client}
        </label>
        <input
          type="text"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.client}
        />
      </div>

      {/* Client Contact Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.clientContact || 'Τηλέφωνο Πελάτη'}
        </label>
        <input
          type="text"
          value={formData.clientContact}
          onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.clientContact || 'Τηλέφωνο'}
        />
      </div>

      {/* Contract Price Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.contractPrice}
        </label>
        <input
          type="number"
          value={formData.contractPrice || ''}
          onChange={(e) => setFormData({ ...formData, contractPrice: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder="€"
        />
      </div>

      {/* Status Select */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.status}
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ObjectStatus })}
          className="w-full rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
        >
          <option value="open" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.statusOpen || t.filterOpen}</option>
          <option value="closed" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.statusClosed || t.filterClosed}</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="btn-universal flex-1 text-button"
          style={{ minHeight: '52px', backgroundColor: 'var(--polar)' }}
        >
          {t.cancel || 'Ακύρωση'}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="btn-universal flex-1 text-button"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)' }}
        >
          {isSaving ? '...' : (t.save || 'Αποθήκευση')}
        </button>
      </div>
    </form>
  );
}
