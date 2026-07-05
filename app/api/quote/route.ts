import OpenAI from "openai";
import { NextResponse } from "next/server";

type DailyQuote = {
  quote: string;
  author: string;
  reflection: string;
  date: string;
  source: "openai" | "fallback";
};

const fallbackQuotes = [
  {
    quote: "Chaque matin contient une porte discrete vers une vie plus vraie.",
    author: "KIMIA",
    reflection:
      "Choisis une seule chose a rendre plus claire aujourd'hui, puis avance sans bruit."
  },
  {
    quote: "La paix n'est pas l'absence de questions, mais l'art de marcher avec elles.",
    author: "KIMIA",
    reflection:
      "Observe ce qui insiste en toi sans le juger: une reponse commence souvent par l'ecoute."
  },
  {
    quote: "Ce que tu contemples avec patience finit par t'enseigner sa lumiere.",
    author: "KIMIA",
    reflection:
      "Laisse la journee te parler lentement avant de decider ce qu'elle signifie."
  },
  {
    quote: "Une ame attentive transforme l'ordinaire en commencement.",
    author: "KIMIA",
    reflection:
      "Ralentis devant le banal: il porte parfois la sagesse que le spectaculaire cache."
  }
];

let cachedQuote: DailyQuote | null = null;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function fallbackFor(date: string): DailyQuote {
  const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const selected = fallbackQuotes[seed % fallbackQuotes.length];

  return {
    ...selected,
    date,
    source: "fallback"
  };
}

function normalizeQuote(rawText: string, date: string): DailyQuote {
  const parsed = JSON.parse(rawText) as Partial<DailyQuote>;

  if (
    typeof parsed.quote !== "string" ||
    typeof parsed.author !== "string" ||
    typeof parsed.reflection !== "string"
  ) {
    throw new Error("Invalid quote payload");
  }

  return {
    quote: parsed.quote.trim(),
    author: parsed.author.trim(),
    reflection: parsed.reflection.trim(),
    date,
    source: "openai"
  };
}

export async function GET() {
  const date = todayKey();

  if (cachedQuote?.date === date) {
    return NextResponse.json(cachedQuote, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
      }
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackFor(date), {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300"
      }
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions:
        "Tu ecris des citations inspirees, philosophiques et lumineuses en francais. Reponds uniquement en JSON valide.",
      input: `Cree la citation du jour pour ${date}. Elle doit etre originale, profonde, courte, sans cliche, avec un auteur fictif ou 'KIMIA'. Retourne exactement ce JSON: {"quote":"...","author":"...","reflection":"..."}`,
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    cachedQuote = normalizeQuote(response.output_text, date);

    return NextResponse.json(cachedQuote, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
      }
    });
  } catch (error) {
    console.error("Unable to generate daily quote", error);

    return NextResponse.json(fallbackFor(date), {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300"
      }
    });
  }
}
