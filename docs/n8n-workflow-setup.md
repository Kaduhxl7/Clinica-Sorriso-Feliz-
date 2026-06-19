# n8n Workflow Setup

Workflow file:

- `n8n/workflows/clinica-sorriso-feliz-whatsapp-ai-agent.json`

## Required Environment Variables

Configure these in n8n Cloud before activating the workflow:

- `EVOLUTION_API_URL`: base URL of Evolution API, without trailing slash. Example: `https://evolution.example.com`
- `EVOLUTION_INSTANCE_NAME`: Evolution instance name for Clinica Sorriso Feliz.
- `EVOLUTION_API_KEY`: Evolution API key.
- `SUPABASE_URL`: Supabase project URL. Example: `https://xxxxx.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for server-side workflow writes.
- `GEMINI_API_KEY`: Google Gemini API key.

Optional:

- `MEMORY_MESSAGE_LIMIT`: number of previous messages used as memory context. Default: `12`.
- `EVOLUTION_SEND_DELAY_MS`: Evolution send delay in milliseconds. Default: `800`.

Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `EVOLUTION_API_KEY`, or `GEMINI_API_KEY` in the Next.js dashboard.

## Evolution Webhook Configuration

After importing and activating the workflow in n8n Cloud, copy the production webhook URL from the first node:

- Node: `Evolution Webhook - Incoming WhatsApp`
- HTTP method: `POST`
- Path: `clinica-sorriso-feliz/evolution/whatsapp`
- Production URL shape: `https://<your-n8n-cloud-domain>/webhook/clinica-sorriso-feliz/evolution/whatsapp`

Configure Evolution API to send message events to:

```text
POST https://<your-n8n-cloud-domain>/webhook/clinica-sorriso-feliz/evolution/whatsapp
```

Recommended Evolution webhook events:

- `MESSAGES_UPSERT`
- `messages.upsert`
- equivalent inbound message event for your Evolution API version

Recommended Evolution webhook body:

- full message payload
- `instance`
- `data.key.remoteJid`
- `data.key.fromMe`
- `data.key.id`
- `data.message`
- `data.pushName`
- `data.messageTimestamp`

The workflow ignores messages where `data.key.fromMe = true`, preventing reply loops from bot-sent messages.

## Workflow Behavior

The workflow performs this production sequence:

1. Receives WhatsApp message from Evolution API.
2. Normalizes remote JID, phone, text, message id, timestamp, and media fields.
3. Ignores bot-sent or empty messages.
4. Retrieves the active conversation from Supabase.
5. Creates a conversation when none is active.
6. Retrieves previous messages for memory.
7. Builds compact conversation context.
8. Classifies intent with Gemini 2.5 Flash.
9. Stores the inbound message in Supabase with classification metadata.
10. Updates conversation status and handoff fields.
11. Generates contextual AI response, or handoff acknowledgement when human support is needed.
12. Stores outbound message in Supabase.
13. Sends WhatsApp response through Evolution API.
14. Updates outbound delivery metadata.
15. Returns a JSON success response to Evolution.

## Error Handling and Retry Strategy

HTTP integrations have retry enabled:

- Supabase requests: 3 tries, 1 second between tries.
- Gemini requests: 3 tries, 1.5 seconds between tries.
- Evolution send request: 3 tries, 1.5 seconds between tries.

The workflow includes a disabled `Respond - Error` node as a placeholder for a dedicated n8n error workflow. For production, create a separate error workflow and set it in workflow settings to notify staff through email, Slack, WhatsApp, or another internal channel.

## Human Handoff Rules

Gemini classification returns:

- `intent`
- `confidence`
- `needs_human`
- `handoff_reason`
- `summary`

The workflow sets:

- `status = 'aguardando_humano'` when `needs_human = true` or `intent = 'HUMANO'`
- `human_requested_at = now()`
- `handoff_reason = Gemini handoff reason`

Human handoff is triggered for:

- explicit request for a person
- urgent symptoms or emergency-like language
- complaints
- sensitive medical context
- uncertainty
- anything outside the dental clinic assistant scope

## Supabase Requirements

Run the schema first:

- `supabase/migrations/001_ai_whatsapp_agent_schema.sql`

Required tables:

- `conversations`
- `messages`
- `conversation_metrics`

The workflow uses Supabase REST endpoints with the service role key.
