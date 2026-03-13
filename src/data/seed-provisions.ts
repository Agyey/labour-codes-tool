import type { Provision } from "@/types/provision";

/**
 * Seed provisions — the initial dataset for all 4 labour codes.
 * Covers the most critical provisions across CoW, IRC, CoSS, and OSHW.
 */
export const SEED_PROVISIONS: Provision[] = [
  // ===== CODE ON WAGES (CoW) =====
  {
    id: "CoW-2y", code: "CoW", ch: "I", chName: "Preliminary", sec: "2", sub: "(y)", title: "Definition — 'wages'", provisionType: "section", subSections: [], linkedRuleRefs: ["Draft CoW Rules 2025 — R.3", "Draft CoW Rules 2025 — R.4"], ruleAuth: "Central Government",
    summary: "UNIFIED DEFINITION replacing 4 different definitions. Wages = Basic Pay + DA + Retaining Allowance. Excludes: bonus, HRA, conveyance, OT, commission, gratuity, retrenchment compensation, employer PF/pension. THE 50% RULE: if total exclusions exceed 50% of all remuneration, excess deemed wages. For equal pay & payment of wages: conveyance, HRA, awards, OT are INCLUDED (broader base). Remuneration in kind capped at 15%.",
    fullText: "\"wages\" means all remuneration whether by way of salaries, allowances or otherwise... includes (i) basic pay; (ii) dearness allowance; (iii) retaining allowance, if any, but does not include— (a) bonus not part of employment terms; (b) house-accommodation/amenities; (c) employer PF/pension; (d) conveyance allowance; (e) special expenses; (f) HRA; (g) award/settlement remuneration; (h) OT allowance; (i) commission; (j) gratuity; (k) retrenchment compensation/retirement benefit. Proviso 1: If exclusions (a)-(i) exceed 50% of total remuneration, excess deemed wages. Proviso 2: For equal pay and payment of wages, (d),(f),(g),(h) included. Explanation: Remuneration in kind ≤15% deemed part of wages.",
    oldMappings: [
      { act: "Payment of Wages Act, 1936", sec: "S.2(vi)", summary: "Widest old definition — included all remuneration, OT, most allowances. Excluded bonus, housing, PF, travel, gratuity.", fullText: "\"wages\" means all remuneration expressed in terms of money including overtime wages. Excludes bonus, house accommodation, PF/pension, travel, gratuity.", change: "PoW had widest definition including OT and most allowances. New definition narrows base to Basic+DA+RA but 50% rule prevents gaming. For PAYMENT OF WAGES purposes, Second Proviso adds back conveyance, HRA, awards, OT — partially restoring PoW width.", changeTags: ["Definition changed"] },
      { act: "Minimum Wages Act, 1948", sec: "S.2(h)", summary: "Included HRA explicitly within wages. All remuneration for scheduled employment.", fullText: "\"wages\" means all remuneration capable of being expressed in terms of money. Includes house rent allowance.", change: "HRA was INCLUDED in MW Act wages — now EXCLUDED under S.2(y)(f). For equal pay and payment purposes, HRA added back via Second Proviso. MW computation base may be lower unless 50% rule triggers.", changeTags: ["Definition changed"] },
      { act: "Payment of Bonus Act, 1965", sec: "S.2(21)", summary: "Narrowest definition — only Basic + DA. Used for bonus calculation. Employees earning >₹21,000 excluded.", fullText: "\"salary or wage\" means all remuneration other than overtime. Includes DA.", change: "Bonus Act already used Basic+DA — closest to new definition. 50% anti-avoidance rule means high-allowance structures see excess added to bonus base. Wage thresholds no longer hardcoded — to be notified.", changeTags: ["Definition changed", "Threshold changed"] },
      { act: "Equal Remuneration Act, 1976", sec: "S.2(g)", summary: "Broadest — 'remuneration' meant basic + any additional emoluments whatsoever, cash or kind.", fullText: "\"remuneration\" means basic wage/salary and any additional emoluments whatsoever in cash or kind.", change: "ER Act was broadest. New Code narrows for most purposes but Second Proviso preserves wider base specifically for equal pay. Now gender-neutral, not just men vs women.", changeTags: ["Definition changed", "Coverage expanded"] },
    ],
    impact: "Critical", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"], workflowTags: ["Financially material", "Urgent action needed"],
    compItems: [
      { task: "Restructure CTC/salary to comply with 50% rule", assignee: "", due: "" },
      { task: "Model financial impact — old vs new wage base per statutory purpose", assignee: "", due: "" },
      { task: "Recalculate PF, ESI, gratuity, bonus, leave encashment, OT on new base", assignee: "", due: "" },
      { task: "Update payroll software with 50% cap logic", assignee: "", due: "" },
      { task: "Review all employment contracts and offer letters", assignee: "", due: "" },
      { task: "Obtain fresh actuarial valuation for gratuity", assignee: "", due: "" },
    ],
    draftRules: [
      { ref: "Draft CoW Rules 2025 — R.3", summary: "Manner of calculating wages by hour/day/month — conversion methodology." },
      { ref: "Draft CoW Rules 2025 — R.4", summary: "Norms for MW fixation: 3 consumption units/earner, 2700 cal/day, 66m cloth/family/year, housing 10%, misc 25%." },
    ],
    repealedRules: [
      { ref: "MW (Central) Rules, 1950 — R.3-4", summary: "Old consumption norms for MW fixation." },
      { ref: "Payment of Bonus Rules, 1975", summary: "Old bonus computation on narrow wage base." },
    ],
    forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [],
    stateNotes: { Centre: "50% rule is Central — applies uniformly. Draft Rules R.4 prescribes consumption norms.", Delhi: "Historically higher MW — restructuring impact significant.", Karnataka: "IT/ITES sector: significant CTC restructuring expected.", Maharashtra: "Large organised sector — systematic restructuring needed.", "Tamil Nadu": "Manufacturing sector — wage structure review needed.", Telangana: "IT sector Hyderabad — CTC restructuring impact." },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "Most consequential provision across all 4 Codes. Affects every statutory calculation.", verified: false, pinned: true, assignee: "", dueDate: "",
  },

  {
    id: "CoW-2k", code: "CoW", ch: "I", chName: "Preliminary", sec: "2", sub: "(k)", title: "Definition — 'employee'", provisionType: "section", subSections: [], linkedRuleRefs: ["Draft CoW Rules 2025 — R.2"], ruleAuth: "Appropriate Government",
    summary: "UNIFIED: Any person (except apprentices) employed on wages for skilled, semi-skilled, unskilled, manual, operational, supervisory, managerial, administrative, technical or clerical work. NO WAGE CEILING. Includes persons declared by Govt. Excludes only Armed Forces.",
    fullText: "\"employee\" means any person (other than an apprentice under the Apprentices Act, 1961) employed on wages by an establishment to do any skilled, semi-skilled or unskilled, manual, operational, supervisory, managerial, administrative, technical or clerical work for hire or reward, whether express or implied, and includes a person declared to be an employee by the appropriate Government, but does not include any member of the Armed Forces of the Union.",
    oldMappings: [
      { act: "Payment of Wages Act, 1936", sec: "S.2(vi)", summary: "Limited to persons earning ≤₹24,000/month in factories, railways, notified establishments only.", fullText: "\"employed person\" includes legal representative of deceased. Applied only to wages ≤₹24,000/month.", change: "REMOVED: ₹24,000 wage ceiling. REMOVED: factory/railway/notified establishment restriction. Every employee regardless of salary now covered.", changeTags: ["Threshold changed", "Coverage expanded", "Applicability changed"] },
      { act: "Minimum Wages Act, 1948", sec: "S.2(i)", summary: "Only persons in 'scheduled employment' — listed occupations.", fullText: "\"employee\" means any person employed for hire or reward in a scheduled employment.", change: "REMOVED: scheduled employment limitation. All employees in all occupations now covered for minimum wages.", changeTags: ["Coverage expanded", "Definition changed", "Applicability changed"] },
      { act: "Payment of Bonus Act, 1965", sec: "S.2(13)", summary: "Limited to persons earning ≤₹21,000/month.", fullText: "\"employee\" means any person employed on salary/wage not exceeding ₹21,000 per mensem.", change: "REMOVED: ₹21,000 ceiling (threshold to be notified). Added 'operational' and 'semi-skilled' categories explicitly.", changeTags: ["Threshold changed", "Definition changed"] },
      { act: "Equal Remuneration Act, 1976", sec: "S.2(c)", summary: "Defined by cross-reference. Any person employed for remuneration.", fullText: "Defined by reference to other Acts.", change: "Self-contained definition now. Gender-neutral. Broader work categories enumerated explicitly.", changeTags: ["Definition changed"] },
    ],
    impact: "Critical", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"], workflowTags: ["Financially material"],
    compItems: [
      { task: "Extend coverage to ALL employees — remove wage ceiling exclusions", assignee: "", due: "" },
      { task: "Include supervisory/managerial/administrative in compliance scope", assignee: "", due: "" },
      { task: "Map previously excluded worker categories", assignee: "", due: "" },
      { task: "Update HRIS to remove wage-ceiling filters", assignee: "", due: "" },
    ],
    draftRules: [{ ref: "Draft CoW Rules 2025 — R.2", summary: "Defines unskilled, semi-skilled, skilled, highly skilled for MW fixation. Defines 'family'." }],
    repealedRules: [{ ref: "MW (Central) Rules, 1950 — R.2", summary: "Old definitions for employees in scheduled employment." }],
    forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [],
    stateNotes: { Centre: "Universal.", Delhi: "Same.", Karnataka: "Same.", Maharashtra: "Same.", "Tamil Nadu": "Same.", Telangana: "Same." },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: false, assignee: "", dueDate: "",
  },

  {
    id: "CoW-17", code: "CoW", ch: "III", chName: "Payment of Wages", sec: "17", sub: "", title: "Time limit for payment of wages", provisionType: "section", subSections: [], linkedRuleRefs: [], ruleAuth: "Appropriate Government",
    summary: "Specific timelines: Daily — end of shift. Weekly — last working day. Fortnightly — 2nd day after fortnight. Monthly — 7th of succeeding month. ON SEPARATION (removal/dismissal/retrenchment/resignation/closure): within 2 WORKING DAYS. Appropriate Govt may prescribe different limits.",
    fullText: "(1) Employer shall pay wages: (i) daily — end of shift; (ii) weekly — last working day of week; (iii) fortnightly — before end of 2nd day after fortnight; (iv) monthly — before 7th of succeeding month. (2) Where employee removed/dismissed/retrenched/resigned or unemployed due to closure — wages paid within 2 working days. (3) Appropriate Govt may provide other time limit. (4) Does not affect other laws.",
    oldMappings: [
      { act: "Payment of Wages Act, 1936", sec: "S.5", summary: "Monthly: before 7th day (<1000 employees) or 10th day (1000+). Discharged: before next pay day.", fullText: "(1) Wages paid before 7th day (<1000) or 10th day (1000+). (4) Discharged employee: before next pay day or within 2 days, whichever earlier.", change: "2-DAY full & final settlement is TRANSFORMATIONAL — previously could wait until next pay day. No more distinction between <1000 and 1000+ establishments. Monthly timeline standardised at 7th for all.", changeTags: ["Timeline changed", "Procedure changed"] },
    ],
    impact: "Critical", changeTags: ["Timeline changed", "Procedure changed"], workflowTags: ["Urgent action needed", "Financially material"],
    compItems: [
      { task: "Restructure exit process for 2-day full & final settlement", assignee: "", due: "" },
      { task: "Automate F&F computation for rapid processing", assignee: "", due: "" },
      { task: "Update payroll systems for new timeline", assignee: "", due: "" },
      { task: "Review separation/exit policies", assignee: "", due: "" },
    ],
    draftRules: [], repealedRules: [], forms: [],
    penaltyOld: "Fine up to ₹7,500 (first); ₹22,500 + imprisonment (repeat)",
    penaltyNew: "Fine ₹50,000 (first); 3 months imprisonment or ₹1 lakh or both (repeat)",
    timelineDates: [],
    stateNotes: { Centre: "2-day F&F applies universally.", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: true, assignee: "", dueDate: "",
  },

  // ===== INDUSTRIAL RELATIONS CODE (IRC) =====
  {
    id: "IRC-2l", code: "IRC", ch: "I", chName: "Preliminary", sec: "2", sub: "(l)", title: "Definition — 'employee' (replaces 'workman')", provisionType: "section", subSections: [], linkedRuleRefs: ["Draft IR(C) Rules 2025 — R.2"], ruleAuth: "Not Applicable",
    summary: "'Employee' replaces 'workman'. Includes: manual, unskilled, skilled, technical, operational, supervisory, managerial, administrative, clerical. Supervisory exclusion threshold RAISED from ₹10,000 to ₹18,000/month. Explicitly includes working journalists and sales promotion employees.",
    fullText: "\"employee\" means any person (not being an apprentice) employed on wages in an industry for manual, unskilled, skilled, technical, operational, supervisory, managerial, administrative or clerical work. Excludes: Armed Forces, police, prison officers, managerial/admin capacity, supervisory drawing >₹18,000/month.",
    oldMappings: [
      { act: "Industrial Disputes Act, 1947", sec: "S.2(s) — 'workman'", summary: "'Workman' — manual, unskilled, skilled, technical, operational, clerical. Excluded supervisory >₹10,000/month and all managerial/administrative.", fullText: "\"workman\" means any person employed in any industry to do manual, unskilled, skilled, technical, operational, clerical or supervisory work. Excludes Armed Forces, police, managerial/admin, supervisory >₹10,000.", change: "Terminology: 'workman' replaced by 'employee'. Supervisory exclusion threshold raised ₹10,000→₹18,000. Workers earning ₹10,000-₹18,000 in supervisory roles NOW COVERED. Working journalists and sales promotion employees explicitly included.", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"] },
    ],
    impact: "Critical", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"], workflowTags: ["Financially material"],
    compItems: [
      { task: "Reclassify supervisory staff ₹10,000-₹18,000 — now covered", assignee: "", due: "" },
      { task: "Extend IR protections to newly included employees", assignee: "", due: "" },
      { task: "Update workforce databases", assignee: "", due: "" },
    ],
    draftRules: [{ ref: "Draft IR(C) Rules 2025 — R.2", summary: "Defines 'electronically', 'Form', adopts Code meanings." }],
    repealedRules: [{ ref: "ID (Central) Rules, 1957 — R.2", summary: "Old definitions under ID Act." }],
    forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [],
    stateNotes: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: false, assignee: "", dueDate: "",
  },

  {
    id: "IRC-77", code: "IRC", ch: "IX", chName: "Lay-off, Retrenchment & Closure", sec: "77", sub: "", title: "Prior permission for lay-off/retrenchment (300+ workers)", provisionType: "section", subSections: [], linkedRuleRefs: [], ruleAuth: "Appropriate Government",
    summary: "THRESHOLD RAISED: Prior Govt permission for lay-off/retrenchment now required only for 300+ workers (was 100+). Establishments with 100-299 workers: NO prior permission needed — only notice + compensation. Govt may change threshold by notification. Deemed permission if no Govt response in 60 days.",
    fullText: "No employer of an industrial establishment in which 300 or more workers are employed shall lay-off or retrench any worker until prior permission obtained from appropriate Government. Application decided within 60 days — deemed granted if no response.",
    oldMappings: [
      { act: "Industrial Disputes Act, 1947", sec: "S.25M, S.25N", summary: "Prior Govt permission required for establishments with 100+ workers. Made hiring/firing difficult for medium establishments.", fullText: "S.25M: Employer of industrial establishment with ≥100 workmen cannot lay-off without prior permission. S.25N: Same for retrenchment.", change: "THRESHOLD TRIPLED: 100→300 workers. Establishments with 100-299 workers gain significant flexibility — can retrench with just notice + compensation, no Govt approval. 60-day deemed approval prevents bureaucratic delays. Govt can change threshold by notification (could go up or down).", changeTags: ["Threshold changed", "Procedure changed", "Authority changed"] },
    ],
    impact: "Critical", changeTags: ["Threshold changed", "Procedure changed"], workflowTags: ["Financially material"],
    compItems: [
      { task: "Identify establishment size: <100 / 100-299 / 300+", assignee: "", due: "" },
      { task: "100-299 workers: update retrenchment SOP — no prior permission needed", assignee: "", due: "" },
      { task: "300+: note 60-day deemed approval mechanism", assignee: "", due: "" },
      { task: "Reassess workforce restructuring strategies", assignee: "", due: "" },
    ],
    draftRules: [],
    repealedRules: [{ ref: "ID (Central) Rules, 1957", summary: "Old rules on prior permission for 100+ establishments." }],
    forms: [],
    penaltyOld: "Illegal retrenchment: reinstatement + back wages",
    penaltyNew: "Similar — reinstatement + back wages. Enhanced penalties for non-compliance.",
    timelineDates: [],
    stateNotes: { Centre: "300 threshold is Central default. States may notify different threshold.", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: true, assignee: "", dueDate: "",
  },

  {
    id: "IRC-62", code: "IRC", ch: "VIII", chName: "Strikes & Lock-outs", sec: "62", sub: "", title: "Prohibition of strikes and lock-outs", provisionType: "section", subSections: [], linkedRuleRefs: [], ruleAuth: "Appropriate Government",
    summary: "14-day advance notice NOW MANDATORY for ALL establishments (was only public utility services). Strike prohibited: without 60-day notice, within 14 days of notice, before specified date, during conciliation/tribunal + 7 days after, during arbitration + 60 days after. Mass casual leave by 50%+ workers = strike.",
    fullText: "No person employed shall go on strike without giving notice within 60 days before striking, within 14 days of giving such notice, before the date of strike specified in the notice, and during any period in which conciliation/tribunal/arbitration proceedings are pending.",
    oldMappings: [
      { act: "Industrial Disputes Act, 1947", sec: "S.22-23", summary: "14 days notice required ONLY in public utility services. Other establishments: strike without notice permitted.", fullText: "S.22: No strike in public utility service without 14 days notice. S.23: No strike during conciliation/adjudication proceedings.", change: "UNIVERSAL NOTICE: 14-day requirement extended from public utilities to ALL industrial establishments. Expanded strike definition includes mass casual leave (50%+ workers). Significant restriction on strike action. Penalty: up to 1 month imprisonment or ₹50,000 or both.", changeTags: ["Applicability changed", "Coverage expanded", "Penalty changed", "Definition changed"] },
    ],
    impact: "Critical", changeTags: ["Applicability changed", "Coverage expanded", "Penalty changed"], workflowTags: ["Urgent action needed"],
    compItems: [
      { task: "Update IR policies — strike notice now universal", assignee: "", due: "" },
      { task: "Train management on 14-day notice + cooling period rules", assignee: "", due: "" },
      { task: "Monitor mass casual leave patterns as potential illegal strikes", assignee: "", due: "" },
      { task: "Establish rapid-response protocol for strike notices", assignee: "", due: "" },
    ],
    draftRules: [], repealedRules: [], forms: [],
    penaltyOld: "Imprisonment up to 1 month or fine ₹50 or both (public utility only)",
    penaltyNew: "Imprisonment up to 1 month or fine ₹50,000 or both (ALL establishments)",
    timelineDates: [],
    stateNotes: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: false, assignee: "", dueDate: "",
  },

  // ===== CODE ON SOCIAL SECURITY (CoSS) =====
  {
    id: "CoSS-53", code: "CoSS", ch: "V", chName: "Gratuity", sec: "53", sub: "", title: "Payment of gratuity", provisionType: "section", subSections: [], linkedRuleRefs: ["Draft CoSS Rules 2025"], ruleAuth: "Appropriate Government",
    summary: "Regular employees: gratuity after 5 years continuous service (same). FIXED TERM EMPLOYEES: eligible for pro-rata gratuity after just 1 YEAR (major change). Calculation: 15 days' wages × years of service — but 'wages' now per new unified definition. Working journalists: 15 days × 3 × years. Gratuity on: termination, superannuation, resignation, death, disablement, FTE contract expiry.",
    fullText: "Gratuity payable to every employee on termination after not less than 5 years continuous service. For fixed-term: payable on a pro-rata basis after completion of one year. Rate: 15 days' wages for every completed year of service or part thereof in excess of six months.",
    oldMappings: [
      { act: "Payment of Gratuity Act, 1972", sec: "S.4", summary: "Gratuity after 5 years continuous service. 15 days' wages (last drawn basic+DA) per year. Max ₹20 lakh. Applied to 10+ employee establishments.", fullText: "S.4: Gratuity payable to every employee after not less than 5 years continuous service at rate of 15 days' wages per completed year. Maximum ₹20 lakh.", change: "FTE GRATUITY after 1 year is transformational — no previous provision. Wage base changes from 'last drawn basic+DA' to new unified definition (50% rule applies). Max limit to be notified (not hardcoded at ₹20 lakh). Draft Rules clarify: performance-linked annual payments NOT included in gratuity wages. Balance sheet impact significant due to wage base change.", changeTags: ["Coverage expanded", "Definition changed", "Threshold changed", "New provision"] },
    ],
    impact: "Critical", changeTags: ["Coverage expanded", "Definition changed", "Threshold changed", "New provision"], workflowTags: ["Financially material", "Urgent action needed"],
    compItems: [
      { task: "Provide pro-rata gratuity for FTE after 1 year", assignee: "", due: "" },
      { task: "Recalculate gratuity on new wage definition", assignee: "", due: "" },
      { task: "Obtain fresh actuarial valuation", assignee: "", due: "" },
      { task: "Update gratuity trust/insurance funding", assignee: "", due: "" },
      { task: "Review FTE appointment letters for gratuity terms", assignee: "", due: "" },
      { task: "Model balance sheet impact", assignee: "", due: "" },
    ],
    draftRules: [{ ref: "Draft CoSS Rules 2025", summary: "Performance-linked annual payments not part of gratuity wages. Gratuity applies prospectively from 21 Nov 2025." }],
    repealedRules: [{ ref: "PG (Central) Rules, 1972", summary: "Old gratuity computation rules on last-drawn basic+DA." }],
    forms: [],
    penaltyOld: "6 months imprisonment or ₹10,000 fine or both",
    penaltyNew: "Enhanced penalties under unified Code framework",
    timelineDates: [{ date: "2025-11-21", label: "Gratuity provisions effective — applies prospectively" }],
    stateNotes: { Centre: "Gratuity applies prospectively from 21 Nov 2025.", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "No SS draft rules published.", Telangana: "" },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: true, assignee: "", dueDate: "",
  },

  {
    id: "CoSS-109", code: "CoSS", ch: "IX", chName: "Unorganised, Gig & Platform Workers", sec: "109-114", sub: "", title: "Social security for gig and platform workers", provisionType: "section", subSections: [], linkedRuleRefs: ["Draft CoSS Rules 2025"], ruleAuth: "Central Government",
    summary: "TRANSFORMATIONAL: (1) Gig workers and platform workers formally recognized for first time. (2) Central Govt may frame SS schemes for: life/disability insurance, health, maternity, old age, education, housing, food. (3) Aggregators to contribute 1-2% of annual turnover (max 5% of payments to workers). (4) Self-registration on portal. (5) Aadhaar-based identity. (6) Draft Rules prescribe minimum engagement thresholds.",
    fullText: "S.109-114: Central Government may frame welfare schemes for unorganised, gig and platform workers. Aggregators required to contribute 1-2% of annual turnover. National/State Social Security Boards. Workers self-register on designated portal.",
    oldMappings: [
      { act: "Unorganised Workers SS Act, 2008", sec: "S.3-10", summary: "Created National Social Security Board. Provided for life/disability insurance, health/maternity, old age for unorganised workers. Implementation was weak.", fullText: "S.3: National Social Security Board. S.4: State Boards. S.5-7: Registration and record-keeping. S.8-10: Schemes for unorganised workers.", change: "UWSS Act framework STRENGTHENED and MASSIVELY EXPANDED. Gig and platform workers are entirely new categories — no previous coverage. Aggregator contribution (1-2% turnover) is new mandatory obligation. Digital registration replaces paper-based. Aadhaar-linked portability is new.", changeTags: ["New provision", "Coverage expanded", "Definition changed", "Procedure changed"] },
    ],
    impact: "Critical", changeTags: ["New provision", "Coverage expanded", "Definition changed"], workflowTags: ["Rules pending", "Financially material"],
    compItems: [
      { task: "Determine if business qualifies as 'aggregator'", assignee: "", due: "" },
      { task: "If aggregator: budget for 1-2% turnover contribution", assignee: "", due: "" },
      { task: "Register gig/platform workers on portal", assignee: "", due: "" },
      { task: "Track Central scheme notifications", assignee: "", due: "" },
      { task: "Monitor eligibility thresholds in final rules", assignee: "", due: "" },
    ],
    draftRules: [{ ref: "Draft CoSS Rules 2025", summary: "Minimum engagement thresholds for gig worker SS eligibility. Registration procedures on Shram Suvidha Portal." }],
    repealedRules: [{ ref: "UWSS Rules, 2009", summary: "Old rules for unorganised worker registration." }],
    forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [],
    stateNotes: { Centre: "Central schemes to be framed. Portal being set up.", Delhi: "Urban gig economy focus expected.", Karnataka: "Separate Karnataka Gig Workers Act, 2025 enacted — welfare fee notified.", Maharashtra: "Large gig workforce.", "Tamil Nadu": "No SS draft rules published.", Telangana: "Hyderabad gig economy." },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "Karnataka Platform Based Gig Workers (SS & Welfare) Act, 2025", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: true, assignee: "", dueDate: "",
  },

  // ===== OSH & WORKING CONDITIONS CODE (OSHW) =====
  {
    id: "OSHW-6", code: "OSHW", ch: "II", chName: "Registration & Duties", sec: "6", sub: "", title: "Appointment letters mandatory + employer duties", provisionType: "section", subSections: [], linkedRuleRefs: ["Draft OSHW Rules 2025"], ruleAuth: "Appropriate Government",
    summary: "MANDATORY appointment letters for ALL employees with prescribed details (name, DOB, nature of employment, wages, social security info etc.) before commencement or within 3 months of rules. Employers must: ensure hazard-free workplace, provide safe systems, free annual health check-ups for employees aged 40+ within 120 days of calendar year.",
    fullText: "Every employer shall issue appointment letter to every employee before commencement of employment containing prescribed particulars. Employer to ensure workplace free from hazards, provide safe work systems, conduct annual health check-ups for employees aged 40+.",
    oldMappings: [
      { act: "Factories Act, 1948", sec: "S.7A, S.11-20", summary: "No mandatory appointment letter. Safety duties were factory-specific: cleanliness, ventilation, temperature, dust/fumes, lighting, drinking water, latrines etc.", fullText: "S.11-20: Cleanliness, disposal of waste, ventilation, temperature, dust and fume, artificial humidification, overcrowding, lighting, drinking water, latrines and urinals, spittoons.", change: "APPOINTMENT LETTER is entirely new statutory requirement — no previous Act mandated it. Health check-ups for 40+ also new. Safety duties consolidated and broadened from factory-specific to all establishments.", changeTags: ["New provision", "Coverage expanded", "Procedure changed"] },
      { act: "Contract Labour (R&A) Act, 1970", sec: "S.7-12", summary: "No appointment letter requirement. Contractor licensing and registration provisions.", fullText: "S.7: Registration of establishments. S.12: Licensing of contractors.", change: "Appointment letters now mandatory for contract labour too. Single pan-India contractor license replaces state-by-state licensing.", changeTags: ["New provision", "Procedure changed"] },
    ],
    impact: "High", changeTags: ["New provision", "Coverage expanded", "Procedure changed"], workflowTags: ["Urgent action needed"],
    compItems: [
      { task: "Issue appointment letters to ALL existing employees within 3 months of rules", assignee: "", due: "" },
      { task: "Include prescribed details: name, DOB, wages, SS info, employment nature", assignee: "", due: "" },
      { task: "Identify employees aged 40+ for annual health check-ups", assignee: "", due: "" },
      { task: "Empanel medical practitioners for health checks", assignee: "", due: "" },
      { task: "Schedule check-ups within 120 days of calendar year", assignee: "", due: "" },
    ],
    draftRules: [{ ref: "Draft OSHW Rules 2025", summary: "Appointment letter format prescribed. Health check-up in Form-V. Electronic notice of commencement/cessation in Form-IV within 30 days." }],
    repealedRules: [
      { ref: "Factories Act Rules", summary: "Old factory-specific safety provisions." },
      { ref: "Contract Labour (Central) Rules, 1971", summary: "Old contractor licensing rules (state-by-state)." },
    ],
    forms: [
      { ref: "Form-IV", summary: "Electronic notice of commencement/cessation of establishment." },
      { ref: "Form-V", summary: "Annual health check-up record for employees aged 40+." },
    ],
    penaltyOld: "", penaltyNew: "Up to ₹2 lakh fine (first); enhanced for repeat",
    timelineDates: [],
    stateNotes: { Centre: "Appointment letters within 3 months of final rules.", Delhi: "", Karnataka: "IT/ITES: many already issue appointment letters — formal compliance needed.", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: false, assignee: "", dueDate: "",
  },

  {
    id: "OSHW-57", code: "OSHW", ch: "VIII", chName: "Contract Labour & Migrant Workers", sec: "57", sub: "", title: "Contract labour in core activities — prohibition", provisionType: "section", subSections: [], linkedRuleRefs: ["Draft OSHW Rules 2025"], ruleAuth: "Appropriate Government",
    summary: "Contract labour PROHIBITED in core activities of establishment. Exceptions: (1) work customarily done by contractors, (2) does not require full-time workers, (3) temporary increase in workload. Appropriate Govt to define 'core activities'. Regular contractor employees with agreed conditions, increments, SS coverage EXCLUDED from contract labour definition. New: 2% minimum annual increment for regular contractor employees. Pan-India single license for contractors.",
    fullText: "No contract labour shall be employed in core activities. Exceptions: customary contractor work, not requiring full-time, temporary surge. Appropriate Government to define core activities. Contractors may obtain single pan-India license.",
    oldMappings: [
      { act: "Contract Labour (R&A) Act, 1970", sec: "S.10", summary: "Appropriate Govt COULD prohibit contract labour in any process/operation after advisory board recommendation. No concept of 'core activities'.", fullText: "S.10: Appropriate Government may prohibit employment of contract labour in any process, operation or other work in any establishment after consultation with the Board.", change: "Prohibition now AUTOMATIC for core activities (no advisory board needed). 'Core activities' concept is new — to be defined by Govt. Exceptions carved out. Regular contractor employees explicitly excluded from definition. 2% annual increment for regular contractor employees is new. Pan-India single license is major simplification.", changeTags: ["Procedure changed", "Definition changed", "New provision", "Coverage expanded"] },
    ],
    impact: "Critical", changeTags: ["Procedure changed", "Definition changed", "New provision", "Coverage expanded"], workflowTags: ["Urgent action needed", "Financially material"],
    compItems: [
      { task: "Audit ALL contractor engagements against core activity prohibition", assignee: "", due: "" },
      { task: "Classify activities as core vs non-core", assignee: "", due: "" },
      { task: "Restructure prohibited contract labour arrangements", assignee: "", due: "" },
      { task: "Ensure regular contractor employees get 2% annual increment", assignee: "", due: "" },
      { task: "Contractors: apply for single pan-India license", assignee: "", due: "" },
    ],
    draftRules: [{ ref: "Draft OSHW Rules 2025", summary: "Single license for contractors across states. Principal employer responsible for basic on-premises facilities." }],
    repealedRules: [{ ref: "Contract Labour (Central) Rules, 1971", summary: "Old state-by-state licensing. No core activity concept." }],
    forms: [],
    penaltyOld: "Imprisonment up to 3 months or fine up to ₹1,000",
    penaltyNew: "Enhanced penalties under OSHW Code",
    timelineDates: [],
    stateNotes: { Centre: "Core activities to be defined by notification.", Delhi: "Significant contract labour economy.", Karnataka: "IT/ITES sector exemptions expected.", Maharashtra: "Large manufacturing — significant impact.", "Tamil Nadu": "Manufacturing hub — compliance impact.", Telangana: "IT sector considerations." },
    stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" },
    stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
    notes: "", verified: false, pinned: true, assignee: "", dueDate: "",
  },
];
