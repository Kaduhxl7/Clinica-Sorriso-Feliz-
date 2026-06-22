import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  conversationsPage: await readFile(new URL("../app/conversations/page.tsx", import.meta.url), "utf8"),
  dashboardCharts: await readFile(new URL("../components/dashboard-charts.tsx", import.meta.url), "utf8"),
  filters: await readFile(new URL("../components/conversation-filters.tsx", import.meta.url), "utf8"),
  statusBadge: await readFile(new URL("../components/status-badge.tsx", import.meta.url), "utf8"),
  conversationsTable: await readFile(new URL("../components/conversations-table.tsx", import.meta.url), "utf8"),
  queries: await readFile(new URL("../lib/supabase/queries.ts", import.meta.url), "utf8"),
  themeToggle: await readFile(new URL("../components/theme-toggle.tsx", import.meta.url), "utf8"),
};

test("dashboard keeps real Supabase data integration", () => {
  assert.match(files.queries, /from\("conversations"\)/);
  assert.match(files.queries, /from\("messages"\)/);
  assert.match(files.queries, /from\("conversation_metrics"\)/);
  assert.doesNotMatch(files.queries, /mock|fixture|seed/i);
});

test("conversation inbox exposes advanced filters", () => {
  for (const field of ["phone", "keyword", "status", "intent", "sentiment", "dateFrom", "dateTo", "humanOnly"]) {
    assert.match(files.filters, new RegExp(`name="${field}"`), `Missing filter field: ${field}`);
  }
  assert.match(files.conversationsPage, /humanOnly: filters\.humanOnly === "true"/);
  assert.match(files.conversationsPage, /sentiment,/);
  assert.match(files.queries, /query = query\.eq\("sentiment", params\.sentiment\)/);
});

test("analytics and theme differentials are present", () => {
  assert.match(files.dashboardCharts, /Mensagens por dia/);
  assert.match(files.dashboardCharts, /Crescimento/);
  assert.match(files.dashboardCharts, /Sentimento/);
  assert.match(files.dashboardCharts, /bySentiment/);
  assert.match(files.themeToggle, /localStorage/);
  assert.match(files.themeToggle, /prefers-color-scheme/);
});

test("dashboard renders sentiment information", () => {
  assert.match(files.statusBadge, /function SentimentBadge/);
  assert.match(files.conversationsTable, /<SentimentBadge sentiment=\{conversation\.sentiment\}/);
  assert.match(files.statusBadge, /Sem sentimento/);
});
