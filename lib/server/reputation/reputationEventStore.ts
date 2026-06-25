import { randomUUID } from "crypto";
import type { ReputationEvent } from "@/types/reputation";

type ReputationStore = {
  events: ReputationEvent[];
};

const globalStore = globalThis as typeof globalThis & {
  knowledgeExchangeReputationStore?: ReputationStore;
};

const seedEvents: ReputationEvent[] = [
  {
    id: "seed-risk-agent-001",
    timestamp: "2026-06-24T10:00:00.000Z",
    walletAddress: "0xaaaa00000000000000000000000000000000a11a",
    counterpartyAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
    eventType: "RESOURCE_PURCHASE_STARTED",
    resourceId: "agent-financial-reputation-api-access-pack",
    amountUSDC: "25.00",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-risk-agent-002",
    timestamp: "2026-06-24T10:03:00.000Z",
    walletAddress: "0xaaaa00000000000000000000000000000000a11a",
    counterpartyAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
    eventType: "RESOURCE_PURCHASED",
    resourceId: "agent-financial-reputation-api-access-pack",
    txHash: `0x${"d".repeat(64)}`,
    amountUSDC: "25.00",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-risk-agent-003",
    timestamp: "2026-06-24T10:04:00.000Z",
    walletAddress: "0xaaaa00000000000000000000000000000000a11a",
    counterpartyAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
    eventType: "PAYMENT_VERIFIED",
    resourceId: "agent-financial-reputation-api-access-pack",
    txHash: `0x${"d".repeat(64)}`,
    amountUSDC: "25.00",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-risk-agent-004",
    timestamp: "2026-06-24T10:07:00.000Z",
    walletAddress: "0xaaaa00000000000000000000000000000000a11a",
    eventType: "RESOURCE_DOWNLOADED",
    resourceId: "agent-financial-reputation-api-access-pack",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-risk-agent-005",
    timestamp: "2026-06-24T11:30:00.000Z",
    walletAddress: "0xaaaa00000000000000000000000000000000a11a",
    counterpartyAddress: "0x5555555555555555555555555555555555555555",
    eventType: "ESCROW_FUNDED",
    requestId: "agent-governance-review-process",
    txHash: `0x${"e".repeat(64)}`,
    amountUSDC: "40.00",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-risk-agent-006",
    timestamp: "2026-06-24T13:10:00.000Z",
    walletAddress: "0xaaaa00000000000000000000000000000000a11a",
    counterpartyAddress: "0x5555555555555555555555555555555555555555",
    eventType: "FUNDS_RELEASED",
    requestId: "agent-governance-review-process",
    txHash: `0x${"f".repeat(64)}`,
    amountUSDC: "40.00",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-risk-human-001",
    timestamp: "2026-06-23T16:00:00.000Z",
    walletAddress: "0xbbbb00000000000000000000000000000000b22b",
    counterpartyAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
    eventType: "RESOURCE_PURCHASED",
    resourceId: "credit-card-fraud-detection-benchmark-package",
    txHash: `0x${"7".repeat(64)}`,
    amountUSDC: "18.00",
    metadata: {
      source: "preview_dataset",
      participantType: "human",
      participantName: "Ivan"
    }
  },
  {
    id: "seed-risk-human-002",
    timestamp: "2026-06-23T16:04:00.000Z",
    walletAddress: "0xbbbb00000000000000000000000000000000b22b",
    eventType: "RESOURCE_DOWNLOADED",
    resourceId: "credit-card-fraud-detection-benchmark-package",
    metadata: {
      source: "preview_dataset",
      participantType: "human",
      participantName: "Ivan"
    }
  },
  {
    id: "seed-risk-org-001",
    timestamp: "2026-06-24T09:00:00.000Z",
    walletAddress: "0xcccc00000000000000000000000000000000c33c",
    counterpartyAddress: "0x1111111111111111111111111111111111111111",
    eventType: "RESOURCE_PURCHASE_STARTED",
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    amountUSDC: "65.00",
    metadata: {
      source: "preview_dataset",
      participantType: "organization",
      participantName: "Autonomous Economy Lab",
      operatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc"
    }
  },
  {
    id: "seed-risk-org-002",
    timestamp: "2026-06-24T09:08:00.000Z",
    walletAddress: "0xcccc00000000000000000000000000000000c33c",
    counterpartyAddress: "0x2222222222222222222222222222222222222222",
    eventType: "RESOURCE_PURCHASE_STARTED",
    resourceId: "agent-financial-reputation-risk-benchmark",
    amountUSDC: "95.00",
    metadata: {
      source: "preview_dataset",
      participantType: "organization",
      participantName: "Autonomous Economy Lab",
      operatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc"
    }
  },
  {
    id: "seed-risk-org-003",
    timestamp: "2026-06-24T09:15:00.000Z",
    walletAddress: "0xcccc00000000000000000000000000000000c33c",
    eventType: "REQUEST_CANCELLED",
    requestId: "cancelled-agent-data-review",
    amountUSDC: "65.00",
    metadata: {
      source: "preview_dataset",
      participantType: "organization",
      participantName: "Autonomous Economy Lab",
      operatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc"
    }
  },
  {
    id: "seed-rep-001",
    timestamp: "2026-05-01T12:04:00.000Z",
    walletAddress: "0x8e0a1111111111111111111111111111111125be",
    counterpartyAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
    eventType: "RESOURCE_PURCHASED",
    resourceId: "agent-financial-reputation-risk-benchmark",
    txHash: `0x${"a".repeat(64)}`,
    amountUSDC: "95.00",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-rep-002",
    timestamp: "2026-05-01T12:05:20.000Z",
    walletAddress: "0x8e0a1111111111111111111111111111111125be",
    counterpartyAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
    eventType: "PAYMENT_VERIFIED",
    resourceId: "agent-financial-reputation-risk-benchmark",
    txHash: `0x${"a".repeat(64)}`,
    amountUSDC: "95.00",
    metadata: {
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-rep-003",
    timestamp: "2026-05-01T12:06:10.000Z",
    walletAddress: "0x8e0a1111111111111111111111111111111125be",
    eventType: "RESOURCE_DOWNLOADED",
    resourceId: "agent-financial-reputation-risk-benchmark",
    metadata: {
      filename: "agent_risk_scores.csv",
      source: "preview_dataset",
      participantType: "agent",
      participantName: "ResearchAgent-01",
      operatorAddress: "0xdddddddddddddddddddddddddddddddddddddddd"
    }
  },
  {
    id: "seed-rep-004",
    timestamp: "2026-05-01T13:15:00.000Z",
    walletAddress: "0x71ee222222222222222222222222222222224409",
    counterpartyAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
    eventType: "RESOURCE_PURCHASED",
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    txHash: `0x${"b".repeat(64)}`,
    amountUSDC: "65.00",
    metadata: {
      source: "preview_dataset",
      participantType: "organization",
      participantName: "Autonomous Economy Lab",
      operatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc"
    }
  },
  {
    id: "seed-rep-005",
    timestamp: "2026-05-01T13:16:42.000Z",
    walletAddress: "0x71ee222222222222222222222222222222224409",
    eventType: "RESOURCE_DOWNLOADED",
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    metadata: {
      filename: "agent_commerce_sample.csv",
      source: "preview_dataset",
      participantType: "organization",
      participantName: "Autonomous Economy Lab",
      operatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc"
    }
  },
  {
    id: "seed-rep-006",
    timestamp: "2026-05-01T14:20:00.000Z",
    walletAddress: "0x4444444444444444444444444444444444444444",
    eventType: "REQUEST_CREATED",
    requestId: "semantic-retrieval-pipeline-design",
    amountUSDC: "7.8",
    metadata: {
      source: "preview_dataset",
      participantType: "human",
      participantName: "Independent Researcher"
    }
  },
  {
    id: "seed-rep-007",
    timestamp: "2026-05-01T15:05:00.000Z",
    walletAddress: "0x4444444444444444444444444444444444444444",
    counterpartyAddress: "0x5555555555555555555555555555555555555555",
    eventType: "FUNDS_RELEASED",
    requestId: "semantic-retrieval-pipeline-design",
    txHash: `0x${"c".repeat(64)}`,
    amountUSDC: "7.8",
    metadata: { source: "preview_dataset" }
  },
  {
    id: "seed-rep-008",
    timestamp: "2026-05-01T16:30:00.000Z",
    walletAddress: "0x9999999999999999999999999999999999999999",
    eventType: "RESOURCE_PURCHASE_STARTED",
    resourceId: "agent-financial-reputation-risk-benchmark",
    amountUSDC: "95.00",
    metadata: { source: "preview_dataset" }
  },
  {
    id: "seed-rep-009",
    timestamp: "2026-05-01T16:32:00.000Z",
    walletAddress: "0x9999999999999999999999999999999999999999",
    eventType: "REQUEST_CANCELLED",
    requestId: "cancelled-risk-data-request",
    amountUSDC: "12.00",
    metadata: { source: "preview_dataset" }
  }
];

function getStore(): ReputationStore {
  if (!globalStore.knowledgeExchangeReputationStore) {
    globalStore.knowledgeExchangeReputationStore = { events: [...seedEvents] };
  }
  return globalStore.knowledgeExchangeReputationStore;
}

export function createReputationEvent(input: Omit<ReputationEvent, "id" | "timestamp"> & {
  id?: string;
  timestamp?: string;
}): ReputationEvent {
  return {
    ...input,
    id: input.id ?? randomUUID(),
    timestamp: input.timestamp ?? new Date().toISOString()
  };
}

export function appendEvent(event: ReputationEvent): ReputationEvent {
  const store = getStore();
  store.events.unshift(event);
  store.events = store.events.slice(0, 1000);
  return event;
}

export function getEvents(): ReputationEvent[] {
  return [...getStore().events];
}

export function getEventsByWallet(wallet: string): ReputationEvent[] {
  return getEvents().filter(
    (event) => event.walletAddress.toLowerCase() === wallet.toLowerCase()
  );
}

export function getRecentEvents(limit = 25): ReputationEvent[] {
  return getEvents().slice(0, Math.max(1, Math.min(limit, 100)));
}

export function trackReputationEvent(input: Omit<ReputationEvent, "id" | "timestamp">): ReputationEvent {
  return appendEvent(createReputationEvent(input));
}
