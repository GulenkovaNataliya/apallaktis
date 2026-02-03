"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface UserProfile {
  id: string;
  account_number: number;
  name: string;
  email: string | null;
  phone: string | null;
  subscription_status: string;
  subscription_plan: string | null;
  doc_type: string | null;
  afm: string | null;
  doy: string | null;
  company_name: string | null;
  company_activity: string | null;
  company_address: string | null;
  created_at: string;
  subscription_expires_at: string | null;
  vip_expires_at: string | null;
  vip_granted_by: string | null;
  vip_reason: string | null;
  referral_code: string | null;
  referred_by: string | null;
  bonus_months: number | null;
  role: string;
  contact_consent: boolean;
}

interface ReferralStat {
  user: UserProfile;
  invited: number;
  purchased: number;
}

interface Payment {
  id: string;
  user_id: string;
  stripe_event_id: string;
  paid_at: string;
  amount: number;
  currency: string;
  type: string;
  plan: string | null;
  invoice_created: boolean;
  invoice_sent: boolean;
  created_at: string;
  // Joined from profiles
  profiles: {
    name: string;
    email: string | null;
    doc_type: string | null;
    afm: string | null;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);

  // Section open states
  const [usersOpen, setUsersOpen] = useState(true);
  const [referralsOpen, setReferralsOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  // Payments filters
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentSentFilter, setPaymentSentFilter] = useState("all"); // all | sent | not_sent

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userPlanFilter, setUserPlanFilter] = useState("all");
  const [userDocFilter, setUserDocFilter] = useState("all");

  // Quick filters
  const [quickTimeFilter, setQuickTimeFilter] = useState<"none" | "24h" | "7d">("none");
  const [onlyDemo, setOnlyDemo] = useState(false);
  const [onlyConsent, setOnlyConsent] = useState(false);

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    doc_type: "ΑΠΟΔΕΙΞΗ",
    subscription_status: "demo",
    subscription_plan: "",
    afm: "",
    doy: "",
    company_name: "",
    company_activity: "",
    company_address: "",
  });

  // VIP form
  const [vipForm, setVipForm] = useState({
    email: "",
    duration: "forever",
    customDate: "",
    reason: "",
  });

  // Load data
  useEffect(() => {
    const supabase = createClient();

    async function checkAdminAndLoad() {
      // Check admin session flag
      const adminLoggedIn = sessionStorage.getItem("adminLoggedIn");
      if (adminLoggedIn !== "true") {
        router.push("/admin/login");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        sessionStorage.removeItem("adminLoggedIn");
        router.push("/admin/login");
        return;
      }

      // Check admin role via RPC (bypasses RLS)
      const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

      if (rpcError) {
        console.error("RPC is_admin error:", rpcError);
        sessionStorage.removeItem("adminLoggedIn");
        router.push("/admin/login");
        return;
      }

      if (isAdmin !== true) {
        sessionStorage.removeItem("adminLoggedIn");
        router.push("/admin/login");
        return;
      }

      setAdminId(user.id);

      // Load all users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersData) {
        setUsers(usersData);
      }

      // Load payments with profile info (FK join)
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(`
          *,
          profiles!payments_user_id_fkey (name, email, doc_type, afm)
        `)
        .order("paid_at", { ascending: false });

      if (paymentsData) {
        setPayments(paymentsData as Payment[]);
      }

      setIsLoading(false);
    }

    checkAdminAndLoad();
  }, [router]);

  // Stats calculations
  const now = new Date();
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const cutoff7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    total: users.length,
    active: users.filter(u => u.subscription_status === "active").length,
    readonly: users.filter(u => u.subscription_status === "read-only").length,
    demo: users.filter(u => u.subscription_status === "demo").length,
    basic: users.filter(u => u.subscription_plan === "Basic").length,
    standard: users.filter(u => u.subscription_plan === "Standard").length,
    premium: users.filter(u => u.subscription_plan === "Premium").length,
    vip: users.filter(u => u.subscription_status === "vip").length,
    referrals: users.filter(u => u.referred_by).length,
    revenue: 0,
    // Quick filter counts
    new24h: users.filter(u => u.created_at && new Date(u.created_at) >= cutoff24h).length,
    new7d: users.filter(u => u.created_at && new Date(u.created_at) >= cutoff7d).length,
    consent: users.filter(u => u.contact_consent === true).length,
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchSearch = userSearch === "" ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.afm?.includes(userSearch);
    const matchStatus = userStatusFilter === "all" || u.subscription_status === userStatusFilter;
    const matchPlan = userPlanFilter === "all" || u.subscription_plan === userPlanFilter;
    const matchDoc = userDocFilter === "all" || u.doc_type === userDocFilter;

    // Quick time filter (New 24h / New 7d)
    let matchTime = true;
    if (quickTimeFilter !== "none" && u.created_at) {
      const createdAt = new Date(u.created_at);
      const now = new Date();
      const hoursAgo = quickTimeFilter === "24h" ? 24 : 7 * 24;
      const cutoff = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      matchTime = createdAt >= cutoff;
    }

    // Only demo filter
    const matchDemo = !onlyDemo || u.subscription_status === "demo";

    // Only consent filter
    const matchConsent = !onlyConsent || u.contact_consent === true;

    return matchSearch && matchStatus && matchPlan && matchDoc && matchTime && matchDemo && matchConsent;
  });

  // VIP users
  const vipUsers = users.filter(u => u.subscription_status === "vip");

  // Referrals stats
  const referralStats: ReferralStat[] = [];
  const referrerMap = new Map<string, ReferralStat>();
  users.forEach(u => {
    if (u.referred_by) {
      const referrer = users.find(r => r.referral_code === u.referred_by);
      if (referrer) {
        if (!referrerMap.has(referrer.id)) {
          referrerMap.set(referrer.id, { user: referrer, invited: 0, purchased: 0 });
        }
        const stat = referrerMap.get(referrer.id)!;
        stat.invited++;
        if (u.subscription_status !== "demo") {
          stat.purchased++;
        }
      }
    }
  });
  referrerMap.forEach(stat => referralStats.push(stat));
  referralStats.sort((a, b) => b.invited - a.invited);

  // View user
  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  // Edit user
  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      doc_type: user.doc_type || "ΑΠΟΔΕΙΞΗ",
      subscription_status: user.subscription_status || "demo",
      subscription_plan: user.subscription_plan || "",
      afm: user.afm || "",
      doy: user.doy || "",
      company_name: user.company_name || "",
      company_activity: user.company_activity || "",
      company_address: user.company_address || "",
    });
    setEditModalOpen(true);
  };

  // Save user edit
  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        doc_type: editForm.doc_type,
        subscription_status: editForm.subscription_status,
        subscription_plan: editForm.subscription_plan || null,
        afm: editForm.afm || null,
        doy: editForm.doy || null,
        company_name: editForm.company_name || null,
        company_activity: editForm.company_activity || null,
        company_address: editForm.company_address || null,
      })
      .eq("id", selectedUser.id);

    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }

    setUsers(users.map(u => u.id === selectedUser.id ? {
      ...u,
      ...editForm,
      subscription_plan: editForm.subscription_plan || null,
    } : u));

    setEditModalOpen(false);
    alert("Сохранено!");
  };

  // Quick VIP
  const handleQuickVip = (user: UserProfile) => {
    setVipForm({
      email: user.email || "",
      duration: "forever",
      customDate: "",
      reason: "",
    });
    setVipModalOpen(true);
  };

  // Open VIP modal
  const handleOpenVipModal = () => {
    setVipForm({
      email: "",
      duration: "forever",
      customDate: "",
      reason: "",
    });
    setVipModalOpen(true);
  };

  // Activate VIP
  const handleActivateVip = async () => {
    if (!vipForm.email.trim()) {
      alert("Введите email!");
      return;
    }

    const user = users.find(u => u.email?.toLowerCase() === vipForm.email.toLowerCase());
    if (!user) {
      alert("Пользователь не найден!");
      return;
    }

    let expiresAt: string;
    if (vipForm.duration === "forever") {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 100);
      expiresAt = d.toISOString();
    } else if (vipForm.duration === "custom") {
      if (!vipForm.customDate) {
        alert("Укажите дату!");
        return;
      }
      expiresAt = new Date(vipForm.customDate).toISOString();
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() + parseInt(vipForm.duration));
      expiresAt = d.toISOString();
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "vip",
        subscription_plan: "VIP",
        vip_expires_at: expiresAt,
        vip_granted_by: adminId,
        vip_reason: vipForm.reason || null,
      })
      .eq("id", user.id);

    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }

    try {
      await fetch("/api/email/vip-activated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          expiresAt,
          reason: vipForm.reason || undefined,
          locale: "el",
        }),
      });
    } catch (e) {
      console.error("Email error:", e);
    }

    setUsers(users.map(u => u.id === user.id ? {
      ...u,
      subscription_status: "vip",
      subscription_plan: "VIP",
      vip_expires_at: expiresAt,
      vip_granted_by: adminId,
      vip_reason: vipForm.reason || null,
    } : u));

    setVipModalOpen(false);
    alert(`VIP активирован для ${user.name}!`);
  };

  // Remove VIP
  const handleRemoveVip = async (user: UserProfile) => {
    if (!confirm(`Убрать VIP у ${user.name}?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_plan: null,
        vip_expires_at: null,
        vip_granted_by: null,
        vip_reason: null,
      })
      .eq("id", user.id);

    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }

    setUsers(users.map(u => u.id === user.id ? {
      ...u,
      subscription_status: "active",
      subscription_plan: null,
      vip_expires_at: null,
      vip_granted_by: null,
      vip_reason: null,
    } : u));

    alert("VIP убран");
  };

  // Export to Excel
  const exportToExcel = async (data: Record<string, unknown>[], filename: string) => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportUsers = () => {
    const data = filteredUsers.map(u => ({
      ID: u.account_number,
      Name: u.name,
      Email: u.email,
      Phone: u.phone,
      Document: u.doc_type,
      AFM: u.afm,
      Company: u.company_name,
      subscription_status: u.subscription_status,
      subscription_plan: u.subscription_plan || "DEMO",
      Consent: u.contact_consent ? "Yes" : "No",
      Created: u.created_at?.split("T")[0],
      vip_expires_at: u.vip_expires_at || "",
      vip_granted_by: u.vip_granted_by || "",
      vip_reason: u.vip_reason || "",
    }));
    exportToExcel(data, "APALLAKTIS_Users");
  };

  const exportReferrals = () => {
    const data = referralStats.map(r => ({
      Name: r.user.name,
      Email: r.user.email,
      Invited: r.invited,
      Purchased: r.purchased,
    }));
    exportToExcel(data, "APALLAKTIS_Referrals");
  };

  const exportVip = () => {
    const data = vipUsers.map(u => ({
      Name: u.name,
      Email: u.email,
      "VIP since": u.created_at?.split("T")[0],
      vip_expires_at: u.vip_expires_at || "",
      vip_granted_by: u.vip_granted_by || "",
      vip_reason: u.vip_reason || "",
    }));
    exportToExcel(data, "APALLAKTIS_VIP");
  };

  // Filter payments (null-safe)
  const filteredPayments = payments.filter(p => {
    const name = (p.profiles?.name ?? "").toLowerCase();
    const email = (p.profiles?.email ?? "").toLowerCase();
    const searchTerm = paymentSearch.toLowerCase();
    const matchSearch = paymentSearch === "" ||
      name.includes(searchTerm) ||
      email.includes(searchTerm);
    const matchSent = paymentSentFilter === "all" ||
      (paymentSentFilter === "sent" && p.invoice_sent) ||
      (paymentSentFilter === "not_sent" && !p.invoice_sent);
    return matchSearch && matchSent;
  });

  // Update payment invoice status
  const handleUpdatePaymentInvoice = async (paymentId: string, field: "invoice_created" | "invoice_sent", value: boolean) => {
    // Guard: can't set invoice_sent=true if invoice_created=false
    if (field === "invoice_sent" && value === true) {
      const payment = payments.find(p => p.id === paymentId);
      if (payment && !payment.invoice_created) {
        alert("Сначала создайте τιμολόγιο (invoice_created)");
        return;
      }
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("payments")
      .update({ [field]: value })
      .eq("id", paymentId);

    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }

    setPayments(payments.map(p => p.id === paymentId ? { ...p, [field]: value } : p));
  };

  const exportPayments = () => {
    const data = filteredPayments.map(p => ({
      "Дата оплаты": p.paid_at?.split("T")[0],
      "Имя": p.profiles?.name || "",
      "Email": p.profiles?.email || "",
      "Сумма": p.amount,
      "Валюта": p.currency,
      "Тип": p.type,
      "План": p.plan || "—",
      "Создан (myDATA)": p.invoice_created ? "Да" : "Нет",
      "Отправлен": p.invoice_sent ? "Да" : "Нет",
      "Документ": p.profiles?.doc_type || "",
      "ΑΦΜ": p.profiles?.afm || "",
    }));
    exportToExcel(data, "APALLAKTIS_Payments");
  };

  // Logout
  const handleLogout = async () => {
    if (!confirm("Выйти?")) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

  // Badge styles
  const getBadgeStyle = (type: string): React.CSSProperties => {
    switch (type) {
      case "vip": return { background: "linear-gradient(135deg,#f5af19,#f12711)", color: "#fff" };
      case "active": return { background: "#d4edda", color: "#155724" };
      case "demo": return { background: "#e2e3f3", color: "#383d8b" };
      case "expired": return { background: "#f8d7da", color: "#721c24" };
      case "read-only": return { background: "#fff3cd", color: "#856404" };
      case "basic": return { background: "#e9ecef", color: "#495057" };
      case "standard": return { background: "#cce5ff", color: "#004085" };
      case "premium": return { background: "#d4edda", color: "#155724" };
      case "ΤΙΜΟΛΟΓΙΟ": return { background: "#e3f2fd", color: "#1565c0" };
      case "ΑΠΟΔΕΙΞΗ": return { background: "#fff3e0", color: "#e65100" };
      default: return { background: "#e9ecef", color: "#495057" };
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: "#fff", color: "#1a1a2e", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        background: "#1a1a2e",
        padding: "15px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Image
          src="/Apallaktis.photos/apallaktis-logo-orange@2x.png"
          alt="APALLAKTIS"
          width={180}
          height={45}
          style={{ height: "45px", width: "auto" }}
        />
        <button
          onClick={handleLogout}
          style={{
            background: "#e74c3c",
            border: "none",
            color: "#fff",
            padding: "10px 25px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Выход
        </button>
      </header>

      <div style={{ maxWidth: "1800px", margin: "0 auto", padding: "30px" }}>
        {/* Stats Grid */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "15px",
          marginBottom: "30px",
        }}>
          {[
            { value: stats.total, label: "Всего", bg: "linear-gradient(135deg,#11998e,#38ef7d)" },
            { value: stats.active, label: "Активные", bg: "linear-gradient(135deg,#4facfe,#00f2fe)" },
            { value: stats.readonly, label: "Only Read", bg: "linear-gradient(135deg,#fa709a,#fee140)" },
            { value: stats.demo, label: "DEMO", bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)" },
            { value: stats.basic, label: "Basic", bg: "linear-gradient(135deg,#667eea,#764ba2)" },
            { value: stats.standard, label: "Standard", bg: "linear-gradient(135deg,#f093fb,#f5576c)" },
            { value: stats.premium, label: "Premium", bg: "linear-gradient(135deg,#4facfe,#00f2fe)" },
            { value: stats.vip, label: "VIP", bg: "linear-gradient(135deg,#f5af19,#f12711)" },
            { value: stats.referrals, label: "Рефералов", bg: "linear-gradient(135deg,#11998e,#38ef7d)" },
            { value: `€${stats.revenue}`, label: "Доход", bg: "linear-gradient(135deg,#667eea,#764ba2)" },
          ].map((stat, i) => (
            <div key={i} style={{
              borderRadius: "12px",
              padding: "20px",
              color: "#fff",
              textAlign: "center",
              background: stat.bg,
            }}>
              <div style={{ fontSize: "36px", fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", marginTop: "5px" }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Users Section */}
        <Section title="Пользователи" icon="👥" isOpen={usersOpen} onToggle={() => setUsersOpen(!usersOpen)}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
              <input
                type="text"
                placeholder="Поиск"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 35px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>
            <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)} style={{ padding: "10px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "13px" }}>
              <option value="all">Все статусы</option>
              <option value="vip">vip</option>
              <option value="active">active</option>
              <option value="demo">demo</option>
              <option value="expired">expired</option>
              <option value="read-only">read-only</option>
            </select>
            <select value={userPlanFilter} onChange={(e) => setUserPlanFilter(e.target.value)} style={{ padding: "10px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "13px" }}>
              <option value="all">Все планы</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
            <select value={userDocFilter} onChange={(e) => setUserDocFilter(e.target.value)} style={{ padding: "10px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "13px" }}>
              <option value="all">Все документы</option>
              <option value="ΤΙΜΟΛΟΓΙΟ">ΤΙΜΟΛΟΓΙΟ</option>
              <option value="ΑΠΟΔΕΙΞΗ">ΑΠΟΔΕΙΞΗ</option>
            </select>
            <button onClick={exportUsers} style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
              📥 Excel
            </button>
          </div>
          {/* Quick Filters Row */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#495057" }}>Быстрые фильтры:</span>
            <button
              onClick={() => setQuickTimeFilter(quickTimeFilter === "24h" ? "none" : "24h")}
              style={{
                padding: "6px 12px",
                border: "2px solid",
                borderColor: quickTimeFilter === "24h" ? "#FF6B35" : "#e9ecef",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: quickTimeFilter === "24h" ? "#FF6B35" : "#fff",
                color: quickTimeFilter === "24h" ? "#fff" : "#495057",
                transition: "all 0.2s",
              }}
            >
              🕐 New 24h ({stats.new24h})
            </button>
            <button
              onClick={() => setQuickTimeFilter(quickTimeFilter === "7d" ? "none" : "7d")}
              style={{
                padding: "6px 12px",
                border: "2px solid",
                borderColor: quickTimeFilter === "7d" ? "#FF6B35" : "#e9ecef",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: quickTimeFilter === "7d" ? "#FF6B35" : "#fff",
                color: quickTimeFilter === "7d" ? "#fff" : "#495057",
                transition: "all 0.2s",
              }}
            >
              📅 New 7d ({stats.new7d})
            </button>
            <span style={{ width: "1px", height: "20px", background: "#e9ecef", margin: "0 4px" }} />
            <button
              onClick={() => setOnlyDemo(!onlyDemo)}
              style={{
                padding: "6px 12px",
                border: "2px solid",
                borderColor: onlyDemo ? "#a18cd1" : "#e9ecef",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: onlyDemo ? "#a18cd1" : "#fff",
                color: onlyDemo ? "#fff" : "#495057",
                transition: "all 0.2s",
              }}
            >
              🎮 Only Demo ({stats.demo})
            </button>
            <button
              onClick={() => setOnlyConsent(!onlyConsent)}
              style={{
                padding: "6px 12px",
                border: "2px solid",
                borderColor: onlyConsent ? "#28a745" : "#e9ecef",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: onlyConsent ? "#28a745" : "#fff",
                color: onlyConsent ? "#fff" : "#495057",
                transition: "all 0.2s",
              }}
            >
              ✅ Consent Only ({stats.consent})
            </button>
          </div>
          <div style={{ background: "#f8f9fa", padding: "8px 12px", borderRadius: "8px", marginBottom: "10px", fontWeight: 600, fontSize: "13px" }}>
            Показано: <span style={{ color: "#FF6B35" }}>{filteredUsers.length}</span>
          </div>
          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
              <thead>
                <tr>
                  {["ID", "Имя", "Email", "Телефон", "Документ", "ΑΦΜ", "Status", "Plan", "Consent", "Дата", "Действия"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #e9ecef", background: "#f8f9fa", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", color: "#495057" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}><small>#{user.account_number}</small></td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}><b>{user.name}</b></td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.email}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.phone}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      <span style={{ ...getBadgeStyle(user.doc_type || "ΑΠΟΔΕΙΞΗ"), display: "inline-block", padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase" }}>{user.doc_type || "ΑΠΟΔΕΙΞΗ"}</span>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.doc_type === "ΤΙΜΟΛΟΓΙΟ" ? user.afm : "-"}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      <span style={{ ...getBadgeStyle(user.subscription_status), display: "inline-block", padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase" }}>{user.subscription_status}</span>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      <span style={{ ...getBadgeStyle((user.subscription_plan || "demo").toLowerCase()), display: "inline-block", padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase" }}>{user.subscription_plan || "DEMO"}</span>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px", textAlign: "center" }}>
                      {user.contact_consent ? <span style={{ color: "#28a745" }}>✅</span> : <span style={{ color: "#dc3545" }}>❌</span>}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.created_at?.split("T")[0]}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      <button onClick={() => handleViewUser(user)} style={{ padding: "4px 6px", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "pointer", margin: "1px", background: "#e8eaf6", color: "#3f51b5" }}>👁️</button>
                      <button onClick={() => handleEditUser(user)} style={{ padding: "4px 6px", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "pointer", margin: "1px", background: "#e3f2fd", color: "#1976d2" }}>✏️</button>
                      {user.subscription_status !== "vip" && (
                        <button onClick={() => handleQuickVip(user)} style={{ padding: "4px 6px", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "pointer", margin: "1px", background: "#fff3cd", color: "#856404" }}>⭐</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Referrals Section */}
        <Section title="Рефералы" icon="🎁" isOpen={referralsOpen} onToggle={() => setReferralsOpen(!referralsOpen)}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
            <button onClick={exportReferrals} style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>📥 Excel</button>
          </div>
          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Реферер", "Email", "Приглашено", "Купили", "Бонус"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #e9ecef", background: "#f8f9fa", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", color: "#495057" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referralStats.map(r => (
                  <tr key={r.user.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}><b>{r.user.name}</b></td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{r.user.email}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{r.invited}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{r.purchased}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{r.user.bonus_months || 0} мес.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* VIP Section */}
        <Section title="VIP" icon="⭐" isOpen={vipOpen} onToggle={() => setVipOpen(!vipOpen)}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
            <button onClick={exportVip} style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>📥 Excel</button>
            <button onClick={handleOpenVipModal} style={{ background: "linear-gradient(135deg,#f5af19,#f12711)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>⭐ Добавить VIP</button>
          </div>
          <div style={{ background: "#f8f9fa", padding: "8px 12px", borderRadius: "8px", marginBottom: "10px", fontWeight: 600, fontSize: "13px" }}>
            VIP: <span style={{ color: "#FF6B35" }}>{vipUsers.length}</span>
          </div>
          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Имя", "Email", "VIP с", "vip_expires_at", "vip_granted_by", "vip_reason", "Действия"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #e9ecef", background: "#f8f9fa", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", color: "#495057" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vipUsers.map(user => {
                  const exp = user.vip_expires_at ? (new Date(user.vip_expires_at).getFullYear() > 2100 ? "Бессрочно" : user.vip_expires_at.split("T")[0]) : "-";
                  return (
                    <tr key={user.id}>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}><b>{user.name}</b></td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.email}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.created_at?.split("T")[0]}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{exp}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.vip_granted_by || "-"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>{user.vip_reason || "-"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                        <button onClick={() => handleRemoveVip(user)} style={{ padding: "4px 6px", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "pointer", margin: "1px", background: "#f8d7da", color: "#721c24" }}>❌</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Payments Section */}
        <Section title="История платежей" icon="💰" isOpen={paymentsOpen} onToggle={() => setPaymentsOpen(!paymentsOpen)}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
              <input
                type="text"
                placeholder="Поиск по имени/email"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 35px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>
            <select value={paymentSentFilter} onChange={(e) => setPaymentSentFilter(e.target.value)} style={{ padding: "10px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "13px" }}>
              <option value="all">Все</option>
              <option value="not_sent">Не отправлен</option>
              <option value="sent">Отправлен</option>
            </select>
            <button onClick={exportPayments} style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>📥 Excel</button>
          </div>
          <div style={{ background: "#f8f9fa", padding: "8px 12px", borderRadius: "8px", marginBottom: "10px", fontWeight: 600, fontSize: "13px" }}>
            Платежей: <span style={{ color: "#FF6B35" }}>{filteredPayments.length}</span>
            {paymentSentFilter === "not_sent" && <span style={{ marginLeft: "15px", color: "#dc3545" }}>⚠️ Требуют обработки</span>}
          </div>
          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr>
                  {["Дата", "Клиент", "Сумма", "Тип", "План", "Документ", "Workflow", "Действия"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #e9ecef", background: "#f8f9fa", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", color: "#495057" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      {payment.paid_at?.split("T")[0]}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      <b>{payment.profiles?.name || "—"}</b><br/>
                      <small style={{ color: "#6c757d" }}>{payment.profiles?.email || "—"}</small>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px", fontWeight: 600 }}>
                      €{payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      <span style={{
                        ...getBadgeStyle(payment.type === "account_purchase" ? "active" : "standard"),
                        display: "inline-block", padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 700
                      }}>
                        {payment.type === "account_purchase" ? "Аккаунт" : "Подписка"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      {payment.plan || "—"}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      {payment.profiles?.doc_type && (
                        <>
                          <span style={{ ...getBadgeStyle(payment.profiles.doc_type), display: "inline-block", padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 700 }}>
                            {payment.profiles.doc_type}
                          </span>
                          {payment.profiles.afm && <small style={{ marginLeft: "4px", color: "#6c757d" }}>{payment.profiles.afm}</small>}
                        </>
                      )}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span title="Stripe оплачен" style={{ color: "#28a745" }}>Stripe ✅</span>
                        <span title="Создан в myDATA" style={{ color: payment.invoice_created ? "#28a745" : "#dc3545" }}>
                          Создан {payment.invoice_created ? "✅" : "❌"}
                        </span>
                        <span title="Отправлен клиенту" style={{ color: payment.invoice_sent ? "#28a745" : "#dc3545" }}>
                          Отправлен {payment.invoice_sent ? "✅" : "❌"}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e9ecef", fontSize: "12px" }}>
                      {!payment.invoice_created && (
                        <button
                          onClick={() => handleUpdatePaymentInvoice(payment.id, "invoice_created", true)}
                          title="Отметить: Τιμολόγιο создан"
                          style={{ padding: "4px 6px", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "pointer", margin: "1px", background: "#e3f2fd", color: "#1976d2" }}
                        >📝</button>
                      )}
                      {payment.invoice_created && !payment.invoice_sent && (
                        <button
                          onClick={() => handleUpdatePaymentInvoice(payment.id, "invoice_sent", true)}
                          title="Отметить: Τιμολόγιο отправлен"
                          style={{ padding: "4px 6px", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "pointer", margin: "1px", background: "#d4edda", color: "#155724" }}
                        >📧</button>
                      )}
                      {!payment.invoice_created && (
                        <button
                          disabled
                          title="Сначала создайте τιμολόγιο"
                          style={{ padding: "4px 6px", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "not-allowed", margin: "1px", background: "#e9ecef", color: "#adb5bd", opacity: 0.5 }}
                        >📧</button>
                      )}
                      {payment.invoice_created && payment.invoice_sent && (
                        <span style={{ color: "#28a745", fontSize: "11px" }}>✓ Готово</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* View User Modal */}
      {viewModalOpen && selectedUser && (
        <Modal onClose={() => setViewModalOpen(false)}>
          <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>👤 Пользователь</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", marginBottom: "12px" }}>
            <div><b>ID:</b> #{selectedUser.account_number}</div>
            <div><b>Имя:</b> {selectedUser.name}</div>
            <div><b>Email:</b> {selectedUser.email}</div>
            <div><b>Телефон:</b> {selectedUser.phone}</div>
            <div><b>subscription_status:</b> <span style={{ ...getBadgeStyle(selectedUser.subscription_status), display: "inline-block", padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 700 }}>{selectedUser.subscription_status}</span></div>
            <div><b>subscription_plan:</b> <span style={{ ...getBadgeStyle((selectedUser.subscription_plan || "demo").toLowerCase()), display: "inline-block", padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 700 }}>{selectedUser.subscription_plan || "DEMO"}</span></div>
          </div>
          {selectedUser.subscription_status === "vip" && (
            <div style={{ background: "#fff3cd", border: "2px solid #f5af19", borderRadius: "8px", padding: "10px", marginTop: "10px" }}>
              <h4 style={{ color: "#856404", marginBottom: "6px", fontSize: "12px" }}>⭐ VIP</h4>
              <div style={{ fontSize: "11px" }}>
                <b>vip_expires_at:</b> {selectedUser.vip_expires_at ? (new Date(selectedUser.vip_expires_at).getFullYear() > 2100 ? "Бессрочно" : selectedUser.vip_expires_at) : "-"}<br />
                <b>vip_granted_by:</b> {selectedUser.vip_granted_by || "-"}<br />
                <b>vip_reason:</b> {selectedUser.vip_reason || "-"}
              </div>
            </div>
          )}
          {selectedUser.doc_type === "ΤΙΜΟΛΟΓΙΟ" && (
            <div style={{ background: "#e3f2fd", border: "2px solid #1565c0", borderRadius: "8px", padding: "10px", marginTop: "10px" }}>
              <h4 style={{ color: "#1565c0", marginBottom: "8px", fontSize: "12px" }}>📋 ΤΙΜΟΛΟΓΙΟ</h4>
              <div style={{ fontSize: "11px" }}>
                <b>ΑΦΜ:</b> {selectedUser.afm}<br />
                <b>ΔΟΥ:</b> {selectedUser.doy}<br />
                <b>Компания:</b> {selectedUser.company_name}<br />
                <b>Деятельность:</b> {selectedUser.company_activity}<br />
                <b>Адрес:</b> {selectedUser.company_address}
              </div>
            </div>
          )}
          <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setViewModalOpen(false)} style={{ padding: "10px 20px", border: "none", borderRadius: "8px", background: "#e9ecef", color: "#495057", fontWeight: 700, cursor: "pointer" }}>Закрыть</button>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <Modal onClose={() => setEditModalOpen(false)}>
          <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>✏️ Редактирование</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Имя</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
            <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
            <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Телефон</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
            <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Документ</label><select value={editForm.doc_type} onChange={(e) => setEditForm({ ...editForm, doc_type: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }}><option value="ΑΠΟΔΕΙΞΗ">ΑΠΟΔΕΙΞΗ</option><option value="ΤΙΜΟΛΟΓΙΟ">ΤΙΜΟΛΟΓΙΟ</option></select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
            <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>subscription_status</label><select value={editForm.subscription_status} onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }}><option value="demo">demo</option><option value="active">active</option><option value="expired">expired</option><option value="read-only">read-only</option><option value="vip">vip</option></select></div>
            <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>subscription_plan</label><select value={editForm.subscription_plan} onChange={(e) => setEditForm({ ...editForm, subscription_plan: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }}><option value="">null</option><option value="Basic">Basic</option><option value="Standard">Standard</option><option value="Premium">Premium</option><option value="VIP">VIP</option></select></div>
          </div>
          {editForm.doc_type === "ΤΙΜΟΛΟΓΙΟ" && (
            <div style={{ background: "#e3f2fd", border: "2px solid #1565c0", borderRadius: "8px", padding: "10px", marginTop: "10px" }}>
              <h4 style={{ color: "#1565c0", marginBottom: "8px", fontSize: "12px" }}>📋 ΤΙΜΟΛΟΓΙΟ</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>ΑΦΜ</label><input type="text" value={editForm.afm} onChange={(e) => setEditForm({ ...editForm, afm: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
                <div><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>ΔΟΥ</label><input type="text" value={editForm.doy} onChange={(e) => setEditForm({ ...editForm, doy: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
              </div>
              <div style={{ marginTop: "10px" }}><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Компания</label><input type="text" value={editForm.company_name} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
              <div style={{ marginTop: "10px" }}><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Деятельность</label><input type="text" value={editForm.company_activity} onChange={(e) => setEditForm({ ...editForm, company_activity: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
              <div style={{ marginTop: "10px" }}><label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Адрес</label><input type="text" value={editForm.company_address} onChange={(e) => setEditForm({ ...editForm, company_address: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} /></div>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button onClick={() => setEditModalOpen(false)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#e9ecef", color: "#495057", fontWeight: 700, cursor: "pointer" }}>Отмена</button>
            <button onClick={handleSaveEdit} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg,#FF6B35,#F7C59F)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Сохранить</button>
          </div>
        </Modal>
      )}

      {/* VIP Modal */}
      {vipModalOpen && (
        <Modal onClose={() => setVipModalOpen(false)}>
          <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>⭐ Активировать VIP</h3>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Email</label>
            <input type="email" value={vipForm.email} onChange={(e) => setVipForm({ ...vipForm, email: e.target.value })} placeholder="Введите email" style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Срок (vip_expires_at)</label>
            <select value={vipForm.duration} onChange={(e) => setVipForm({ ...vipForm, duration: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }}>
              <option value="forever">Бессрочно (+100 лет)</option>
              <option value="1">1 месяц</option>
              <option value="3">3 месяца</option>
              <option value="6">6 месяцев</option>
              <option value="12">1 год</option>
              <option value="custom">Указать дату</option>
            </select>
          </div>
          {vipForm.duration === "custom" && (
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>Дата</label>
              <input type="date" value={vipForm.customDate} onChange={(e) => setVipForm({ ...vipForm, customDate: e.target.value })} style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} />
            </div>
          )}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "12px" }}>vip_reason</label>
            <input type="text" value={vipForm.reason} onChange={(e) => setVipForm({ ...vipForm, reason: e.target.value })} placeholder="Причина..." style={{ width: "100%", padding: "8px", border: "2px solid #e9ecef", borderRadius: "6px", fontSize: "13px" }} />
          </div>
          <div style={{ background: "#fff3cd", border: "2px solid #f5af19", borderRadius: "8px", padding: "10px", marginTop: "10px" }}>
            <h4 style={{ color: "#856404", marginBottom: "6px", fontSize: "12px" }}>При активации:</h4>
            <div style={{ fontSize: "11px" }}>
              subscription_status → 'vip'<br />
              subscription_plan → 'VIP'<br />
              vip_expires_at → дата<br />
              vip_granted_by → ID админа<br />
              + отправка email
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button onClick={() => setVipModalOpen(false)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#e9ecef", color: "#495057", fontWeight: 700, cursor: "pointer" }}>Отмена</button>
            <button onClick={handleActivateVip} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg,#FF6B35,#F7C59F)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>⭐ Активировать</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Section Component
function Section({ title, icon, isOpen, onToggle, children }: { title: string; icon: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section style={{ background: "#f8f9fa", borderRadius: "16px", marginBottom: "25px", border: "2px solid #e9ecef", overflow: "hidden" }}>
      <div onClick={onToggle} style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", color: "#fff", padding: "18px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <h2 style={{ fontSize: "18px", margin: 0 }}>{icon} {title}</h2>
        <span style={{ fontSize: "18px", transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </div>
      {isOpen && <div style={{ padding: "20px", background: "#fff" }}>{children}</div>}
    </section>
  );
}

// Modal Component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", padding: "25px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
