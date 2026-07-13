# SEO Genius Front

Frontend Next.js de SEO Genius. Il consomme l'API Nest du dossier
`projet-annuel-back`.

## Connexion au back

Le front utilise `NEXT_PUBLIC_API_URL` pour appeler le back. En local :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Le fichier `.env.local` est deja configure avec cette valeur.

Demarrage recommande :

```bash
# Terminal 1 - back
cd ../projet-annuel-back
npm run migration:run
npm run start:dev

# Terminal 2 - front
cd ../Annual-Project-2026-Front
npm run dev
```

Pour tester les idees sans cle Gemini, mettre `AI_PROVIDER=demo` cote back.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
