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
  },
  {
    quote: "Se connaitre un peu mieux rend chaque choix moins bruyant.",
    author: "KIMIA",
    inspiration: "Inspiré de Socrate",
    reflection:
      "La vraie lucidite commence souvent par une question honnete posee a soi-meme."
  },
  {
    quote: "Ce qui passe ne t'enleve pas tout: parfois, cela te rend plus libre.",
    author: "KIMIA",
    inspiration: "Inspiré d'une sagesse persane",
    reflection:
      "Quand une emotion traverse, laisse-la passer sans lui offrir toute la maison."
  },
  {
    quote: "Le chemin devient plus clair quand tu avances avec ce que tu as, pas avec ce qui manque.",
    author: "KIMIA",
    inspiration: "Inspiré du Seigneur des anneaux",
    reflection:
      "Le courage se reconnait souvent dans les petits pas qui continuent malgre l'incertitude."
  },
  {
    quote: "Une journee difficile peut encore contenir un geste qui remet de la lumiere.",
    author: "KIMIA",
    inspiration: "Inspiré de Victor Hugo",
    reflection:
      "Cherche la petite action juste: elle peut rouvrir l'espace quand tout semble serre."
  },
  {
    quote: "Ce que tu choisis de nourrir finit par dessiner ton horizon.",
    author: "KIMIA",
    inspiration: "Inspiré d'un proverbe populaire",
    reflection:
      "Donne ton attention a ce qui t'aide a grandir, pas seulement a ce qui fait du bruit."
  },
  {
    quote: "La joie ne demande pas toujours plus; parfois elle demande seulement d'etre la.",
    author: "KIMIA",
    inspiration: "Inspiré d'Amelie Poulain",
    reflection:
      "Un detail simple peut changer la couleur d'une journee quand tu lui laisses une place."
  },
  {
    quote: "Avancer, ce n'est pas tout comprendre: c'est refuser de laisser la peur conduire seule.",
    author: "KIMIA",
    inspiration: "Inspiré de Matrix",
    reflection:
      "La clarte vient quand tu choisis de regarder ce qui t'endort au lieu de le subir."
  }
];

const quoteSourceDirections = [
  "une citation populaire de sagesse autour de 'connais-toi toi-meme', attribuee a Socrate",
  "une citation populaire de sagesse persane autour de l'idee 'cela aussi passera'",
  "Le Seigneur des anneaux, pour le courage discret et le poids du chemin",
  "Matrix, pour le reveil, le choix et la lucidite",
  "Le Voyage de Chihiro, pour la transformation douce et la memoire de soi",
  "Nelson Mandela, pour la patience, la liberte interieure et la perseverance",
  "Victor Hugo, pour la lumiere, la dignite et l'esperance",
  "Maya Angelou, pour l'estime de soi et la force calme",
  "la philosophie stoicienne, pour distinguer ce qui depend de nous",
  "la sagesse zen, pour le calme, l'attention et la simplicite",
  "un proverbe africain populaire, pour la communaute et le pas collectif",
  "un proverbe japonais populaire, pour la patience et la resilience",
  "Forrest Gump, pour la simplicite courageuse et l'optimisme",
  "Kung Fu Panda, pour l'apprentissage, l'humour et la confiance",
  "Ted Lasso, pour la gentillesse active et l'esprit d'equipe",
  "Amelie Poulain, pour la joie simple et les petits gestes lumineux",
  "Le Roi Lion, pour la responsabilite et le fait de retrouver sa place",
  "Harry Potter, pour le courage de choisir ce qui est juste",
  "L'Alchimiste, pour l'ecoute du chemin et le sens de la quete",
  "une citation populaire attribuee a Marc Aurele, pour la maitrise de soi",
  "une citation populaire attribuee a Confucius, pour apprendre pas a pas",
  "une citation populaire attribuee a Rumi, pour la transformation interieure"
];

const QUOTE_CRITERIA_VERSION = "broad-inspirations-v5";

let cachedQuote: DailyQuote | null = null;
let cachedQuoteKey: string | null = null;

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
  const sourceDirection = sourceDirectionFor(date, shouldBypassCache);

  if (!shouldBypassCache && cachedQuote?.date === date && cachedQuoteKey === quoteKey) {
    return NextResponse.json(cachedQuote, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
      }
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackFor(date, shouldBypassCache), {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300"
      }
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions:
        "Tu ecris des pensees inspirees, philosophiques et lumineuses en francais. Reponds uniquement en JSON valide.",
      input: `Cree la pensee du jour pour ${date}. Source a utiliser cette fois: ${sourceDirection}. La phrase doit etre originale, motivante, introspective et liee a la joie simple, la paix interieure, le courage calme, la clarte ou l'art de recommencer. Tu peux partir d'une citation populaire, d'un livre, d'un film, d'une serie, d'un personnage historique, d'un courant philosophique ou d'une culture du monde, mais tu dois varier les sources entre les generations. N'utilise pas Le Petit Prince dans cette generation, sauf demande explicite plus tard. N'ecris pas une citation exacte issue d'une oeuvre protegee; si tu reprends une citation populaire exacte, elle doit etre courte, ancienne, publique ou attribuee a un personnage historique. Sinon, cree une phrase nouvelle, courte et humaine dans l'esprit de la reference choisie. L'auteur doit etre 'KIMIA'. Pour inspiration, utilise une grammaire francaise correcte: "Inspiré du ...", "Inspiré de la ...", "Inspiré de l'...", "Inspiré des ...", ou "Inspiré de ..." selon le titre. Retourne exactement ce JSON: {"quote":"...","author":"KIMIA","inspiration":"Inspiré ...","reflection":"..."}`,
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

    return NextResponse.json(fallbackFor(date, shouldBypassCache), {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300"
      }
    });
  }
}
