# Cafe Palette

Drag ingredient graphics into a glass, select any preferences and dietary restrictions, then click "Generate My Drink" for a recipe written by Gemini and grounded with Google Search.

## Stack

- HTML, CSS, TypeScript, React, Vite
- D3 for the flavor map and ingredient network
- Node.js and Express (`backend/`)
- Google Gemini, called only from the backend

## Setup

```bash
# frontend
npm install

# backend
cd backend
npm install
cp .env.example .env   # then paste your key into backend/.env
```

Get a Gemini API key at https://aistudio.google.com/apikey and put it in `backend/.env`:

```
GEMINI_API_KEY=your-key-here
```

`backend/.env` is git-ignored. The key never reaches the browser and there is no `VITE_` variable for it.

## Run

Use two terminals:

```bash
# terminal 1: API on http://localhost:3001
cd backend
npm run dev

# terminal 2: app on http://localhost:5173
npm run dev
```

Open http://localhost:5173. Vite forwards `/api/*` to the backend.

## How it works

1. Drag or click ingredient pictures into the glass, then choose drink style, temperature and sweetness.
2. **Generate My Drink** sends `POST /api/generate-drink` with the selection.
3. The backend validates the request and asks Gemini for one structured recipe.
4. The recipe is validated again and shown in the menu panel.

### API

`POST /api/generate-drink`

```json
{
  "ingredients": ["strawberry", "matcha", "oat milk"],
  "drinkType": "latte",
  "temperature": "iced",
  "sweetness": "medium"
}
```

Returns `{ name, description, ingredients: [{ name, amount, userSelected }], equipment, instructions: [{ step, instruction }], prepTime, servings, difficulty, difficultyLabel, sources, dietaryRestrictions, dietaryConflict, topper, flavorProfile }`, or `{ error }` with a 400 (bad request), 503 (no API key configured) or 502 (Gemini failed). `topper` is `{ name, description }` or `null`. `flavorProfile` is `{ sweet, tart, light, rich }` from 0 to 10, or `null`.

Optional `backend/.env` settings: `GEMINI_MODEL` (default `gemini-3.5-flash-lite`) and `PORT` (default `3001`).
