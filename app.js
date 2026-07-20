// The Family Recipe Collection — app logic (vanilla JS, hash-based routing, localStorage persistence)

const app = document.getElementById("app");
const searchInput = document.getElementById("search-input");
const groceryCountBadge = document.getElementById("grocery-count");

// ---------- Storage helpers ----------
const STORE_KEY = "frc_state_v1";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { checks: {}, grocery: [] };
  } catch (e) {
    return { checks: {}, grocery: [] };
  }
}
function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}
let state = loadState();

function isChecked(key) {
  return !!state.checks[key];
}
function toggleCheck(key) {
  state.checks[key] = !state.checks[key];
  saveState(state);
}
function isInGroceryList(id) {
  return state.grocery.includes(id);
}
function toggleGrocery(id) {
  if (state.grocery.includes(id)) {
    state.grocery = state.grocery.filter((x) => x !== id);
  } else {
    state.grocery.push(id);
  }
  saveState(state);
  updateGroceryBadge();
}
function updateGroceryBadge() {
  const n = state.grocery.length;
  groceryCountBadge.textContent = n > 0 ? n : "";
  groceryCountBadge.style.display = n > 0 ? "inline-flex" : "none";
}

function getRecipe(id) {
  return RECIPES.find((r) => r.id === id);
}
function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}

// ---------- HTML escape ----------
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ---------- Views ----------

function renderHome() {
  const html = `
    <div class="view">
      <h1 class="page-title">The Family Recipe Collection</h1>
      <p class="page-sub">Tap a category to browse, or search above.</p>
      <div class="card-grid">
        ${CATEGORIES.map((c) => {
          const count = RECIPES.filter((r) => r.category === c.id).length;
          return `
            <a class="category-card" href="#/category/${c.id}">
              <span class="category-emoji">${c.emoji}</span>
              <span class="category-name">${esc(c.name)}</span>
              <span class="category-count">${count} recipe${count === 1 ? "" : "s"}</span>
            </a>
          `;
        }).join("")}
      </div>
    </div>
  `;
  app.innerHTML = html;
}

function renderCategory(catId) {
  const cat = getCategory(catId);
  if (!cat) return renderNotFound();
  const recipes = RECIPES.filter((r) => r.category === catId);
  app.innerHTML = `
    <div class="view">
      <a class="back-link" href="#/">&larr; All categories</a>
      <h1 class="page-title">${cat.emoji} ${esc(cat.name)}</h1>
      <div class="recipe-list">
        ${recipes.map((r) => recipeCard(r)).join("")}
      </div>
    </div>
  `;
}

function recipeCard(r) {
  const inList = isInGroceryList(r.id);
  return `
    <div class="recipe-card">
      <a class="recipe-card-link" href="#/recipe/${r.id}">
        <span class="recipe-card-title">${esc(r.title)}</span>
        <span class="recipe-card-meta">${Object.entries(r.meta).map(([k, v]) => `${k}: ${esc(v)}`).join(" · ")}</span>
      </a>
      <button class="grocery-toggle ${inList ? "active" : ""}" data-recipe="${r.id}" title="Add to grocery list">
        ${inList ? "✓ In list" : "+ Add to list"}
      </button>
    </div>
  `;
}

function renderSearch(query) {
  const q = query.trim().toLowerCase();
  let results = [];
  if (q.length > 0) {
    results = RECIPES.filter((r) => {
      if (r.title.toLowerCase().includes(q)) return true;
      const allIngredients = r.ingredients.flatMap((g) => g.items).join(" ").toLowerCase();
      if (allIngredients.includes(q)) return true;
      return false;
    });
  }
  app.innerHTML = `
    <div class="view">
      <a class="back-link" href="#/">&larr; All categories</a>
      <h1 class="page-title">Search: "${esc(query)}"</h1>
      ${
        results.length === 0
          ? `<p class="empty-msg">No recipes found. Try another ingredient or dish name.</p>`
          : `<div class="recipe-list">${results.map((r) => recipeCard(r)).join("")}</div>`
      }
    </div>
  `;
}

function renderRecipe(id) {
  const r = getRecipe(id);
  if (!r) return renderNotFound();
  const cat = getCategory(r.category);
  const inList = isInGroceryList(r.id);

  const ingredientsHtml = r.ingredients.map((group, gi) => `
    ${group.group ? `<h3 class="sub-heading">${esc(group.group)}</h3>` : ""}
    <ul class="check-list">
      ${group.items.map((item, ii) => {
        const key = `${r.id}-ing-${gi}-${ii}`;
        const checked = isChecked(key);
        return `
          <li class="check-item ${checked ? "checked" : ""}" data-key="${key}">
            <span class="check-box">${checked ? "✓" : ""}</span>
            <span class="check-text">${esc(item)}</span>
          </li>
        `;
      }).join("")}
    </ul>
  `).join("");

  const instructionsHtml = r.instructions.map((group, gi) => `
    ${group.group ? `<h3 class="sub-heading">${esc(group.group)}</h3>` : ""}
    <ol class="check-list numbered">
      ${group.items.map((item, ii) => {
        const key = `${r.id}-step-${gi}-${ii}`;
        const checked = isChecked(key);
        return `
          <li class="check-item ${checked ? "checked" : ""}" data-key="${key}">
            <span class="check-box">${checked ? "✓" : ""}</span>
            <span class="check-text">${esc(item)}</span>
          </li>
        `;
      }).join("")}
    </ol>
  `).join("");

  const notesHtml = r.notes && r.notes.length
    ? `<div class="note-box">${r.notes.map((n) => `<p><strong>Note:</strong> ${esc(n)}</p>`).join("")}</div>`
    : "";

  const nutritionHtml = r.nutrition
    ? `<div class="nutrition-box">
        <h3 class="sub-heading">${esc(r.nutrition.title)}</h3>
        <ul class="plain-list">${r.nutrition.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
      </div>`
    : "";

  app.innerHTML = `
    <div class="view">
      <a class="back-link" href="#/category/${cat.id}">&larr; ${esc(cat.name)}</a>
      <h1 class="page-title recipe-title">${esc(r.title)}</h1>
      ${r.source ? `<p class="source-line">${esc(r.source)}</p>` : ""}
      <p class="meta-line">${Object.entries(r.meta).map(([k, v]) => `<strong>${k}:</strong> ${esc(v)}`).join(" &nbsp;|&nbsp; ")}</p>

      <button class="grocery-toggle big ${inList ? "active" : ""}" data-recipe="${r.id}">
        ${inList ? "✓ Added to grocery list" : "+ Add ingredients to grocery list"}
      </button>

      <h2 class="section-heading">Ingredients</h2>
      ${ingredientsHtml}

      <h2 class="section-heading">Instructions</h2>
      ${instructionsHtml}

      ${notesHtml}
      ${nutritionHtml}

      <button class="reset-link" id="reset-checklist">Reset checkboxes for this recipe</button>
    </div>
  `;

  document.getElementById("reset-checklist").addEventListener("click", () => {
    Object.keys(state.checks).forEach((k) => {
      if (k.startsWith(`${r.id}-`)) delete state.checks[k];
    });
    saveState(state);
    renderRecipe(id);
  });
}

function renderGroceryList() {
  const recipes = state.grocery.map((id) => getRecipe(id)).filter(Boolean);
  app.innerHTML = `
    <div class="view">
      <a class="back-link" href="#/">&larr; All categories</a>
      <h1 class="page-title">🛒 Grocery List</h1>
      ${
        recipes.length === 0
          ? `<p class="empty-msg">No recipes added yet. Open a recipe and tap "Add ingredients to grocery list."</p>`
          : `
            <button class="reset-link" id="clear-grocery">Clear entire grocery list</button>
            ${recipes.map((r) => `
              <div class="grocery-section">
                <h3 class="sub-heading"><a href="#/recipe/${r.id}">${esc(r.title)}</a></h3>
                <ul class="check-list">
                  ${r.ingredients.flatMap((g) => g.items).map((item, ii) => {
                    const key = `grocery-${r.id}-${ii}`;
                    const checked = isChecked(key);
                    return `
                      <li class="check-item ${checked ? "checked" : ""}" data-key="${key}">
                        <span class="check-box">${checked ? "✓" : ""}</span>
                        <span class="check-text">${esc(item)}</span>
                      </li>
                    `;
                  }).join("")}
                </ul>
              </div>
            `).join("")}
          `
      }
    </div>
  `;

  const clearBtn = document.getElementById("clear-grocery");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Remove all recipes from the grocery list?")) {
        state.grocery = [];
        Object.keys(state.checks).forEach((k) => {
          if (k.startsWith("grocery-")) delete state.checks[k];
        });
        saveState(state);
        updateGroceryBadge();
        renderGroceryList();
      }
    });
  }
}

function renderNotFound() {
  app.innerHTML = `
    <div class="view">
      <a class="back-link" href="#/">&larr; All categories</a>
      <p class="empty-msg">Recipe not found.</p>
    </div>
  `;
}

// ---------- Event delegation for checkboxes & grocery buttons ----------
app.addEventListener("click", (e) => {
  const checkItem = e.target.closest(".check-item");
  if (checkItem) {
    toggleCheck(checkItem.dataset.key);
    checkItem.classList.toggle("checked");
    checkItem.querySelector(".check-box").textContent = checkItem.classList.contains("checked") ? "✓" : "";
    return;
  }
  const groceryBtn = e.target.closest(".grocery-toggle");
  if (groceryBtn) {
    e.preventDefault();
    toggleGrocery(groceryBtn.dataset.recipe);
    // re-render current view to reflect the state everywhere it's shown
    router();
    return;
  }
});

// ---------- Search input ----------
let searchDebounce;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    const q = searchInput.value;
    if (q.trim().length === 0) {
      window.location.hash = "#/";
    } else {
      window.location.hash = "#/search/" + encodeURIComponent(q);
    }
  }, 200);
});

// ---------- Router ----------
function router() {
  const hash = window.location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);

  if (parts.length === 0) {
    searchInput.value = "";
    renderHome();
  } else if (parts[0] === "category" && parts[1]) {
    searchInput.value = "";
    renderCategory(parts[1]);
  } else if (parts[0] === "recipe" && parts[1]) {
    renderRecipe(parts[1]);
  } else if (parts[0] === "grocery") {
    searchInput.value = "";
    renderGroceryList();
  } else if (parts[0] === "search") {
    const q = decodeURIComponent(parts.slice(1).join("/"));
    searchInput.value = q;
    renderSearch(q);
  } else {
    renderNotFound();
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  updateGroceryBadge();
  router();
});
