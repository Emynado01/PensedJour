import { neon } from "@neondatabase/serverless";
import {
  DailyQuote,
  DailyRiddle,
  PublicContent,
  StoredAnswer,
  fallbackQuoteFor,
  isCorrectAnswer,
  riddleFor
} from "./kimia";

type Sql = ReturnType<typeof neon>;

type ContentRow = {
  id: string;
  cycle_key: string;
  quote: string;
  quote_author: string;
  quote_source: string;
  reflection: string;
  quote_date: string;
  riddle_question: string;
  riddle_answer: string;
  riddle_source: string;
};

type AnswerRow = {
  pseudo: string;
  answer: string;
  cycle_key: string;
  question: string;
  submitted_at: string;
};

let sqlClient: Sql | null = null;
let schemaReady: Promise<void> | null = null;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

async function ensureSchema() {
  if (schemaReady) {
    return schemaReady;
  }

  const sql = getSql();

  schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS kimia_daily_content (
        id BIGSERIAL PRIMARY KEY,
        cycle_key TEXT UNIQUE NOT NULL,
        quote TEXT NOT NULL,
        quote_author TEXT NOT NULL,
        quote_source TEXT NOT NULL,
        reflection TEXT NOT NULL,
        quote_date TEXT NOT NULL,
        riddle_question TEXT NOT NULL,
        riddle_answer TEXT NOT NULL,
        riddle_source TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kimia_riddle_answers (
        id BIGSERIAL PRIMARY KEY,
        content_id BIGINT NOT NULL REFERENCES kimia_daily_content(id) ON DELETE CASCADE,
        cycle_key TEXT NOT NULL,
        question TEXT NOT NULL,
        pseudo TEXT NOT NULL,
        answer TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS kimia_answers_content_correct_idx
      ON kimia_riddle_answers(content_id, is_correct, created_at)
    `;
  })();

  return schemaReady;
}

function contentRowToPublic(row: ContentRow, winningAnswer: StoredAnswer | null): PublicContent {
  return {
    id: row.id,
    cycleKey: row.cycle_key,
    quote: {
      quote: row.quote,
      author: row.quote_author,
      inspiration: row.quote_source,
      reflection: row.reflection,
      date: row.quote_date,
      source: "fallback"
    },
    riddle: {
      question: row.riddle_question,
      answer: row.riddle_answer,
      inspiration: row.riddle_source
    },
    winningAnswer
  };
}

function answerRowToStored(row: AnswerRow): StoredAnswer {
  return {
    pseudo: row.pseudo,
    answer: row.answer,
    cycleKey: row.cycle_key,
    question: row.question,
    submittedAt: row.submitted_at
  };
}

async function getWinningAnswer(contentId: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT pseudo, answer, cycle_key, question, created_at::TEXT AS submitted_at
    FROM kimia_riddle_answers
    WHERE content_id = ${contentId} AND is_correct = TRUE
    ORDER BY created_at ASC
    LIMIT 1
  `) as AnswerRow[];

  return rows[0] ? answerRowToStored(rows[0]) : null;
}

export async function getOrCreateContent(cycleKey: string): Promise<PublicContent> {
  await ensureSchema();

  const sql = getSql();
  const quote = fallbackQuoteFor(cycleKey);
  const riddle = riddleFor(cycleKey);

  await sql`
    INSERT INTO kimia_daily_content (
      cycle_key,
      quote,
      quote_author,
      quote_source,
      reflection,
      quote_date,
      riddle_question,
      riddle_answer,
      riddle_source
    )
    VALUES (
      ${cycleKey},
      ${quote.quote},
      ${quote.author},
      ${quote.inspiration},
      ${quote.reflection},
      ${quote.date},
      ${riddle.question},
      ${riddle.answer},
      ${riddle.inspiration}
    )
    ON CONFLICT (cycle_key) DO NOTHING
  `;

  const rows = (await sql`
    SELECT
      id,
      cycle_key,
      quote,
      quote_author,
      quote_source,
      reflection,
      quote_date,
      riddle_question,
      riddle_answer,
      riddle_source
    FROM kimia_daily_content
    WHERE cycle_key = ${cycleKey}
    LIMIT 1
  `) as ContentRow[];

  if (!rows[0]) {
    throw new Error("Unable to load daily content");
  }

  return contentRowToPublic(rows[0], await getWinningAnswer(rows[0].id));
}

export async function saveContent(cycleKey: string, quote: DailyQuote, riddle: DailyRiddle) {
  await ensureSchema();

  const sql = getSql();
  const rows = (await sql`
    INSERT INTO kimia_daily_content (
      cycle_key,
      quote,
      quote_author,
      quote_source,
      reflection,
      quote_date,
      riddle_question,
      riddle_answer,
      riddle_source
    )
    VALUES (
      ${cycleKey},
      ${quote.quote},
      ${quote.author},
      ${quote.inspiration},
      ${quote.reflection},
      ${quote.date || cycleKey},
      ${riddle.question},
      ${riddle.answer},
      ${riddle.inspiration}
    )
    ON CONFLICT (cycle_key) DO UPDATE SET
      quote = EXCLUDED.quote,
      quote_author = EXCLUDED.quote_author,
      quote_source = EXCLUDED.quote_source,
      reflection = EXCLUDED.reflection,
      quote_date = EXCLUDED.quote_date,
      riddle_question = EXCLUDED.riddle_question,
      riddle_answer = EXCLUDED.riddle_answer,
      riddle_source = EXCLUDED.riddle_source,
      updated_at = NOW()
    RETURNING
      id,
      cycle_key,
      quote,
      quote_author,
      quote_source,
      reflection,
      quote_date,
      riddle_question,
      riddle_answer,
      riddle_source
  `) as ContentRow[];

  if (!rows[0]) {
    throw new Error("Unable to save daily content");
  }

  return contentRowToPublic(rows[0], await getWinningAnswer(rows[0].id));
}

export async function resetContent(cycleKey: string) {
  await ensureSchema();

  const sql = getSql();
  await sql`
    DELETE FROM kimia_daily_content
    WHERE cycle_key = ${cycleKey}
  `;

  return getOrCreateContent(cycleKey);
}

export async function submitRiddleAnswer(cycleKey: string, pseudo: string, answer: string) {
  const content = await getOrCreateContent(cycleKey);
  const isCorrect = isCorrectAnswer(answer, content.riddle.answer);
  const sql = getSql();

  await sql`
    INSERT INTO kimia_riddle_answers (
      content_id,
      cycle_key,
      question,
      pseudo,
      answer,
      is_correct
    )
    VALUES (
      ${content.id},
      ${cycleKey},
      ${content.riddle.question},
      ${pseudo},
      ${answer},
      ${isCorrect}
    )
  `;

  return {
    isCorrect,
    content: await getOrCreateContent(cycleKey)
  };
}
