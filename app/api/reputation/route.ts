import { NextResponse, type NextRequest } from "next/server";
import {
  getRiskProfiles,
  toPublicRiskProfileResponse
} from "@/lib/server/risk-intelligence/riskService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limit = Math.max(1, Math.min(Number(request.nextUrl.searchParams.get("limit") || 10), 50));
  const riskTier = request.nextUrl.searchParams.get("riskTier");
  const profiles = getRiskProfiles(100)
    .filter((profile) => !riskTier || profile.scores.riskTier === riskTier)
    .slice(0, limit)
    .map(toPublicRiskProfileResponse);

  return NextResponse.json({
    ok: true,
    name: "Knowledge Exchange Risk Intelligence API",
    scope: "Knowledge Exchange activity only",
    network: "Arc Testnet",
    wallets: profiles,
    limitations: [
      "Preview risk model",
      "Not an official Arc or Circle score",
      "Does not score all Arc wallets",
      "MVP preview model based on local Knowledge Exchange events"
    ]
  });
}
