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
  updateObjectWithVersion,
  deleteObject as deleteObjectApi,
  type PropertyObject as SupabasePropertyObject,
} from '@/lib/supabase/services';
import { getUserTier, canCreateObject, type SubscriptionTier } from '@/lib/subscription';

type ViewType = 'list' | 'add-object' | 'edit-object';

// Конвертер из Supabase формата в локальный
function toLocalObject(obj: SupabasePropertyObject): PropertyObject & { version: number } {
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
    version: obj.version || 1,
  };
}

export default function ObjectsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.objects || messages.el.objects;
  const tDemo = messages[locale]?.demoExpired || messages.el.demoExpired;
  const { user, isLoading: authLoading } = useAuth();

  // Debug
  console.log('ObjectsPage - auth state:', {
    userId: user?.id,
    authLoading,
    hasUser: !!user
  });

  // Objects state
  const [objects, setObjects] = useState<PropertyObject[]>([]);
  const [mounted, setMounted] = useState(false);

  const [view, setView] = useState<ViewType>('list');
  const [filter, setFilter] = useState<ObjectStatus>('open');
  const [editingObject, setEditingObject] = useState<PropertyObject | null>(null);

  // User subscription state
  const [userTier, setUserTier] = useState<SubscriptionTier>('demo');
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

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
            .select('subscription_status, account_purchased, demo_expires_at, vip_expires_at')
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

  // Subscription limit messages
  const subscriptionMessages = {
    el: {
      objectLimitBasic: 'Φτάσατε το όριο των 10 αντικειμένων. Αναβαθμίστε σε Standard (έως 50) ή Premium (απεριόριστα).',
      objectLimitStandard: 'Φτάσατε το όριο των 50 αντικειμένων. Αναβαθμίστε σε Premium για απεριόριστα αντικείμενα.',
      upgradePlan: 'Αναβάθμιση τιμολογίου',
    },
    ru: {
      objectLimitBasic: 'Вы достигли лимита 10 объектов. Улучшите до Standard (до 50) или Premium (безлимит).',
      objectLimitStandard: 'Вы достигли лимита 50 объектов. Улучшите до Premium для безлимитных объектов.',
      upgradePlan: 'Улучшить тариф',
    },
    uk: {
      objectLimitBasic: 'Ви досягли ліміту 10 об\'єктів. Покращіть до Standard (до 50) або Premium (безліміт).',
      objectLimitStandard: 'Ви досягли ліміту 50 об\'єктів. Покращіть до Premium для безлімітних об\'єктів.',
      upgradePlan: 'Покращити тариф',
    },
    sq: {
      objectLimitBasic: 'Keni arritur limitin e 10 objekteve. Përmirësoni në Standard (deri në 50) ose Premium (pa limit).',
      objectLimitStandard: 'Keni arritur limitin e 50 objekteve. Përmirësoni në Premium për objekte pa limit.',
      upgradePlan: 'Përmirëso planin',
    },
    bg: {
      objectLimitBasic: 'Достигнахте лимита от 10 обекта. Надградете до Standard (до 50) или Premium (неограничено).',
      objectLimitStandard: 'Достигнахте лимита от 50 обекта. Надградете до Premium за неограничени обекти.',
      upgradePlan: 'Надгради плана',
    },
    ro: {
      objectLimitBasic: 'Ați atins limita de 10 obiecte. Actualizați la Standard (până la 50) sau Premium (nelimitat).',
      objectLimitStandard: 'Ați atins limita de 50 obiecte. Actualizați la Premium pentru obiecte nelimitate.',
      upgradePlan: 'Actualizare plan',
    },
    en: {
      objectLimitBasic: 'You reached the limit of 10 objects. Upgrade to Standard (up to 50) or Premium (unlimited).',
      objectLimitStandard: 'You reached the limit of 50 objects. Upgrade to Premium for unlimited objects.',
      upgradePlan: 'Upgrade plan',
    },
    ar: {
      objectLimitBasic: 'لقد وصلت إلى حد 10 كائنات. قم بالترقية إلى Standard (حتى 50) أو Premium (غير محدود).',
      objectLimitStandard: 'لقد وصلت إلى حد 50 كائنًا. قم بالترقية إلى Premium للحصول على كائنات غير محدودة.',
      upgradePlan: 'ترقية الخطة',
    },
  };

  const tSub = subscriptionMessages[locale] || subscriptionMessages.en;

  const handleAddObjectClick = () => {
    // Check subscription limits
    const check = canCreateObject(userTier, objects.length);

    if (!check.allowed) {
      if (check.message === 'objectLimitBasic') {
        setUpgradeMessage(tSub.objectLimitBasic);
      } else if (check.message === 'objectLimitStandard') {
        setUpgradeMessage(tSub.objectLimitStandard);
      }
      setShowUpgradeModal(true);
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
  const filteredObjects = objects.filter(obj => obj.status === filter);

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
        <div className="min-h-screen flex flex-col" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>

          {/* Back - just text, not a button */}
          <p
            onClick={() => router.push(`/${locale}/page-pay`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)', marginBottom: '48px' }}
          >
            {t.backToDashboard}
          </p>

          {/* Buttons */}
          <div className="w-full flex flex-col gap-12">

            {/* Filter Buttons Row: Open & Closed */}
            <div className="flex gap-4">
              <button
                onClick={() => setFilter('open')}
                className="btn-universal flex-1 text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: filter === 'open' ? 'var(--polar)' : 'transparent',
                  border: filter === 'open' ? 'none' : '2px solid var(--polar)',
                  color: filter === 'open' ? 'var(--deep-teal)' : 'var(--polar)',
                }}
              >
                {t.filterOpen}
              </button>

              <button
                onClick={() => setFilter('closed')}
                className="btn-universal flex-1 text-button"
                style={{
                  minHeight: '52px',
                  backgroundColor: filter === 'closed' ? 'var(--zanah)' : 'transparent',
                  border: filter === 'closed' ? 'none' : '2px solid var(--polar)',
                  color: filter === 'closed' ? 'var(--deep-teal)' : 'var(--polar)',
                }}
              >
                {t.filterClosed}
              </button>
            </div>

            {/* Add Object Button */}
            <button
              onClick={handleAddObjectClick}
              className="btn-universal w-full text-button"
              style={{ minHeight: '52px' }}
            >
              {t.addNew}
            </button>

            {/* No Objects Message - text only, follows button law */}
            {objects.length === 0 && (
              <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
                {t.noObjects}
              </p>
            )}

          </div>

          {/* Objects Carousel */}
          <div className="flex-1" style={{ marginTop: '48px' }}>
            {/* Hint phrase - only visible when objects exist */}
            {filteredObjects.length > 0 && (
              <div className="text-center text-button" style={{ color: 'var(--zanah)', marginBottom: '24px' }}>
                <p>{t.clickToAnalyzeLine1}</p>
                <p>{t.clickToAnalyzeLine2}</p>
              </div>
            )}
            {filteredObjects.length > 0 && (
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
                    {t.cancel || 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </BackgroundPage>
    );
  }

  // ADD/EDIT OBJECT FORM
  if (view === 'add-object' || view === 'edit-object') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen flex flex-col" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}>

          {/* Back - text, not a button */}
          <p
            onClick={() => {
              setView('list');
              setEditingObject(null);
            }}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)', marginBottom: '48px' }}
          >
            {t.backToDashboard}
          </p>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
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
      </BackgroundPage>
    );
  }

  return null;
}

// Conflict modal translations
const conflictTranslations = {
  el: {
    conflictTitle: "Σύγκρουση Αλλαγών",
    conflictMessage: "Κάποιος άλλος άλλαξε αυτό το αντικείμενο. Θέλετε να φορτώσετε ξανά;",
    reload: "Ναι, φόρτωσε ξανά",
    overwrite: "Αντικατάσταση",
  },
  ru: {
    conflictTitle: "Конфликт изменений",
    conflictMessage: "Кто-то другой изменил этот объект. Хотите перезагрузить?",
    reload: "Да, перезагрузить",
    overwrite: "Перезаписать",
  },
  en: {
    conflictTitle: "Edit Conflict",
    conflictMessage: "Someone else edited this object. Would you like to reload?",
    reload: "Yes, reload",
    overwrite: "Overwrite",
  },
  uk: {
    conflictTitle: "Конфлікт змін",
    conflictMessage: "Хтось інший змінив цей об'єкт. Бажаєте перезавантажити?",
    reload: "Так, перезавантажити",
    overwrite: "Перезаписати",
  },
  sq: {
    conflictTitle: "Konflikt Ndryshimesh",
    conflictMessage: "Dikush tjetër ndryshoi këtë objekt. Dëshironi të ringarkoni?",
    reload: "Po, ringarkoni",
    overwrite: "Mbishkruaj",
  },
  bg: {
    conflictTitle: "Конфликт на промени",
    conflictMessage: "Някой друг промени този обект. Искате ли да презаредите?",
    reload: "Да, презареди",
    overwrite: "Презапиши",
  },
  ro: {
    conflictTitle: "Conflict de editare",
    conflictMessage: "Altcineva a editat acest obiect. Doriți să reîncărcați?",
    reload: "Da, reîncarcă",
    overwrite: "Suprascrie",
  },
  ar: {
    conflictTitle: "تعارض في التحرير",
    conflictMessage: "قام شخص آخر بتعديل هذا العنصر. هل تريد إعادة التحميل؟",
    reload: "نعم، أعد التحميل",
    overwrite: "استبدال",
  },
};

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
  const tConflict = conflictTranslations[locale as keyof typeof conflictTranslations] || conflictTranslations.en;

  const [formData, setFormData] = useState({
    name: object?.name || '',
    address: object?.address || '',
    clientName: object?.clientName || '',
    clientContact: object?.clientContact || '',
    contractPrice: object?.contractPrice || 0,
    status: object?.status || 'open' as ObjectStatus,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(object?.version || 1);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('ObjectForm handleSubmit called, userId:', userId);

    if (!userId) {
      console.error('No userId provided!');
      alert('Error: User not authenticated. Please log in again.');
      return;
    }

    setIsSaving(true);

    try {
      let savedObject: PropertyObject;

      console.log('Saving object...', { formData, userId, isEdit: !!object?.id, version: currentVersion });

      if (object?.id) {
        // Обновление существующего с проверкой версии
        const result = await updateObjectWithVersion(object.id, userId, {
          name: formData.name,
          address: formData.address || null,
          client_name: formData.clientName || null,
          client_contact: formData.clientContact || null,
          contract_price: formData.contractPrice,
          status: formData.status,
        }, currentVersion);

        if (!result.success && result.conflict) {
          // Конфликт версий
          setShowConflictModal(true);
          setIsSaving(false);
          return;
        }

        if (!result.data) {
          throw new Error('Update failed');
        }

        console.log('Updated:', result.data);
        savedObject = toLocalObject(result.data);
        setCurrentVersion(result.data.version);
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
        console.log('Created:', created);
        savedObject = toLocalObject(created);
      }

      console.log('Saved successfully:', savedObject);
      onSave(savedObject);
    } catch (error: any) {
      console.error('Error saving object:', error);
      alert(`Failed to save object: ${error?.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReload = () => {
    // Reload the page to get fresh data
    window.location.reload();
  };

  const handleOverwrite = async () => {
    setShowConflictModal(false);
    setIsSaving(true);

    try {
      // Force update without version check
      const updated = await updateObject(object!.id, userId, {
        name: formData.name,
        address: formData.address || null,
        client_name: formData.clientName || null,
        client_contact: formData.clientContact || null,
        contract_price: formData.contractPrice,
        status: formData.status,
      });
      const savedObject = toLocalObject(updated);
      setCurrentVersion(updated.version);
      onSave(savedObject);
    } catch (error: any) {
      console.error('Error overwriting object:', error);
      alert(`Failed to save object: ${error?.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-12" style={{ marginTop: '48px' }}>
      {/* Name */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.name || 'Όνομα'}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            padding: '12px',
            fontSize: '18px'
          }}
          placeholder={t.name || 'Όνομα'}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.address}
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            padding: '12px',
            fontSize: '18px'
          }}
          placeholder={t.address}
        />
      </div>

      {/* Client */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.client}
        </label>
        <input
          type="text"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            padding: '12px',
            fontSize: '18px'
          }}
          placeholder={t.client}
        />
      </div>

      {/* Client Contact */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.clientContact || 'Τηλέφωνο Πελάτη'}
        </label>
        <input
          type="text"
          value={formData.clientContact}
          onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            padding: '12px',
            fontSize: '18px'
          }}
          placeholder={t.clientContact || 'Τηλέφωνο'}
        />
      </div>

      {/* Contract Price */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.contractPrice}
        </label>
        <input
          type="number"
          value={formData.contractPrice || ''}
          onChange={(e) => setFormData({ ...formData, contractPrice: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            padding: '12px',
            fontSize: '18px'
          }}
          placeholder="€"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-button" style={{ color: 'var(--polar)', marginBottom: '20px' }}>
          {t.status}
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ObjectStatus })}
          className="w-full rounded-2xl text-body"
          style={{
            border: '2px solid var(--polar)',
            color: 'var(--polar)',
            backgroundColor: 'transparent',
            minHeight: '52px',
            padding: '12px',
            fontSize: '18px'
          }}
        >
          <option value="open" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.statusOpen || t.filterOpen}</option>
          <option value="closed" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.statusClosed || t.filterClosed}</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="btn-universal flex-1"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--polar)',
            fontSize: '18px',
            fontWeight: 600
          }}
        >
          {t.cancel || 'Ακύρωση'}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="btn-universal flex-1"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--zanah)',
            fontSize: '18px',
            fontWeight: 600
          }}
        >
          {isSaving ? '...' : (t.save || 'Αποθήκευση')}
        </button>
      </div>

      {/* Version Conflict Modal */}
      {showConflictModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div
            className="rounded-2xl p-6 mx-4 max-w-sm"
            style={{ backgroundColor: 'var(--polar)', border: '2px solid var(--orange)' }}
          >
            <h3
              className="text-button font-bold text-center mb-4"
              style={{ color: 'var(--orange)' }}
            >
              {tConflict.conflictTitle}
            </h3>
            <p
              className="text-body text-center mb-6"
              style={{ color: 'var(--deep-teal)' }}
            >
              {tConflict.conflictMessage}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleReload}
                className="flex-1 rounded-2xl text-button font-medium"
                style={{
                  minHeight: '48px',
                  backgroundColor: 'var(--zanah)',
                  color: 'var(--deep-teal)',
                }}
              >
                {tConflict.reload}
              </button>
              <button
                onClick={handleOverwrite}
                className="flex-1 rounded-2xl text-button font-medium"
                style={{
                  minHeight: '48px',
                  backgroundColor: 'var(--orange)',
                  color: 'white',
                }}
              >
                {tConflict.overwrite}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
