import type { ParticipantType } from "@/types/resource";

export type ApiParticipantType = ParticipantType | "unknown";

const labels: Record<ParticipantType, string> = {
  human: "Human",
  agent: "Agent",
  organization: "Organization"
};

export function getParticipantLabel(type?: ParticipantType | null): string {
  return type ? labels[type] : "Human";
}

export function getApiParticipantType(type?: ParticipantType | null): ApiParticipantType {
  return type ?? "unknown";
}

export function isParticipantType(value: unknown): value is ParticipantType {
  return value === "human" || value === "agent" || value === "organization";
}

export function getParticipantBadgeClass(type?: ParticipantType | null): string {
  if (type === "agent") {
    return "border-arc-blue/40 bg-arc-blue/10 text-arc-blue";
  }

  if (type === "organization") {
    return "border-purple-300/40 bg-purple-300/10 text-purple-100";
  }

  return "border-white/30 bg-white/10 text-white";
}
