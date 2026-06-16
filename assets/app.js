// Digital Policy Tracker — front end.
// Tries the live Netlify function first; falls back to a bundled snapshot so the
// page still renders meaningfully when opened locally without `netlify dev`.

const ENDPOINTS = ["/api/bills", "/.netlify/functions/bills", "data/snapshot.json"];
const REFRESH_MS = 15 * 60 * 1000; // re-poll every 15 minutes

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
};

const fmtDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
};

async function loadData() {
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && Array.isArray(data.tracked)) {
        return { data, live: url !== "data/snapshot.json" };
      }
    } catch (_) {
      /* try next endpoint */
    }
  }
  return null;
}

function setStatus(state, text) {
  const pill = document.getElementById("statusPill");
  pill.className = "status-pill " + state;
  document.getElementById("statusDot");
  document.getElementById("statusText").textContent = text;
}

function buildLegend() {
  document.getElementById("legend").innerHTML = `
    <span><i class="l-done"></i> Stage passed</span>
    <span><i class="l-current"></i> Current stage</span>
    <span><i class="l-pending"></i> Not yet reached</span>`;
}

function renderResources(resources) {
  const nav = document.getElementById("resources");
  if (!resources || !resources.length) {
    nav.hidden = true;
    return;
  }
  nav.innerHTML =
    '<span class="resources-label">Watch &amp; verify:</span>' +
    resources
      .map(
        (r) =>
          `<a href="${r.url}" target="_blank" rel="noopener" title="${r.note || ""}">${r.label}</a>`
      )
      .join("");
}

function relativeDay(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return days + "d ago";
  return fmtDate(iso);
}

function currentStageIndex(stages) {
  // The current stage is the first incomplete one; if all complete, none is "current".
  const idx = stages.findIndex((s) => !s.complete);
  return idx;
}

function renderCard(bill) {
  const tpl = document.getElementById("cardTemplate");
  const node = tpl.content.cloneNode(true);
  const card = node.querySelector(".card");

  node.querySelector(".bill-num").textContent = bill.expected
    ? "Expected"
    : bill.billNumber || "—";
  node.querySelector(".category-tag").textContent = bill.category || "";
  node.querySelector(".card-title").textContent = bill.headline || bill.shortTitle || "";

  const longTitle = node.querySelector(".long-title");
  if (bill.longTitle && bill.longTitle !== bill.headline) {
    longTitle.textContent = bill.longTitle;
  } else {
    longTitle.remove();
  }

  // Progress + stepper
  const progress = node.querySelector(".progress");
  const stepper = node.querySelector(".stepper");
  if (bill.expected || !bill.stages || !bill.stages.length) {
    progress.remove();
    stepper.remove();
    card.classList.add("expected");
  } else {
    node.querySelector(".progress-fill").style.width = (bill.progress || 0) + "%";
    node.querySelector(".progress-label").textContent = (bill.progress || 0) + "%";
    const curIdx = currentStageIndex(bill.stages);
    bill.stages.forEach((s, i) => {
      const li = document.createElement("li");
      if (s.complete) li.classList.add("done");
      else if (i === curIdx) li.classList.add("current");
      li.innerHTML =
        `${s.label}` +
        (s.date ? `<span class="step-date">${fmtDate(s.date)}</span>` : "");
      stepper.appendChild(li);
    });
  }

  const why = node.querySelector(".why");
  why.textContent = bill.whyItMatters || "";
  if (!bill.whyItMatters) why.remove();

  const tags = node.querySelector(".tags");
  (bill.tags || []).forEach((t) => {
    const s = document.createElement("span");
    s.textContent = t;
    tags.appendChild(s);
  });
  if (!bill.tags || !bill.tags.length) tags.remove();

  // News
  const news = node.querySelector(".news");
  const newsList = node.querySelector(".news-list");
  if (bill.news && bill.news.length) {
    bill.news.forEach((n) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = n.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = n.title;
      const meta = document.createElement("span");
      meta.className = "news-meta";
      meta.textContent =
        [n.source, n.date ? relativeDay(n.date) : ""].filter(Boolean).join(" · ");
      li.appendChild(a);
      if (meta.textContent) li.appendChild(meta);
      newsList.appendChild(li);
    });
  } else {
    news.remove();
  }

  const latest = node.querySelector(".latest");
  if (bill.expected) {
    latest.textContent = "Not yet tabled — watching Parliament's feed.";
  } else if (bill.notFound) {
    latest.textContent = "Awaiting first appearance in the session feed.";
  } else if (bill.latestActivity) {
    latest.textContent = bill.latestActivity;
  } else {
    latest.remove();
  }

  // Reference links
  const links = node.querySelector(".links");
  const list = bill.links && bill.links.length
    ? bill.links
    : bill.legisinfoUrl
    ? [{ label: "LEGISinfo", url: bill.legisinfoUrl }]
    : [];
  if (list.length) {
    list.forEach((l) => {
      const a = document.createElement("a");
      a.href = l.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "ref-link";
      a.textContent = l.label;
      links.appendChild(a);
    });
  } else {
    links.remove();
  }

  return node;
}

function renderInto(gridId, bills) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";
  bills.forEach((b) => grid.appendChild(renderCard(b)));
}

async function refresh() {
  const result = await loadData();
  if (!result) {
    setStatus("error", "Couldn't reach Parliament's feed");
    document.getElementById("trackedGrid").innerHTML =
      '<div class="error-note">Live data is temporarily unavailable. Please refresh shortly.</div>';
    return;
  }

  const { data, live } = result;
  renderResources(data.resources);
  renderInto("trackedGrid", data.tracked || []);

  const discovered = data.discovered || [];
  const discSection = document.getElementById("discoveredSection");
  if (discovered.length) {
    discSection.hidden = false;
    renderInto("discoveredGrid", discovered);
  } else {
    discSection.hidden = true;
  }

  const stamp = fmtDateTime(data.generatedAt);
  if (live) {
    setStatus("live", "Live · updated " + stamp);
  } else {
    setStatus("stale", "Snapshot · " + stamp);
  }
  document.getElementById("footerMeta").textContent =
    `Session ${data.session || ""} · ${(data.tracked || []).length} bills tracked` +
    (discovered.length ? ` · ${discovered.length} auto-detected` : "") +
    (stamp ? ` · data as of ${stamp}` : "");
}

buildLegend();
refresh();
setInterval(refresh, REFRESH_MS);
