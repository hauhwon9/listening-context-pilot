const songs = [
  { id: "S1", title: "River Flows In You", artist: "Yiruma", role: "Calm instrumental anchor" },
  { id: "S2", title: "Sweden", artist: "C418", role: "Calm ambient anchor" },
  { id: "S3", title: "The Night We Met", artist: "Lord Huron", role: "Low-energy emotional vocal bridge" },
  { id: "S4", title: "普通朋友", artist: "陶喆", role: "Chinese R&B / vocal bridge" },
  { id: "S5", title: "Attention", artist: "Charlie Puth", role: "Groove / social bridge" },
  { id: "S6", title: "Blueming", artist: "IU", role: "Bright pop / K-pop bridge" },
  { id: "S7", title: "Closer", artist: "The Chainsmokers ft. Halsey", role: "Electronic pop bridge" },
  { id: "S8", title: "Blinding Lights", artist: "The Weeknd", role: "Synth-pop / energetic bridge" },
  { id: "S9", title: "Give Me Everything", artist: "Pitbull, AFROJACK, Ne-Yo, Nayer", role: "Party energetic anchor" },
  { id: "S10", title: "Dynamite", artist: "BTS", role: "K-pop high-energy social anchor" }
];

const pairs = [
  ["S1", "S2", "Calm-calm baseline"],
  ["S1", "S3", "Calm instrumental vs emotional vocal"],
  ["S2", "S3", "Calm ambient vs emotional vocal"],
  ["S3", "S4", "Low/medium vocal bridge"],
  ["S4", "S5", "R&B to groove/social bridge"],
  ["S5", "S6", "Groove pop to bright pop"],
  ["S6", "S7", "Bright pop to electronic pop"],
  ["S7", "S8", "Electronic pop to synth-pop energetic bridge"],
  ["S8", "S9", "Energetic bridge to party anchor"],
  ["S9", "S10", "Energetic/social anchor baseline"]
];

const features = [
  "Energy",
  "Danceability",
  "Vocals",
  "Mood / emotion",
  "Familiarity",
  "Language",
  "Instrumentalness"
];

const prompts = {
  focused:
    "Imagine you are studying, coding, or working alone. You want to stay focused and avoid distraction. Please judge song similarity based on how similar the songs feel in this focused individual listening situation.",
  social:
    "Imagine you are in an energetic or social situation, such as a party, workout, or group activity. Please judge song similarity based on how similar the songs feel in this energetic social listening situation."
};

const PREVIEW_API = "https://itunes.apple.com/search";

const songById = Object.fromEntries(songs.map(song => [song.id, song]));
const participantInput = document.querySelector("#participantId");
const consentCheck = document.querySelector("#consentCheck");
const contextSelect = document.querySelector("#contextSelect");
const contextPrompt = document.querySelector("#contextPrompt");
const songList = document.querySelector("#songList");
const familiarityList = document.querySelector("#familiarityList");
const pairList = document.querySelector("#pairList");
const featureList = document.querySelector("#featureList");
const commentBox = document.querySelector("#commentBox");
const template = document.querySelector("#rangeTemplate");

function searchUrl(song) {
  const query = encodeURIComponent(`${song.title} ${song.artist}`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

function clipPath(song) {
  return `assets/audio/${song.id}.mp3`;
}

function mediaHtml(song) {
  return `
    <audio controls preload="none" data-song-id="${song.id}"></audio>
    <p class="audio-fallback">Loading 30-second preview...</p>
    <a class="song-link" href="${searchUrl(song)}" target="_blank" rel="noreferrer">Open original/search</a>
  `;
}

async function fetchPreviewUrl(song) {
  const query = new URLSearchParams({
    term: `${song.title} ${song.artist}`,
    media: "music",
    entity: "song",
    limit: "1"
  });
  const response = await fetch(`${PREVIEW_API}?${query.toString()}`);
  if (!response.ok) throw new Error(`Preview lookup failed for ${song.id}`);
  const data = await response.json();
  return data.results?.[0]?.previewUrl || "";
}

async function loadAudioPreviews() {
  await Promise.all(
    songs.map(async song => {
      const players = document.querySelectorAll(`audio[data-song-id="${song.id}"]`);
      const messages = Array.from(players).map(player => player.nextElementSibling);
      try {
        const previewUrl = await fetchPreviewUrl(song);
        if (!previewUrl) throw new Error(`No preview found for ${song.id}`);
        players.forEach(player => {
          player.src = previewUrl;
          player.hidden = false;
        });
        messages.forEach(message => {
          if (message?.classList.contains("audio-fallback")) {
            message.textContent = "30-second preview loaded.";
          }
        });
      } catch {
        players.forEach(player => {
          player.hidden = true;
          player.removeAttribute("src");
        });
        messages.forEach(message => {
          if (message?.classList.contains("audio-fallback")) {
            message.textContent = "Preview not available. Please use the original/search link below.";
          }
        });
      }
    })
  );
}

function applyContextFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const context = params.get("context");
  if (context && prompts[context]) {
    contextSelect.value = context;
  }
}

function setPrompt() {
  contextPrompt.textContent = prompts[contextSelect.value];
}

function makeRange(id, label, min = 0, max = 100, value = 50) {
  const node = template.content.firstElementChild.cloneNode(true);
  const input = node.querySelector("input");
  const output = node.querySelector("output");
  node.querySelector(".range-label").textContent = label;
  input.id = id;
  input.name = id;
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  output.textContent = String(value);
  input.addEventListener("input", () => {
    output.textContent = input.value;
    saveDraft();
  });
  return node;
}

function makeFeatureRange(id, label, min = 1, max = 7, value = 4) {
  const node = document.createElement("label");
  node.className = "feature-row";
  node.innerHTML = `
    <span class="feature-label">${label}</span>
    <input type="range" min="${min}" max="${max}" value="${value}" name="${id}" id="${id}">
    <output>${value}</output>
  `;
  const input = node.querySelector("input");
  const output = node.querySelector("output");
  input.addEventListener("input", () => {
    output.textContent = input.value;
    saveDraft();
  });
  return node;
}

function renderSongs() {
  songList.innerHTML = "";
  for (const song of songs) {
    const card = document.createElement("article");
    card.className = "song-card";
    card.innerHTML = `
      <p class="song-role">${song.id} · ${song.role}</p>
      <h3>${song.title}</h3>
      <p class="song-meta">${song.artist}</p>
      <div class="song-actions">
        ${mediaHtml(song)}
      </div>
    `;
    songList.appendChild(card);
  }
}

function makePairListenCard(song, label) {
  const card = document.createElement("div");
  card.className = "pair-song";
  card.innerHTML = `
    <p class="song-role">${label} · ${song.id}</p>
    <h3>${song.title}</h3>
    <p class="song-meta">${song.artist}</p>
    ${mediaHtml(song)}
  `;
  return card;
}

function attachAudioFallbacks() {
  document.querySelectorAll("audio").forEach(audio => {
    audio.addEventListener("error", () => {
      audio.hidden = true;
      const fallback = audio.nextElementSibling;
      if (fallback?.classList.contains("audio-fallback")) {
        fallback.hidden = false;
      }
    });
  });
}

function renderFamiliarity() {
  familiarityList.innerHTML = "";
  for (const song of songs) {
    familiarityList.appendChild(
      makeRange(`familiarity_${song.id}`, `${song.id} ${song.title} - ${song.artist}`, 1, 7, 4)
    );
  }
}

function renderPairs() {
  pairList.innerHTML = "";
  pairs.forEach(([aId, bId, purpose], index) => {
    const a = songById[aId];
    const b = songById[bId];
    const card = document.createElement("article");
    card.className = "pair-card";
    card.innerHTML = `
      <div class="pair-title">
        <h3>Pair ${index + 1}: ${a.id} ${a.title} / ${b.id} ${b.title}</h3>
        <span class="pair-purpose">${purpose}</span>
      </div>
      <div class="pair-audio-grid"></div>
      <div class="direction-grid"></div>
    `;
    const audioGrid = card.querySelector(".pair-audio-grid");
    audioGrid.appendChild(makePairListenCard(a, "Song A"));
    audioGrid.appendChild(makePairListenCard(b, "Song B"));
    const grid = card.querySelector(".direction-grid");
    grid.appendChild(makeRange(`similarity_${aId}_${bId}`, `A to B: Treat ${a.title} as reference. How similar does ${b.title} feel?`, 0, 100, 50));
    grid.appendChild(makeRange(`similarity_${bId}_${aId}`, `B to A: Treat ${b.title} as reference. How similar does ${a.title} feel?`, 0, 100, 50));
    pairList.appendChild(card);
  });
}

function renderFeatures() {
  featureList.innerHTML = "";
  for (const feature of features) {
    const id = `feature_${feature.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    featureList.appendChild(makeFeatureRange(id, feature, 1, 7, 4));
  }
}

function collectData() {
  const values = {};
  document.querySelectorAll("input[type='range']").forEach(input => {
    values[input.name] = Number(input.value);
  });

  const similarityRatings = [];
  for (const [aId, bId, purpose] of pairs) {
    similarityRatings.push({
      pair: `${aId}-${bId}`,
      direction: `${aId}->${bId}`,
      reference_song: aId,
      comparison_song: bId,
      value: values[`similarity_${aId}_${bId}`],
      purpose
    });
    similarityRatings.push({
      pair: `${aId}-${bId}`,
      direction: `${bId}->${aId}`,
      reference_song: bId,
      comparison_song: aId,
      value: values[`similarity_${bId}_${aId}`],
      purpose
    });
  }

  const familiarity = songs.map(song => ({
    song_id: song.id,
    title: song.title,
    artist: song.artist,
    value: values[`familiarity_${song.id}`]
  }));

  const featureImportance = features.map(feature => {
    const id = `feature_${feature.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    return { feature, value: values[id] };
  });

  return {
    participant_id: participantInput.value.trim(),
    consent_confirmed: consentCheck.checked,
    context: contextSelect.value,
    context_prompt: prompts[contextSelect.value],
    timestamp: new Date().toISOString(),
    songs,
    familiarity,
    similarity_ratings: similarityRatings,
    feature_importance: featureImportance,
    comment: commentBox.value.trim()
  };
}

function toCsv(data) {
  const rows = [
    ["participant_id", "context", "rating_type", "item", "direction", "reference_song", "comparison_song", "value", "note"]
  ];

  for (const row of data.familiarity) {
    rows.push([data.participant_id, data.context, "familiarity", row.song_id, "", row.song_id, "", row.value, row.title]);
  }

  for (const row of data.similarity_ratings) {
    rows.push([data.participant_id, data.context, "similarity", row.pair, row.direction, row.reference_song, row.comparison_song, row.value, row.purpose]);
  }

  for (const row of data.feature_importance) {
    rows.push([data.participant_id, data.context, "feature_importance", row.feature, "", "", "", row.value, ""]);
  }

  rows.push([data.participant_id, data.context, "comment", "open_text", "", "", "", "", data.comment]);

  return rows
    .map(row => row.map(cell => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function downloadFile(filename, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function safeParticipantId() {
  return participantInput.value.trim().replace(/[^a-z0-9_-]+/gi, "_") || "participant";
}

function saveDraft() {
  const data = collectData();
  localStorage.setItem("contextPilotDraft", JSON.stringify(data));
}

function restoreDraft() {
  const raw = localStorage.getItem("contextPilotDraft");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    participantInput.value = data.participant_id || "";
    consentCheck.checked = Boolean(data.consent_confirmed);
    const urlContext = new URLSearchParams(window.location.search).get("context");
    contextSelect.value = prompts[urlContext] ? urlContext : data.context || "focused";
    commentBox.value = data.comment || "";
    setPrompt();
    const map = {};
    for (const item of data.familiarity || []) map[`familiarity_${item.song_id}`] = item.value;
    for (const item of data.similarity_ratings || []) map[`similarity_${item.direction.replace("->", "_")}`] = item.value;
    for (const item of data.feature_importance || []) {
      const id = `feature_${item.feature.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
      map[id] = item.value;
    }
    document.querySelectorAll("input[type='range']").forEach(input => {
      if (map[input.name] !== undefined) {
        input.value = String(map[input.name]);
        input.closest("label").querySelector("output").textContent = input.value;
      }
    });
  } catch {
    localStorage.removeItem("contextPilotDraft");
  }
}

function init() {
  applyContextFromUrl();
  renderSongs();
  renderFamiliarity();
  renderPairs();
  renderFeatures();
  attachAudioFallbacks();
  loadAudioPreviews();
  setPrompt();
  restoreDraft();

  contextSelect.addEventListener("change", () => {
    setPrompt();
    saveDraft();
  });
  consentCheck.addEventListener("change", saveDraft);
  participantInput.addEventListener("input", saveDraft);
  commentBox.addEventListener("input", saveDraft);

  document.querySelector("#downloadJson").addEventListener("click", () => {
    const data = collectData();
    downloadFile(`${safeParticipantId()}_${data.context}_pilot.json`, JSON.stringify(data, null, 2), "application/json");
  });

  document.querySelector("#downloadCsv").addEventListener("click", () => {
    const data = collectData();
    downloadFile(`${safeParticipantId()}_${data.context}_pilot.csv`, toCsv(data), "text/csv");
  });

  document.querySelector("#clearForm").addEventListener("click", () => {
    if (!confirm("Clear all responses on this device?")) return;
    localStorage.removeItem("contextPilotDraft");
    location.reload();
  });
}

init();
