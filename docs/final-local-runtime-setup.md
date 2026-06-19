# SECTION 1 - Fixed .env

Arquivo gerado: `.env`

Valores validados:

- `N8N_WEBHOOK_URL=http://localhost:5678/`
- `EVOLUTION_API_URL=http://host.docker.internal:8080`
- `SUPABASE_URL=https://ugcmnmxktzsbtiibtelo.supabase.co`
- `NEXT_PUBLIC_SUPABASE_URL=https://ugcmnmxktzsbtiibtelo.supabase.co`
- `N8N_ENCRYPTION_KEY` gerado com 64 caracteres hexadecimais.
- `docker compose --env-file .env config` executou com sucesso.

Valores que exigem substituicao manual:

- `EVOLUTION_API_KEY=MANUAL_REPLACE_EVOLUTION_AUTHENTICATION_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY=MANUAL_REPLACE_SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY=MANUAL_REPLACE_GEMINI_API_KEY`

Conteudo final esperado:

```env
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_WEBHOOK_URL=http://localhost:5678/
GENERIC_TIMEZONE=America/Sao_Paulo
N8N_ENCRYPTION_KEY=<already-generated-in-.env>

POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=<already-set-in-.env>

EVOLUTION_API_URL=http://host.docker.internal:8080
EVOLUTION_INSTANCE_NAME=clinica-sorriso
EVOLUTION_API_KEY=MANUAL_REPLACE_EVOLUTION_AUTHENTICATION_API_KEY
EVOLUTION_SEND_DELAY_MS=800

SUPABASE_URL=https://ugcmnmxktzsbtiibtelo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=MANUAL_REPLACE_SUPABASE_SERVICE_ROLE_KEY

GEMINI_API_KEY=MANUAL_REPLACE_GEMINI_API_KEY
MEMORY_MESSAGE_LIMIT=12

NEXT_PUBLIC_SUPABASE_URL=https://ugcmnmxktzsbtiibtelo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<already-set-in-.env>
```

# SECTION 2 - Docker Startup

Pare o container temporario anterior, se ainda estiver rodando:

```powershell
docker stop n8n
docker rm n8n
```

Suba o PostgreSQL do n8n:

```powershell
docker compose up -d postgres
docker compose ps
```

Suba o n8n local:

```powershell
docker compose up -d n8n
docker compose ps
```

Veja os logs:

```powershell
docker compose logs -f n8n
```

Abra:

```text
http://localhost:5678
```

# SECTION 3 - n8n Setup

1. Abra `http://localhost:5678/setup`.
2. Crie o usuario owner local do n8n.
3. Va para `Workflows`.
4. Clique em `Import from File`.
5. Importe `n8n/workflows/clinica-sorriso-feliz-whatsapp-ai-agent.json`.
6. Salve o workflow.
7. Abra cada node HTTP principal e confirme que ele usa `$env`:
   - `EVOLUTION_API_URL`
   - `EVOLUTION_INSTANCE_NAME`
   - `EVOLUTION_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
8. Ative o workflow.
9. Copie a URL de producao do node `Evolution Webhook - Incoming WhatsApp`.

# SECTION 4 - Evolution Webhook Setup

Configure a Evolution API para enviar eventos ao n8n local:

```text
Method: POST
URL: http://localhost:5678/webhook/clinica-sorriso-feliz/evolution/whatsapp
Event: MESSAGES_UPSERT or messages.upsert
```

Como a Evolution API esta no Windows host:

- Browser e Evolution no host usam `http://localhost:5678`.
- n8n dentro do Docker usa `http://host.docker.internal:8080` para chamar a Evolution.

No `.env` da Evolution API, procure:

```env
AUTHENTICATION_API_KEY=
```

Copie esse valor para:

```env
EVOLUTION_API_KEY=MANUAL_REPLACE_EVOLUTION_AUTHENTICATION_API_KEY
```

# SECTION 5 - Testing Checklist

1. Validar Docker Compose:

```powershell
docker compose --env-file .env config
```

2. Validar containers:

```powershell
docker compose ps
```

Esperado:

- `clinica_n8n_postgres` running/healthy.
- `clinica_n8n` running/healthy.

3. Validar UI do n8n:

```powershell
Invoke-WebRequest -Uri http://localhost:5678 -UseBasicParsing
```

Esperado:

- HTTP `200`.

4. Validar Evolution no Windows host:

```powershell
Invoke-WebRequest -Uri http://localhost:8080 -UseBasicParsing
```

Esperado:

- HTTP `200` ou resposta HTTP da Evolution.

5. Validar Evolution a partir do container n8n:

```powershell
docker compose exec n8n sh -lc 'wget -qO- "$EVOLUTION_API_URL"'
```

Esperado:

- Resposta HTTP da Evolution.
- Se falhar com connection refused, a porta da Evolution nao e `8080`.

6. Validar Gemini a partir do container n8n:

```powershell
docker compose exec n8n sh -lc 'wget -qO- "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"'
```

Esperado:

- JSON de modelos.
- Se retornar erro de API key, substitua `GEMINI_API_KEY`.

7. Validar Supabase a partir do container n8n:

```powershell
docker compose exec n8n sh -lc 'wget -qO- --header="apikey: $SUPABASE_SERVICE_ROLE_KEY" --header="Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_URL/rest/v1/conversations?select=id&limit=1"'
```

Esperado:

- JSON array.
- `[]` e valido.
- `401` indica service role key errada.
- `403 permission denied for table` indica que falta rodar `supabase/migrations/003_grant_agent_dashboard_permissions.sql` no Supabase SQL Editor.

8. Validar webhook do workflow:

```powershell
Invoke-WebRequest -Uri http://localhost:5678/webhook/clinica-sorriso-feliz/evolution/whatsapp -Method POST -ContentType "application/json" -Body "{}"
```

Esperado:

- n8n recebe execucao.
- Payload vazio pode ser ignorado pelo workflow.

9. Teste end-to-end real:

- Envie mensagem pelo WhatsApp conectado.
- Evolution deve disparar webhook para n8n.
- n8n deve registrar conversa/mensagem no Supabase.
- Gemini deve classificar intencao.
- n8n deve enviar resposta via Evolution.
- Dashboard deve atualizar via Supabase Realtime.
