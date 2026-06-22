import type { ConversationSentiment } from "@/lib/types";

export const sentimentValues = ["POSITIVO", "NEUTRO", "NEGATIVO"] as const satisfies readonly ConversationSentiment[];

export function parseSentiment(value: unknown): ConversationSentiment {
  if (typeof value !== "string") return "NEUTRO";

  const normalized = value.trim().toUpperCase();
  return sentimentValues.includes(normalized as ConversationSentiment)
    ? (normalized as ConversationSentiment)
    : "NEUTRO";
}

export function clampConfidence(value: unknown): number {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.max(0, Math.min(1, numberValue));
}
