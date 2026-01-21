"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

const translations = {
  el: {
    title: "Ασφάλεια",
    changePassword: "Αλλαγή Κωδικού",
    currentPassword: "Τρέχων κωδικός",
    newPassword: "Νέος κωδικός",
    confirmPassword: "Επιβεβαίωση κωδικού",
    updatePassword: "Ενημέρωση Κωδικού",
    updating: "Ενημέρωση...",
    passwordUpdated: "Ο κωδικός ενημερώθηκε!",
    passwordError: "Σφάλμα ενημέρωσης κωδικού",
    passwordMismatch: "Οι κωδικοί δεν ταιριάζουν",
    passwordTooShort: "Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες",
    deleteAccount: "Διαγραφή Λογαριασμού",
    deleteWarning: "Αυτή η ενέργεια είναι μη αναστρέψιμη! Όλα τα δεδομένα σας θα διαγραφούν.",
    deleteConfirm: "Είστε σίγουροι;",
    typeDelete: "Πληκτρολογήστε DELETE για επιβεβαίωση",
    deleteButton: "Διαγραφή Οριστικά",
    deleting: "Διαγραφή...",
    back: "← Πίσω",
    cancel: "Ακύρωση",
  },
  ru: {
    title: "Безопасность",
    changePassword: "Изменить Пароль",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    confirmPassword: "Подтвердите пароль",
    updatePassword: "Обновить Пароль",
    updating: "Обновление...",
    passwordUpdated: "Пароль обновлён!",
    passwordError: "Ошибка обновления пароля",
    passwordMismatch: "Пароли не совпадают",
    passwordTooShort: "Пароль должен быть минимум 6 символов",
    deleteAccount: "Удалить Аккаунт",
    deleteWarning: "Это действие необратимо! Все ваши данные будут удалены.",
    deleteConfirm: "Вы уверены?",
    typeDelete: "Введите DELETE для подтверждения",
    deleteButton: "Удалить Навсегда",
    deleting: "Удаление...",
    back: "← Назад",
    cancel: "Отмена",
  },
  en: {
    title: "Security",
    changePassword: "Change Password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    updatePassword: "Update Password",
    updating: "Updating...",
    passwordUpdated: "Password updated!",
    passwordError: "Error updating password",
    passwordMismatch: "Passwords don't match",
    passwordTooShort: "Password must be at least 6 characters",
    deleteAccount: "Delete Account",
    deleteWarning: "This action is irreversible! All your data will be deleted.",
    deleteConfirm: "Are you sure?",
    typeDelete: "Type DELETE to confirm",
    deleteButton: "Delete Permanently",
    deleting: "Deleting...",
    back: "← Back",
    cancel: "Cancel",
  },
  uk: {
    title: "Безпека",
    changePassword: "Змінити Пароль",
    currentPassword: "Поточний пароль",
    newPassword: "Новий пароль",
    confirmPassword: "Підтвердьте пароль",
    updatePassword: "Оновити Пароль",
    updating: "Оновлення...",
    passwordUpdated: "Пароль оновлено!",
    passwordError: "Помилка оновлення пароля",
    passwordMismatch: "Паролі не співпадають",
    passwordTooShort: "Пароль має бути мінімум 6 символів",
    deleteAccount: "Видалити Акаунт",
    deleteWarning: "Ця дія незворотня! Всі ваші дані будуть видалені.",
    deleteConfirm: "Ви впевнені?",
    typeDelete: "Введіть DELETE для підтвердження",
    deleteButton: "Видалити Назавжди",
    deleting: "Видалення...",
    back: "← Назад",
    cancel: "Скасувати",
  },
  sq: {
    title: "Siguria",
    changePassword: "Ndrysho Fjalëkalimin",
    currentPassword: "Fjalëkalimi aktual",
    newPassword: "Fjalëkalimi i ri",
    confirmPassword: "Konfirmo fjalëkalimin",
    updatePassword: "Përditëso Fjalëkalimin",
    updating: "Duke përditësuar...",
    passwordUpdated: "Fjalëkalimi u përditësua!",
    passwordError: "Gabim gjatë përditësimit",
    passwordMismatch: "Fjalëkalimet nuk përputhen",
    passwordTooShort: "Fjalëkalimi duhet të jetë të paktën 6 karaktere",
    deleteAccount: "Fshi Llogarinë",
    deleteWarning: "Ky veprim është i pakthyeshëm! Të gjitha të dhënat tuaja do të fshihen.",
    deleteConfirm: "Jeni të sigurt?",
    typeDelete: "Shkruani DELETE për të konfirmuar",
    deleteButton: "Fshi Përgjithmonë",
    deleting: "Duke fshirë...",
    back: "← Kthehu",
    cancel: "Anulo",
  },
  bg: {
    title: "Сигурност",
    changePassword: "Промяна на Паролата",
    currentPassword: "Текуща парола",
    newPassword: "Нова парола",
    confirmPassword: "Потвърдете паролата",
    updatePassword: "Обнови Паролата",
    updating: "Обновяване...",
    passwordUpdated: "Паролата е обновена!",
    passwordError: "Грешка при обновяване",
    passwordMismatch: "Паролите не съвпадат",
    passwordTooShort: "Паролата трябва да е поне 6 символа",
    deleteAccount: "Изтрий Акаунта",
    deleteWarning: "Това действие е необратимо! Всички ваши данни ще бъдат изтрити.",
    deleteConfirm: "Сигурни ли сте?",
    typeDelete: "Въведете DELETE за потвърждение",
    deleteButton: "Изтрий Завинаги",
    deleting: "Изтриване...",
    back: "← Назад",
    cancel: "Отказ",
  },
  ro: {
    title: "Securitate",
    changePassword: "Schimbă Parola",
    currentPassword: "Parola curentă",
    newPassword: "Parola nouă",
    confirmPassword: "Confirmă parola",
    updatePassword: "Actualizează Parola",
    updating: "Se actualizează...",
    passwordUpdated: "Parola a fost actualizată!",
    passwordError: "Eroare la actualizare",
    passwordMismatch: "Parolele nu se potrivesc",
    passwordTooShort: "Parola trebuie să aibă cel puțin 6 caractere",
    deleteAccount: "Șterge Contul",
    deleteWarning: "Această acțiune este ireversibilă! Toate datele vor fi șterse.",
    deleteConfirm: "Ești sigur?",
    typeDelete: "Tastează DELETE pentru confirmare",
    deleteButton: "Șterge Definitiv",
    deleting: "Se șterge...",
    back: "← Înapoi",
    cancel: "Anulează",
  },
  ar: {
    title: "الأمان",
    changePassword: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    updatePassword: "تحديث كلمة المرور",
    updating: "جاري التحديث...",
    passwordUpdated: "تم تحديث كلمة المرور!",
    passwordError: "خطأ في التحديث",
    passwordMismatch: "كلمات المرور غير متطابقة",
    passwordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    deleteAccount: "حذف الحساب",
    deleteWarning: "هذا الإجراء لا رجعة فيه! سيتم حذف جميع بياناتك.",
    deleteConfirm: "هل أنت متأكد؟",
    typeDelete: "اكتب DELETE للتأكيد",
    deleteButton: "حذف نهائياً",
    deleting: "جاري الحذف...",
    back: "← رجوع",
    cancel: "إلغاء",
  },
};

export default function SecurityPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = translations[locale as keyof typeof translations] || translations.el;
  const isRTL = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }
      }

      setIsLoading(false);
    }

    checkAuth();
  }, [locale, router]);

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordStatus('idle');

    // Validation
    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t.passwordTooShort);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t.passwordMismatch);
      return;
    }

    setIsUpdating(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) {
        console.error('Error updating password:', error);
        setPasswordStatus('error');
        setPasswordError(t.passwordError);
      } else {
        setPasswordStatus('success');
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        setTimeout(() => setPasswordStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setPasswordStatus('error');
      setPasswordError(t.passwordError);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete profile data (cascade should handle related data)
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      // Sign out
      await supabase.auth.signOut();

      // Redirect to home
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
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
    <BackgroundPage pageIndex={1}>
      <div
        className="flex min-h-screen flex-col items-center gap-8 pb-20"
        style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Change Password */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              🔐 {t.changePassword}
            </h2>

            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-body font-medium mb-2" style={{ color: 'var(--deep-teal)' }}>
                  {t.newPassword}
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-body"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(1, 49, 45, 0.2)',
                    color: 'var(--deep-teal)',
                    minHeight: '52px',
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-body font-medium mb-2" style={{ color: 'var(--deep-teal)' }}>
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-body"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(1, 49, 45, 0.2)',
                    color: 'var(--deep-teal)',
                    minHeight: '52px',
                  }}
                />
              </div>

              {/* Error/Success messages */}
              {passwordError && (
                <p className="text-sm" style={{ color: '#ff6a1a' }}>{passwordError}</p>
              )}
              {passwordStatus === 'success' && (
                <p className="text-sm" style={{ color: '#25D366' }}>{t.passwordUpdated}</p>
              )}

              {/* Update Button */}
              <button
                onClick={handleUpdatePassword}
                disabled={isUpdating || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{
                  backgroundColor: '#ff8f0a',
                  color: 'white',
                  minHeight: '52px',
                }}
              >
                {isUpdating ? t.updating : t.updatePassword}
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'rgba(255, 106, 26, 0.1)' }}
          >
            <h2 className="text-heading font-semibold mb-2" style={{ color: '#ff6a1a' }}>
              ⚠️ {t.deleteAccount}
            </h2>
            <p className="text-body mb-4" style={{ color: '#ff6a1a' }}>
              {t.deleteWarning}
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#ff6a1a',
                  color: 'white',
                  minHeight: '52px',
                }}
              >
                {t.deleteAccount}
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-body font-semibold" style={{ color: '#ff6a1a' }}>
                  {t.deleteConfirm}
                </p>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#ff6a1a' }}>
                    {t.typeDelete}
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-body"
                    style={{
                      backgroundColor: 'white',
                      border: '2px solid #ff6a1a',
                      color: 'var(--deep-teal)',
                      minHeight: '52px',
                    }}
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                    className="flex-1 px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--deep-teal)',
                      color: 'white',
                      minHeight: '52px',
                    }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    className="flex-1 px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{
                      backgroundColor: '#ff6a1a',
                      color: 'white',
                      minHeight: '52px',
                    }}
                  >
                    {isDeleting ? t.deleting : t.deleteButton}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--deep-teal)',
              color: 'white',
              minHeight: '52px',
              boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
            }}
          >
            {t.back}
          </button>
        </div>
      </div>
    </BackgroundPage>
  );
}
