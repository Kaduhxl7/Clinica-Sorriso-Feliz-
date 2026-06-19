-- AI WhatsApp Agent for Clinica Sorriso Feliz
-- Supabase/PostgreSQL production schema
-- No mock or seed data is included.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_status') THEN
    CREATE TYPE conversation_status AS ENUM (
      'em_andamento',
      'aguardando_humano',
      'encerrada'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_intent') THEN
    CREATE TYPE conversation_intent AS ENUM (
      'AGENDAMENTO',
      'ORCAMENTO',
      'DUVIDA',
      'HUMANO'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_sender') THEN
    CREATE TYPE message_sender AS ENUM (
      'patient',
      'agent',
      'human',
      'system'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_direction') THEN
    CREATE TYPE message_direction AS ENUM (
      'inbound',
      'outbound',
      'internal'
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evolution_instance_id text NOT NULL,
  whatsapp_remote_jid text NOT NULL,
  patient_phone_e164 text NOT NULL,
  patient_name text,
  status conversation_status NOT NULL DEFAULT 'em_andamento',
  intent conversation_intent,
  intent_confidence numeric(5,4),
  assigned_human_name text,
  handoff_reason text,
  summary text,
  last_message_preview text,
  last_message_at timestamptz,
  started_at timestamptz NOT NULL DEFAULT now(),
  human_requested_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT conversations_phone_e164_format_chk
    CHECK (patient_phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  CONSTRAINT conversations_intent_confidence_chk
    CHECK (intent_confidence IS NULL OR intent_confidence BETWEEN 0 AND 1),
  CONSTRAINT conversations_handoff_required_chk
    CHECK (
      status <> 'aguardando_humano'
      OR intent = 'HUMANO'
      OR handoff_reason IS NOT NULL
    ),
  CONSTRAINT conversations_closed_at_required_chk
    CHECK (
      status <> 'encerrada'
      OR closed_at IS NOT NULL
    ),
  CONSTRAINT conversations_closed_at_after_started_chk
    CHECK (closed_at IS NULL OR closed_at >= started_at),
  CONSTRAINT conversations_human_requested_at_after_started_chk
    CHECK (human_requested_at IS NULL OR human_requested_at >= started_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS conversations_active_whatsapp_thread_uidx
  ON conversations (evolution_instance_id, whatsapp_remote_jid)
  WHERE status IN ('em_andamento', 'aguardando_humano');

CREATE INDEX IF NOT EXISTS conversations_status_idx
  ON conversations (status);

CREATE INDEX IF NOT EXISTS conversations_intent_idx
  ON conversations (intent);

CREATE INDEX IF NOT EXISTS conversations_patient_phone_idx
  ON conversations (patient_phone_e164);

CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx
  ON conversations (last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS conversations_created_at_idx
  ON conversations (created_at DESC);

DROP TRIGGER IF EXISTS trg_conversations_set_updated_at ON conversations;
CREATE TRIGGER trg_conversations_set_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  evolution_message_id text,
  sender message_sender NOT NULL,
  direction message_direction NOT NULL,
  body text,
  media_url text,
  media_mime_type text,
  message_type text NOT NULL DEFAULT 'text',
  ai_model text,
  ai_prompt_tokens integer,
  ai_completion_tokens integer,
  ai_total_tokens integer,
  ai_latency_ms integer,
  intent conversation_intent,
  intent_confidence numeric(5,4),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT messages_content_present_chk
    CHECK (body IS NOT NULL OR media_url IS NOT NULL),
  CONSTRAINT messages_token_counts_non_negative_chk
    CHECK (
      COALESCE(ai_prompt_tokens, 0) >= 0
      AND COALESCE(ai_completion_tokens, 0) >= 0
      AND COALESCE(ai_total_tokens, 0) >= 0
    ),
  CONSTRAINT messages_ai_latency_non_negative_chk
    CHECK (ai_latency_ms IS NULL OR ai_latency_ms >= 0),
  CONSTRAINT messages_intent_confidence_chk
    CHECK (intent_confidence IS NULL OR intent_confidence BETWEEN 0 AND 1),
  CONSTRAINT messages_delivery_order_chk
    CHECK (
      (delivered_at IS NULL OR delivered_at >= sent_at)
      AND (read_at IS NULL OR delivered_at IS NULL OR read_at >= delivered_at)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS messages_evolution_message_uidx
  ON messages (evolution_message_id)
  WHERE evolution_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS messages_conversation_sent_at_idx
  ON messages (conversation_id, sent_at ASC);

CREATE INDEX IF NOT EXISTS messages_direction_idx
  ON messages (direction);

CREATE INDEX IF NOT EXISTS messages_sender_idx
  ON messages (sender);

CREATE INDEX IF NOT EXISTS messages_intent_idx
  ON messages (intent);

CREATE INDEX IF NOT EXISTS messages_created_at_idx
  ON messages (created_at DESC);

CREATE INDEX IF NOT EXISTS messages_metadata_gin_idx
  ON messages USING gin (metadata);

DROP TRIGGER IF EXISTS trg_messages_set_updated_at ON messages;
CREATE TRIGGER trg_messages_set_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS conversation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
  inbound_messages_count integer NOT NULL DEFAULT 0,
  outbound_agent_messages_count integer NOT NULL DEFAULT 0,
  outbound_human_messages_count integer NOT NULL DEFAULT 0,
  total_messages_count integer NOT NULL DEFAULT 0,
  first_response_at timestamptz,
  first_response_seconds integer,
  average_agent_latency_ms integer,
  total_ai_prompt_tokens integer NOT NULL DEFAULT 0,
  total_ai_completion_tokens integer NOT NULL DEFAULT 0,
  total_ai_tokens integer NOT NULL DEFAULT 0,
  handoff_count integer NOT NULL DEFAULT 0,
  resolved_by_ai boolean NOT NULL DEFAULT false,
  resolution_seconds integer,
  last_calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT conversation_metrics_counts_non_negative_chk
    CHECK (
      inbound_messages_count >= 0
      AND outbound_agent_messages_count >= 0
      AND outbound_human_messages_count >= 0
      AND total_messages_count >= 0
      AND total_ai_prompt_tokens >= 0
      AND total_ai_completion_tokens >= 0
      AND total_ai_tokens >= 0
      AND handoff_count >= 0
    ),
  CONSTRAINT conversation_metrics_durations_non_negative_chk
    CHECK (
      first_response_seconds IS NULL OR first_response_seconds >= 0
    ),
  CONSTRAINT conversation_metrics_resolution_non_negative_chk
    CHECK (
      resolution_seconds IS NULL OR resolution_seconds >= 0
    ),
  CONSTRAINT conversation_metrics_average_latency_non_negative_chk
    CHECK (
      average_agent_latency_ms IS NULL OR average_agent_latency_ms >= 0
    )
);

CREATE INDEX IF NOT EXISTS conversation_metrics_last_calculated_at_idx
  ON conversation_metrics (last_calculated_at DESC);

CREATE INDEX IF NOT EXISTS conversation_metrics_resolved_by_ai_idx
  ON conversation_metrics (resolved_by_ai);

DROP TRIGGER IF EXISTS trg_conversation_metrics_set_updated_at ON conversation_metrics;
CREATE TRIGGER trg_conversation_metrics_set_updated_at
BEFORE UPDATE ON conversation_metrics
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION sync_conversation_after_message()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.sent_at,
    last_message_preview = CASE
      WHEN NEW.body IS NULL THEN '[' || NEW.message_type || ']'
      ELSE left(NEW.body, 240)
    END
  WHERE id = NEW.conversation_id;

  INSERT INTO conversation_metrics (
    conversation_id,
    inbound_messages_count,
    outbound_agent_messages_count,
    outbound_human_messages_count,
    total_messages_count,
    first_response_at,
    first_response_seconds,
    average_agent_latency_ms,
    total_ai_prompt_tokens,
    total_ai_completion_tokens,
    total_ai_tokens,
    last_calculated_at
  )
  SELECT
    c.id,
    COUNT(*) FILTER (WHERE m.direction = 'inbound')::integer,
    COUNT(*) FILTER (WHERE m.direction = 'outbound' AND m.sender = 'agent')::integer,
    COUNT(*) FILTER (WHERE m.direction = 'outbound' AND m.sender = 'human')::integer,
    COUNT(*)::integer,
    MIN(m.sent_at) FILTER (WHERE m.direction = 'outbound') AS first_response_at,
    CASE
      WHEN MIN(m.sent_at) FILTER (WHERE m.direction = 'outbound') IS NULL THEN NULL
      ELSE EXTRACT(
        EPOCH FROM (
          MIN(m.sent_at) FILTER (WHERE m.direction = 'outbound') - c.started_at
        )
      )::integer
    END AS first_response_seconds,
    AVG(m.ai_latency_ms) FILTER (WHERE m.ai_latency_ms IS NOT NULL)::integer,
    COALESCE(SUM(m.ai_prompt_tokens), 0)::integer,
    COALESCE(SUM(m.ai_completion_tokens), 0)::integer,
    COALESCE(SUM(m.ai_total_tokens), 0)::integer,
    now()
  FROM conversations c
  JOIN messages m ON m.conversation_id = c.id
  WHERE c.id = NEW.conversation_id
  GROUP BY c.id, c.started_at
  ON CONFLICT (conversation_id) DO UPDATE
  SET
    inbound_messages_count = EXCLUDED.inbound_messages_count,
    outbound_agent_messages_count = EXCLUDED.outbound_agent_messages_count,
    outbound_human_messages_count = EXCLUDED.outbound_human_messages_count,
    total_messages_count = EXCLUDED.total_messages_count,
    first_response_at = EXCLUDED.first_response_at,
    first_response_seconds = EXCLUDED.first_response_seconds,
    average_agent_latency_ms = EXCLUDED.average_agent_latency_ms,
    total_ai_prompt_tokens = EXCLUDED.total_ai_prompt_tokens,
    total_ai_completion_tokens = EXCLUDED.total_ai_completion_tokens,
    total_ai_tokens = EXCLUDED.total_ai_tokens,
    last_calculated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_sync_conversation_after_insert ON messages;
CREATE TRIGGER trg_messages_sync_conversation_after_insert
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION sync_conversation_after_message();

CREATE OR REPLACE FUNCTION sync_metrics_after_conversation_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'aguardando_humano'
     AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.human_requested_at IS DISTINCT FROM NEW.human_requested_at) THEN
    INSERT INTO conversation_metrics (conversation_id, handoff_count)
    VALUES (NEW.id, 1)
    ON CONFLICT (conversation_id) DO UPDATE
    SET
      handoff_count = conversation_metrics.handoff_count + 1,
      last_calculated_at = now();
  END IF;

  IF NEW.status = 'encerrada' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO conversation_metrics (
      conversation_id,
      resolved_by_ai,
      resolution_seconds,
      last_calculated_at
    )
    VALUES (
      NEW.id,
      NEW.human_requested_at IS NULL,
      GREATEST(EXTRACT(EPOCH FROM (NEW.closed_at - NEW.started_at))::integer, 0),
      now()
    )
    ON CONFLICT (conversation_id) DO UPDATE
    SET
      resolved_by_ai = EXCLUDED.resolved_by_ai,
      resolution_seconds = EXCLUDED.resolution_seconds,
      last_calculated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversations_sync_metrics_after_update ON conversations;
CREATE TRIGGER trg_conversations_sync_metrics_after_update
AFTER UPDATE OF status, human_requested_at, closed_at ON conversations
FOR EACH ROW
EXECUTE FUNCTION sync_metrics_after_conversation_update();

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read conversations" ON conversations;
CREATE POLICY "Authenticated users can read conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read messages" ON messages;
CREATE POLICY "Authenticated users can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read conversation metrics" ON conversation_metrics;
CREATE POLICY "Authenticated users can read conversation metrics"
  ON conversation_metrics
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE conversations IS 'One active or closed WhatsApp conversation handled by the AI agent or human team.';
COMMENT ON TABLE messages IS 'Inbound, outbound, and internal messages associated with a conversation.';
COMMENT ON TABLE conversation_metrics IS 'Aggregated operational and AI usage metrics for each conversation.';

COMMENT ON COLUMN conversations.status IS 'Conversation lifecycle: em_andamento, aguardando_humano, encerrada.';
COMMENT ON COLUMN conversations.intent IS 'Current classified intent: AGENDAMENTO, ORCAMENTO, DUVIDA, HUMANO.';
COMMENT ON COLUMN messages.metadata IS 'Raw or normalized metadata from Evolution API, n8n, Gemini, and delivery receipts.';

COMMIT;
