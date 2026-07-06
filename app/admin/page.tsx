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
const ADMIN_RECENT_RIDDLES_KEY = "kimia-admin-recent-riddles";

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
      "Dans Le Petit Prince, je suis invisible pour les yeux, mais je rends les choses vraiment importantes. Qui suis-je ?",
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
  },
  {
    question:
      "Dans Matrix, je suis petite, rouge ou bleue, et je peux transformer un lundi banal en crise existentielle. Qui suis-je ?",
    answer: "La pilule",
    inspiration: "Matrix"
  },
  {
    question:
      "Dans Le Seigneur des anneaux, je suis minuscule, je brille, et pourtant tout le monde perd son calme a cause de moi. Qui suis-je ?",
    answer: "L'anneau",
    inspiration: "Le Seigneur des anneaux"
  },
  {
    question:
      "Chez Sherlock Holmes, je suis souvent devant tout le monde, mais il faut arreter de paniquer pour me voir. Qui suis-je ?",
    answer: "L'indice",
    inspiration: "Sherlock Holmes"
  },
  {
    question:
      "Dans Harry Potter, je suis lancee avec une baguette, mais au travail on prefere quand je ressemble a une bonne idee. Qui suis-je ?",
    answer: "La magie",
    inspiration: "Harry Potter"
  },
  {
    question:
      "Chez Confucius, je peux etre long, lent et parfois penible, mais je commence toujours par un premier pas. Qui suis-je ?",
    answer: "Le chemin",
    inspiration: "Confucius"
  },
  {
    question:
      "Chez Marc Aurele, je ne controle pas la panne, la pluie ou le planning, mais je decide comment je reponds. Qui suis-je ?",
    answer: "L'attitude",
    inspiration: "Marc Aurèle"
  },
  {
    question:
      "Dans Toy Story, je ne suis pas une fusee, mais je fais avancer tout le monde quand personne ne veut rester seul. Qui suis-je ?",
    answer: "L'amitie",
    inspiration: "Toy Story"
  },
  {
    question:
      "Dans Le Roi Lion, je te suis partout, surtout quand tu fais semblant de ne pas avoir de responsabilites. Qui suis-je ?",
    answer: "Le passé",
    inspiration: "Le Roi Lion"
  },
  {
    question:
      "Dans Kung Fu Panda, je suis rond, gourmand, un peu maladroit, mais je finis par prouver que la confiance pese plus lourd que les muscles. Qui suis-je ?",
    answer: "Po",
    inspiration: "Kung Fu Panda"
  },
  {
    question:
      "Chez Rumi, je ressemble parfois a une fissure, mais c'est par la que quelque chose de lumineux peut entrer. Qui suis-je ?",
    answer: "La blessure",
    inspiration: "Rumi"
  },
  {
    question:
      "Dans Forrest Gump, je suis dans une boite, on ne sait jamais sur quoi on va tomber, un peu comme certains mails du matin. Qui suis-je ?",
    answer: "Le chocolat",
    inspiration: "Forrest Gump"
  },
  {
    question:
      "Chez Socrate, je derange un peu, je ralentis les certitudes, mais je rend tout le monde moins automatique. Qui suis-je ?",
    answer: "La question",
    inspiration: "Socrate"
  },
  {
    question:
      "Dans la culture zen, je ne fais pas de bruit, je ne gagne pas de debat, mais je remet souvent l'esprit a l'endroit. Qui suis-je ?",
    answer: "Le silence",
    inspiration: "Sagesse zen"
  },
  {
    question:
      "Dans Star Wars, je suis minuscule, vert, tres vieux, et je parle comme si la grammaire avait pris un jour de conge. Qui suis-je ?",
    answer: "Yoda",
    inspiration: "Star Wars"
  },
  {
    question:
      "Dans un proverbe africain, je permet d'aller loin quand aller vite ne suffit plus. Qui suis-je ?",
    answer: "Ensemble",
    inspiration: "Proverbe africain"
  },
  {
    question:
      "Dans Le Voyage de Chihiro, je peux disparaitre si tu oublies qui tu es. Qui suis-je ?",
    answer: "Le nom",
    inspiration: "Le Voyage de Chihiro"
  },
  {
    question:
      "Chez Nelson Mandela, je demande beaucoup de patience, mais je finis par ouvrir des portes que la colere gardait fermees. Qui suis-je ?",
    answer: "Le pardon",
    inspiration: "Nelson Mandela"
  },
  {
    question:
      "Dans Amelie Poulain, je suis petit, discret, presque rien, mais je peux changer la couleur d'une journee. Qui suis-je ?",
    answer: "Un détail",
    inspiration: "Amélie Poulain"
  },
  {
    question:
      "Dans L'Alchimiste, je ne suis pas seulement au bout du voyage; parfois je marche deja avec toi. Qui suis-je ?",
    answer: "Le trésor",
    inspiration: "L'Alchimiste"
  }
];

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
    .slice(0, Math.min(8, riddleIdeas.length - 1));
  window.localStorage.setItem(ADMIN_RECENT_RIDDLES_KEY, JSON.stringify(nextRecent));
}

function nextRiddle(currentQuestion: string) {
  const recentQuestions = readRecentRiddleQuestions();
  const availableRiddles = riddleIdeas.filter(
    (riddle) => riddle.question !== currentQuestion && !recentQuestions.includes(riddle.question)
  );
  const pool = availableRiddles.length > 0
    ? availableRiddles
    : riddleIdeas.filter((riddle) => riddle.question !== currentQuestion);
  const finalPool = pool.length > 0 ? pool : riddleIdeas;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
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

  function generateRiddle() {
    const generatedRiddle = nextRiddle(riddleDraft.question);
    rememberRiddle(generatedRiddle.question);
    setRiddleDraft(generatedRiddle);
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
