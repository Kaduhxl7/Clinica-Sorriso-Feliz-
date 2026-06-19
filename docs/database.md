# Database Documentation

Project: AI WhatsApp Agent for Clinica Sorriso Feliz

Stack flow: WhatsApp -> Evolution API -> n8n Cloud -> Gemini 2.5 Flash -> Supabase -> Next.js Dashboard

The schema is implemented in `supabase/migrations/001_ai_whatsapp_agent_schema.sql`. It contains no mock data.

## Required Credentials

No credential is required to create these files. To run the system in production, you will need:

- Supabase project URL
- Supabase service role key for n8n server-side writes
- Supabase anon key for the Next.js client dashboard
- Evolution API base URL, instance name/id, and API key
- Gemini API key
- n8n webhook production URL

Never expose the Supabase service role key or Evolution API key in the browser.

## Enum Types

### conversation_status

- `em_andamento`: AI agent is actively handling the conversation.
- `aguardando_humano`: conversation needs manual attendance.
- `encerrada`: conversation is closed.

### conversation_intent

- `AGENDAMENTO`: patient wants to schedule or reschedule.
- `ORCAMENTO`: patient asks about prices, estimates, plans, or payment.
- `DUVIDA`: patient asks a general question.
- `HUMANO`: patient requested human support or AI should escalate.

### message_sender

- `patient`
- `agent`
- `human`
- `system`

### message_direction

- `inbound`
- `outbound`
- `internal`

## Table: conversations

Stores one WhatsApp conversation lifecycle.

Key columns:

- `id`: UUID primary key.
- `evolution_instance_id`: Evolution API instance identifier.
- `whatsapp_remote_jid`: WhatsApp chat identifier from Evolution API.
- `patient_phone_e164`: patient phone in E.164 format, for example `+5511999999999`.
- `patient_name`: optional name captured from WhatsApp profile, AI extraction, or dashboard edit.
- `status`: lifecycle status.
- `intent`: latest classified intent.
- `intent_confidence`: confidence score from Gemini or n8n classification logic, from `0` to `1`.
- `assigned_human_name`: staff member handling the conversation, when escalated.
- `handoff_reason`: reason for escalation.
- `summary`: short AI-generated summary for the dashboard.
- `last_message_preview`: latest message preview for list screens.
- `last_message_at`: latest message timestamp.
- `started_at`: conversation start timestamp.
- `human_requested_at`: escalation timestamp.
- `closed_at`: closure timestamp.
- `created_at`, `updated_at`: audit timestamps.

Important constraints:

- `patient_phone_e164` must be valid E.164 format.
- `intent_confidence` must be between `0` and `1`.
- `encerrada` requires `closed_at`.
- `aguardando_humano` requires `intent = HUMANO` or `handoff_reason`.

Important indexes:

- Unique active thread per `evolution_instance_id + whatsapp_remote_jid` while status is `em_andamento` or `aguardando_humano`.
- Status, intent, patient phone, last message, and creation date indexes.

## Table: messages

Stores all patient, AI, human, and system messages.

Key columns:

- `id`: UUID primary key.
- `conversation_id`: foreign key to `conversations`.
- `evolution_message_id`: Evolution API message id; unique when present.
- `sender`: `patient`, `agent`, `human`, or `system`.
- `direction`: `inbound`, `outbound`, or `internal`.
- `body`: text content.
- `media_url`, `media_mime_type`: media support for audio, images, PDFs, etc.
- `message_type`: channel message type, default `text`.
- `ai_model`: model used, for example `gemini-2.5-flash`.
- `ai_prompt_tokens`, `ai_completion_tokens`, `ai_total_tokens`: token accounting when available.
- `ai_latency_ms`: Gemini response latency.
- `intent`, `intent_confidence`: intent detected for that specific message.
- `metadata`: JSONB field for Evolution API payload fragments, Gemini safety metadata, n8n execution id, or delivery details.
- `sent_at`, `delivered_at`, `read_at`: message timeline.
- `created_at`, `updated_at`: audit timestamps.

Important constraints:

- Each message must have `body` or `media_url`.
- AI token and latency values cannot be negative.
- Delivery timestamps must be chronologically valid.

Important indexes:

- Unique Evolution message id.
- Conversation timeline index on `conversation_id, sent_at`.
- Sender, direction, intent, created date, and JSONB metadata GIN indexes.

## Table: conversation_metrics

Stores one aggregate metrics row per conversation.

Key columns:

- `conversation_id`: unique foreign key to `conversations`.
- `inbound_messages_count`: patient message count.
- `outbound_agent_messages_count`: AI agent response count.
- `outbound_human_messages_count`: human staff response count.
- `total_messages_count`: total message count.
- `first_response_at`: first outbound response timestamp.
- `first_response_seconds`: seconds from `started_at` to first outbound response.
- `average_agent_latency_ms`: average AI latency.
- `total_ai_prompt_tokens`, `total_ai_completion_tokens`, `total_ai_tokens`: aggregate AI usage.
- `handoff_count`: escalation count.
- `resolved_by_ai`: true when closed without human handoff.
- `resolution_seconds`: seconds from start to close.
- `last_calculated_at`: last metrics recalculation timestamp.
- `created_at`, `updated_at`: audit timestamps.

Metrics are automatically updated by database triggers after inserts into `messages` and relevant updates to `conversations`.

## Security Model

Row Level Security is enabled on all three tables.

Default policy:

- Authenticated users can read rows for dashboard display.
- Writes should be performed from n8n using the Supabase service role key, which bypasses RLS.

For multi-clinic production use, add a `clinic_id` tenant column and replace the broad read policies with tenant-scoped policies.

## Deployment Order

1. Open Supabase SQL Editor.
2. Run `supabase/migrations/001_ai_whatsapp_agent_schema.sql`.
3. Store Supabase URL and keys in n8n credentials.
4. Store Supabase anon key and URL in Next.js environment variables.
5. Confirm the Next.js dashboard uses authenticated Supabase sessions for reads.
