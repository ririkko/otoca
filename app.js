const COLLECTION_KEY = "otoca_collection_v1";

function getOtocaSpotData() {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || "{}");
      if (data["@type"] === "OtocaSpot" && data.spotId && Array.isArray(data.cards)) {
        return data;
      }
    } catch (error) {
      console.warn("JSON-LDの読み込みに失敗しました", error);
    }
  }

  return null;
}

function normalizeDropRates(cards) {
  const total = cards.reduce((sum, card) => sum + Number(card.dropRate || 0), 0);
  if (total <= 0) return cards.map(card => ({ ...card, dropRate: 1 / cards.length }));
  return cards.map(card => ({ ...card, dropRate: Number(card.dropRate || 0) / total }));
}

function drawCard(cards) {
  const normalizedCards = normalizeDropRates(cards);
  const random = Math.random();
  let sum = 0;

  for (const card of normalizedCards) {
    sum += card.dropRate;
    if (random <= sum) return card;
  }

  return normalizedCards[0];
}

function getCollection() {
  return JSON.parse(localStorage.getItem(COLLECTION_KEY) || "[]");
}

function saveCollectedCard(spot, card) {
  const collection = getCollection();
  const item = {
    id: `${spot.spotId}:${card.cardId}:${Date.now()}`,
    spotId: spot.spotId,
    spotName: spot.name,
    area: spot.area,
    cardId: card.cardId,
    title: card.title,
    rarity: card.rarity,
    description: card.description,
    imageUrl: card.imageUrl,
    audioUrl: card.audioUrl,
    collectedAt: new Date().toISOString()
  };

  collection.unshift(item);
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
  return item;
}

function renderSpotPage() {
  const spot = getOtocaSpotData();
  if (!spot) return;

  const name = document.getElementById("spotName");
  const area = document.getElementById("spotArea");
  const image = document.getElementById("spotImage");
  const description = document.getElementById("spotDescription");
  const cardList = document.getElementById("cardList");
  const drawButton = document.getElementById("drawButton");

  if (name) name.textContent = spot.name;
  if (area) area.textContent = `📍 ${spot.area}`;
  if (image) {
    image.src = spot.imageUrl;
    image.alt = spot.name;
  }
  if (description) description.textContent = spot.description;

  if (cardList) {
    cardList.innerHTML = spot.cards.map(card => `
      <li>
        <span class="rarity ${escapeHtml(card.rarity)}">${escapeHtml(card.rarity)}</span>
        ${escapeHtml(card.title)}
      </li>
    `).join("");
  }

  if (drawButton) {
    drawButton.addEventListener("click", () => {
      const selected = drawCard(spot.cards);
      saveCollectedCard(spot, selected);
      renderDrawResult(selected);
    });
  }
}

function renderDrawResult(card) {
  const result = document.getElementById("drawResult");
  if (!result) return;

  result.innerHTML = `
    <article class="trading-card">
      <img class="card-image" src="${escapeAttribute(card.imageUrl)}" alt="${escapeAttribute(card.title)}">
      <p><span class="rarity ${escapeHtml(card.rarity)}">${escapeHtml(card.rarity)}</span></p>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.description || "")}</p>
      <audio controls src="${escapeAttribute(card.audioUrl)}"></audio>
    </article>
  `;
}

function renderCollectionList() {
  const list = document.getElementById("collectionList");
  const clearButton = document.getElementById("clearCollectionButton");
  if (!list) return;

  const collection = getCollection();

  if (collection.length === 0) {
    list.innerHTML = `<p class="muted">まだ音カードを取得していません。</p>`;
  } else {
    list.innerHTML = collection.map(item => `
      <div class="collection-item">
        <strong><span class="rarity ${escapeHtml(item.rarity)}">${escapeHtml(item.rarity)}</span>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.spotName)} / ${escapeHtml(item.area || "")}</span><br>
        <small>${new Date(item.collectedAt).toLocaleString("ja-JP")}</small>
      </div>
    `).join("");
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (confirm("保存済みコレクションを削除しますか？")) {
        localStorage.removeItem(COLLECTION_KEY);
        renderCollectionList();
      }
    });
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
