"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type DailyQuote = {
  quote: string;
  author: string;
  reflection: string;
  inspiration: string;
  date: string;
  source: "openai" | "fallback";
};

type StoredAnswer = {
  pseudo: string;
  answer: string;
  cycleKey: string;
  question: string;
  submittedAt: string;
};

const fallbackQuote: DailyQuote = {
  quote: "On avance mieux quand le tresor cherche devient une facon de regarder.",
  author: "KIMIA",
  inspiration: "Inspiré de l'Alchimiste",
  reflection:
    "Reste attentif au chemin: il sait parfois parler avant l'arrivee.",
  date: new Date().toISOString().slice(0, 10),
  source: "fallback"
};

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
      "Chez les stoiciens, je ne controle ni la meteo ni les collegues, mais je peux controler ma reponse. Qui suis-je ?",
    answer: "Le jugement",
    inspiration: "Stoicisme"
  }
];

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function riddleCycleKey(date: Date) {
  const cycleDate = new Date(date);

  if (date.getHours() < 23) {
    cycleDate.setDate(cycleDate.getDate() - 1);
  }

  return localDateKey(cycleDate);
}

function riddleFor(cycleKey: string) {
  const seed = [...cycleKey].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return riddleBank[seed % riddleBank.length];
}

function normalizeText(value: string) {
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

function isCorrectAnswer(userAnswer: string, expectedAnswer: string) {
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

export default function Home() {
  const [quote, setQuote] = useState<DailyQuote>(fallbackQuote);
  const [now, setNow] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionBubble, setShowQuestionBubble] = useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [answer, setAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [storedAnswers, setStoredAnswers] = useState<StoredAnswer[]>([]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${quote.date}T12:00:00`));
  }, [quote.date]);

  const cycleKey = useMemo(() => riddleCycleKey(now), [now]);
  const riddle = useMemo(() => riddleFor(cycleKey), [cycleKey]);
  const answersStorageKey = `kimia-riddle-answers-v4-${cycleKey}`;
  const isQuestionPhase = now.getHours() >= 23 || now.getHours() < 13;
  const winningAnswer = useMemo(() => {
    return storedAnswers.find((entry) => isCorrectAnswer(entry.answer, riddle.answer)) ?? null;
  }, [riddle.answer, storedAnswers]);
  const hasCorrectAnswer = Boolean(winningAnswer);
  const bubbleState = isQuestionPhase ? "question" : hasCorrectAnswer ? "found" : "missed";
  const bubbleIcon = isQuestionPhase ? "?" : hasCorrectAnswer ? "👍" : "😕";
  const bubbleLabel = isQuestionPhase
    ? "Ouvrir la devinette du jour"
    : hasCorrectAnswer
      ? "Reponse trouvee"
      : "Reponse non trouvee";
  const quoteWords = useMemo(() => {
    const text = isLoading ? "Une pensee prend forme pour commencer la journee." : quote.quote;
    return text.split(" ");
  }, [isLoading, quote.quote]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedAnswers = window.localStorage.getItem(answersStorageKey);

    if (savedAnswers) {
      setStoredAnswers(JSON.parse(savedAnswers) as StoredAnswer[]);
    } else {
      setStoredAnswers([]);
    }

    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("kimia-riddle-answers-") && key !== answersStorageKey)
      .forEach((key) => window.localStorage.removeItem(key));
  }, [answersStorageKey]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `kimia-daily-quote-v4-${today}`;
    const cachedQuote = window.localStorage.getItem(cacheKey);

    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("kimia-daily-quote-") && key !== cacheKey)
      .forEach((key) => window.localStorage.removeItem(key));

    if (cachedQuote) {
      setQuote(JSON.parse(cachedQuote) as DailyQuote);
      setIsLoading(false);
      return;
    }

    fetch("/api/quote", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("La citation du jour n'a pas pu etre chargee.");
        }

        return (await response.json()) as DailyQuote;
      })
      .then((dailyQuote) => {
        setQuote(dailyQuote);
        window.localStorage.setItem(cacheKey, JSON.stringify(dailyQuote));
      })
      .catch((requestError: Error) => {
        setError(requestError.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowQuestionBubble(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsQuestionOpen(false);
      }
    }

    if (isQuestionOpen) {
      window.addEventListener("keydown", closeOnEscape);
    }

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isQuestionOpen]);

  function openQuestion() {
    setIsQuestionOpen(true);
    setHasSubmitted(false);
  }

  function closeQuestion() {
    setIsQuestionOpen(false);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pseudo.trim() || !answer.trim()) {
      return;
    }

    const nextAnswers = [
      ...storedAnswers,
      {
        pseudo: pseudo.trim(),
        answer: answer.trim(),
        cycleKey,
        question: riddle.question,
        submittedAt: new Date().toISOString()
      }
    ];

    // TODO: Replace this local prototype with a POST to the answers backend.
    window.localStorage.setItem(answersStorageKey, JSON.stringify(nextAnswers));
    setStoredAnswers(nextAnswers);

    setPseudo("");
    setAnswer("");
    setHasSubmitted(true);
  }

  return (
    <main className="page-shell">
      <div className="morning-glow morning-glow-one" />
      <div className="morning-glow morning-glow-two" />
      <div className="factory-line" />
      <div className="soft-noise" />

      <section className="experience-shell" aria-live="polite">
        <article className="quote-card">
          <p className="date-label">{formattedDate}</p>

          <blockquote className={isLoading ? "quote loading" : "quote"}>
            <span aria-hidden="true" className="quote-mark">
              “
            </span>
            <span className="quote-text">
              {quoteWords.map((word, index) => (
                <span
                  className="quote-word"
                  key={`${word}-${index}`}
                  style={{ animationDelay: `${0.42 + index * 0.055}s` }}
                >
                  {word}
                  {index < quoteWords.length - 1 ? " " : ""}
                </span>
              ))}
            </span>
            <span aria-hidden="true" className="quote-mark end">
              ”
            </span>
          </blockquote>

          <div className="author-row">
            <span />
            <p>KIMIA</p>
            <span />
          </div>
          <p className="inspiration-label">{quote.inspiration}</p>

          {error ? <p className="error-message">{error}</p> : null}
        </article>
      </section>

      <button
        className={[
          "question-bubble",
          `bubble-${bubbleState}`,
          showQuestionBubble ? "is-visible" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        aria-label={bubbleLabel}
        onClick={openQuestion}
      >
        <span className="question-icon">{bubbleIcon}</span>
      </button>

      {isQuestionOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={closeQuestion}>
          <section
            aria-labelledby="question-modal-title"
            aria-modal="true"
            className="question-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Fermer la question du jour"
              className="modal-close"
              type="button"
              onClick={closeQuestion}
            >
              x
            </button>

            {!isQuestionPhase ? (
              <div className={hasCorrectAnswer ? "answer-result is-found" : "answer-result is-missed"}>
                <span className="result-icon">{hasCorrectAnswer ? "👍" : "😕"}</span>
                <p className="modal-kicker">Reponse du jour</p>
                <h2 id="question-modal-title">
                  {hasCorrectAnswer ? "La reponse a ete trouvee" : "Personne n'a trouve cette fois"}
                </h2>
                <p className="question-recap">{riddle.question}</p>
                <p className="revealed-answer">{riddle.answer}</p>
                {winningAnswer ? <p className="winner-name">Trouvee par {winningAnswer.pseudo}</p> : null}
                <button className="primary-action" type="button" onClick={closeQuestion}>
                  Fermer
                </button>
              </div>
            ) : hasSubmitted ? (
              <div className="success-state">
                <span className="success-icon">✓</span>
                <h2 id="question-modal-title">Merci pour ta reponse</h2>
                <p>
                  Ta proposition est enregistree pour la devinette en cours.
                </p>
                <button className="primary-action" type="button" onClick={closeQuestion}>
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="modal-kicker">Devinette du jour</p>
                <p className="riddle-source">{riddle.inspiration}</p>
                <h2 id="question-modal-title">{riddle.question}</h2>

                <form className="answer-form" onSubmit={submitAnswer}>
                  <label htmlFor="daily-pseudo">Pseudo</label>
                  <input
                    id="daily-pseudo"
                    maxLength={32}
                    placeholder="Ton pseudo"
                    type="text"
                    value={pseudo}
                    onChange={(event) => setPseudo(event.target.value)}
                  />
                  <label htmlFor="daily-answer">Ta reponse</label>
                  <textarea
                    id="daily-answer"
                    maxLength={360}
                    placeholder="Ecris quelques mots..."
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                  />
                  <div className="form-footer">
                    <span>{answer.length}/360</span>
                    <button
                      className="primary-action"
                      disabled={!pseudo.trim() || !answer.trim()}
                      type="submit"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
