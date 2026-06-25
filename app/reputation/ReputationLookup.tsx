"use client";

import { useState } from "react";

type ReputationLookupResult = {
  ok: boolean;
  wallet: string;
  profileStatus?: "active" | "limited" | "no_data";
  message?: string;
  recommendation?: string;
  participant?: {
    type: string;
    name: string | null;
    operatorAddress: string | null;
  };
  scores?: {
    financialBehaviorScore: number | null;
    riskScore: number | null;
    riskTier: string;
    confidenceLevel: string;
  };
  activity?: {
    totalCompletedVolumeUSDC: string;
    completedActions: number;
    successfulPayments: number;
    failedPayments: number;
    resourcesPurchased: number;
    resourcesDownloaded: number;
    requestsCreated: number;
    protectedTransactionsFunded: number;
    deliveriesSubmitted: number;
    fundsReleased: number;
    uniqueCounterparties: number;
    averageTransactionAmountUSDC: string;
    averageActionsPerDay: string;
    lastActivity: string | null;
    daysSinceLastActivity: number | null;
    evidenceCount: number;
    activityLevel: string;
  };
  behavioralSignals?: Array<{
    label: string;
    value: string;
    status: string;
  }>;
  riskSignals?: Array<{
    label: string;
    severity: string;
    description: string;
  }>;
  reputationScore: number | null;
  financialRiskScore: number | null;
  riskTier: string;
  confidenceLevel: string;
  metrics: {
    totalVolumeUSDC: string;
    successfulPayments: number;
    resourcesPurchased: number;
    resourcesDownloaded: number;
    escrowsFunded: number;
    protectedTransactionsFunded?: number;
    fundsReleased: number;
    paymentSuccessRate: number;
    evidenceCount: number;
  };
  lastActivity: string | null;
  limitations: string[];
};

function getRiskAccent(tier: string): string {
  if (tier === "Low") return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100";
  if (tier === "Medium") return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  if (tier === "High") return "border-red-300/40 bg-red-300/10 text-red-100";
  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}

function formatNullableScore(value: number | null | undefined): string {
  return value === null || value === undefined ? "Not assessed" : String(value);
}

function getStatusAccent(status: string): string {
  if (status === "Normal") return "text-emerald-200";
  if (status === "Watch" || status === "Monitor") return "text-amber-200";
  if (status === "Elevated") return "text-red-200";
  return "text-slate-400";
}

function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString() : "Unknown";
}

export function ReputationLookup() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState<ReputationLookupResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/reputation/${wallet}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || body.error || "Lookup failed.");
      }
      setResult(body);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-arc-border bg-arc-panel/80 p-5">
      <h2 className="text-xl font-semibold text-white">Wallet lookup</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Query a Risk Intelligence profile based on Knowledge Exchange preview activity.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={wallet}
          onChange={(event) => setWallet(event.target.value)}
          placeholder="0x..."
          className="min-w-0 flex-1 rounded-lg border border-arc-border bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-arc-blue"
        />
        <button
          type="button"
          onClick={lookup}
          disabled={loading || !wallet.trim()}
          className="rounded-lg bg-arc-blue px-5 py-3 text-sm font-semibold text-arc-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking..." : "Check Risk Intelligence"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="mt-4 grid gap-5 rounded-lg border border-arc-border bg-black/20 p-4 text-sm">
          {result.profileStatus === "no_data" ? (
            <div className="rounded-lg border border-sky-300/25 bg-sky-300/10 p-4">
              <p className="font-semibold text-sky-100">
                No Knowledge Exchange activity found
              </p>
              <p className="mt-2 leading-6 text-slate-300">
                This wallet has no activity in Knowledge Exchange yet. Risk cannot be
                assessed from marketplace data alone.
              </p>
              <p className="mt-3 rounded-lg border border-slate-500/30 bg-black/20 p-3 text-sm font-medium text-slate-200">
                Missing data is not the same as high risk.
              </p>
              <p className="mt-2 leading-6 text-slate-400">
                Use review mode, request additional verification, or apply your own risk
                policy before transacting.
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">
                {result.participant?.name
                  ? `${result.participant.name} · ${result.participant.type}`
                  : result.participant?.type === "unknown"
                    ? "Unknown participant type"
                    : result.participant?.type}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500">{result.wallet}</p>
              {result.participant?.operatorAddress ? (
                <p className="mt-1 break-all text-xs text-slate-500">
                  Operator: {result.participant.operatorAddress}
                </p>
              ) : null}
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRiskAccent(
                result.riskTier
              )}`}
            >
              {result.riskTier} risk
            </span>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Financial Behavior Score", result.scores?.financialBehaviorScore ?? result.reputationScore],
              ["Risk Score", result.scores?.riskScore ?? result.financialRiskScore],
              ["Risk Tier", result.scores?.riskTier ?? result.riskTier],
              ["Confidence", result.scores?.confidenceLevel ?? result.confidenceLevel],
              ["Completed Volume", `${result.activity?.totalCompletedVolumeUSDC ?? result.metrics.totalVolumeUSDC} USDC`],
              ["Completed Actions", result.activity?.completedActions ?? 0],
              ["Last Activity", formatDate(result.activity?.lastActivity ?? result.lastActivity)],
              ["Activity Level", result.activity?.activityLevel ?? "Unknown"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-arc-border bg-white/[0.03] p-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 text-base font-semibold text-white">
                  {typeof value === "number" || value === null || value === undefined
                    ? formatNullableScore(value)
                    : value}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="text-sm font-semibold text-white">Activity Profile</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Successful payments", result.activity?.successfulPayments ?? result.metrics.successfulPayments],
                ["Failed payments", result.activity?.failedPayments ?? 0],
                ["Resources purchased", result.activity?.resourcesPurchased ?? result.metrics.resourcesPurchased],
                ["Resources downloaded", result.activity?.resourcesDownloaded ?? result.metrics.resourcesDownloaded],
                ["Requests created", result.activity?.requestsCreated ?? 0],
                [
                  "Protected transactions funded",
                  result.activity?.protectedTransactionsFunded ??
                    result.metrics.protectedTransactionsFunded ??
                    result.metrics.escrowsFunded
                ],
                ["Deliveries submitted", result.activity?.deliveriesSubmitted ?? 0],
                ["Funds released", result.activity?.fundsReleased ?? result.metrics.fundsReleased],
                ["Unique counterparties", result.activity?.uniqueCounterparties ?? 0],
                [
                  "Average transaction",
                  `${result.activity?.averageTransactionAmountUSDC ?? "0.00"} USDC`
                ],
                ["Average actions/day", result.activity?.averageActionsPerDay ?? "0.0"],
                [
                  "Days since last activity",
                  result.activity?.daysSinceLastActivity ?? "Unknown"
                ],
                ["Evidence count", result.activity?.evidenceCount ?? result.metrics.evidenceCount]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-white">Behavioral Signals</p>
              <div className="mt-3 grid gap-2">
                {(result.behavioralSignals ?? []).map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-lg border border-arc-border bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{signal.label}</p>
                      <span className={`text-xs font-semibold ${getStatusAccent(signal.status)}`}>
                        {signal.status}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-400">{signal.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Risk Signals</p>
              <div className="mt-3 grid gap-2">
                {(result.riskSignals ?? []).map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-lg border border-arc-border bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{signal.label}</p>
                      <span className={`text-xs font-semibold ${getStatusAccent(signal.severity)}`}>
                        {signal.severity}
                      </span>
                    </div>
                    <p className="mt-1 leading-5 text-slate-400">{signal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
