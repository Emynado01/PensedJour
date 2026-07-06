import OpenAI from "openai";
import { NextResponse } from "next/server";

type DailyQuote = {
  quote: string;
  author: string;
  reflection: string;
  inspiration: string;
  date: string;
  source: "openai" | "fallback";
};

const fallbackQuotes = [
  {
    quote: "Connais-toi toi-même.",
    author: "Socrate",
    inspiration: "Citation attribuée à Socrate",
    reflection:
      "Une phrase courte pour revenir a soi avant de chercher trop loin."
  },
  {
    quote: "Le bonheur dépend de nous.",
    author: "Aristote",
    inspiration: "Citation attribuée à Aristote",
    reflection:
      "Elle rappelle que la joie se travaille aussi dans nos choix ordinaires."
  },
  {
    quote: "Ce qui ne me tue pas me rend plus fort.",
    author: "Friedrich Nietzsche",
    inspiration: "Citation de Friedrich Nietzsche",
    reflection:
      "Une pensee directe sur la resilience et la transformation par l'epreuve."
  },
  {
    quote: "Il faut cultiver notre jardin.",
    author: "Voltaire",
    inspiration: "Citation de Voltaire",
    reflection:
      "Une invitation a revenir au concret, au soin et a l'action utile."
  },
  {
    quote: "Ose savoir !",
    author: "Emmanuel Kant",
    inspiration: "Citation d'Emmanuel Kant",
    reflection:
      "Une formule breve pour encourager la lucidite et l'autonomie."
  },
  {
    quote: "Aide-toi, le ciel t'aidera.",
    author: "Jean de La Fontaine",
    inspiration: "Citation de Jean de La Fontaine",
    reflection:
      "Elle valorise l'initiative, meme quand le resultat semble encore loin."
  },
  {
    quote: "Rien ne sert de courir; il faut partir à point.",
    author: "Jean de La Fontaine",
    inspiration: "Citation de Jean de La Fontaine",
    reflection:
      "Un rappel simple: la regularite peut valoir mieux que la precipitation."
  },
  {
    quote: "Un voyage de mille lieues commence toujours par un premier pas.",
    author: "Lao Tseu",
    inspiration: "Citation attribuée à Lao Tseu",
    reflection:
      "Elle remet les grands objectifs a la taille du prochain geste."
  },
  {
    quote: "La simplicité est la sophistication suprême.",
    author: "Léonard de Vinci",
    inspiration: "Citation attribuée à Léonard de Vinci",
    reflection:
      "Une phrase utile pour chercher la justesse plutot que l'exces."
  },
  {
    quote: "Tout ce que je sais, c'est que je ne sais rien.",
    author: "Socrate",
    inspiration: "Citation attribuée à Socrate",
    reflection:
      "Une bonne porte d'entree vers l'humilite et l'apprentissage."
  },
  {
    quote: "La vie est un sommeil, l'amour en est le rêve.",
    author: "Alfred de Musset",
    inspiration: "Citation d'Alfred de Musset",
    reflection:
      "Une phrase poetique pour garder une place a la douceur."
  },
  {
    quote: "Le doute est le commencement de la sagesse.",
    author: "Aristote",
    inspiration: "Citation attribuée à Aristote",
    reflection:
      "Elle transforme l'incertitude en point de depart, pas en faiblesse."
  },
  {
    quote: "La patience est amère, mais son fruit est doux.",
    author: "Jean-Jacques Rousseau",
    inspiration: "Citation attribuée à Jean-Jacques Rousseau",
    reflection:
      "Elle encourage a tenir sans confondre lenteur et immobilite."
  },
  {
    quote: "Il n'y a point de génie sans un grain de folie.",
    author: "Aristote",
    inspiration: "Citation attribuée à Aristote",
    reflection:
      "Une phrase pour laisser un peu de place a l'audace."
  },
  {
    quote: "L'homme est né libre, et partout il est dans les fers.",
    author: "Jean-Jacques Rousseau",
    inspiration: "Citation de Jean-Jacques Rousseau",
    reflection:
      "Elle invite a interroger les habitudes qui enferment."
  },
  {
    quote: "Science sans conscience n'est que ruine de l'âme.",
    author: "François Rabelais",
    inspiration: "Citation de François Rabelais",
    reflection:
      "Un rappel a relier competence, responsabilite et humanite."
  }
];

const quoteSourceDirections = [
  "une citation exacte de Socrate ou attribuee a Socrate",
  "une citation exacte d'Aristote ou attribuee a Aristote",
  "une citation exacte de Marc Aurele",
  "une citation exacte d'Epictete",
  "une citation exacte de Seneque",
  "une citation exacte de Confucius",
  "une citation exacte de Lao Tseu ou attribuee a Lao Tseu",
  "une citation exacte de Rumi ou attribuee a Rumi",
  "une citation exacte de Victor Hugo",
  "une citation exacte de Voltaire",
  "une citation exacte de Jean de La Fontaine",
  "une citation exacte de Montaigne",
  "une citation exacte de Blaise Pascal",
  "une citation exacte de Friedrich Nietzsche",
  "une citation exacte de Jean-Jacques Rousseau",
  "une citation exacte de Francois Rabelais",
  "une citation exacte de Baruch Spinoza",
  "une citation exacte d'Emmanuel Kant",
  "un proverbe africain connu, mot pour mot",
  "un proverbe japonais connu, mot pour mot",
  "un proverbe chinois connu, mot pour mot",
  "un proverbe persan connu, mot pour mot"
];

const QUOTE_CRITERIA_VERSION = "exact-existing-quotes-v1";

let cachedQuote: DailyQuote | null = null;
let cachedQuoteKey: string | null = null;

const dailyCacheHeaders = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
};

const shortFallbackCacheHeaders = {
  "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300"
};

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store"
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function fallbackFor(date: string, shouldUseRandomQuote = false): DailyQuote {
  const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = shouldUseRandomQuote
    ? Math.floor(Math.random() * fallbackQuotes.length)
    : seed % fallbackQuotes.length;
  const selected = fallbackQuotes[index];

  return {
    ...selected,
    date,
    source: "fallback"
  };
}

function sourceDirectionFor(date: string, shouldBypassCache: boolean) {
  if (shouldBypassCache) {
    return quoteSourceDirections[Math.floor(Math.random() * quoteSourceDirections.length)];
  }

  const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return quoteSourceDirections[seed % quoteSourceDirections.length];
}

function cleanInspiration(value: string) {
  return value
    .trim()
    .replace(/^Inspire(?:e|é)? de Le /i, "Inspiré du ")
    .replace(/^Inspire(?:e|é)? de Les /i, "Inspiré des ")
    .replace(/^Inspire(?:e|é)? de L'/i, "Inspiré de l'")
    .replace(/^Inspire(?:e|é)? de La /i, "Inspiré de la ")
    .replace(/^Inspire(?:e|é)? de Un /i, "Inspiré d'un ")
    .replace(/^Inspire(?:e|é)? de Une /i, "Inspiré d'une ")
    .replace(/^Inspire(?:e|é)? de ([AEIOUYH])/i, "Inspiré d'$1")
    .replace(/^Inspire(?:e|é)? de /i, "Inspiré de ")
    .replace(/^Inspire(?:e|é)? du /i, "Inspiré du ")
    .replace(/^Inspire(?:e|é)? des /i, "Inspiré des ");
}

function normalizeQuote(rawText: string, date: string): DailyQuote {
  const parsed = JSON.parse(rawText) as Partial<DailyQuote>;

  if (
    typeof parsed.quote !== "string" ||
    typeof parsed.author !== "string" ||
    typeof parsed.reflection !== "string" ||
    typeof parsed.inspiration !== "string"
  ) {
    throw new Error("Invalid quote payload");
  }

  return {
    quote: parsed.quote.trim(),
    author: parsed.author.trim(),
    reflection: parsed.reflection.trim(),
    inspiration: cleanInspiration(parsed.inspiration),
    date,
    source: "openai"
  };
}

export async function GET(request: Request) {
  const date = todayKey();
  const quoteKey = `${QUOTE_CRITERIA_VERSION}-${date}`;
  const shouldBypassCache = new URL(request.url).searchParams.get("fresh") === "1";
  const responseHeaders = shouldBypassCache ? noStoreHeaders : dailyCacheHeaders;
  const sourceDirection = sourceDirectionFor(date, shouldBypassCache);

  if (!shouldBypassCache && cachedQuote?.date === date && cachedQuoteKey === quoteKey) {
    return NextResponse.json(cachedQuote, {
      headers: dailyCacheHeaders
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackFor(date, shouldBypassCache), {
      headers: shouldBypassCache ? noStoreHeaders : shortFallbackCacheHeaders
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions:
        "Tu selectionnes des citations existantes en francais, mot pour mot, sans les modifier. Reponds uniquement en JSON valide.",
      input: `Trouve la citation du jour pour ${date}. Source a utiliser cette fois: ${sourceDirection}. Tu dois retourner une citation deja existante, mot pour mot, sans reformulation, sans adaptation et sans phrase inventee. La citation doit etre courte, motivante, introspective ou liee au bonheur, a la paix interieure, au courage, a la clarte ou a l'art de recommencer. Utilise uniquement des citations du domaine public, des proverbes connus ou des auteurs/personnages historiques anciens. Evite les citations issues de films, series, livres modernes ou oeuvres encore protegees. Le champ "quote" doit contenir seulement la citation exacte. Le champ "author" doit contenir l'auteur reel ou "Proverbe". Le champ "inspiration" doit indiquer "Citation de ...", "Citation attribuée à ..." ou "Proverbe ...". Le champ "reflection" peut contenir une courte phrase originale de contexte, mais ne doit pas modifier la citation. Retourne exactement ce JSON: {"quote":"...","author":"...","inspiration":"...","reflection":"..."}`,
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    const generatedQuote = normalizeQuote(response.output_text, date);

    if (!shouldBypassCache) {
      cachedQuote = generatedQuote;
      cachedQuoteKey = quoteKey;
    }

    return NextResponse.json(generatedQuote, {
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Unable to generate daily quote", error);

    return NextResponse.json(fallbackFor(date, shouldBypassCache), {
      headers: shouldBypassCache ? noStoreHeaders : shortFallbackCacheHeaders
    });
  }
}
