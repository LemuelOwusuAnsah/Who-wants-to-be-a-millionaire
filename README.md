# Wonders / Millionaire

> A focused, cinematic trivia experience about the places, monuments, and stories that have shaped our world.

**Play the live game:** [Who Wants to Be a Millionaire](https://lemuelowusuansah.github.io/Who-wants-to-be-a-millionaire/)

## About

Wonders / Millionaire is a modern, browser-based quiz inspired by the classic *Who Wants to Be a Millionaire?* format. Each round takes players through the world's most remarkable landmarks, from the ancient wonders of Babylon and Alexandria to the Great Wall, Petra, and Machu Picchu.

The game is designed to feel quick to learn and satisfying to replay. Questions are arranged across three stages of increasing difficulty, with a visible prize ladder, a pressure-building timer, and two strategic lifelines. Every answer produces immediate feedback, while the final score gives players a clear reason to try again and improve.

## Features

- 30 curated questions across three levels: Rookie, Explorer, and Master
- 30-second countdown for every question with an urgent final-state indicator
- 50 / 50 lifeline to remove two incorrect answers
- Skip question lifeline for a strategic reset
- Live score, prize ladder, level indicator, and overall progress tracking
- Clear correct, incorrect, and timed-out answer states
- Responsive layout for phones, tablets, and desktop screens
- Final results screen with replay flow and performance message
- No account, backend, or external data source required to play

## Built With

- [React](https://react.dev/) for the interactive game experience
- [Vite](https://vite.dev/) for fast development and production bundling
- [Tailwind CSS](https://tailwindcss.com/) v4 through `@tailwindcss/vite`
- [Lucide React](https://lucide.dev/) for interface icons
- GitHub Actions and GitHub Pages for continuous deployment

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Create a production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

## Project Structure

```text
src/
	App.jsx              # Game state, gameplay flow, and UI composition
	data/questions.js    # Three levels of quiz content
	main.jsx             # React application entrypoint
	styles.css           # Tailwind import and visual system
vite.config.js         # Vite and GitHub Pages base path
```

## Deployment

Every push to `main` builds the app and deploys `dist/` to GitHub Pages through the workflow in `.github/workflows/deploy.yml`. The site is published at:

```text
https://lemuelowusuansah.github.io/Who-wants-to-be-a-millionaire/
```

## License

This project is intended as a public educational and portfolio project.
