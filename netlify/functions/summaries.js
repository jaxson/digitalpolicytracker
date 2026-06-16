// AI-generated plain-language summaries for the tracked bills.
//
// These are written by AI (Claude) and grounded in each bill's OFFICIAL summary and
// Table of Provisions from Parliament's first-reading text, cross-checked against the
// government's own backgrounders and mainstream reporting. They are a reading aid, not
// legal advice, and are kept deliberately neutral. Regenerate when a bill is materially
// amended. The UI shows the caveat below alongside every summary.

const CAVEAT =
  "AI-generated from the bill's official summary and text. A plain-language aid, not legal advice — confirm against the full bill before relying on it.";

const summaries = {
  "C-36": {
    overview:
      "Bill C-36 rewrites the rules for how private companies handle Canadians' personal data. It enacts a new Protecting Privacy and Consumer Data Act, replaces the private-sector half of the 25-year-old PIPEDA, and stands up a new regulator to enforce the regime.",
    points: [
      "Enacts the Protecting Privacy and Consumer Data Act to govern how organizations collect, use and disclose personal information in commercial activities; the rest of PIPEDA is renamed the Electronic Documents Act.",
      "Strengthens individual rights over personal data — reporting highlights new rights to request deletion of personal information and to address AI-generated deepfakes.",
      "Introduces rules on automated decision-making (AI) and on so-called surveillance pricing, where prices are personalized using a person's data.",
      "Creates a new Digital Safety and Data Protection Commission of Canada to oversee private-sector compliance; the Privacy Commissioner continues to oversee federal public-sector privacy.",
      "Makes consequential amendments to several federal statutes, including the Access to Information Act, the Privacy Act and the Competition Act.",
      "Sponsored by the Minister of Artificial Intelligence and Digital Innovation and tabled June 15, 2026; coverage describes it as the largest overhaul of Canadian private-sector privacy law in a generation.",
    ],
  },
  "C-22": {
    overview:
      "Bill C-22 modernizes 'lawful access' — the rules letting police and intelligence agencies obtain digital information. It updates investigative powers in several existing laws and creates a new obligation for service providers to be able to hand over data when legally compelled.",
    points: [
      "Part 1 amends the Criminal Code, the CSIS Act, the Mutual Legal Assistance in Criminal Matters Act, the Controlled Drugs and Substances Act and the Cannabis Act to update tools for gathering information in investigations.",
      "Part 2 enacts the Supporting Authorized Access to Information Act, requiring electronic service providers to be technically able to facilitate authorized access to information for police and CSIS when legally authorized.",
      "Reintroduces lawful-access measures that were originally part of the Strong Borders Act (Bill C-2) and were split out after criticism.",
      "The government states the bill does not require encryption 'backdoors'; civil-liberties groups, technologists and major technology firms have raised privacy and cybersecurity concerns, including over metadata retention.",
      "New access orders under the Act are subject to approval by the Intelligence Commissioner.",
      "Part 3 requires a parliamentary review of Parts 1 and 2 after they come into force.",
    ],
  },
  "C-34": {
    overview:
      "Bill C-34 is Canada's online-safety law for young people. It sets safety duties for social media and AI chatbot services, restricts social media accounts for under-16s, and creates a new regulator to enforce the rules.",
    points: [
      "Part 1 enacts the Digital Safety Act, setting duties for social media and AI chatbot services — assessing risks, safety-by-design and age-appropriate features, user tools, and published digital safety plans.",
      "Restricts social media accounts for people under 16, with a pathway for platforms to seek an exemption by demonstrating sufficient safeguards for younger users.",
      "Brings AI chatbot services within the online-safety framework.",
      "Part 2 enacts the Digital Safety Commission of Canada Act, creating an independent Digital Safety Commission to administer and enforce the new regime.",
      "Makes consequential amendments to other Acts, including the Access to Information Act and the Privacy Act.",
      "Sponsored by the Minister of Canadian Identity and Culture and tabled June 10, 2026; officials have signalled the under-16 rules would realistically take effect in 2027–2028.",
    ],
  },
  "C-8": {
    overview:
      "Bill C-8 is the backbone of Canada's critical-infrastructure cybersecurity regime. It makes securing the telecom system a formal policy goal and creates binding cybersecurity obligations for operators of systems vital to national security or public safety.",
    points: [
      "Part 1 amends the Telecommunications Act to make securing Canada's telecom system a policy objective and lets the government direct telecom providers to act (or refrain from acting) to secure the system, backed by an administrative monetary penalty scheme.",
      "Part 2 enacts the Critical Cyber Systems Protection Act (CCSPA) to protect cyber systems vital to national security or public safety.",
      "Lets the government designate 'vital services and systems' and classes of operators across sectors such as finance, telecommunications, energy and transportation.",
      "Requires designated operators to establish cybersecurity programs, manage supply-chain and third-party risks, report cybersecurity incidents, and comply with binding cybersecurity directions.",
      "Provides for information sharing among relevant parties and for enforcement, with penalties for non-compliance.",
      "Sponsored by the Minister of Public Safety and tabled June 18, 2025; it is at the final stage in the Senate.",
    ],
  },
};

module.exports = { summaries, CAVEAT };
