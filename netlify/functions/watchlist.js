// Editorial watchlist for Digital Policy Tracker.
// Live legislative status, sponsor and news are pulled at request time. This file holds
// the curation: which bills to track, how to group them, a neutral plain-language note
// on what each bill does, and the search query used to gather news. Tone here is kept
// descriptive and non-partisan: characterizations are attributed, not asserted.
//
// To track a newly tabled bill, add an entry with its LEGISinfo number (e.g. "C-40").

module.exports = {
  session: "45-1",

  bills: [
    {
      billNumber: "C-36",
      category: "Privacy",
      headline: "Protecting Privacy and Consumer Data Act",
      newsQuery: '"Bill C-36" privacy Canada',
      department: { name: "ISED", url: "https://ised-isde.canada.ca/site/ised/en" },
      whyItMatters:
        "Overhauls federal private-sector privacy law by amending PIPEDA. Reporting describes new individual rights (including over AI-generated deepfakes), rules on automated decision-making and so-called surveillance pricing, and a restructured federal privacy regulator. Tabled June 15, 2026 by the Minister of Artificial Intelligence and Digital Innovation.",
      tags: ["PIPEDA reform", "AI & automated decisions", "consumer data", "privacy regulator"],
    },
    {
      billNumber: "C-22",
      category: "Surveillance & Lawful Access",
      headline: "Lawful Access Act, 2026",
      newsQuery: '"Bill C-22" lawful access Canada',
      department: { name: "Public Safety Canada", url: "https://www.canada.ca/en/public-safety-canada.html" },
      whyItMatters:
        "Would require certain electronic service providers to retain metadata and to facilitate authorized access to information for police and intelligence agencies, with provisions on sharing with foreign governments. Revisits the lawful-access provisions originally in the Strong Borders Act (Bill C-2). The government cites investigative needs; civil-liberties groups and some technologists have raised concerns about encryption and privacy.",
      tags: ["metadata retention", "encryption", "police access", "CSIS"],
    },
    {
      billNumber: "C-34",
      category: "Online Safety",
      headline: "Safe Social Media Act",
      newsQuery: '"Bill C-34" social media Canada',
      department: { name: "Canadian Heritage", url: "https://www.canada.ca/en/canadian-heritage.html" },
      whyItMatters:
        "Would restrict social media accounts for people under 16 (with a platform exemption pathway), create a Digital Safety Commission of Canada, and set safety duties for social media and AI chatbot services. Tabled June 10, 2026.",
      tags: ["under-16 ban", "Digital Safety Commission", "AI chatbots", "age verification"],
    },
    {
      billNumber: "C-8",
      category: "Cybersecurity",
      headline: "Critical Cyber Systems Protection",
      newsQuery: '"Bill C-8" cyber security Canada',
      department: { name: "Public Safety Canada", url: "https://www.canada.ca/en/public-safety-canada.html" },
      whyItMatters:
        "Amends the Telecommunications Act and establishes cybersecurity requirements and incident-reporting duties for operators of designated critical infrastructure such as telecoms, finance and energy.",
      tags: ["critical infrastructure", "Telecommunications Act", "incident reporting"],
    },
  ],

  // Keywords used to auto-flag other digital bills moving through the session that are
  // not on the curated list, so nothing relevant slips by unnoticed.
  discoveryKeywords: [
    "privacy",
    "personal information",
    "digital",
    "online",
    "data ",
    "cyber",
    "social media",
    "artificial intelligence",
    "telecommunication",
    "lawful access",
    "interception",
  ],
};
