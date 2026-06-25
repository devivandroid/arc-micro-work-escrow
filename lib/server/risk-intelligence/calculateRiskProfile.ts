import { isAddress } from "ethers";
import { calculateReputation } from "@/lib/server/reputation/calculateReputation";
import { toRiskProfile } from "@/lib/server/risk-intelligence/riskSignals";
import type { RiskProfile } from "@/lib/server/risk-intelligence/types";
import type { ReputationEvent } from "@/types/reputation";

export function calculateRiskProfile(wallet: string, events: ReputationEvent[]): RiskProfile {
  return toRiskProfile(calculateReputation(wallet, events));
}

export function getUniqueRiskWallets(events: ReputationEvent[]): string[] {
  return [...new Set(events.map((event) => event.walletAddress).filter(isAddress))];
}
