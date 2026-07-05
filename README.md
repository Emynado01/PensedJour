# KIMIA - Pensee du jour

Une page Next.js animee qui affiche une pensee quotidienne et une devinette avec reponse revelee a 12h.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Cle OpenAI

Ajoute ta cle dans `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

La cle reste cote serveur dans `app/api/quote/route.ts`. Si elle est absente ou invalide, le site affiche une citation locale de secours.
