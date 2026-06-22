# SECTION 1 - Files to create

Created files:

- `docker-compose.yml`: local n8n stack with PostgreSQL, persistent volumes, health checks, restart policies, and workflow folder mount.
- `env/.env.example`: complete environment variable contract for local n8n, PostgreSQL, Evolution API, Supabase, Gemini, and the Next.js dashboard.
- `docs/local-n8n-architecture.md`: startup, import, and validation guide.

Existing workflow to import:

- `n8n/workflows/clinica-sorriso-feliz-whatsapp-ai-agent.json`

Local architecture:

```text
WhatsApp
  -> Evolution API local
  -> http://localhost:5678/webhook/clinica-sorriso-feliz/evolution/whatsapp
  -> n8n local container
  -> Gemini 2.5 Flash
  -> Supabase REST
  -> Next.js Dashboard

n8n local container
  -> PostgreSQL container for n8n internal data
  -> Docker volume clinica_n8n_data
  -> Docker volume clinica_n8n_postgres_data
```

# SECTION 2 - docker-compose.yml

The production-ready local compose file is at `docker-compose.yml`.

Services:

- `postgres`: PostgreSQL 16 dedicated to n8n internal data.
- `n8n`: local n8n instance exposed on `${N8N_PORT}:5678`.

Persistent volumes:

- `clinica_n8n_data`: n8n credentials, settings, binary data, and local runtime files.
- `clinica_n8n_postgres_data`: PostgreSQL database files for n8n.

Restart policies:

- Both services use `restart: unless-stopped`.

Health checks:

- PostgreSQL uses `pg_isready`.
- n8n checks `http://localhost:5678/healthz`.

Network:

- `clinica_n8n_local` bridge network.

# SECTION 3 - .env.example

The complete environment template is at `env/.env.example`.

Required variables for n8n:

- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_WEBHOOK_URL`
- `GENERIC_TIMEZONE`
- `N8N_ENCRYPTION_KEY`

Required variables for n8n PostgreSQL:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Required variables for Evolution API:

- `EVOLUTION_API_URL`
- `EVOLUTION_INSTANCE_NAME`
- `EVOLUTION_API_KEY`
- `EVOLUTION_SEND_DELAY_MS`

Required variables for Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Required variables for Gemini:

- `GEMINI_API_KEY`
- `MEMORY_MESSAGE_LIMIT`

Important URL rules:

- `SUPABASE_URL` must be the base URL, for example `https://project-ref.supabase.co`.
- Do not include `/rest/v1` in `SUPABASE_URL`.
- `N8N_WEBHOOK_URL` must end with `/`.
- If Evolution runs on the Windows host and n8n runs in Docker, n8n should call Evolution through `http://host.docker.internal:<evolution-port>`.

# SECTION 4 - Startup commands

1. Stop the temporary n8n container started with `docker run`:

```powershell
docker stop n8n
docker rm n8n
```

2. Create the real local env file:

```powershell
Copy-Item env\.env.example env\.env
```

3. Edit `.env` and set real values:

```powershell
notepad .env
```

4. Generate `N8N_ENCRYPTION_KEY` with Docker if OpenSSL is not installed locally:

```powershell
docker run --rm alpine sh -c "apk add --no-cache openssl >/dev/null && openssl rand -hex 32"
```

5. Start PostgreSQL first and wait for health:

```powershell
docker compose up -d postgres
docker compose ps
```

6. Start n8n:

```powershell
docker compose up -d n8n
docker compose ps
```

7. Watch logs:

```powershell
docker compose logs -f n8n
```

Startup order:

1. PostgreSQL starts first.
2. PostgreSQL health check must pass.
3. n8n starts after PostgreSQL is healthy.
4. n8n loads env vars and persistent data from Docker volume.
5. n8n exposes the UI at `http://localhost:5678`.
6. Evolution API should be configured after n8n is active.

Import workflow:

1. Open `http://localhost:5678`.
2. Complete the local n8n owner setup.
3. Go to `Workflows`.
4. Click `Import from File`.
5. Select `n8n/workflows/clinica-sorriso-feliz-whatsapp-ai-agent.json`.
6. Open the workflow.
7. Confirm every HTTP Request node references env vars with `$env`.
8. Save the workflow.
9. Activate the workflow.
10. Copy the production webhook URL from the webhook node.

Evolution webhook configuration:

```text
Method: POST
URL: http://localhost:5678/webhook/clinica-sorriso-feliz/evolution/whatsapp
Events: MESSAGES_UPSERT or messages.upsert
```

If Evolution runs in Docker and cannot reach `localhost`, use the n8n container network DNS or host address appropriate to your Evolution deployment.

# SECTION 5 - Validation checklist

Docker stack:

```powershell
docker compose ps
```

Expected:

- `postgres` is healthy.
- `n8n` is healthy or running.
- Port `5678` maps to local host.

n8n UI:

```powershell
Invoke-WebRequest -Uri http://localhost:5678 -UseBasicParsing
```

Expected:

- HTTP status `200`.

Evolution API connectivity from n8n container:

```powershell
docker compose exec n8n sh -lc 'wget -qO- "$EVOLUTION_API_URL"'
```

Expected:

- Evolution responds with HTTP content or an authentication error from Evolution.
- A connection refused or DNS error means `EVOLUTION_API_URL` is wrong for Docker networking.

Gemini connectivity from n8n container:

```powershell
docker compose exec n8n sh -lc 'wget -qO- "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"'
```

Expected:

- JSON response listing models, or a Google API JSON error that identifies key or permission issues.

Supabase REST connectivity from n8n container:

```powershell
docker compose exec n8n sh -lc 'wget -qO- --header="apikey: $SUPABASE_SERVICE_ROLE_KEY" --header="Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_URL/rest/v1/conversations?select=id&limit=1"'
```

Expected:

- JSON array.
- `[]` is valid when there are no conversations.
- `401` means the Supabase key is wrong.
- DNS or connection errors mean `SUPABASE_URL` is wrong.

Workflow webhook:

```powershell
Invoke-WebRequest -Uri http://localhost:5678/webhook/clinica-sorriso-feliz/evolution/whatsapp -Method POST -ContentType "application/json" -Body "{}"
```

Expected:

- n8n receives the request.
- Empty payload may return ignored or validation behavior depending on workflow activation.

Dashboard:

```powershell
npm run dev
```

Expected:

- Dashboard opens at `http://localhost:3000`.
- Login uses Supabase Auth.
- Realtime updates refresh conversations/messages after n8n writes to Supabase.
