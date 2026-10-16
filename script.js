const API = "https://api.scryfall.com";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const COLOURS = { w:"White", u:"Blue", b:"Black", r:"Red", g:"Green", c:"Colourless" };
let next = null, busy = false;

const picked = () => [...document.querySelectorAll(".colours button[aria-pressed=true]")].map(b => b.dataset.c);

// Fill the Sets dropdown from Scryfall
async function loadSets(){
  try {
    const d = await (await fetch(API + "/sets")).json();
    $("set").innerHTML = '<option value="">Sets</option>' +
      d.data.filter(s => !s.digital).map(s => `<option value="${esc(s.code)}">${esc(s.name)}</option>`).join("");
  } catch { /* dropdown just stays empty if Scryfall is unreachable */ }
}

// Turn the form into a Scryfall search string
function buildQuery(){
  const parts = [], q = $("q").value.trim(), c = picked();
  if (q) parts.push(q);
  if ($("set").value) parts.push("s:" + $("set").value);
  if ($("type").value) parts.push("t:" + $("type").value);
  if ($("rarity").value) parts.push("r:" + $("rarity").value);
  if (c.includes("c")) parts.push("c:c");
  else if (c.length) parts.push("c:" + c.join(""));
  return parts.join(" ");
}

// Update the red line under the search area
function updateSummary(){
  const q = $("q").value.trim();
  const set = $("set").value ? $("set").selectedOptions[0].text : "Any set";
  const type = $("type").value || "Any type";
  const rarity = $("rarity").value || "Any rarity";
  const c = picked(), colour = c.length ? c.map(k => COLOURS[k]).join(" / ") : "Any colour";
  $("summary").innerHTML = `<span>“${esc(q || "All cards")}”</span><span>${esc(set)}</span><i></i><span>${esc(type)}</span><i></i><span>${esc(rarity)}</span><i></i><span>${esc(colour)}</span><i></i>`;
}

const imgOf = c => (c.image_uris || (c.card_faces && c.card_faces[0].image_uris) || {}).normal || "";

async function fetchPage(url){
  if (busy) return; busy = true;
  $("status").textContent = "Searching…";
  try {
    const r = await fetch(url), d = await r.json();
    if (!r.ok){ $("status").textContent = d.details || "No cards found."; $("more").hidden = true; }
    else {
      $("grid").insertAdjacentHTML("beforeend", d.data.map(c =>
        `<a href="${esc(c.scryfall_uri)}" target="_blank" rel="noopener"><img src="${esc(imgOf(c))}" alt="${esc(c.name)}" loading="lazy"></a>`).join(""));
      next = d.has_more ? d.next_page : null;
      $("more").hidden = !next;
      $("status").textContent = d.total_cards + " cards found";
    }
  } catch { $("status").textContent = "Couldn't reach Scryfall. Check your connection."; }
  busy = false;
}

function run(){
  const query = buildQuery();
  if (!query){ $("status").textContent = "Type a card name or pick a filter."; return; }
  updateSummary();
  $("grid").innerHTML = "";
  fetchPage(API + "/cards/search?order=name&q=" + encodeURIComponent(query));
}

$("form").addEventListener("submit", e => { e.preventDefault(); run(); });
["set", "type", "rarity"].forEach(id => $(id).addEventListener("change", run));
document.querySelectorAll(".colours button").forEach(b => b.addEventListener("click", () => {
  b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
  run();
}));
$("more").addEventListener("click", () => next && fetchPage(next));

loadSets();