-- Adds nullable sentiment tracking without changing existing records.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_sentiment') THEN
    CREATE TYPE conversation_sentiment AS ENUM (
      'POSITIVO',
      'NEUTRO',
      'NEGATIVO'
    );
  END IF;
END $$;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS sentiment conversation_sentiment,
  ADD COLUMN IF NOT EXISTS sentiment_confidence numeric(5,4);

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS sentiment conversation_sentiment,
  ADD COLUMN IF NOT EXISTS sentiment_confidence numeric(5,4);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'conversations_sentiment_confidence_chk'
  ) THEN
    ALTER TABLE conversations
      ADD CONSTRAINT conversations_sentiment_confidence_chk
      CHECK (sentiment_confidence IS NULL OR sentiment_confidence BETWEEN 0 AND 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'messages_sentiment_confidence_chk'
  ) THEN
    ALTER TABLE messages
      ADD CONSTRAINT messages_sentiment_confidence_chk
      CHECK (sentiment_confidence IS NULL OR sentiment_confidence BETWEEN 0 AND 1);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS conversations_sentiment_idx
  ON conversations (sentiment);

CREATE INDEX IF NOT EXISTS messages_sentiment_idx
  ON messages (sentiment);

COMMENT ON TYPE conversation_sentiment IS 'Classified conversation sentiment: POSITIVO, NEUTRO, NEGATIVO.';
COMMENT ON COLUMN conversations.sentiment IS 'Latest conversation sentiment classified by Gemini.';
COMMENT ON COLUMN conversations.sentiment_confidence IS 'Gemini confidence score for the latest sentiment classification.';
COMMENT ON COLUMN messages.sentiment IS 'Sentiment classified for this message or interaction.';
COMMENT ON COLUMN messages.sentiment_confidence IS 'Gemini confidence score for this message sentiment.';

COMMIT;
