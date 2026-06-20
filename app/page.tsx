"use client";

import { useEffect, useMemo, useState } from "react";

type DailyQuote = {
  quote: string;
  author: string;
  reflection: string;
  date: string;
  source: "openai" | "fallback";
};

const fallbackQuote: DailyQuote = {
  quote: "Le jour devient plus vaste quand on consent a l'habiter pleinement.",
  author: "Ndule",
  reflection:
    "Reviens au geste simple, a la respiration, a ce que tu peux clarifier maintenant.",
  date: new Date().toISOString().slice(0, 10),
  source: "fallback"
};

export default function Home() {
  const [quote, setQuote] = useState<DailyQuote>(fallbackQuote);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${quote.date}T12:00:00`));
  }, [quote.date]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `ndule-daily-quote-${today}`;
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

  return (
    <main className="page-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="grain" />

      <section className="quote-stage" aria-live="polite">
        <p className="eyebrow">Citation philosophique du jour</p>
        <p className="date-label">{formattedDate}</p>

        <blockquote className={isLoading ? "quote loading" : "quote"}>
          <span aria-hidden="true" className="quote-mark">
            “
          </span>
          {isLoading ? "Une pensee prend forme..." : quote.quote}
          <span aria-hidden="true" className="quote-mark end">
            ”
          </span>
        </blockquote>

        <div className="author-row">
          <span />
          <p>{isLoading ? "Ndule" : quote.author}</p>
          <span />
        </div>

        <p className="reflection">{quote.reflection}</p>

        <div className="status-row">
          <span className="pulse" />
          <span>
            {quote.source === "openai"
              ? "Generee avec OpenAI pour aujourd'hui"
              : "Fallback local actif en attendant la cle API"}
          </span>
        </div>

        {error ? <p className="error-message">{error}</p> : null}
      </section>
    </main>
  );
}

