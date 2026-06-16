// Netlify Function: bills
// Fetches the live LEGISinfo feed for the watched session, merges it with the editorial
// watchlist, computes each bill's position in the legislative journey, pulls recent
// news per bill (aggregated across outlets, kept non-partisan), attaches official
// reference links, and returns clean JSON for the front end. LEGISinfo blocks direct
// browser access, so this server-side proxy is what makes the tracker real-time.

const watchlist = require("./watchlist");

const FEED = (session) =>
  `https://www.parl.ca/legisinfo/en/bills/json?parlsession=${session}`;

// parl.ca's WAF rejects non-browser user agents (403), so present browser-like headers.
const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "accept": "application/json, text/javascript, text/html, */*; q=0.01",
  "accept-language": "en-CA,en;q=0.9",
};

const HOUSE_STAGES = [
  { key: "house1", label: "House — 1st reading", field: "PassedHouseFirstReadingDateTime" },
  { key: "house2", label: "House — 2nd reading", field: "PassedHouseSecondReadingDateTime" },
  { key: "house3", label: "House — 3rd reading", field: "PassedHouseThirdReadingDateTime" },
  { key: "senate1", label: "Senate — 1st reading", field: "PassedSenateFirstReadingDateTime" },
  { key: "senate2", label: "Senate — 2nd reading", field: "PassedSenateSecondReadingDateTime" },
  { key: "senate3", label: "Senate — 3rd reading", field: "PassedSenateThirdReadingDateTime" },
  { key: "assent", label: "Royal Assent", field: "ReceivedRoyalAssentDateTime" },
];

function buildStages(raw) {
  // Origin chamber is reliably encoded in the bill number prefix: "C-" bills originate
  // in the House of Commons, "S-" bills in the Senate. (The feed's OriginatingChamberId
  // is not dependable, so we key off the number instead.)
  const senateFirst = (raw.BillNumberFormatted || "").toUpperCase().startsWith("S");
  const order = senateFirst
    ? [HOUSE_STAGES[3], HOUSE_STAGES[4], HOUSE_STAGES[5], HOUSE_STAGES[0], HOUSE_STAGES[1], HOUSE_STAGES[2], HOUSE_STAGES[6]]
    : HOUSE_STAGES;
  return order.map((s) => {
    const date = raw[s.field] || null;
    return { key: s.key, label: s.label, complete: !!date, date };
  });
}

const progressPct = (stages) =>
  Math.round((stages.filter((s) => s.complete).length / stages.length) * 100);

function billLinks(num, session) {
  const lower = num.toLowerCase();
  return [
    { label: "LEGISinfo", url: `https://www.parl.ca/legisinfo/en/bill/${session}/${lower}` },
    { label: "Full text", url: `https://www.parl.ca/DocumentViewer/en/${session}/bill/${num}/first-reading` },
  ];
}

function shape(raw, editorial, session) {
  const stages = buildStages(raw);
  const num = raw.BillNumberFormatted || "";
  const links = billLinks(num, session);
  // Add the sponsoring department/ministry when curated for this bill.
  if (editorial && editorial.department && editorial.department.url) {
    links.push({ label: editorial.department.name, url: editorial.department.url });
  }
  return {
    billNumber: num,
    legisinfoUrl: `https://www.parl.ca/legisinfo/en/bill/${session}/${num.toLowerCase()}`,
    links,
    shortTitle: raw.ShortTitleEn || raw.LongTitleEn || "",
    longTitle: raw.LongTitleEn || "",
    sponsor: raw.SponsorEn || null,
    billType: raw.BillTypeEn || null,
    isGovernment: (raw.BillTypeEn || "").toLowerCase().includes("government"),
    currentStatus: raw.CurrentStatusEn || raw.LatestCompletedMajorStageEn || null,
    latestActivity: raw.LatestActivityEn || null,
    latestActivityDate: raw.LatestActivityDateTime || null,
    completedStage: raw.LatestCompletedMajorStageEn || null,
    royalAssent: raw.ReceivedRoyalAssentDateTime || null,
    stages,
    progress: progressPct(stages),
    category: editorial ? editorial.category : "Other digital bill",
    headline: editorial ? editorial.headline : raw.ShortTitleEn || raw.LongTitleEn,
    whyItMatters: editorial ? editorial.whyItMatters : null,
    tags: editorial ? editorial.tags : [],
    curated: !!editorial,
    news: [],
  };
}

function isDigital(raw) {
  const hay = `${raw.ShortTitleEn || ""} ${raw.LongTitleEn || ""}`.toLowerCase();
  return watchlist.discoveryKeywords.some((k) => hay.includes(k.trim()));
}

// --- News (Google News RSS, aggregated across outlets) -----------------------
function decodeEntities(s) {
  return String(s)
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseNews(xml, limit = 3) {
  const items = [...xml.matchAll(/<item>(.*?)<\/item>/gs)].map((m) => m[1]);
  return items.slice(0, limit).map((it) => {
    const pick = (tag) => {
      const m = it.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s"));
      return m ? decodeEntities(m[1]) : "";
    };
    let title = pick("title");
    let source = pick("source");
    // Google News appends " - Source" to titles. Strip that tail and use it as the
    // source if a <source> element wasn't present.
    const idx = title.lastIndexOf(" - ");
    if (idx > 0) {
      const tail = title.slice(idx + 3).trim();
      if (!source) source = tail;
      if (tail === source || tail.startsWith(source)) title = title.slice(0, idx);
    }
    const trimSep = (s) => s.replace(/[\s–—|-]+$/, "").trim();
    return { title: trimSep(title), source: trimSep(source), url: pick("link"), date: pick("pubDate") };
  });
}

async function fetchNews(query) {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=en-CA&gl=CA&ceid=CA:en";
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: BROWSER_HEADERS });
    if (!res.ok) return [];
    return parseNews(await res.text());
  } catch (_) {
    return [];
  } finally {
    clearTimeout(t);
  }
}
// -----------------------------------------------------------------------------

exports.handler = async () => {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=86400",
  };

  try {
    const res = await fetch(FEED(watchlist.session), { headers: BROWSER_HEADERS });
    if (!res.ok) throw new Error(`LEGISinfo returned ${res.status}`);
    const all = await res.json();

    const byNumber = new Map(all.map((b) => [b.BillNumberFormatted, b]));
    const curatedNumbers = new Set(watchlist.bills.map((b) => b.billNumber).filter(Boolean));

    const tracked = watchlist.bills.map((ed) => {
      const raw = ed.billNumber ? byNumber.get(ed.billNumber) : null;
      if (!raw) {
        return {
          billNumber: ed.billNumber || null,
          [ed.billNumber ? "notFound" : "expected"]: true,
          category: ed.category,
          headline: ed.headline,
          whyItMatters: ed.whyItMatters,
          tags: ed.tags,
          curated: true,
          stages: [],
          progress: 0,
          news: [],
          newsQuery: ed.newsQuery || null,
        };
      }
      const shaped = shape(raw, ed, watchlist.session);
      shaped.newsQuery = ed.newsQuery || `"Bill ${ed.billNumber}" Canada`;
      return shaped;
    });

    const discovered = all
      .filter(
        (b) =>
          (b.BillTypeEn || "").toLowerCase().includes("government") &&
          !curatedNumbers.has(b.BillNumberFormatted) &&
          isDigital(b)
      )
      .map((b) => shape(b, null, watchlist.session))
      .sort((a, b) => (b.latestActivityDate || "").localeCompare(a.latestActivityDate || ""));

    // Fetch news in parallel for tracked bills (and a couple of discovered ones).
    const newsTargets = [...tracked.filter((t) => t.newsQuery), ...discovered.slice(0, 2)];
    await Promise.all(
      newsTargets.map(async (bill) => {
        const q = bill.newsQuery || `"Bill ${bill.billNumber}" Canada`;
        bill.news = await fetchNews(q);
      })
    );
    tracked.forEach((t) => delete t.newsQuery);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        session: watchlist.session,
        generatedAt: new Date().toISOString(),
        source: "Parliament of Canada — LEGISinfo · news via Google News",
        tracked,
        discovered,
      }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not reach LEGISinfo", detail: String(err) }),
    };
  }
};
