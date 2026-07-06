"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  DailyQuote,
  DailyRiddle,
  PublicContent,
  StoredAnswer,
  fallbackQuoteFor,
  riddleCycleKey,
  riddleFor
} from "./lib/kimia";

const initialCycleKey = riddleCycleKey(new Date());
const initialFallbackQuote = fallbackQuoteFor(initialCycleKey);
const initialFallbackRiddle = riddleFor(initialCycleKey);

export default function Home() {
  const [quote, setQuote] = useState<DailyQuote>(initialFallbackQuote);
  const [riddle, setRiddle] = useState<DailyRiddle>(initialFallbackRiddle);
  const [now, setNow] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionBubble, setShowQuestionBubble] = useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [answer, setAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [dbWinningAnswer, setDbWinningAnswer] = useState<StoredAnswer | null>(null);
  const [demoWinner, setDemoWinner] = useState<string | null>(null);

  const displayedQuote = quote;

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${displayedQuote.date}T12:00:00`));
  }, [displayedQuote.date]);

  const cycleKey = useMemo(() => riddleCycleKey(now), [now]);
  const isQuestionPhase = now.getHours() >= 23 || now.getHours() < 13;
  const winningAnswer = useMemo(() => {
    if (dbWinningAnswer) {
      return dbWinningAnswer;
    }

    if (!demoWinner) {
      return null;
    }

    return {
      pseudo: demoWinner,
      answer: riddle.answer,
      cycleKey,
      question: riddle.question,
      submittedAt: new Date().toISOString()
    };
  }, [cycleKey, dbWinningAnswer, demoWinner, riddle.answer, riddle.question]);
  const hasCorrectAnswer = Boolean(winningAnswer);
  const bubbleState = isQuestionPhase ? "question" : hasCorrectAnswer ? "found" : "missed";
  const bubbleIcon = isQuestionPhase ? "?" : hasCorrectAnswer ? "👍" : "😕";
  const bubbleLabel = isQuestionPhase
    ? "Ouvrir la devinette du jour"
    : hasCorrectAnswer
      ? "Réponse trouvée"
      : "Réponse non trouvée";
  const quoteWords = useMemo(() => {
    const text = isLoading ? "Une pensee prend forme pour commencer la journee." : displayedQuote.quote;
    return text.split(" ");
  }, [displayedQuote.quote, isLoading]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const winner = new URLSearchParams(window.location.search).get("demoWinner")?.trim();
    setDemoWinner(winner || null);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`/api/content?cycleKey=${encodeURIComponent(cycleKey)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Le contenu du jour n'a pas pu etre charge.");
        }

        return (await response.json()) as PublicContent;
      })
      .then((dailyContent) => {
        setQuote(dailyContent.quote);
        setRiddle(dailyContent.riddle);
        setDbWinningAnswer(dailyContent.winningAnswer);
      })
      .catch((requestError: Error) => {
        setError(requestError.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [cycleKey]);

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

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pseudo.trim() || !answer.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cycleKey,
          pseudo: pseudo.trim(),
          answer: answer.trim()
        })
      });

      if (!response.ok) {
        throw new Error("La reponse n'a pas pu etre enregistree.");
      }

      const result = (await response.json()) as {
        content: PublicContent;
        isCorrect: boolean;
      };

      setQuote(result.content.quote);
      setRiddle(result.content.riddle);
      setDbWinningAnswer(result.content.winningAnswer);
      setPseudo("");
      setAnswer("");
      setHasSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erreur d'envoi.");
    }
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
            <p>{displayedQuote.author}</p>
            <span />
          </div>
          <p className="inspiration-label">{displayedQuote.inspiration}</p>

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
                <p className="modal-kicker">Réponse du jour</p>
                <h2 id="question-modal-title">
                  {hasCorrectAnswer ? "La réponse a été trouvée" : "Personne n'a trouvé cette fois"}
                </h2>
                <p className="question-recap">{riddle.question}</p>
                <p className="revealed-answer">{riddle.answer}</p>
                {winningAnswer ? <p className="winner-name">Trouvée par {winningAnswer.pseudo}</p> : null}
                <button className="primary-action" type="button" onClick={closeQuestion}>
                  Fermer
                </button>
              </div>
            ) : hasSubmitted ? (
              <div className="success-state">
                <span className="success-icon">✓</span>
                <h2 id="question-modal-title">Merci pour ta réponse</h2>
                <p>
                  Ta proposition est enregistrée pour la devinette en cours.
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
                  <label htmlFor="daily-answer">Ta réponse</label>
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
