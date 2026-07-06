"use client";

import { FormEvent, useEffect, useState } from "react";
import { DailyQuote, DailyRiddle, PublicContent, nextRiddle, riddleCycleKey } from "../lib/kimia";

const ADMIN_RECENT_RIDDLES_KEY = "kimia-admin-recent-riddles";

const defaultQuote: DailyQuote = {
  quote: "Connais-toi toi-même.",
  author: "Socrate",
  reflection: "Une phrase courte pour revenir a soi avant de chercher trop loin.",
  inspiration: "Citation attribuée à Socrate",
  date: new Date().toISOString().slice(0, 10),
  source: "fallback"
};

const defaultRiddle: DailyRiddle = {
  question:
    "Plus je sèche, plus je deviens mouillée. Qui suis-je ?",
  answer: "La serviette",
  inspiration: "Devinette classique"
};

const localQuoteIdeas = [
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

function localQuote() {
  const selected = localQuoteIdeas[Math.floor(Math.random() * localQuoteIdeas.length)];

  return {
    ...defaultQuote,
    ...selected,
    date: new Date().toISOString().slice(0, 10)
  };
}

function readRecentRiddleQuestions() {
  try {
    const stored = window.localStorage.getItem(ADMIN_RECENT_RIDDLES_KEY);
    const parsed = stored ? (JSON.parse(stored) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function rememberRiddle(question: string) {
  const nextRecent = [question, ...readRecentRiddleQuestions().filter((item) => item !== question)]
    .slice(0, 8);
  window.localStorage.setItem(ADMIN_RECENT_RIDDLES_KEY, JSON.stringify(nextRecent));
}

export default function AdminPage() {
  const [cycleKey] = useState(() => riddleCycleKey(new Date()));
  const [quoteDraft, setQuoteDraft] = useState<DailyQuote>(defaultQuote);
  const [riddleDraft, setRiddleDraft] = useState<DailyRiddle>(defaultRiddle);
  const [selectedQuote, setSelectedQuote] = useState<DailyQuote | null>(null);
  const [selectedRiddle, setSelectedRiddle] = useState<DailyRiddle | null>(null);
  const [status, setStatus] = useState("Connexion au contenu global...");
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  useEffect(() => {
    fetch(`/api/content?cycleKey=${encodeURIComponent(cycleKey)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Contenu global indisponible.");
        }

        return (await response.json()) as PublicContent;
      })
      .then((content) => {
        setQuoteDraft(content.quote);
        setRiddleDraft(content.riddle);
        setSelectedQuote(content.quote);
        setSelectedRiddle(content.riddle);
        setStatus("Contenu global charge depuis Neon.");
      })
      .catch((error: Error) => {
        setStatus(error.message);
      });
  }, [cycleKey]);

  async function generateQuote() {
    setIsGeneratingQuote(true);
    setStatus("Generation de la citation...");

    try {
      const response = await fetch(`/api/quote?fresh=1&nonce=${Date.now()}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("API indisponible");
      }

      const nextQuote = (await response.json()) as DailyQuote;
      setQuoteDraft(nextQuote);
      setStatus("Citation generee. Tu peux la modifier avant selection.");
    } catch {
      setQuoteDraft(localQuote());
      setStatus("Citation locale generee, faute de reponse API.");
    } finally {
      setIsGeneratingQuote(false);
    }
  }

  async function generateRiddle() {
    const recentQuestions = readRecentRiddleQuestions();
    const params = new URLSearchParams({
      fresh: "1",
      nonce: String(Date.now()),
      current: riddleDraft.question
    });
    recentQuestions.forEach((question) => params.append("recent", question));

    setStatus("Generation de la devinette...");

    try {
      const response = await fetch(`/api/riddle?${params.toString()}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("API devinette indisponible.");
      }

      const generatedRiddle = (await response.json()) as DailyRiddle;
      rememberRiddle(generatedRiddle.question);
      setRiddleDraft(generatedRiddle);
      setStatus("Devinette generee. Tu peux la modifier avant selection.");
    } catch {
      const fallbackRiddle = nextRiddle(riddleDraft.question, recentQuestions);
      rememberRiddle(fallbackRiddle.question);
      setRiddleDraft(fallbackRiddle);
      setStatus("Devinette locale generee, faute de reponse API.");
    }
  }

  async function saveGlobalContent(nextQuote: DailyQuote, nextRiddle: DailyRiddle) {
    const response = await fetch("/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cycleKey,
        quote: nextQuote,
        riddle: nextRiddle
      })
    });

    if (!response.ok) {
      throw new Error("Sauvegarde Neon impossible.");
    }

    return (await response.json()) as PublicContent;
  }

  async function selectQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const content = await saveGlobalContent(quoteDraft, riddleDraft);
      setSelectedQuote(content.quote);
      setSelectedRiddle(content.riddle);
      setStatus("Citation sauvegardee globalement dans Neon.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur de sauvegarde.");
    }
  }

  async function selectRiddle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const content = await saveGlobalContent(quoteDraft, riddleDraft);
      setSelectedQuote(content.quote);
      setSelectedRiddle(content.riddle);
      setStatus("Question sauvegardee globalement dans Neon.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur de sauvegarde.");
    }
  }

  async function clearSelection() {
    try {
      const response = await fetch(`/api/content?cycleKey=${encodeURIComponent(cycleKey)}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Reset Neon impossible.");
      }

      const content = (await response.json()) as PublicContent;
      setQuoteDraft(content.quote);
      setRiddleDraft(content.riddle);
      setSelectedQuote(content.quote);
      setSelectedRiddle(content.riddle);
      setStatus("Cycle reinitialise globalement dans Neon.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur de reset.");
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <p className="admin-kicker">KIMIA Admin</p>
        <h1>Gestion des citations et devinettes</h1>
        <p>
          Page cachee pour generer, modifier et selectionner le contenu global
          affiche sur la page publique. Les choix sont sauvegardes dans Neon et
          deviennent communs a tous les navigateurs.
        </p>
      </section>

      <section className="admin-grid">
        <form className="admin-panel" onSubmit={selectQuote}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Citation</p>
              <h2>Citation du jour</h2>
            </div>
            <button disabled={isGeneratingQuote} type="button" onClick={generateQuote}>
              {isGeneratingQuote ? "Generation..." : "Generer"}
            </button>
          </div>

          <label>
            Citation
            <textarea
              value={quoteDraft.quote}
              onChange={(event) => setQuoteDraft({ ...quoteDraft, quote: event.target.value })}
            />
          </label>

          <label>
            Inspiration
            <input
              value={quoteDraft.inspiration}
              onChange={(event) =>
                setQuoteDraft({ ...quoteDraft, inspiration: event.target.value })
              }
            />
          </label>

          <label>
            Auteur
            <input
              value={quoteDraft.author}
              onChange={(event) => setQuoteDraft({ ...quoteDraft, author: event.target.value })}
            />
          </label>

          <label>
            Contexte interne
            <textarea
              value={quoteDraft.reflection}
              onChange={(event) =>
                setQuoteDraft({ ...quoteDraft, reflection: event.target.value })
              }
            />
          </label>

          <button className="admin-primary" type="submit">
            Selectionner cette citation
          </button>
        </form>

        <form className="admin-panel" onSubmit={selectRiddle}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Question</p>
              <h2>Devinette du jour</h2>
            </div>
            <button type="button" onClick={generateRiddle}>
              Generer
            </button>
          </div>

          <label>
            Question
            <textarea
              value={riddleDraft.question}
              onChange={(event) =>
                setRiddleDraft({ ...riddleDraft, question: event.target.value })
              }
            />
          </label>

          <label>
            Reponse attendue
            <input
              value={riddleDraft.answer}
              onChange={(event) => setRiddleDraft({ ...riddleDraft, answer: event.target.value })}
            />
          </label>

          <label>
            Inspiration
            <input
              value={riddleDraft.inspiration}
              onChange={(event) =>
                setRiddleDraft({ ...riddleDraft, inspiration: event.target.value })
              }
            />
          </label>

          <button className="admin-primary" type="submit">
            Selectionner cette question
          </button>
        </form>
      </section>

      <section className="admin-panel admin-status">
        <div>
          <p className="admin-kicker">Etat</p>
          <h2>{status}</h2>
          <p>
            Citation active: {selectedQuote ? selectedQuote.inspiration : "cycle automatique"}
            <br />
            Question active: {selectedRiddle ? selectedRiddle.inspiration : "cycle automatique"}
          </p>
        </div>
        <button type="button" onClick={clearSelection}>
          Retirer la selection manuelle
        </button>
      </section>
    </main>
  );
}
