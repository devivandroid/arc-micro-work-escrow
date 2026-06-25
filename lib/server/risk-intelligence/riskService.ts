import { ARC_TESTNET_CHAIN_ID } from "@/lib/chains/arcTestnet";
import { calculateRiskProfile, getUniqueRiskWallets } from "@/lib/server/risk-intelligence/calculateRiskProfile";
import { getEvents } from "@/lib/server/reputation/reputationEventStore";
import { toRiskProfileApiResponse } from "@/lib/server/risk-intelligence/riskProfileResponse";
import type {
  ConfidenceLevel,
  RiskGuardCheck,
  RiskGuardDecision,
  RiskGuardPolicy,
  RiskProfile,
  UnknownWalletBehavior
} from "@/lib/server/risk-intelligence/types";

export const riskServiceScope = "Knowledge Exchange activity only";
export const riskServiceNetwork = "Arc Testnet";

export const riskServiceLimitations = [
  "Based only on Knowledge Exchange activity",
  "Not an official Arc or Circle score",
  "Preview risk model",
  "No authentication yet",
  "No production-grade compliance screening"
];

export function getRiskProfile(wallet: string): RiskProfile {
  return calculateRiskProfile(wallet, getEvents());
}

export function getRiskProfiles(limit = 50): RiskProfile[] {
  const events = getEvents();
  return getUniqueRiskWallets(events)
    .map((wallet) => calculateRiskProfile(wallet, events))
    .sort(
      (a, b) =>
        (b.scores.financialBehaviorScore ?? -1) - (a.scores.financialBehaviorScore ?? -1)
    )
    .slice(0, Math.max(1, Math.min(limit, 100)));
}

export function toPublicRiskProfileResponse(profile: RiskProfile) {
  return {
    ...toRiskProfileApiResponse(profile),
    service: "Knowledge Exchange Public Risk Intelligence Service"
  };
}

export function toRiskSummaryResponse(profile: RiskProfile) {
  return {
    ok: true,
    service: "Knowledge Exchange Public Risk Intelligence Service",
    scope: riskServiceScope,
    network: riskServiceNetwork,
    chainId: ARC_TESTNET_CHAIN_ID,
    wallet: profile.wallet,
    profileStatus: profile.profileStatus,
    message: profile.message,
    recommendation: profile.recommendation,
    participant: {
      type: profile.participant.type,
      name: profile.participant.name ?? null,
      operatorAddress: profile.participant.operatorAddress ?? null
    },
    summary: {
      financialBehaviorScore: profile.scores.financialBehaviorScore,
      riskScore: profile.scores.riskScore,
      riskTier: profile.scores.riskTier,
      confidenceLevel: profile.scores.confidenceLevel,
      activityLevel: profile.activity.activityLevel,
      totalCompletedVolumeUSDC: profile.activity.totalCompletedVolumeUSDC,
      completedActions: profile.activity.completedActions,
      lastActivity: profile.activity.lastActivity ?? null,
      evidenceCount: profile.activity.evidenceCount
    },
    limitations: riskServiceLimitations
  };
}

export function toRiskSignalsResponse(profile: RiskProfile) {
  return {
    ok: true,
    service: "Knowledge Exchange Public Risk Intelligence Service",
    scope: riskServiceScope,
    network: riskServiceNetwork,
    chainId: ARC_TESTNET_CHAIN_ID,
    wallet: profile.wallet,
    profileStatus: profile.profileStatus,
    message: profile.message,
    recommendation: profile.recommendation,
    behavioralSignals: profile.behavioralSignals,
    riskSignals: profile.riskSignals,
    limitations: riskServiceLimitations
  };
}

export function getRiskModelResponse() {
  return {
    ok: true,
    service: "Knowledge Exchange Public Risk Intelligence Service",
    name: "Knowledge Exchange Risk Intelligence Model",
    scope: riskServiceScope,
    network: riskServiceNetwork,
    chainId: ARC_TESTNET_CHAIN_ID,
    scoring: {
      financialBehaviorScore: {
        range: "0-1000",
        startingScore: 500,
        positiveSignals: [
          "successful payments",
          "verified payments",
          "resource downloads",
          "protected transaction funding",
          "delivery submission",
          "funds released",
          "counterparty diversity",
          "completed volume"
        ],
        negativeSignals: [
          "cancelled requests",
          "purchase starts without completion",
          "failed payments when observed"
        ]
      },
      riskScore: {
        range: "0-100",
        interpretation: "0 is lowest observed risk in this preview model; 100 is highest observed risk."
      },
      riskTiers: {
        Low: "risk score 0-24",
        Medium: "risk score 25-59",
        High: "risk score 60-100",
        Unknown: "insufficient Knowledge Exchange evidence"
      },
      confidenceLevels: {
        Low: "fewer than 5 evidence events",
        Medium: "5-20 evidence events",
        High: "more than 20 evidence events"
      },
      activityLevels: {
        Dormant: "no activity or last activity more than 30 days ago",
        Low: "less than 1 action per day",
        Normal: "1-5 actions per day",
        High: "more than 5 actions per day",
        Unknown: "no observed activity"
      },
      profileStatuses: {
        active: "medium or high confidence Knowledge Exchange evidence is available",
        limited: "some Knowledge Exchange evidence is available, but confidence is low",
        no_data: "no Knowledge Exchange activity was found for the wallet"
      },
      noDataHandling: {
        rule: "No data is not high risk.",
        riskTier: "Unknown",
        confidenceLevel: "Low",
        numericScores: "financialBehaviorScore and riskScore are null",
        riskGuardDefault: "review"
      }
    },
    limitations: riskServiceLimitations
  };
}

const confidenceRank: Record<ConfidenceLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3
};

const defaultRiskGuardPolicy: Required<RiskGuardPolicy> = {
  maxRiskScore: 100,
  allowedRiskTiers: ["Low", "Medium", "High", "Unknown"],
  minimumConfidenceLevel: "Low",
  allowUnknownParticipantType: true,
  unknownWalletBehavior: "review"
};

export function normalizeRiskGuardPolicy(policy: RiskGuardPolicy = {}): Required<RiskGuardPolicy> {
  return {
    maxRiskScore: policy.maxRiskScore ?? defaultRiskGuardPolicy.maxRiskScore,
    allowedRiskTiers: policy.allowedRiskTiers?.length
      ? policy.allowedRiskTiers
      : defaultRiskGuardPolicy.allowedRiskTiers,
    minimumConfidenceLevel:
      policy.minimumConfidenceLevel ?? defaultRiskGuardPolicy.minimumConfidenceLevel,
    allowUnknownParticipantType:
      policy.allowUnknownParticipantType ?? defaultRiskGuardPolicy.allowUnknownParticipantType,
    unknownWalletBehavior:
      policy.unknownWalletBehavior ?? defaultRiskGuardPolicy.unknownWalletBehavior
  };
}

function getRiskGuardReason(
  decision: RiskGuardDecision,
  profile: RiskProfile,
  unknownWalletBehavior: UnknownWalletBehavior
): string {
  if (profile.profileStatus === "no_data") {
    const suffix =
      unknownWalletBehavior === "allow"
        ? "Policy allows unknown wallets."
        : unknownWalletBehavior === "block"
          ? "Policy blocks unknown wallets."
          : "Policy requires review.";
    return `${profile.message} Missing data is not negative evidence. ${suffix}`;
  }
  if (decision === "allow") return "Risk score and confidence are within policy.";
  if (decision === "block") return "One or more blocking risk checks failed.";
  return "One or more risk checks require review before transacting.";
}

export function evaluateRiskGuard(wallet: string, policy: RiskGuardPolicy = {}) {
  const normalizedPolicy = normalizeRiskGuardPolicy(policy);
  const profile = getRiskProfile(wallet);
  const isNoDataProfile = profile.profileStatus === "no_data";

  const checks: RiskGuardCheck[] = [
    {
      label: "Risk score threshold",
      passed:
        profile.scores.riskScore === null
          ? true
          : profile.scores.riskScore <= normalizedPolicy.maxRiskScore,
      value: profile.scores.riskScore,
      expected:
        profile.scores.riskScore === null
          ? "not evaluated for no-data profiles"
          : `<= ${normalizedPolicy.maxRiskScore}`
    },
    {
      label: "Risk tier allowed",
      passed: normalizedPolicy.allowedRiskTiers.includes(profile.scores.riskTier),
      value: profile.scores.riskTier,
      expected: normalizedPolicy.allowedRiskTiers.join(", ")
    },
    {
      label: "Confidence level",
      passed:
        confidenceRank[profile.scores.confidenceLevel] >=
        confidenceRank[normalizedPolicy.minimumConfidenceLevel],
      value: profile.scores.confidenceLevel,
      expected: `>= ${normalizedPolicy.minimumConfidenceLevel}`
    },
    {
      label: "Participant type known",
      passed:
        normalizedPolicy.allowUnknownParticipantType || profile.participant.type !== "unknown",
      value: profile.participant.type,
      expected: normalizedPolicy.allowUnknownParticipantType ? "any" : "not unknown"
    }
  ];

  const failedChecks = checks.filter((check) => !check.passed);
  const riskScoreFailed = !checks[0].passed;
  const riskTierFailed = !checks[1].passed;
  const highRiskTierBlocked =
    profile.scores.riskTier === "High" && !normalizedPolicy.allowedRiskTiers.includes("High");
  const unknownParticipantBlocked =
    !isNoDataProfile &&
    !normalizedPolicy.allowUnknownParticipantType &&
    profile.participant.type === "unknown";

  const decision: RiskGuardDecision = isNoDataProfile
    ? normalizedPolicy.unknownWalletBehavior
    : failedChecks.length === 0
      ? "allow"
      : riskScoreFailed ||
          highRiskTierBlocked ||
          (riskTierFailed && profile.scores.riskTier === "High") ||
          unknownParticipantBlocked
        ? "block"
        : "review";

  return {
    ok: true,
    service: "Knowledge Exchange Risk Guard",
    scope: riskServiceScope,
    network: riskServiceNetwork,
    chainId: ARC_TESTNET_CHAIN_ID,
    wallet: profile.wallet,
    profileStatus: profile.profileStatus,
    decision,
    allowed: decision === "allow",
    reason: getRiskGuardReason(decision, profile, normalizedPolicy.unknownWalletBehavior),
    policy: normalizedPolicy,
    profile: {
      scores: profile.scores,
      participant: {
        type: profile.participant.type,
        name: profile.participant.name ?? null,
        operatorAddress: profile.participant.operatorAddress ?? null
      }
    },
    checks,
    limitations: riskServiceLimitations
  };
}
