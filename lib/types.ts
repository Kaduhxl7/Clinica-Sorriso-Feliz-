export type ConversationStatus = "em_andamento" | "aguardando_humano" | "encerrada";
export type ConversationIntent = "AGENDAMENTO" | "ORCAMENTO" | "DUVIDA" | "HUMANO";
export type MessageSender = "patient" | "agent" | "human" | "system";
export type MessageDirection = "inbound" | "outbound" | "internal";

export type Conversation = {
  id: string;
  evolution_instance_id: string;
  whatsapp_remote_jid: string;
  patient_phone_e164: string;
  patient_name: string | null;
  status: ConversationStatus;
  intent: ConversationIntent | null;
  intent_confidence: number | null;
  assigned_human_name: string | null;
  handoff_reason: string | null;
  summary: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  started_at: string;
  human_requested_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  evolution_message_id: string | null;
  sender: MessageSender;
  direction: MessageDirection;
  body: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  message_type: string;
  ai_model: string | null;
  ai_prompt_tokens: number | null;
  ai_completion_tokens: number | null;
  ai_total_tokens: number | null;
  ai_latency_ms: number | null;
  intent: ConversationIntent | null;
  intent_confidence: number | null;
  metadata: Record<string, unknown>;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ConversationMetric = {
  id: string;
  conversation_id: string;
  inbound_messages_count: number;
  outbound_agent_messages_count: number;
  outbound_human_messages_count: number;
  total_messages_count: number;
  first_response_at: string | null;
  first_response_seconds: number | null;
  average_agent_latency_ms: number | null;
  total_ai_prompt_tokens: number;
  total_ai_completion_tokens: number;
  total_ai_tokens: number;
  handoff_count: number;
  resolved_by_ai: boolean;
  resolution_seconds: number | null;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation>;
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message>;
        Update: Partial<Message>;
      };
      conversation_metrics: {
        Row: ConversationMetric;
        Insert: Partial<ConversationMetric>;
        Update: Partial<ConversationMetric>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      conversation_status: ConversationStatus;
      conversation_intent: ConversationIntent;
      message_sender: MessageSender;
      message_direction: MessageDirection;
    };
  };
};

export type DashboardStats = {
  totalConversations: number;
  totalMessages: number;
  byDay: Array<{ day: string; total: number }>;
  messagesByDay: Array<{ day: string; total: number }>;
  growthByDay: Array<{ day: string; total: number }>;
  byIntent: Array<{ name: ConversationIntent | "SEM_INTENCAO"; value: number }>;
  byStatus: Array<{ name: ConversationStatus; value: number }>;
};
