import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = JSON.parse(
  await readFile(new URL("../n8n/workflows/clinica-sorriso-feliz-whatsapp-ai-agent.json", import.meta.url), "utf8"),
);

test("n8n workflow contains the mandatory automation path", () => {
  const nodeNames = new Set(workflow.nodes.map((node) => node.name));

  for (const requiredNode of [
    "Evolution Webhook - Incoming WhatsApp",
    "Normalize Incoming Message",
    "IF - Ignore Bot or Empty Message",
    "Supabase - Get Active Conversation",
    "Gemini - Classify Intent",
    "Gemini - Generate Contextual Response",
    "Evolution API - Send WhatsApp Response",
    "Respond - Success",
  ]) {
    assert.ok(nodeNames.has(requiredNode), `Missing node: ${requiredNode}`);
  }
});

test("n8n workflow persists memory, intent, and messages", () => {
  const nodeNames = workflow.nodes.map((node) => node.name);

  assert.ok(nodeNames.some((name) => name.includes("Get Conversation History")), "Missing conversation history node");
  assert.ok(nodeNames.some((name) => name.includes("Build Memory Context")), "Missing memory context node");
  assert.ok(nodeNames.some((name) => name.includes("Store Inbound Message")), "Missing inbound persistence node");
  assert.ok(nodeNames.some((name) => name.includes("Store Outbound Message")), "Missing outbound persistence node");
  assert.ok(nodeNames.some((name) => name.includes("Update Conversation")), "Missing conversation status update node");
});

test("workflow classifies and persists sentiment", () => {
  const classifyNode = workflow.nodes.find((node) => node.name === "Gemini - Classify Intent");
  const parseNode = workflow.nodes.find((node) => node.name === "Parse Intent Classification");
  const updateConversationNode = workflow.nodes.find((node) => node.name === "Supabase - Update Conversation Status");
  const storeInboundNode = workflow.nodes.find((node) => node.name === "Supabase - Store Inbound Message");

  assert.match(classifyNode.parameters.jsonBody, /sentiment/);
  assert.match(classifyNode.parameters.jsonBody, /POSITIVO, NEUTRO, NEGATIVO/);
  assert.match(parseNode.parameters.jsCode, /allowedSentiments/);
  assert.match(updateConversationNode.parameters.jsonBody, /sentiment: \$json\.sentiment/);
  assert.match(storeInboundNode.parameters.jsonBody, /sentiment_confidence: \$json\.sentiment_confidence/);
});

test("workflow does not contain fake patient seed data", () => {
  const serialized = JSON.stringify(workflow);
  assert.equal(serialized.includes("5531999999999"), false);
  assert.equal(serialized.includes("Teste Evolution"), false);
});
