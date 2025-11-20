# interndIn Frontend

A React-based frontend for the interndIn platform, connecting SGSITS students with alumni opportunities.

## Features

- Student and Alumni dashboards
- Job postings and applications
- Messaging system
- Profile management
- Google OAuth integration

## Getting Started

```sh
npm install
npm run dev
```

## Tech Stack

- React + Vite
- Tailwind CSS + shadcn/ui
- React Router
- Axios for API calls
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dc5589d4-880f-4ce9-a982-45d8cc895804) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Vercel / Production note

- This app is a SPA. When deployed on Vercel make sure the rewrites file `vercel.json` is present in the `frontend` folder. It routes all non-API requests to `index.html` so refreshing client-side routes doesn't return 404.
