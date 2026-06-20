# Ndule - Citation du jour

Une page Next.js animee qui affiche chaque jour une citation inspirante et philosophique.

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

