"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";
import { createClient } from "@/lib/supabase/client";
import { getUserTier, canAddTeamMember, SUBSCRIPTION_LIMITS, type SubscriptionTier } from "@/lib/subscription";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  name: string;
  email: string;
  account_number: number;
}

interface TeamInvitation {
  id: string;
  email: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface TeamData {
  team: {
    id: string;
    name: string;
    subscription_plan: string;
    max_members: number;
    owner_id: string;
  };
  members: TeamMember[];
  invitations: TeamInvitation[];
  isOwner: boolean;
  currentUserRole: string;
}

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const { user, isAuthenticated, isLoading } = useAuth();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<SubscriptionTier>('demo');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const texts = {
    el: {
      title: "Η Ομάδα μου",
      back: "Πίσω",
      members: "Μέλη Ομάδας",
      owner: "Ιδιοκτήτης",
      member: "Μέλος",
      inviteMember: "Πρόσκληση Μέλους",
      pendingInvitations: "Εκκρεμείς Προσκλήσεις",
      noInvitations: "Δεν υπάρχουν εκκρεμείς προσκλήσεις",
      cancelInvitation: "Ακύρωση",
      removeMember: "Αφαίρεση",
      leaveTeam: "Αποχώρηση από την Ομάδα",
      email: "Email",
      send: "Αποστολή",
      cancel: "Ακύρωση",
      expires: "Λήγει",
      joined: "Εντάχθηκε",
      inviteSuccess: "Η πρόσκληση στάλθηκε επιτυχώς!",
      inviteError: "Σφάλμα κατά την αποστολή πρόσκλησης",
      memberLimit: "Έχετε φτάσει το όριο μελών για τον τρέχοντα plan",
      upgradeRequired: "Αναβαθμίστε για περισσότερα μέλη",
      upgrade: "Αναβάθμιση",
      confirmRemove: "Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτό το μέλος;",
      confirmLeave: "Είστε σίγουροι ότι θέλετε να αποχωρήσετε από την ομάδα;",
      planLimit: "Όριο μελών",
      current: "Τρέχον",
      maxAllowed: "Μέγιστο",
      unlimited: "Απεριόριστο",
      alreadyMember: "Ο χρήστης είναι ήδη μέλος",
      invitePending: "Υπάρχει ήδη πρόσκληση σε αυτό το email",
    },
    ru: {
      title: "Моя Команда",
      back: "Назад",
      members: "Члены Команды",
      owner: "Владелец",
      member: "Участник",
      inviteMember: "Пригласить Участника",
      pendingInvitations: "Ожидающие Приглашения",
      noInvitations: "Нет ожидающих приглашений",
      cancelInvitation: "Отмена",
      removeMember: "Удалить",
      leaveTeam: "Покинуть Команду",
      email: "Email",
      send: "Отправить",
      cancel: "Отмена",
      expires: "Истекает",
      joined: "Присоединился",
      inviteSuccess: "Приглашение успешно отправлено!",
      inviteError: "Ошибка при отправке приглашения",
      memberLimit: "Вы достигли лимита участников для текущего плана",
      upgradeRequired: "Обновите план для большего количества участников",
      upgrade: "Обновить",
      confirmRemove: "Вы уверены, что хотите удалить этого участника?",
      confirmLeave: "Вы уверены, что хотите покинуть команду?",
      planLimit: "Лимит участников",
      current: "Текущее",
      maxAllowed: "Максимум",
      unlimited: "Безлимит",
      alreadyMember: "Пользователь уже является участником",
      invitePending: "Приглашение на этот email уже отправлено",
    },
    en: {
      title: "My Team",
      back: "Back",
      members: "Team Members",
      owner: "Owner",
      member: "Member",
      inviteMember: "Invite Member",
      pendingInvitations: "Pending Invitations",
      noInvitations: "No pending invitations",
      cancelInvitation: "Cancel",
      removeMember: "Remove",
      leaveTeam: "Leave Team",
      email: "Email",
      send: "Send",
      cancel: "Cancel",
      expires: "Expires",
      joined: "Joined",
      inviteSuccess: "Invitation sent successfully!",
      inviteError: "Error sending invitation",
      memberLimit: "You have reached the member limit for your current plan",
      upgradeRequired: "Upgrade for more members",
      upgrade: "Upgrade",
      confirmRemove: "Are you sure you want to remove this member?",
      confirmLeave: "Are you sure you want to leave the team?",
      planLimit: "Member Limit",
      current: "Current",
      maxAllowed: "Maximum",
      unlimited: "Unlimited",
      alreadyMember: "User is already a member",
      invitePending: "Invitation already sent to this email",
    },
    uk: {
      title: "Моя Команда",
      back: "Назад",
      members: "Члени Команди",
      owner: "Власник",
      member: "Учасник",
      inviteMember: "Запросити Учасника",
      pendingInvitations: "Очікуючі Запрошення",
      noInvitations: "Немає очікуючих запрошень",
      cancelInvitation: "Скасувати",
      removeMember: "Видалити",
      leaveTeam: "Покинути Команду",
      email: "Email",
      send: "Надіслати",
      cancel: "Скасувати",
      expires: "Закінчується",
      joined: "Приєднався",
      inviteSuccess: "Запрошення успішно надіслано!",
      inviteError: "Помилка при надсиланні запрошення",
      memberLimit: "Ви досягли ліміту учасників для поточного плану",
      upgradeRequired: "Оновіть план для більшої кількості учасників",
      upgrade: "Оновити",
      confirmRemove: "Ви впевнені, що хочете видалити цього учасника?",
      confirmLeave: "Ви впевнені, що хочете покинути команду?",
      planLimit: "Ліміт учасників",
      current: "Поточне",
      maxAllowed: "Максимум",
      unlimited: "Безліміт",
      alreadyMember: "Користувач вже є учасником",
      invitePending: "Запрошення на цей email вже надіслано",
    },
    sq: {
      title: "Ekipi Im",
      back: "Prapa",
      members: "Anëtarët e Ekipit",
      owner: "Pronar",
      member: "Anëtar",
      inviteMember: "Fto Anëtar",
      pendingInvitations: "Ftesat në Pritje",
      noInvitations: "Nuk ka ftesa në pritje",
      cancelInvitation: "Anulo",
      removeMember: "Hiq",
      leaveTeam: "Largohu nga Ekipi",
      email: "Email",
      send: "Dërgo",
      cancel: "Anulo",
      expires: "Skadon",
      joined: "U Bashkua",
      inviteSuccess: "Ftesa u dërgua me sukses!",
      inviteError: "Gabim gjatë dërgimit të ftesës",
      memberLimit: "Keni arritur kufirin e anëtarëve për planin aktual",
      upgradeRequired: "Përmirësoni për më shumë anëtarë",
      upgrade: "Përmirëso",
      confirmRemove: "Jeni i sigurt që dëshironi të hiqni këtë anëtar?",
      confirmLeave: "Jeni i sigurt që dëshironi të largoheni nga ekipi?",
      planLimit: "Kufiri i Anëtarëve",
      current: "Aktual",
      maxAllowed: "Maksimum",
      unlimited: "Pa kufi",
      alreadyMember: "Përdoruesi është tashmë anëtar",
      invitePending: "Ftesa tashmë është dërguar në këtë email",
    },
    bg: {
      title: "Моят Екип",
      back: "Назад",
      members: "Членове на Екипа",
      owner: "Собственик",
      member: "Член",
      inviteMember: "Покани Член",
      pendingInvitations: "Чакащи Покани",
      noInvitations: "Няма чакащи покани",
      cancelInvitation: "Отмени",
      removeMember: "Премахни",
      leaveTeam: "Напусни Екипа",
      email: "Email",
      send: "Изпрати",
      cancel: "Отмени",
      expires: "Изтича",
      joined: "Присъедини се",
      inviteSuccess: "Поканата беше изпратена успешно!",
      inviteError: "Грешка при изпращане на поканата",
      memberLimit: "Достигнахте лимита на членовете за текущия план",
      upgradeRequired: "Надградете за повече членове",
      upgrade: "Надгради",
      confirmRemove: "Сигурни ли сте, че искате да премахнете този член?",
      confirmLeave: "Сигурни ли сте, че искате да напуснете екипа?",
      planLimit: "Лимит на Членове",
      current: "Текущ",
      maxAllowed: "Максимум",
      unlimited: "Неограничено",
      alreadyMember: "Потребителят вече е член",
      invitePending: "Покана вече е изпратена на този email",
    },
    ro: {
      title: "Echipa Mea",
      back: "Înapoi",
      members: "Membrii Echipei",
      owner: "Proprietar",
      member: "Membru",
      inviteMember: "Invită Membru",
      pendingInvitations: "Invitații în Așteptare",
      noInvitations: "Nu există invitații în așteptare",
      cancelInvitation: "Anulează",
      removeMember: "Elimină",
      leaveTeam: "Părăsește Echipa",
      email: "Email",
      send: "Trimite",
      cancel: "Anulează",
      expires: "Expiră",
      joined: "S-a Alăturat",
      inviteSuccess: "Invitația a fost trimisă cu succes!",
      inviteError: "Eroare la trimiterea invitației",
      memberLimit: "Ați atins limita de membri pentru planul actual",
      upgradeRequired: "Actualizați pentru mai mulți membri",
      upgrade: "Actualizați",
      confirmRemove: "Sunteți sigur că doriți să eliminați acest membru?",
      confirmLeave: "Sunteți sigur că doriți să părăsiți echipa?",
      planLimit: "Limită Membri",
      current: "Curent",
      maxAllowed: "Maxim",
      unlimited: "Nelimitat",
      alreadyMember: "Utilizatorul este deja membru",
      invitePending: "Invitația a fost deja trimisă la acest email",
    },
    ar: {
      title: "فريقي",
      back: "رجوع",
      members: "أعضاء الفريق",
      owner: "المالك",
      member: "عضو",
      inviteMember: "دعوة عضو",
      pendingInvitations: "الدعوات المعلقة",
      noInvitations: "لا توجد دعوات معلقة",
      cancelInvitation: "إلغاء",
      removeMember: "إزالة",
      leaveTeam: "مغادرة الفريق",
      email: "البريد الإلكتروني",
      send: "إرسال",
      cancel: "إلغاء",
      expires: "ينتهي",
      joined: "انضم",
      inviteSuccess: "تم إرسال الدعوة بنجاح!",
      inviteError: "خطأ في إرسال الدعوة",
      memberLimit: "لقد وصلت إلى الحد الأقصى للأعضاء في خطتك الحالية",
      upgradeRequired: "قم بالترقية لمزيد من الأعضاء",
      upgrade: "ترقية",
      confirmRemove: "هل أنت متأكد أنك تريد إزالة هذا العضو؟",
      confirmLeave: "هل أنت متأكد أنك تريد مغادرة الفريق؟",
      planLimit: "حد الأعضاء",
      current: "الحالي",
      maxAllowed: "الحد الأقصى",
      unlimited: "غير محدود",
      alreadyMember: "المستخدم عضو بالفعل",
      invitePending: "تم إرسال دعوة بالفعل إلى هذا البريد الإلكتروني",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  // Check user subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createClient();
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_tier, account_purchased, demo_expires_at, subscription_expires_at, vip_expires_at')
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, locale, router]);

  // Fetch team data
  useEffect(() => {
    async function fetchTeamData() {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/team');
        if (response.ok) {
          const data = await response.json();
          setTeamData(data);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchTeamData();
    }
  }, [user?.id]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.toLowerCase(), locale }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteSuccess(t.inviteSuccess);
        setInviteEmail('');
        setShowInviteModal(false);
        // Refresh team data
        const teamResponse = await fetch('/api/team');
        if (teamResponse.ok) {
          setTeamData(await teamResponse.json());
        }
      } else {
        if (data.error === 'User is already a team member') {
          setInviteError(t.alreadyMember);
        } else if (data.error === 'Invitation already sent to this email') {
          setInviteError(t.invitePending);
        } else {
          setInviteError(data.error || t.inviteError);
        }
      }
    } catch (error) {
      setInviteError(t.inviteError);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/team/invite?id=${invitationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh team data
        const teamResponse = await fetch('/api/team');
        if (teamResponse.ok) {
          setTeamData(await teamResponse.json());
        }
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(t.confirmRemove)) return;

    try {
      const response = await fetch(`/api/team/members?id=${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh team data
        const teamResponse = await fetch('/api/team');
        if (teamResponse.ok) {
          setTeamData(await teamResponse.json());
        }
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm(t.confirmLeave)) return;

    const myMembership = teamData?.members.find(m => m.user_id === user?.id);
    if (!myMembership) return;

    try {
      const response = await fetch(`/api/team/members?id=${myMembership.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Redirect to dashboard after leaving
        router.push(`/${locale}/dashboard`);
      }
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const limits = SUBSCRIPTION_LIMITS[userTier];
  const canInvite = canAddTeamMember(userTier, teamData?.members.length || 0);

  return (
    <BackgroundPage pageIndex={8}>
      <div className="flex min-h-screen flex-col items-center" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back */}
          <p
            onClick={() => router.push(`/${locale}/dashboard`)}
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

          {/* Plan Limit Info */}
          <p className="text-slogan font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t.planLimit}:{' '}
            <span style={{ color: '#ff8f0a' }}>
              {limits.maxUsers === -1 ? t.unlimited : `${teamData?.members.length || 0} / ${limits.maxUsers}`}
            </span>
          </p>

          {/* Invite Success Message */}
          {inviteSuccess && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#10b981', color: 'white' }}>
              <p className="text-button text-center">{inviteSuccess}</p>
            </div>
          )}

          {/* Members Section */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            {t.members}
          </p>

          <div className="flex flex-col gap-4">
            {teamData?.members.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'var(--zanah)' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-button font-semibold" style={{ color: 'var(--deep-teal)' }}>
                      {member.name}
                    </p>
                    <p className="text-small mt-1" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                      {member.email}
                    </p>
                    <p className="text-small mt-1" style={{ color: member.role === 'owner' ? 'var(--orange)' : 'var(--deep-teal)' }}>
                      {member.role === 'owner' ? t.owner : t.member}
                    </p>
                    <p className="text-small mt-1" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                      {t.joined}: {new Date(member.joined_at).toLocaleDateString(locale)}
                    </p>
                  </div>

                  {/* Remove button (only for owner, not for themselves) */}
                  {teamData.isOwner && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-1 rounded-lg text-small"
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      {t.removeMember}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Leave Team button (only for members, not owner) */}
          {teamData && !teamData.isOwner && (
            <button
              onClick={handleLeaveTeam}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'transparent',
                border: '2px solid #ef4444',
                color: '#ef4444',
              }}
            >
              {t.leaveTeam}
            </button>
          )}

          {/* Invite Member Button (show for owner OR when no team exists yet) */}
          {(teamData?.isOwner || !teamData) && (
            <>
              {canInvite.allowed ? (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-universal w-full text-button"
                  style={{
                    minHeight: '52px',
                    backgroundColor: 'var(--orange)',
                    color: 'var(--deep-teal)',
                  }}
                >
                  + {t.inviteMember}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-button text-center" style={{ color: 'var(--orange)' }}>
                    {t.memberLimit}
                  </p>
                  <button
                    onClick={() => router.push(`/${locale}/pricing`)}
                    className="btn-universal w-full text-button"
                    style={{
                      minHeight: '52px',
                      backgroundColor: 'var(--orange)',
                      color: 'var(--deep-teal)',
                    }}
                  >
                    {t.upgrade}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Pending Invitations (only for owner) */}
          {teamData?.isOwner && (
            <>
              <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
                {t.pendingInvitations}
              </p>

              {teamData.invitations.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {teamData.invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: 'var(--zanah)' }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-button" style={{ color: 'var(--deep-teal)' }}>
                            {invitation.email}
                          </p>
                          <p className="text-small mt-1" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                            {t.expires}: {new Date(invitation.expires_at).toLocaleDateString(locale)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="px-3 py-1 rounded-lg text-small"
                          style={{ backgroundColor: '#6b7280', color: 'white' }}
                        >
                          {t.cancelInvitation}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-button text-center" style={{ color: 'var(--zanah)', opacity: 0.7 }}>
                  {t.noInvitations}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm mx-4"
            style={{ backgroundColor: 'var(--zanah)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-heading font-semibold text-center mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.inviteMember}
            </h2>

            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t.email}
              className="w-full rounded-2xl text-button mb-4"
              style={{
                minHeight: '52px',
                padding: '12px',
                backgroundColor: 'white',
                color: 'var(--deep-teal)',
                border: inviteError ? '2px solid #ef4444' : '2px solid var(--deep-teal)',
              }}
            />

            {inviteError && (
              <p className="text-small mb-4" style={{ color: '#ef4444' }}>
                {inviteError}
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 rounded-2xl text-button font-semibold"
                style={{
                  minHeight: '52px',
                  backgroundColor: 'transparent',
                  border: '2px solid var(--deep-teal)',
                  color: 'var(--deep-teal)',
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleInvite}
                disabled={inviteLoading || !inviteEmail.trim()}
                className="flex-1 rounded-2xl text-button font-semibold"
                style={{
                  minHeight: '52px',
                  backgroundColor: 'var(--orange)',
                  color: 'var(--deep-teal)',
                  opacity: inviteLoading || !inviteEmail.trim() ? 0.5 : 1,
                }}
              >
                {inviteLoading ? '...' : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </BackgroundPage>
  );
}
