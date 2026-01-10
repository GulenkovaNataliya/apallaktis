export type SubscriptionStatus = 'demo' | 'active' | 'expired' | 'vip' | 'read-only';

export type SubscriptionPlan = 'demo' | 'basic' | 'standard' | 'premium' | 'vip' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  countryCode?: string;
  isBusiness: boolean;
  companyName?: string | null;
  afm?: string | null;
  doy?: string | null;
  address?: string | null;

  // Account info
  accountNumber: number; // Порядковый номер #1010, #1011...
  createdAt?: string; // Дата регистрации

  // DEMO период (48 часов)
  subscriptionStatus: SubscriptionStatus;
  demoExpiresAt: string | null; // Когда заканчивается DEMO

  // Покупка аккаунта (97€+ΦΠΑ)
  accountPurchased?: boolean; // Куплен ли аккаунт
  accountPurchasedAt?: string | null; // Дата покупки (для расчета ежемесячной оплаты)
  firstMonthFreeExpiresAt?: string | null; // Конец первого бесплатного месяца

  // Подписка
  subscriptionPlan?: SubscriptionPlan; // Выбранный тариф
  subscriptionExpiresAt?: string | null; // Дата окончания текущего периода

  // VIP (активируется админом)
  vipExpiresAt?: string | null; // null = бессрочно
  vipGrantedBy?: string | null; // ID админа
  vipReason?: string | null; // Причина

  // Реферальная программа
  referralCode?: string;
  referredBy?: string | null; // Код того, кто привел
  bonusMonths?: number; // Накопленные бонусные месяцы
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
