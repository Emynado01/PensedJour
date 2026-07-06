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

const riddleBank = [
  {
    question:
      "Dans Le Seigneur des anneaux, je suis minuscule, je brille, et je transforme tout le monde en mauvais collegue. Qui suis-je ?",
    answer: "L'anneau",
    inspiration: "Le Seigneur des anneaux"
  },
  {
    question:
      "Dans Matrix, je suis rouge ou bleue, mais je ne soigne aucun rhume. Je change juste ta facon de voir le monde. Qui suis-je ?",
    answer: "La pilule",
    inspiration: "Matrix"
  },
  {
    question:
      "Dans Harry Potter, je ne suis pas un plan RH, mais je choisis ta maison et parfois ton ego. Qui suis-je ?",
    answer: "Le Choixpeau",
    inspiration: "Harry Potter"
  },
  {
    question:
      "Dans Star Wars, je suis partout, mais impossible de me mettre en bouteille pour la pause cafe. Qui suis-je ?",
    answer: "La Force",
    inspiration: "Star Wars"
  },
  {
    question:
      "Dans Le Roi Lion, je veux dire: respire, avance, et arrete de ruminer comme si c'etait un metier. Qui suis-je ?",
    answer: "Hakuna Matata",
    inspiration: "Le Roi Lion"
  },
  {
    question:
      "Dans Inside Out, je prouve qu'une larme peut parfois faire mieux qu'un grand sourire force. Qui suis-je ?",
    answer: "La tristesse",
    inspiration: "Inside Out"
  },
  {
    question:
      "Dans Ted Lasso, je ressemble a un mot simple sur un panneau, mais je fais courir l'espoir plus vite qu'un coach. Qui suis-je ?",
    answer: "Believe",
    inspiration: "Ted Lasso"
  },
  {
    question:
      "Dans Toy Story, je suis une mission immense, meme quand on part d'une chambre d'enfant. Qui suis-je ?",
    answer: "Vers l'infini et au-dela",
    inspiration: "Toy Story"
  },
  {
    question:
      "Chez Socrate, je commence souvent par dire 'je ne sais pas', ce qui est pratique quand on n'a pas revise. Qui suis-je ?",
    answer: "La sagesse",
    inspiration: "Socrate"
  },
  {
    question:
      "Dans la culture japonaise, je repare les fissures avec de l'or au lieu de faire semblant qu'elles n'existent pas. Qui suis-je ?",
    answer: "Le kintsugi",
    inspiration: "Culture japonaise"
  },
  {
    question:
      "Avec Nelson Mandela, je demande du temps, du calme et une tete dure, mais je finis par ouvrir les portes. Qui suis-je ?",
    answer: "La perseverance",
    inspiration: "Nelson Mandela"
  },
  {
    question:
      "Chez les stoiciens, je ne controle ni la meteo ni les collegues, mais je peux controler ma réponse. Qui suis-je ?",
    answer: "Le jugement",
    inspiration: "Stoicisme"
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
