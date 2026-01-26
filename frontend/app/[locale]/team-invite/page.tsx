"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

interface InvitationDetails {
  id: string;
  email: string;
  status: string;
  expires_at: string;
  team_name: string;
  team_plan: string;
  inviter_name: string;
  inviter_email: string;
}

export default function TeamInvitePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || "el";
  const token = searchParams.get('token');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const texts = {
    el: {
      title: "Πρόσκληση στην Ομάδα",
      invitedBy: "Σας προσκάλεσε ο/η",
      toJoin: "να συμμετάσχετε στην ομάδα",
      expires: "Η πρόσκληση λήγει",
      accept: "Αποδοχή Πρόσκλησης",
      decline: "Απόρριψη",
      success: "Επιτυχής εγγραφή στην ομάδα!",
      goToDashboard: "Μετάβαση στο Dashboard",
      invalidToken: "Μη έγκυρο ή ληγμένο token πρόσκλησης",
      expired: "Αυτή η πρόσκληση έχει λήξει",
      alreadyUsed: "Αυτή η πρόσκληση έχει ήδη χρησιμοποιηθεί",
      loginRequired: "Πρέπει να συνδεθείτε για να αποδεχτείτε την πρόσκληση",
      login: "Σύνδεση",
      register: "Εγγραφή",
      emailMismatch: "Αυτή η πρόσκληση στάλθηκε σε διαφορετικό email",
      invitedEmail: "Προσκλήθηκε",
      yourEmail: "Το email σας",
      ownerError: "Είστε ιδιοκτήτης άλλης ομάδας. Δεν μπορείτε να συμμετάσχετε σε άλλη ομάδα.",
      error: "Σφάλμα κατά την αποδοχή της πρόσκλησης",
    },
    ru: {
      title: "Приглашение в Команду",
      invitedBy: "Вас пригласил(а)",
      toJoin: "присоединиться к команде",
      expires: "Приглашение действует до",
      accept: "Принять Приглашение",
      decline: "Отклонить",
      success: "Вы успешно присоединились к команде!",
      goToDashboard: "Перейти в Dashboard",
      invalidToken: "Недействительный или истекший токен приглашения",
      expired: "Это приглашение истекло",
      alreadyUsed: "Это приглашение уже использовано",
      loginRequired: "Вы должны войти, чтобы принять приглашение",
      login: "Войти",
      register: "Регистрация",
      emailMismatch: "Это приглашение было отправлено на другой email",
      invitedEmail: "Приглашено",
      yourEmail: "Ваш email",
      ownerError: "Вы владелец другой команды. Вы не можете присоединиться к другой команде.",
      error: "Ошибка при принятии приглашения",
    },
    en: {
      title: "Team Invitation",
      invitedBy: "You've been invited by",
      toJoin: "to join the team",
      expires: "Invitation expires",
      accept: "Accept Invitation",
      decline: "Decline",
      success: "Successfully joined the team!",
      goToDashboard: "Go to Dashboard",
      invalidToken: "Invalid or expired invitation token",
      expired: "This invitation has expired",
      alreadyUsed: "This invitation has already been used",
      loginRequired: "You must log in to accept this invitation",
      login: "Log in",
      register: "Register",
      emailMismatch: "This invitation was sent to a different email",
      invitedEmail: "Invited",
      yourEmail: "Your email",
      ownerError: "You are an owner of another team. You cannot join another team.",
      error: "Error accepting invitation",
    },
    uk: {
      title: "Запрошення до Команди",
      invitedBy: "Вас запросив(ла)",
      toJoin: "приєднатися до команди",
      expires: "Запрошення дійсне до",
      accept: "Прийняти Запрошення",
      decline: "Відхилити",
      success: "Ви успішно приєдналися до команди!",
      goToDashboard: "Перейти до Dashboard",
      invalidToken: "Недійсний або прострочений токен запрошення",
      expired: "Це запрошення закінчилося",
      alreadyUsed: "Це запрошення вже використано",
      loginRequired: "Ви повинні увійти, щоб прийняти запрошення",
      login: "Увійти",
      register: "Реєстрація",
      emailMismatch: "Це запрошення було надіслано на інший email",
      invitedEmail: "Запрошено",
      yourEmail: "Ваш email",
      ownerError: "Ви власник іншої команди. Ви не можете приєднатися до іншої команди.",
      error: "Помилка при прийнятті запрошення",
    },
    sq: {
      title: "Ftesë për Ekipin",
      invitedBy: "Jeni ftuar nga",
      toJoin: "për t'u bashkuar në ekipin",
      expires: "Ftesa skadon",
      accept: "Prano Ftesën",
      decline: "Refuzo",
      success: "U bashkuat me sukses në ekip!",
      goToDashboard: "Shko në Dashboard",
      invalidToken: "Token ftese i pavlefshëm ose i skaduar",
      expired: "Kjo ftesë ka skaduar",
      alreadyUsed: "Kjo ftesë tashmë është përdorur",
      loginRequired: "Duhet të identifikoheni për të pranuar ftesën",
      login: "Identifikohu",
      register: "Regjistrohu",
      emailMismatch: "Kjo ftesë u dërgua në një email tjetër",
      invitedEmail: "Ftuar",
      yourEmail: "Email-i juaj",
      ownerError: "Ju jeni pronar i një ekipi tjetër. Nuk mund të bashkoheni me një ekip tjetër.",
      error: "Gabim gjatë pranimit të ftesës",
    },
    bg: {
      title: "Покана за Екип",
      invitedBy: "Поканен сте от",
      toJoin: "да се присъедините към екип",
      expires: "Поканата изтича",
      accept: "Приеми Поканата",
      decline: "Отхвърли",
      success: "Успешно се присъединихте към екипа!",
      goToDashboard: "Към Dashboard",
      invalidToken: "Невалиден или изтекъл токен за покана",
      expired: "Тази покана е изтекла",
      alreadyUsed: "Тази покана вече е използвана",
      loginRequired: "Трябва да влезете, за да приемете поканата",
      login: "Вход",
      register: "Регистрация",
      emailMismatch: "Тази покана беше изпратена на друг email",
      invitedEmail: "Поканен",
      yourEmail: "Вашият email",
      ownerError: "Вие сте собственик на друг екип. Не можете да се присъедините към друг екип.",
      error: "Грешка при приемане на поканата",
    },
    ro: {
      title: "Invitație pentru Echipă",
      invitedBy: "Ați fost invitat de",
      toJoin: "să vă alăturați echipei",
      expires: "Invitația expiră",
      accept: "Acceptă Invitația",
      decline: "Refuză",
      success: "V-ați alăturat echipei cu succes!",
      goToDashboard: "Mergi la Dashboard",
      invalidToken: "Token de invitație invalid sau expirat",
      expired: "Această invitație a expirat",
      alreadyUsed: "Această invitație a fost deja folosită",
      loginRequired: "Trebuie să vă autentificați pentru a accepta invitația",
      login: "Autentificare",
      register: "Înregistrare",
      emailMismatch: "Această invitație a fost trimisă la un alt email",
      invitedEmail: "Invitat",
      yourEmail: "Email-ul dvs.",
      ownerError: "Sunteți proprietarul altei echipe. Nu vă puteți alătura altei echipe.",
      error: "Eroare la acceptarea invitației",
    },
    ar: {
      title: "دعوة للفريق",
      invitedBy: "تمت دعوتك من قبل",
      toJoin: "للانضمام إلى الفريق",
      expires: "تنتهي الدعوة",
      accept: "قبول الدعوة",
      decline: "رفض",
      success: "تم الانضمام إلى الفريق بنجاح!",
      goToDashboard: "الذهاب إلى لوحة التحكم",
      invalidToken: "رمز دعوة غير صالح أو منتهي الصلاحية",
      expired: "انتهت صلاحية هذه الدعوة",
      alreadyUsed: "تم استخدام هذه الدعوة بالفعل",
      loginRequired: "يجب عليك تسجيل الدخول لقبول الدعوة",
      login: "تسجيل الدخول",
      register: "التسجيل",
      emailMismatch: "تم إرسال هذه الدعوة إلى بريد إلكتروني مختلف",
      invitedEmail: "مدعو",
      yourEmail: "بريدك الإلكتروني",
      ownerError: "أنت مالك فريق آخر. لا يمكنك الانضمام إلى فريق آخر.",
      error: "خطأ في قبول الدعوة",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError(t.invalidToken);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/team/accept?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          const inv = data.invitation;
          if (inv.status === 'expired') {
            setError(t.expired);
          } else if (inv.status === 'accepted') {
            setError(t.alreadyUsed);
          } else {
            setInvitation(inv);
          }
        } else {
          setError(t.invalidToken);
        }
      } catch (err) {
        setError(t.invalidToken);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token, t.invalidToken, t.expired, t.alreadyUsed]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    setError('');

    try {
      const response = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        if (data.error?.includes('owner')) {
          setError(t.ownerError);
        } else if (data.error?.includes('different email')) {
          setError(`${t.emailMismatch}: ${data.invitedEmail}`);
        } else {
          setError(data.error || t.error);
        }
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setAccepting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="flex min-h-screen flex-col items-center justify-center" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full max-w-sm flex flex-col gap-8 items-center">
            <div className="text-6xl">✅</div>
            <h1 className="text-slogan font-bold text-center" style={{ color: '#10b981' }}>
              {t.success}
            </h1>
            <button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'var(--orange)',
                color: 'var(--deep-teal)',
              }}
            >
              {t.goToDashboard}
            </button>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // Error state (invalid token, expired, etc.)
  if (error && !invitation) {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="flex min-h-screen flex-col items-center justify-center" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full max-w-sm flex flex-col gap-8 items-center">
            <div className="text-6xl">❌</div>
            <h1 className="text-heading font-bold text-center" style={{ color: '#ef4444' }}>
              {error}
            </h1>
            <button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'transparent',
                border: '2px solid var(--polar)',
                color: 'var(--polar)',
              }}
            >
              {t.goToDashboard}
            </button>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <BackgroundPage pageIndex={4}>
        <div className="flex min-h-screen flex-col items-center justify-center" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full max-w-sm flex flex-col gap-8 items-center">
            <h1 className="text-slogan font-bold text-center" style={{ color: '#ff8f0a' }}>
              {t.title}
            </h1>

            {invitation && (
              <div className="rounded-2xl p-6 w-full" style={{ backgroundColor: 'var(--zanah)' }}>
                <p className="text-button text-center" style={{ color: 'var(--deep-teal)' }}>
                  {t.invitedBy} <strong>{invitation.inviter_name}</strong>
                </p>
                <p className="text-button text-center mt-2" style={{ color: 'var(--deep-teal)' }}>
                  {t.toJoin}: <strong style={{ color: 'var(--orange)' }}>{invitation.team_name}</strong>
                </p>
              </div>
            )}

            <p className="text-button text-center" style={{ color: 'var(--polar)' }}>
              {t.loginRequired}
            </p>

            <button
              onClick={() => router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/team-invite?token=${token}`)}`)}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'var(--orange)',
                color: 'var(--deep-teal)',
              }}
            >
              {t.login}
            </button>

            <button
              onClick={() => router.push(`/${locale}/register?redirect=${encodeURIComponent(`/${locale}/team-invite?token=${token}`)}`)}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'transparent',
                border: '2px solid var(--polar)',
                color: 'var(--polar)',
              }}
            >
              {t.register}
            </button>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // Authenticated - show invitation details and accept button
  return (
    <BackgroundPage pageIndex={4}>
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="w-full max-w-sm flex flex-col gap-8 items-center">
          <h1 className="text-slogan font-bold text-center" style={{ color: '#ff8f0a' }}>
            {t.title}
          </h1>

          {invitation && (
            <div className="rounded-2xl p-6 w-full" style={{ backgroundColor: 'var(--zanah)' }}>
              <p className="text-button text-center" style={{ color: 'var(--deep-teal)' }}>
                {t.invitedBy}
              </p>
              <p className="text-heading text-center font-semibold mt-2" style={{ color: 'var(--orange)' }}>
                {invitation.inviter_name}
              </p>
              <p className="text-button text-center mt-4" style={{ color: 'var(--deep-teal)' }}>
                {t.toJoin}
              </p>
              <p className="text-heading text-center font-semibold mt-2" style={{ color: 'var(--orange)' }}>
                {invitation.team_name}
              </p>
              <p className="text-small text-center mt-4" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                {t.expires}: {new Date(invitation.expires_at).toLocaleDateString(locale)}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl p-4 w-full" style={{ backgroundColor: '#fee2e2' }}>
              <p className="text-button text-center" style={{ color: '#ef4444' }}>
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={accepting}
            className="btn-universal w-full text-button"
            style={{
              minHeight: '52px',
              backgroundColor: 'var(--orange)',
              color: 'var(--deep-teal)',
              opacity: accepting ? 0.5 : 1,
            }}
          >
            {accepting ? '...' : t.accept}
          </button>

          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="btn-universal w-full text-button"
            style={{
              minHeight: '52px',
              backgroundColor: 'transparent',
              border: '2px solid var(--polar)',
              color: 'var(--polar)',
            }}
          >
            {t.decline}
          </button>
        </div>
      </div>
    </BackgroundPage>
  );
}
