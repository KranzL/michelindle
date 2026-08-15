# Michelindle

Daily fine dining puzzle game. Players guess the signature dishes of real two-star and three-star Michelin restaurants across three rounds per day.

## Architecture

Static site -- zero backend, zero build step. Two JS data files + one HTML file.

| File | Purpose |
|------|---------|
| index.html | Game UI, styles, all game logic inline |
| restaurants.js | Restaurant bank: name, location, stars, chef, cuisine, fame tier, signature dish, course bucket, three graded dish clues |
| schedule.js | Date-to-restaurant-ID mapping, three IDs per day (one per fame tier) |
| images/{id}.jpg | Photograph of each signature dish, keyed by restaurant ID. The primary hint. |
| images/sources.txt | Tab-separated id and source URL for every downloaded photograph, for review and replacement. |

## Game Modes

| Mode | Description |
|------|-------------|
| prix fixe | Restaurant and plate photo shown. Pick the signature dish from 4 options. 3 guesses. |
| a la carte | Restaurant hidden, only the plate photo shown. Search a dropdown of every dish + restaurant pair. 6 guesses. Misses reveal cuisine + stars, then country, then city, and show country / course / stars match chips. |

Mode is chosen once per day and locked for all three rounds.

## Daily Structure

Three rounds per day, one restaurant per fame tier:

| Round | Label | Fame tier |
|-------|-------|-----------|
| 1 | amuse-bouche | 1 (iconic) |
| 2 | plat principal | 2 (well known) |
| 3 | chef's table | 3 (deep cut) |

A day counts as won when at least 2 of 3 rounds are solved. Streak requires consecutive won days.

## Data Model (restaurants.js)

```json
{
  "id": 1,
  "name": "The French Laundry",
  "city": "Yountville",
  "country": "United States",
  "stars": 3,
  "chef": "Thomas Keller",
  "cuisine": "Contemporary French",
  "fame": 1,
  "dish": "Oysters and Pearls",
  "course": "seafood",
  "dishClue1": "Vague tease. Never names dish, main ingredient, restaurant, chef, city, or country.",
  "dishClue2": "Key ingredient or technique. Same restrictions.",
  "dishClue3": "Near-giveaway description. Never contains dish, restaurant, or chef name."
}
```

`course` is one of: seafood, meat, poultry, vegetable, dessert, soup, pasta-rice, egg-caviar. Each entry also carries `tags`, an array of visible ingredient and form families (truffle, caviar-roe, lobster, pasta, fried, theatrical, ...).

Multiple-choice decoys are drawn in tiers so the photograph cannot single out the answer by name: first dishes sharing a tag AND course (another truffle soup), then any shared tag, then same course, then anything. Selection is seeded by date + restaurant ID so every player sees the same four options.

## Hint Structure

The plate photograph is the hint. It is always shown sharp, never obscured.

a la carte additionally reveals house identity lines on misses: cuisine + stars after 1 miss, country after 3, city after 5. Chef is never given as a clue.

If an image is missing or fails to load, the game falls back to text clues: prix fixe uses dishClue1-3 revealed per miss; a la carte interleaves dish clues with house lines across 6 reveals. dishClue3 also serves as the description on every reveal card, so all three clues stay required fields.

## Scheduling

`schedule.js` maps ISO date strings (EST via America/New_York) to `[fame1Id, fame2Id, fame3Id]`. If a date is missing, fallback picks deterministically per tier by hashing the date string. Regenerate with `node make-schedule.js` if the bank changes.

## Share Format

Wordle-style rows, one per round, built from unicode escapes in source (never literal emoji). Green square at the solving guess, star if solved on the first guess, red for wrong guesses, black for unused slots.

## Deploying

Own Vercel project (michelindle). Git push to main triggers auto-deploy. Proxied at lkranz.com/michelindle via rewrites in the lkranz repo's vercel.json.

## Code Standards

- NO COMMENTS IN CODE
- NO EMOJIS (unicode escapes in share strings only)
- Double-quoted strings in data files
- Every data entry on a single line
- localStorage keys prefixed with `michelindle_`

## Key Design Decisions

- Tasting menu visual identity: claret background (Guide Rouge), ivory menu cards, gold stars, Cormorant Garamond + Lora + Montserrat
- Mode names come from dining: prix fixe (fixed options) vs a la carte (open choice)
- Clues read like menu lines separated by gold dots; each wrong guess reveals the next course
- Fame tiers drive daily difficulty progression rather than per-puzzle difficulty labels
- Answers stored in plain data: multiple choice requires the answer client-side, so hashing would add complexity without protection
