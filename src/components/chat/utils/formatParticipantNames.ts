import type { ChatParticipantSummary } from "../types/chat.types";

const build_full_name = (participant: ChatParticipantSummary): string => {
  const full_name = `${participant.name ?? ""} ${participant.last_name ?? ""}`.trim();
  if (full_name.length > 0) {
    return full_name;
  }
  if (participant.email?.trim()) {
    return participant.email.trim();
  }
  return "Usuario";
};

export const formatParticipantNames = (
  participants: ChatParticipantSummary[],
): string => {
  if (participants.length === 0) {
    return "Sin participantes";
  }
  return participants.map(build_full_name).join(", ");
};

