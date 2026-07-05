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
    quote: "On avance mieux quand le tresor cherche devient une facon de regarder.",
    author: "KIMIA",
    inspiration: "Inspiré de l'Alchimiste",
    reflection:
      "Reste attentif au chemin: il sait parfois parler avant l'arrivee."
  },
  {
    quote: "Ce que tu fais avec patience finit par donner une forme a ton courage.",
    author: "KIMIA",
    inspiration: "Inspiré de Nelson Mandela",
    reflection:
      "La force n'est pas toujours spectaculaire: elle tient souvent dans ce qu'on recommence sans bruit."
  },
  {
    quote: "La clarte arrive quand tu cesses de te battre contre le moment present.",
    author: "KIMIA",
    inspiration: "Inspiré du stoicisme",
    reflection:
      "Observe ce qui depend de toi, puis laisse le reste perdre son poids."
  },
  {
    quote: "Le courage commence souvent par rester doux quand tout pousse a durcir.",
    author: "KIMIA",
    inspiration: "Inspiré de Forrest Gump",
    reflection:
      "Garde un geste simple et bon: il peut changer plus que tu ne crois."
  },
  {
    quote: "Grandir, c'est apprendre a regarder ses peurs sans leur donner le volant.",
    author: "KIMIA",
    inspiration: "Inspiré d'Inside Out",
    reflection:
      "Accueille ce qui traverse ton humeur: tout ne commande pas, beaucoup informe."
  },
  {
    quote: "La paix se fabrique dans les petits choix qu'on repete quand personne ne regarde.",
    author: "KIMIA",
    inspiration: "Inspiré de Kung Fu Panda",
    reflection:
      "Choisis le geste juste maintenant, puis laisse la suite respirer."
  },
  {
    quote: "Une equipe devient forte quand chacun ose apporter sa lumiere sans prendre toute la place.",
    author: "KIMIA",
    inspiration: "Inspiré de Ted Lasso",
    reflection:
      "La bonne humeur n'est pas naive quand elle aide les autres a tenir debout."
  },
  {
    quote: "Le bonheur n'est pas toujours une destination; parfois c'est le pas qu'on rend plus humain.",
    author: "KIMIA",
    inspiration: "Inspiré du Voyage de Chihiro",
    reflection:
      "Traverse la journee avec presence: ce qui semble flou peut devenir passage."
  },
  {
    quote: "Un esprit tranquille entend parfois ce que l'urgence essaie de couvrir.",
    author: "KIMIA",
    inspiration: "Inspiré de la sagesse zen",
    reflection:
      "Avant de forcer la reponse, accorde-toi assez de silence pour la reconnaitre."
  }
];

const QUOTE_CRITERIA_VERSION = "broad-inspirations-v4";

let cachedQuote: DailyQuote | null = null;
let cachedQuoteKey: string | null = null;

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

export async function GET() {
  const date = todayKey();
  const quoteKey = `${QUOTE_CRITERIA_VERSION}-${date}`;

  if (cachedQuote?.date === date && cachedQuoteKey === quoteKey) {
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
        "Tu ecris des pensees inspirees, philosophiques et lumineuses en francais. Reponds uniquement en JSON valide.",
      input: `Cree la pensee du jour pour ${date}. Elle doit etre originale, motivante, introspective et liee a la joie simple, la paix interieure, le courage calme, la clarte ou l'art de recommencer. Elle doit etre inspiree par une reference identifiable et populaire: livre, serie, film, personnage historique, courant philosophique ou culture du monde. N'ecris pas une citation exacte d'une oeuvre protegee; cree une phrase nouvelle, courte et humaine dans l'esprit de la reference choisie. L'auteur doit etre 'KIMIA'. Pour inspiration, utilise une grammaire francaise correcte: "Inspiré du ...", "Inspiré de la ...", "Inspiré de l'...", "Inspiré des ...", ou "Inspiré de ..." selon le titre. Retourne exactement ce JSON: {"quote":"...","author":"KIMIA","inspiration":"Inspiré ...","reflection":"..."}`,
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    cachedQuote = normalizeQuote(response.output_text, date);
    cachedQuoteKey = quoteKey;

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
