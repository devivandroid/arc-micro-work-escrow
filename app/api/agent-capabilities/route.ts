import { NextResponse } from "next/server";
import {
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_CHAIN_ID_HEX,
  ARC_TESTNET_RPC_URL,
  ARC_TESTNET_WS_URL
} from "@/lib/chains/arcTestnet";
import { usdcAddress } from "@/lib/contracts/microWorkEscrow";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    name: "Arc Knowledge Exchange Agent API",
    network: {
      name: "Arc Testnet",
      chainId: ARC_TESTNET_CHAIN_ID,
      chainIdHex: ARC_TESTNET_CHAIN_ID_HEX,
      rpcUrl: ARC_TESTNET_RPC_URL,
      wsUrl: ARC_TESTNET_WS_URL,
      nativeGasToken: "USDC",
      usdcAddress,
      usdcDecimals: 6
    },
    payment: {
      standard: "HTTP_402_USDC_TRANSFER",
      token: "USDC",
      tokenType: "ERC-20",
      settlement: "direct_transfer_to_seller",
      amountDecimals: 6,
      proof: {
        type: "Arc Testnet transaction hash",
        verification: "stateless_tx_receipt_check"
      }
    },
    risk_intelligence: true,
    risk_profile_endpoint: "/api/risk/profile/{wallet}",
    risk_summary_endpoint: "/api/risk/summary/{wallet}",
    risk_signals_endpoint: "/api/risk/signals/{wallet}",
    risk_guard: true,
    risk_guard_endpoint: "/api/risk/guard",
    pre_transaction_risk_checks: true,
    client_defined_risk_policy: true,
    no_data_profiles: true,
    unknown_wallet_behavior: ["allow", "review", "block"],
    risk_guard_default_unknown_wallet_behavior: "review",
    no_data_is_not_high_risk: true,
    participant_risk_profiles: true,
    behavioral_signals: true,
    confidence_levels: true,
    riskIntelligence: {
      service: "Knowledge Exchange Public Risk Intelligence Service",
      profileEndpoint: "/api/risk/profile/{wallet}",
      summaryEndpoint: "/api/risk/summary/{wallet}",
      signalsEndpoint: "/api/risk/signals/{wallet}",
      guardEndpoint: "/api/risk/guard",
      modelEndpoint: "/api/risk/model",
      participantsEndpoint: "/api/risk/participants",
      scope: "Knowledge Exchange activity only",
      noDataProfiles: true,
      unknownWalletBehavior: ["allow", "review", "block"],
      riskGuardDefaultUnknownWalletBehavior: "review",
      noDataIsNotHighRisk: true,
      limitations: [
        "Preview risk model",
        "Not an official Arc or Circle score",
        "No authentication yet",
        "No production-grade compliance screening"
      ]
    },
    capabilities: [
      {
        id: "search_resources",
        method: "GET",
        endpoint: "/api/resources/search",
        query: ["q", "resourceType", "category", "license", "agentConsumable"]
      },
      {
        id: "publish_resource",
        method: "POST",
        endpoint: "/api/resources/publish",
        requiredFields: [
          "title",
          "description",
          "resourceType",
          "priceUSDC",
          "license",
          "sellerAddress"
        ]
      },
      {
        id: "buy_resource_via_402",
        method: "GET",
        endpoint: "/api/resources/{id}",
        note: "Returns 402 Payment Required until a valid Arc Testnet USDC transfer proof is provided.",
        responseCodes: [200, 402, 404, 502]
      },
      {
        id: "downloadable_assets",
        method: "GET",
        endpoint: "/api/download/{resourceId}/{filename}",
        note: "Streams private resource files after txHash and buyerAddress pass payment verification.",
        features: ["authenticated_downloads", "file_metadata", "content_disposition_attachment"],
        responseCodes: [200, 402, 403, 404, 502]
      },
      {
        id: "query_wallet_risk",
        method: "GET",
        endpoint: "/api/risk/profile/{wallet}",
        legacyEndpoint: "/api/reputation/{wallet}",
        note: "Returns a preview Risk Intelligence profile and reputation signals based only on Knowledge Exchange activity.",
        responseCodes: [200, 400]
      },
      {
        id: "query_risk_summary",
        method: "GET",
        endpoint: "/api/risk/summary/{wallet}",
        note: "Returns a compact participant risk profile for lightweight integrations.",
        responseCodes: [200, 400]
      },
      {
        id: "query_risk_signals",
        method: "GET",
        endpoint: "/api/risk/signals/{wallet}",
        note: "Returns behavioral and risk signals for a participant wallet.",
        responseCodes: [200, 400]
      },
      {
        id: "evaluate_transaction_risk",
        method: "POST",
        endpoint: "/api/risk/guard",
        note: "Applies a client-defined Risk Guard policy before a transaction.",
        requiredFields: ["wallet", "policy"],
        responseCodes: [200, 400]
      },
      {
        id: "search_requests",
        method: "GET",
        endpoint: "/api/requests/search",
        query: ["q", "category", "license", "status", "agentConsumable"]
      },
      {
        id: "create_request_draft",
        method: "POST",
        endpoint: "/api/requests/create",
        requiredFields: [
          "title",
          "description",
          "requirements",
          "budgetUSDC",
          "license",
          "requesterAddress"
        ],
        optionalFields: ["participantType", "participantName", "operatorAddress"]
      },
      {
        id: "submit_request_delivery",
        method: "POST",
        endpoint: "/api/requests/{id}/submit",
        requiredFields: ["providerAddress", "deliveryText"],
        optionalFields: [
          "providerParticipantType",
          "providerParticipantName",
          "providerOperatorAddress"
        ]
      }
    ],
    limitations: [
      "No database yet.",
      "Server-side ephemeral storage may reset on restart.",
      "No authentication or API keys yet.",
      "No replay protection yet.",
      "Access proofs are unsigned preview tokens, not production authorization tokens.",
      "Escrow funding still requires wallet interaction.",
      "Arc Testnet only."
    ]
  });
}
