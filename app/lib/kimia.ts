export type DailyQuote = {
  quote: string;
  author: string;
  reflection: string;
  inspiration: string;
  date: string;
  source: "openai" | "fallback";
};

export type DailyRiddle = {
  question: string;
  answer: string;
  inspiration: string;
};

export type StoredAnswer = {
  pseudo: string;
  answer: string;
  cycleKey: string;
  question: string;
  submittedAt: string;
};

export type PublicContent = {
  id: string;
  cycleKey: string;
  quote: DailyQuote;
  riddle: DailyRiddle;
  winningAnswer: StoredAnswer | null;
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
    quote: "Science sans conscience n'est que ruine de l'âme.",
    author: "François Rabelais",
    inspiration: "Citation de François Rabelais",
    reflection:
      "Un rappel a relier competence, responsabilite et humanite."
  }
];

export const riddleBank: DailyRiddle[] = [
  {
    question:
      "Plus je sèche, plus je deviens mouillée. Qui suis-je ?",
    answer: "La serviette",
    inspiration: "Devinette classique"
  },
  {
    question:
      "J'ai des dents, mais je ne mange jamais. Qui suis-je ?",
    answer: "Le peigne",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Je cours sans jambes et je ne m'arrête jamais vraiment. Qui suis-je ?",
    answer: "L'eau",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Je peux remplir une pièce sans prendre de place. Qui suis-je ?",
    answer: "La lumière",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Je suis toujours devant toi, mais tu ne peux jamais me rattraper. Qui suis-je ?",
    answer: "L'avenir",
    inspiration: "Devinette classique"
  },
  {
    question:
      "On me casse avant de m'utiliser. Qui suis-je ?",
    answer: "L'oeuf",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Je grandis quand on me retire des morceaux. Qui suis-je ?",
    answer: "Un trou",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Je parle sans bouche et j'entends sans oreilles. Qui suis-je ?",
    answer: "L'écho",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Plus on en prend, plus on en laisse derrière soi. Qui suis-je ?",
    answer: "Les pas",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Je suis noir quand tu m'achètes, rouge quand tu m'utilises et gris quand tu me jettes. Qui suis-je ?",
    answer: "Le charbon",
    inspiration: "Devinette classique"
  },
  {
    question:
      "Dans Le Seigneur des anneaux, je suis petit, circulaire et capable de faire perdre la raison à ceux qui me désirent. Qui suis-je ?",
    answer: "L'anneau",
    inspiration: "Référence au Seigneur des anneaux"
  },
  {
    question:
      "Dans Matrix, je symbolise le choix entre rester dans l'illusion ou voir la réalité. Qui suis-je ?",
    answer: "La pilule rouge",
    inspiration: "Référence à Matrix"
  },
  {
    question:
      "Dans Star Wars, je relie les êtres vivants, guide certains héros et donne de très mauvais projets aux méchants. Qui suis-je ?",
    answer: "La Force",
    inspiration: "Référence à Star Wars"
  },
  {
    question:
      "Dans Harry Potter, je suis un vieux chapeau capable de décider dans quelle maison un élève va commencer son aventure. Qui suis-je ?",
    answer: "Le Choixpeau",
    inspiration: "Référence à Harry Potter"
  },
  {
    question:
      "Dans Le Roi Lion, je résume une philosophie simple: moins de souci, plus de vie. Qui suis-je ?",
    answer: "Hakuna Matata",
    inspiration: "Référence au Roi Lion"
  },
  {
    question:
      "Dans la tradition japonaise, je répare les fissures avec de l'or au lieu de les cacher. Qui suis-je ?",
    answer: "Le kintsugi",
    inspiration: "Culture japonaise"
  },
  {
    question:
      "Chez les stoïciens, je ne contrôle ni les événements ni la météo, mais je peux contrôler ma manière de répondre. Qui suis-je ?",
    answer: "Le jugement",
    inspiration: "Stoïcisme"
  },
  {
    question:
      "Dans Le Voyage de Chihiro, je peux être perdu, volé ou retrouvé; sans moi, on oublie qui l'on est. Qui suis-je ?",
    answer: "Le nom",
    inspiration: "Référence au Voyage de Chihiro"
  }
];

export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function riddleCycleKey(date: Date) {
  const cycleDate = new Date(date);

  if (date.getHours() < 23) {
    cycleDate.setDate(cycleDate.getDate() - 1);
  }

  return localDateKey(cycleDate);
}

export function seededIndex(value: string, length: number) {
  const seed = [...value].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return seed % length;
}

export function fallbackQuoteFor(cycleKey: string): DailyQuote {
  const selected = fallbackQuotes[seededIndex(cycleKey, fallbackQuotes.length)];

  return {
    ...selected,
    date: cycleKey,
    source: "fallback"
  };
}

export function riddleFor(cycleKey: string): DailyRiddle {
  return riddleBank[seededIndex(cycleKey, riddleBank.length)];
}

export function nextRiddle(currentQuestion = "", recentQuestions: string[] = []) {
  const availableRiddles = riddleBank.filter(
    (riddle) => riddle.question !== currentQuestion && !recentQuestions.includes(riddle.question)
  );
  const pool = availableRiddles.length > 0
    ? availableRiddles
    : riddleBank.filter((riddle) => riddle.question !== currentQuestion);
  const finalPool = pool.length > 0 ? pool : riddleBank;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(le|la|les|un|une|des|l)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordSet(value: string) {
  return new Set(normalizeText(value).split(" ").filter((word) => word.length > 2));
}

function levenshteinDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let lastDiagonal = previous[0];
    previous[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const insertion = previous[rightIndex] + 1;
      const deletion = previous[rightIndex - 1] + 1;
      const substitution = lastDiagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);

      lastDiagonal = previous[rightIndex];
      previous[rightIndex] = Math.min(insertion, deletion, substitution);
    }
  }

  return previous[right.length];
}

function similarity(left: string, right: string) {
  const longest = Math.max(left.length, right.length);

  if (longest === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(left, right) / longest;
}

export function isCorrectAnswer(userAnswer: string, expectedAnswer: string) {
  const user = normalizeText(userAnswer);
  const expected = normalizeText(expectedAnswer);

  if (user.length < 3 || expected.length < 3) {
    return false;
  }

  if (user === expected || user.includes(expected) || expected.includes(user)) {
    return true;
  }

  const userWords = wordSet(user);
  const expectedWords = wordSet(expected);
  const sharedWords = [...expectedWords].filter((word) => userWords.has(word));

  if (expectedWords.size > 0 && sharedWords.length / expectedWords.size >= 0.6) {
    return true;
  }

  return similarity(user, expected) >= 0.72;
}
