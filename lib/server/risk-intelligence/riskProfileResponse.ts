import { ARC_TESTNET_CHAIN_ID } from "@/lib/chains/arcTestnet";
import type { RiskProfile } from "@/lib/server/risk-intelligence/types";

export function toRiskProfileApiResponse(profile: RiskProfile) {
  return {
    ok: true,
    wallet: profile.wallet,
    profileStatus: profile.profileStatus,
    message: profile.message,
    recommendation: profile.recommendation,
    scope: "Knowledge Exchange activity only",
    network: "Arc Testnet",
    chainId: ARC_TESTNET_CHAIN_ID,
    participant: {
      type: profile.participant.type,
      name: profile.participant.name ?? null,
      operatorAddress: profile.participant.operatorAddress ?? null
    },
    participantType: profile.participant.type,
    participantName: profile.participant.name ?? null,
    operatorAddress: profile.participant.operatorAddress ?? null,
    scores: profile.scores,
    reputationScore: profile.scores.financialBehaviorScore,
    financialRiskScore: profile.scores.riskScore,
    riskTier: profile.scores.riskTier,
    confidenceLevel: profile.scores.confidenceLevel,
    activity: profile.activity,
    metrics: {
      totalVolumeUSDC: profile.activity.totalCompletedVolumeUSDC,
      totalCompletedVolumeUSDC: profile.activity.totalCompletedVolumeUSDC,
      completedActions: profile.activity.completedActions,
      successfulPayments: profile.activity.successfulPayments,
      failedPayments: profile.activity.failedPayments,
      resourcesPurchased: profile.activity.resourcesPurchased,
      resourcesDownloaded: profile.activity.resourcesDownloaded,
      requestsCreated: profile.activity.requestsCreated,
      escrowsFunded: profile.activity.protectedTransactionsFunded,
      protectedTransactionsFunded: profile.activity.protectedTransactionsFunded,
      deliveriesSubmitted: profile.activity.deliveriesSubmitted,
      fundsReleased: profile.activity.fundsReleased,
      uniqueCounterparties: profile.activity.uniqueCounterparties,
      averageTransactionAmountUSDC: profile.activity.averageTransactionAmountUSDC,
      averageActionsPerDay: profile.activity.averageActionsPerDay,
      daysSinceLastActivity: profile.activity.daysSinceLastActivity ?? null,
      activityLevel: profile.activity.activityLevel,
      evidenceCount: profile.activity.evidenceCount
    },
    behavioralSignals: profile.behavioralSignals,
    riskSignals: profile.riskSignals,
    lastActivity: profile.activity.lastActivity ?? null,
    limitations: profile.limitations
  };
}
