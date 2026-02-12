/**
 * Subscription Access Guards (server-side)
 *
 * Thin wrappers around subscription checks that return a uniform GuardResult.
 * Each guard calls logLimitDenied internally so API routes stay clean.
 */

import {
  type SubscriptionTier,
  type SubscriptionLimits,
  getUserTier,
  getSubscriptionLimits,
  canCreateObject,
  canAddTeamMember,
  canUseFeature,
} from './subscription';
import { logLimitDenied } from '@core/audit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GuardResult =
  | { allowed: true }
  | {
      allowed: false;
      status: number;
      code: string;
      message: string;
      upgradeToTier?: string;
    };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deny(
  code: string,
  message: string,
  upgradeToTier?: string,
  status: number = 403,
): GuardResult {
  return { allowed: false, status, code, message, upgradeToTier };
}

/**
 * Resolve SubscriptionTier from a profile row.
 * Accepts the same shape that getUserTier expects.
 */
export function getTierFromProfile(profile: Parameters<typeof getUserTier>[0] | null): SubscriptionTier {
  return profile ? getUserTier(profile) : 'demo';
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export async function requireCanCreateObject(params: {
  tier: SubscriptionTier;
  currentCount: number;
  userId: string;
}): Promise<GuardResult> {
  const check = canCreateObject(params.tier, params.currentCount);
  if (check.allowed) return { allowed: true };

  const limits = getSubscriptionLimits(params.tier);
  await logLimitDenied({
    action: 'limits.objects_denied',
    userId: params.userId,
    metadata: {
      tier: params.tier,
      current: params.currentCount,
      max: limits.maxObjects,
      upgrade_to: check.upgradeToTier || '',
    },
  });

  return deny(
    'OBJECT_LIMIT',
    check.message || 'Object limit reached',
    check.upgradeToTier,
  );
}

export async function requireCanAddTeamMember(params: {
  tier: SubscriptionTier;
  currentCount: number;
  userId: string;
  teamId?: string;
}): Promise<GuardResult> {
  const check = canAddTeamMember(params.tier, params.currentCount);
  if (check.allowed) return { allowed: true };

  const limits = getSubscriptionLimits(params.tier);
  await logLimitDenied({
    action: 'limits.team_members_denied',
    userId: params.userId,
    teamId: params.teamId,
    metadata: {
      tier: params.tier,
      current: params.currentCount,
      max: limits.maxUsers,
      upgrade_to: check.upgradeToTier || '',
    },
  });

  return deny(
    'TEAM_MEMBER_LIMIT',
    check.message || 'Team member limit reached',
    check.upgradeToTier,
  );
}

export async function requireCanUseFeature(params: {
  tier: SubscriptionTier;
  feature: keyof SubscriptionLimits;
  userId: string;
}): Promise<GuardResult> {
  const check = canUseFeature(params.tier, params.feature);
  if (check.allowed) return { allowed: true };

  // Map features to audit actions
  const actionMap: Record<string, string> = {
    voiceInput: 'limits.voice_denied',
    photoReceipt: 'limits.photo_denied',
    referralProgram: 'limits.referral_denied',
  };

  const action = actionMap[params.feature] || `limits.feature_denied`;
  await logLimitDenied({
    action: action as any,
    userId: params.userId,
    metadata: {
      tier: params.tier,
      feature: params.feature,
      upgrade_to: check.upgradeToTier || '',
    },
  });

  return deny(
    'FEATURE_NOT_AVAILABLE',
    check.message || 'Feature not available',
    check.upgradeToTier,
  );
}

// ---------------------------------------------------------------------------
// Response helper — converts a denied GuardResult into a NextResponse-ready body
// ---------------------------------------------------------------------------

export function guardErrorBody(result: Extract<GuardResult, { allowed: false }>) {
  return {
    error: result.message,
    code: result.code,
    upgradeToTier: result.upgradeToTier,
  };
}
