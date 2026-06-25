# Risk Intelligence SDK

The Knowledge Exchange Risk Intelligence Service exposes participant-aware risk profiles for
wallets observed in Knowledge Exchange activity. The internal TypeScript SDK wraps the public
`/api/risk/*` routes so builders and agent workflows can integrate them without hand-writing
fetch calls.

This SDK is kept inside the repository for now. It is not published to npm.

## What The Service Provides

- Full participant risk profiles.
- Compact summaries for lightweight checks.
- Behavioral signals and risk signals.
- Scoring methodology, tiers and confidence rules.
- Seed/demo participant profiles.
- No-data profile handling for unknown wallets.
- Risk Guard pre-transaction decisions.

## Use From This Repository

```ts
import { RiskIntelligenceClient } from "@/lib/sdk/risk-intelligence";

const client = new RiskIntelligenceClient({
  baseUrl: "https://knowledge-exchange.fly.dev"
});
```

For local development:

```ts
const client = new RiskIntelligenceClient({
  baseUrl: "http://localhost:3000"
});
```

## API Methods

```ts
const profile = await client.getProfile(wallet);
const summary = await client.getSummary(wallet);
const signals = await client.getSignals(wallet);
const participants = await client.listParticipants({ limit: 10 });
const model = await client.getModel();
const guard = await client.evaluateTransactionRisk(wallet, {
  maxRiskScore: 40,
  allowedRiskTiers: ["Low", "Medium"],
  minimumConfidenceLevel: "Medium",
  unknownWalletBehavior: "review"
});
```

Available methods:

- `getProfile(wallet)` calls `GET /api/risk/profile/:wallet`.
- `getSummary(wallet)` calls `GET /api/risk/summary/:wallet`.
- `getSignals(wallet)` calls `GET /api/risk/signals/:wallet`.
- `getModel()` calls `GET /api/risk/model`.
- `listParticipants(params)` calls `GET /api/risk/participants`.
- `evaluateTransactionRisk(wallet, policy)` calls `POST /api/risk/guard`.
- `canTransactWith(wallet, policy)` returns `true` when Risk Guard returns `allow`.
- `isRiskAtOrBelow(wallet, maxRiskScore)` returns `true` when `riskScore <= maxRiskScore`.
- `isRiskBelow(wallet, riskScore)` returns `true` when the wallet risk score is below the provided threshold.
- `isRiskAbove(wallet, riskScore)` returns `true` when the wallet risk score is above the provided threshold.
- `hasRiskData(wallet)` returns `false` only when `profileStatus === "no_data"`.

Threshold helpers return `false` for no-data profiles because there is no numeric risk score.

`listParticipants` supports:

- `limit`
- `riskTier`
- `participantType`

## Example Use Cases

### Risk Guard

Risk Guard helps apps and autonomous agents validate participant risk before transacting. It does
not decide for the user; it applies the client application's own policy to the current preview
Risk Intelligence profile.

Endpoint:

```txt
POST /api/risk/guard
```

```ts
const allowed = await client.canTransactWith(wallet, {
  maxRiskScore: 40,
  allowedRiskTiers: ["Low", "Medium"],
  minimumConfidenceLevel: "Medium",
  allowUnknownParticipantType: false,
  unknownWalletBehavior: "review"
});
```

Risk Guard is not compliance screening and is based only on Knowledge Exchange activity.

Developers who need the full `allow | review | block` distinction should call
`evaluateTransactionRisk`. `canTransactWith` returns `true` only for `allow`; `review` and
`block` both return `false`.

### Unknown Wallets And No-Data Profiles

Risk Intelligence is currently based on Knowledge Exchange activity. A wallet with no observed
activity returns:

```json
{
  "profileStatus": "no_data",
  "scores": {
    "financialBehaviorScore": null,
    "riskScore": null,
    "riskTier": "Unknown",
    "confidenceLevel": "Low"
  },
  "message": "No Knowledge Exchange activity was found for this wallet.",
  "recommendation": "Missing data is not negative evidence. Apply your own policy or request additional verification before transacting."
}
```

No data is not high risk. Risk Guard defaults unknown wallets to `review`, and clients can
configure `unknownWalletBehavior` as `allow`, `review` or `block`.

```ts
const decision = await client.evaluateTransactionRisk(wallet, {
  maxRiskScore: 40,
  allowedRiskTiers: ["Low", "Medium"],
  minimumConfidenceLevel: "Medium",
  unknownWalletBehavior: "review"
});

if (decision.decision === "allow") {
  // Continue transaction.
}

if (decision.decision === "review") {
  // Ask for human confirmation or additional evidence.
}

if (decision.decision === "block") {
  // Do not proceed.
}
```

### Marketplace Pre-Check

```ts
const summary = await client.getSummary(sellerWallet);

if (summary.summary.riskTier === "High") {
  // Route to manual review before showing a direct purchase path.
}
```

### Autonomous Agent Commerce

```ts
const [summary, signals] = await Promise.all([
  client.getSummary(sellerWallet),
  client.getSignals(sellerWallet)
]);

const elevatedSignal = signals.riskSignals.some((signal) => signal.severity === "Elevated");
const canProceed = summary.summary.riskTier !== "High" && !elevatedSignal;
```

### Participant Directory

```ts
const participants = await client.listParticipants({
  limit: 10,
  participantType: "agent"
});
```

## Compact Summary Response

```json
{
  "ok": true,
  "scope": "Knowledge Exchange activity only",
  "wallet": "0x...",
  "participant": {
    "type": "agent",
    "name": "ResearchAgent-01",
    "operatorAddress": "0x..."
  },
  "summary": {
    "financialBehaviorScore": 860,
    "riskScore": 14,
    "riskTier": "Low",
    "confidenceLevel": "Medium",
    "activityLevel": "Normal",
    "totalCompletedVolumeUSDC": "128.50",
    "completedActions": 18,
    "lastActivity": "2026-06-24T10:00:00.000Z",
    "evidenceCount": 18
  }
}
```

## Examples

Example scripts live in `examples/risk-intelligence/`:

- `basic-profile.ts`
- `lightweight-check.ts`
- `agent-commerce-check.ts`
- `list-participants.ts`
- `risk-guard-basic.ts`
- `no-data-wallet.ts`
- `pre-transaction-check.ts`
- `risk-guard-unknown-wallet.ts`
- `threshold-helpers.ts`

They use `https://knowledge-exchange.fly.dev` by default. Set `RISK_API_BASE_URL` to use a
local server:

```bash
RISK_API_BASE_URL=http://localhost:3000
```

## Limitations

- Knowledge Exchange activity only.
- Preview model.
- Not an official Arc or Circle score.
- Not AML, KYC, sanctions, fraud or compliance screening.
- No authentication or API keys yet.
- No billing, rate limits or production SLA yet.
- Seed/demo participants are for public testnet preview only.

## Planned Data Sources

Planned: **Arc Network Activity Adapter**.

Future versions may enrich profiles with optional Arc Testnet wallet activity signals beyond
Knowledge Exchange events, such as wallet age, transaction count, unique counterparties, last
network activity, contract interaction count, estimated USDC activity and network activity level.
This is not implemented yet and does not imply official Arc/Circle coverage, all-wallet scoring or
AML/KYC/compliance screening.
