"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type DailyQuote = {
  quote: string;
  author: string;
  reflection: string;
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
  quote: "Le jour devient plus vaste quand on consent a l'habiter pleinement.",
  author: "KIMIA",
  reflection:
    "Reviens au geste simple, a la respiration, a ce que tu peux clarifier maintenant.",
  date: new Date().toISOString().slice(0, 10),
  source: "fallback"
};

const riddleBank = [
  {
    question:
      "Je travaille toute la journee sans jamais prendre de pause, mais si on m'oublie, tout le monde ralentit. Qui suis-je ?",
    answer: "La bonne organisation."
  },
  {
    question:
      "Je suis petit, je ne parle pas, mais je peux eviter une grosse erreur avant midi. Qui suis-je ?",
    answer: "Le controle avant de commencer."
  },
  {
    question:
      "Plus on me partage, plus l'equipe avance vite. Pourtant je ne pese rien. Qui suis-je ?",
    answer: "Une bonne information."
  },
  {
    question:
      "Je fais sourire les collegues sans arreter la production. Je coute zero euro et je change l'ambiance. Qui suis-je ?",
    answer: "Un bonjour sincere."
  },
  {
    question:
      "Je suis souvent cachee dans un probleme. Quand on me trouve, tout devient plus simple. Qui suis-je ?",
    answer: "La vraie cause."
  },
  {
    question:
      "Je suis la seule chose qui grandit quand on la donne aux autres au bon moment. Qui suis-je ?",
    answer: "La confiance."
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

function isCorrectAnswer(userAnswer: string, expectedAnswer: string) {
  const user = normalizeText(userAnswer);
  const expected = normalizeText(expectedAnswer);

  if (user.length < 3 || expected.length < 3) {
    return false;
  }

  return user === expected || user.includes(expected) || expected.includes(user);
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
  const answersStorageKey = `kimia-riddle-answers-${cycleKey}`;
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
    const cacheKey = `kimia-daily-quote-${today}`;
    const cachedQuote = window.localStorage.getItem(cacheKey);

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
