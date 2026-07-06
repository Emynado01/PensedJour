"use client";

import { FormEvent, useEffect, useState } from "react";

type DailyQuote = {
  quote: string;
  author: string;
  reflection: string;
  inspiration: string;
  date: string;
  source: "openai" | "fallback";
};

type DailyRiddle = {
  question: string;
  answer: string;
  inspiration: string;
};

const ADMIN_QUOTE_KEY = "kimia-admin-selected-quote";
const ADMIN_RIDDLE_KEY = "kimia-admin-selected-riddle";

const defaultQuote: DailyQuote = {
  quote: "Le calme revient quand tu choisis le prochain geste juste.",
  author: "KIMIA",
  reflection: "Une pensee simple pour remettre de la clarte dans la journee.",
  inspiration: "Inspiré de la sagesse stoïcienne",
  date: new Date().toISOString().slice(0, 10),
  source: "fallback"
};

const defaultRiddle: DailyRiddle = {
  question:
    "Chez les stoiciens, je ne controle ni la meteo ni les collegues, mais je peux controler ma réponse. Qui suis-je ?",
  answer: "Le jugement",
  inspiration: "Stoïcisme"
};

const riddleIdeas: DailyRiddle[] = [
  {
    question:
      "Dans Le Petit Prince, je suis invisible pour les yeux, mais je rend les choses vraiment importantes. Qui suis-je ?",
    answer: "L'essentiel",
    inspiration: "Le Petit Prince"
  },
  {
    question:
      "Dans la culture japonaise, je transforme les fissures en traces d'or au lieu de les cacher. Qui suis-je ?",
    answer: "Le kintsugi",
    inspiration: "Culture japonaise"
  },
  {
    question:
      "Chez Socrate, je commence par avouer que je ne sais pas, ce qui est deja plus honnete que beaucoup de reunions. Qui suis-je ?",
    answer: "La sagesse",
    inspiration: "Socrate"
  },
  {
    question:
      "Avec Mandela, je demande du temps, du courage et une patience solide, mais je finis par ouvrir les portes. Qui suis-je ?",
    answer: "La persévérance",
    inspiration: "Nelson Mandela"
  },
  {
    question:
      "Dans Star Wars, je suis partout, mais impossible de me mettre en bouteille pour la pause cafe. Qui suis-je ?",
    answer: "La Force",
    inspiration: "Star Wars"
  }
];

const localQuoteIdeas = [
  {
    quote: "Chaque recommencement devient plus leger quand tu avances sans te juger.",
    inspiration: "Inspiré de Nelson Mandela",
    reflection:
      "La patience donne au courage le temps de devenir visible."
  },
  {
    quote: "La paix commence parfois par une seule chose que tu acceptes de ne pas porter.",
    inspiration: "Inspiré de la sagesse zen",
    reflection:
      "Tout ne merite pas ton energie; certaines charges peuvent rester au sol."
  },
  {
    quote: "Un pas sincere vaut mieux qu'une grande promesse fatiguee.",
    inspiration: "Inspiré de Socrate",
    reflection:
      "Une question honnete peut remettre plus d'ordre qu'une certitude bruyante."
  },
  {
    quote: "Ce que tu regardes avec calme cesse souvent de te gouverner.",
    inspiration: "Inspiré du stoïcisme",
    reflection:
      "Reviens a ce qui depend de toi, puis laisse le reste perdre son poids."
  },
  {
    quote: "La force tranquille consiste a continuer sans perdre ta douceur.",
    inspiration: "Inspiré de Forrest Gump",
    reflection:
      "La simplicite peut etre une forme solide de courage."
  },
  {
    quote: "Ce qui passe ne t'enleve pas tout: parfois, cela te rend plus libre.",
    inspiration: "Inspiré d'une sagesse persane",
    reflection:
      "Une emotion traverse mieux quand tu ne l'attaches pas a ton identite."
  },
  {
    quote: "Le chemin devient plus clair quand tu avances avec ce que tu as, pas avec ce qui manque.",
    inspiration: "Inspiré du Seigneur des anneaux",
    reflection:
      "Les grands trajets commencent souvent avec des moyens simples et une decision calme."
  },
  {
    quote: "Avancer, ce n'est pas tout comprendre: c'est refuser de laisser la peur conduire seule.",
    inspiration: "Inspiré de Matrix",
    reflection:
      "La lucidite commence quand tu oses regarder ce qui t'endort."
  },
  {
    quote: "La joie ne demande pas toujours plus; parfois elle demande seulement d'etre la.",
    inspiration: "Inspiré d'Amelie Poulain",
    reflection:
      "Un detail simple peut rouvrir la journee quand tu l'accueilles vraiment."
  },
  {
    quote: "Ce que tu choisis de nourrir finit par dessiner ton horizon.",
    inspiration: "Inspiré d'un proverbe populaire",
    reflection:
      "Ton attention est une forme de jardin: elle fait grandir ce qu'elle visite souvent."
  },
  {
    quote: "Le courage n'est pas l'absence de peur; c'est une main posee sur elle pour continuer.",
    inspiration: "Inspiré de Maya Angelou",
    reflection:
      "Tu peux avancer avec la peur sans lui donner toute la direction."
  },
  {
    quote: "Un esprit qui respire trouve parfois une porte la ou il ne voyait qu'un mur.",
    inspiration: "Inspiré d'un proverbe japonais",
    reflection:
      "La patience ne ralentit pas toujours: parfois elle evite de forcer la mauvaise serrure."
  },
  {
    quote: "La lumiere revient souvent par les gestes qu'on croyait trop petits.",
    inspiration: "Inspiré de Victor Hugo",
    reflection:
      "Ne meprise pas le petit bien accompli aujourd'hui."
  },
  {
    quote: "Une equipe avance mieux quand chacun apporte sa lumiere sans eteindre celle des autres.",
    inspiration: "Inspiré de Ted Lasso",
    reflection:
      "La bonne humeur devient serieuse quand elle aide les autres a tenir debout."
  },
  {
    quote: "Retrouver sa place commence parfois par arreter de fuir son propre nom.",
    inspiration: "Inspiré du Roi Lion",
    reflection:
      "Ce que tu assumes avec calme cesse de courir derriere toi."
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

export default function AdminPage() {
  const [quoteDraft, setQuoteDraft] = useState<DailyQuote>(defaultQuote);
  const [riddleDraft, setRiddleDraft] = useState<DailyRiddle>(defaultRiddle);
  const [selectedQuote, setSelectedQuote] = useState<DailyQuote | null>(null);
  const [selectedRiddle, setSelectedRiddle] = useState<DailyRiddle | null>(null);
  const [status, setStatus] = useState("Admin local pret.");
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  useEffect(() => {
    const storedQuote = window.localStorage.getItem(ADMIN_QUOTE_KEY);
    const storedRiddle = window.localStorage.getItem(ADMIN_RIDDLE_KEY);

    if (storedQuote) {
      const parsed = JSON.parse(storedQuote) as DailyQuote;
      setSelectedQuote(parsed);
      setQuoteDraft(parsed);
    }

    if (storedRiddle) {
      const parsed = JSON.parse(storedRiddle) as DailyRiddle;
      setSelectedRiddle(parsed);
      setRiddleDraft(parsed);
    }
  }, []);

  async function generateQuote() {
    setIsGeneratingQuote(true);
    setStatus("Generation de la citation...");

    try {
      const response = await fetch("/api/quote?fresh=1", { cache: "no-store" });

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

  function generateRiddle() {
    const nextRiddle = riddleIdeas[Math.floor(Math.random() * riddleIdeas.length)];
    setRiddleDraft(nextRiddle);
    setStatus("Devinette generee. Tu peux la modifier avant selection.");
  }

  function selectQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(ADMIN_QUOTE_KEY, JSON.stringify(quoteDraft));
    setSelectedQuote(quoteDraft);
    setStatus("Citation selectionnee pour cet appareil.");
  }

  function selectRiddle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(ADMIN_RIDDLE_KEY, JSON.stringify(riddleDraft));
    setSelectedRiddle(riddleDraft);
    setStatus("Question selectionnee pour cet appareil.");
  }

  function clearSelection() {
    window.localStorage.removeItem(ADMIN_QUOTE_KEY);
    window.localStorage.removeItem(ADMIN_RIDDLE_KEY);
    setSelectedQuote(null);
    setSelectedRiddle(null);
    setStatus("Selection manuelle retiree. Le cycle automatique reprend.");
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <p className="admin-kicker">KIMIA Admin</p>
        <h1>Gestion des citations et devinettes</h1>
        <p>
          Page cachee pour generer, modifier et selectionner le contenu affiche sur
          la page publique. Sans selection manuelle, les mises a jour automatiques
          gardent leur rythme habituel.
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
