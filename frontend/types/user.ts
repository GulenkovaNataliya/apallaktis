export type SubscriptionStatus = 'demo' | 'active' | 'expired' | 'vip';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  countryCode?: string;
  isBusiness: boolean;
  companyName?: string | null;
  afm?: string | null;
  subscriptionStatus: SubscriptionStatus;
  demoExpiresAt: string | null;
  subscriptionExpiresAt: string | null;
  referralCode: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
