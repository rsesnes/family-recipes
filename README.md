# The Family Recipe Collection — App

A simple, mobile-friendly recipe app: browse by category, search, check off ingredients/steps while cooking, and build a grocery list from any combination of recipes. No login, no backend, no database — just static files that run entirely in the browser.

## What's in this folder

- `index.html` — page shell
- `style.css` — all styling
- `app.js` — app logic (routing, search, checkboxes, grocery list)
- `data.js` — **all the recipes live here** as plain data
- `manifest.json` — lets phones treat it like an app when added to the home screen

## Deploy it to GitHub Pages (one-time setup)

1. Go to [github.com](https://github.com) and log in.
2. Click the **+** in the top right → **New repository**.
   - Name it something like `family-recipes`.
   - Set it to **Public** (GitHub Pages needs a public repo unless you're on a paid plan).
   - Don't add a README/gitignore — leave it empty.
   - Click **Create repository**.
3. On the new repo's page, click **uploading an existing file** (or drag-and-drop).
4. Drag in all 5 files from this folder (`index.html`, `style.css`, `app.js`, `data.js`, `manifest.json`).
5. Scroll down and click **Commit changes**.
6. Go to the repo's **Settings** tab → **Pages** (left sidebar).
7. Under "Build and deployment," set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**. Click **Save**.
8. Wait about a minute, then refresh the Pages settings — it'll show your live URL, something like:
   `https://<your-username>.github.io/family-recipes/`

That's it — no build step, no command line required.

## Add it to your phone's home screen

**iPhone (Safari):** open the URL → tap the Share icon → **Add to Home Screen**.

**Android (Chrome):** open the URL → tap the ⋮ menu → **Add to Home screen** (or **Install app**).

It'll show up with its own icon and open full-screen, like a regular app.

## Adding or editing recipes later

Everything lives in `data.js`, in plain readable blocks like this:

```js
{
  id: "dutch-baby",              // unique, no spaces
  title: "Dutch Baby (German Pancake)",
  category: "breakfast",          // must match a category id below
  meta: { Prep: "10 minutes", Cook: "30–35 minutes", Serves: "4–6" },
  ingredients: [
    { group: "Dry Ingredients", items: ["1 3/4 cups flour", "..."] }
  ],
  instructions: [
    { group: null, items: ["Step one.", "Step two."] }
  ],
  notes: ["Optional serving tip."],
}
```

Categories (at the top of `data.js`): `breakfast`, `appetizers`, `main`, `sides`, `desserts`.

To add a new recipe: copy an existing block, edit the text, give it a new `id`, and add a comma between entries. To publish the change, edit `data.js` directly on GitHub (click the file → pencil icon → edit → commit) — the live site updates within a minute or two, no redeploy needed.

Just say the word and I can also add new recipes into `data.js` for you and hand you the updated file to upload.

## Notes on how it works

- All data lives in the browser (`localStorage`) — checked-off ingredients/steps and your grocery list persist between visits on that device, but won't sync across phones.
- Since it's a public GitHub repo, anyone with the link could view it — there's no login. That's fine for a family recipe box with nothing sensitive in it.
- Works offline once a page has loaded once in that browser (no internet needed to view a recipe you've already opened).
