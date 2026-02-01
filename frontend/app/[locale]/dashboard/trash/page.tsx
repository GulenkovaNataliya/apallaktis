"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";
import {
  getDeletedObjects,
  restoreObject,
  permanentlyDeleteObject,
  type PropertyObject,
} from "@/lib/supabase/services";

const translations = {
  el: {
    title: "🗑️",
    back: "Πίσω",
    empty: "Ο κάδος είναι άδειος",
    restore: "Επαναφορά",
    deletePermanently: "Οριστική Διαγραφή",
    confirmDelete: "Είστε σίγουροι; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.",
    deletedAt: "Διαγράφηκε",
    restoring: "Επαναφορά...",
    deleting: "Διαγραφή...",
    restored: "Επαναφέρθηκε!",
    deleted: "Διαγράφηκε οριστικά!",
    error: "Σφάλμα",
    autoDeleteLine1: "Το αντικείμενο διαγράφεται αυτόματα",
    autoDeleteLine2: "μετά από 30 ημέρες",
  },
  ru: {
    title: "🗑️",
    back: "Назад",
    empty: "Корзина пуста",
    restore: "Восстановить",
    deletePermanently: "Удалить навсегда",
    confirmDelete: "Вы уверены? Это действие нельзя отменить.",
    deletedAt: "Удалено",
    restoring: "Восстановление...",
    deleting: "Удаление...",
    restored: "Восстановлено!",
    deleted: "Удалено навсегда!",
    error: "Ошибка",
    autoDeleteLine1: "Объект автоматически удаляется",
    autoDeleteLine2: "через 30 дней",
  },
  en: {
    title: "🗑️",
    back: "Back",
    empty: "Trash is empty",
    restore: "Restore",
    deletePermanently: "Delete Permanently",
    confirmDelete: "Are you sure? This action cannot be undone.",
    deletedAt: "Deleted",
    restoring: "Restoring...",
    deleting: "Deleting...",
    restored: "Restored!",
    deleted: "Permanently deleted!",
    error: "Error",
    autoDeleteLine1: "Object is automatically deleted",
    autoDeleteLine2: "after 30 days",
  },
  uk: {
    title: "🗑️",
    back: "Назад",
    empty: "Кошик порожній",
    restore: "Відновити",
    deletePermanently: "Видалити назавжди",
    confirmDelete: "Ви впевнені? Цю дію не можна скасувати.",
    deletedAt: "Видалено",
    restoring: "Відновлення...",
    deleting: "Видалення...",
    restored: "Відновлено!",
    deleted: "Видалено назавжди!",
    error: "Помилка",
    autoDeleteLine1: "Об'єкт автоматично видаляється",
    autoDeleteLine2: "через 30 днів",
  },
  sq: {
    title: "🗑️",
    back: "Kthehu",
    empty: "Koshi është bosh",
    restore: "Rikthe",
    deletePermanently: "Fshi Përgjithmonë",
    confirmDelete: "Jeni i sigurt? Ky veprim nuk mund të zhbëhet.",
    deletedAt: "Fshirë",
    restoring: "Duke rikthyer...",
    deleting: "Duke fshirë...",
    restored: "U rikthye!",
    deleted: "U fshi përgjithmonë!",
    error: "Gabim",
    autoDeleteLine1: "Objekti fshihet automatikisht",
    autoDeleteLine2: "pas 30 ditësh",
  },
  bg: {
    title: "🗑️",
    back: "Назад",
    empty: "Кошчето е празно",
    restore: "Възстанови",
    deletePermanently: "Изтрий завинаги",
    confirmDelete: "Сигурни ли сте? Това действие не може да бъде отменено.",
    deletedAt: "Изтрито",
    restoring: "Възстановяване...",
    deleting: "Изтриване...",
    restored: "Възстановено!",
    deleted: "Изтрито завинаги!",
    error: "Грешка",
    autoDeleteLine1: "Обектът се изтрива автоматично",
    autoDeleteLine2: "след 30 дни",
  },
  ro: {
    title: "🗑️",
    back: "Înapoi",
    empty: "Coșul este gol",
    restore: "Restaurează",
    deletePermanently: "Șterge definitiv",
    confirmDelete: "Ești sigur? Această acțiune nu poate fi anulată.",
    deletedAt: "Șters",
    restoring: "Se restaurează...",
    deleting: "Se șterge...",
    restored: "Restaurat!",
    deleted: "Șters definitiv!",
    error: "Eroare",
    autoDeleteLine1: "Obiectul este șters automat",
    autoDeleteLine2: "după 30 de zile",
  },
  ar: {
    title: "🗑️",
    back: "رجوع",
    empty: "السلة فارغة",
    restore: "استعادة",
    deletePermanently: "حذف نهائي",
    confirmDelete: "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
    deletedAt: "تم الحذف",
    restoring: "جاري الاستعادة...",
    deleting: "جاري الحذف...",
    restored: "تمت الاستعادة!",
    deleted: "تم الحذف نهائياً!",
    error: "خطأ",
    autoDeleteLine1: "يتم حذف العنصر تلقائياً",
    autoDeleteLine2: "بعد 30 يوماً",
  },
};

export default function TrashPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = translations[locale as keyof typeof translations] || translations.el;
  const isRTL = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [deletedObjects, setDeletedObjects] = useState<PropertyObject[]>([]);
  const [actionStatus, setActionStatus] = useState<Record<string, 'restoring' | 'deleting' | 'restored' | 'deleted' | 'error'>>({});

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      setUserId(user.id);

      try {
        const objects = await getDeletedObjects(user.id);
        setDeletedObjects(objects);
      } catch (error) {
        console.error('Error loading deleted objects:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [locale, router]);

  const handleRestore = async (objectId: string) => {
    if (!userId) return;

    setActionStatus(prev => ({ ...prev, [objectId]: 'restoring' }));

    try {
      await restoreObject(objectId, userId);
      setActionStatus(prev => ({ ...prev, [objectId]: 'restored' }));

      // Remove from list after short delay
      setTimeout(() => {
        setDeletedObjects(prev => prev.filter(obj => obj.id !== objectId));
        setActionStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[objectId];
          return newStatus;
        });
      }, 1000);
    } catch (error) {
      console.error('Error restoring object:', error);
      setActionStatus(prev => ({ ...prev, [objectId]: 'error' }));
    }
  };

  const handlePermanentDelete = async (objectId: string) => {
    if (!userId) return;
    if (!confirm(t.confirmDelete)) return;

    setActionStatus(prev => ({ ...prev, [objectId]: 'deleting' }));

    try {
      await permanentlyDeleteObject(objectId, userId);
      setActionStatus(prev => ({ ...prev, [objectId]: 'deleted' }));

      // Remove from list after short delay
      setTimeout(() => {
        setDeletedObjects(prev => prev.filter(obj => obj.id !== objectId));
        setActionStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[objectId];
          return newStatus;
        });
      }, 1000);
    } catch (error) {
      console.error('Error permanently deleting object:', error);
      setActionStatus(prev => ({ ...prev, [objectId]: 'error' }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'restoring': return t.restoring;
      case 'deleting': return t.deleting;
      case 'restored': return t.restored;
      case 'deleted': return t.deleted;
      case 'error': return t.error;
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BackgroundPage specialPage="objekt">
      <div
        className="flex min-h-screen flex-col items-center"
        style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back */}
          <p
            onClick={() => router.push(`/${locale}/objects`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            ← {t.back}
          </p>

          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Auto-delete note - two lines centered */}
          <div className="text-center text-button" style={{ color: 'var(--zanah)' }}>
            <p>{t.autoDeleteLine1}</p>
            <p>{t.autoDeleteLine2}</p>
          </div>

          {/* Empty state - orange by law */}
          {deletedObjects.length === 0 && (
            <p
              className="text-center text-button"
              style={{ color: 'var(--orange)' }}
            >
              {t.empty}
            </p>
          )}

          {/* Deleted objects list */}
          <div className="flex flex-col gap-6">
            {deletedObjects.map((obj) => (
              <div
                key={obj.id}
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid var(--polar)',
                }}
              >
                {/* Object info */}
                <div className="mb-4">
                  <h3
                    className="text-button font-semibold"
                    style={{ color: 'var(--polar)' }}
                  >
                    {obj.name}
                  </h3>
                  {obj.address && (
                    <p className="text-sm" style={{ color: 'var(--polar)', opacity: 0.8 }}>
                      {obj.address}
                    </p>
                  )}
                  <p className="text-sm mt-2" style={{ color: 'var(--zanah)' }}>
                    {t.deletedAt}: {formatDate(obj.deleted_at!)}
                  </p>
                </div>

                {/* Status message */}
                {actionStatus[obj.id] && (
                  <p
                    className="text-center text-sm mb-3"
                    style={{
                      color: actionStatus[obj.id] === 'error' ? '#ff6a1a' :
                             actionStatus[obj.id] === 'restored' || actionStatus[obj.id] === 'deleted' ? '#25D366' :
                             'var(--polar)'
                    }}
                  >
                    {getStatusText(actionStatus[obj.id])}
                  </p>
                )}

                {/* Action buttons */}
                {!actionStatus[obj.id] || actionStatus[obj.id] === 'error' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRestore(obj.id)}
                      className="flex-1 rounded-2xl text-button font-medium"
                      style={{
                        minHeight: '52px',
                        backgroundColor: 'var(--zanah)',
                        color: 'var(--deep-teal)',
                      }}
                    >
                      {t.restore}
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(obj.id)}
                      className="flex-1 rounded-2xl text-button font-medium"
                      style={{
                        minHeight: '52px',
                        backgroundColor: 'var(--orange)',
                        color: 'white',
                      }}
                    >
                      {t.deletePermanently}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}
