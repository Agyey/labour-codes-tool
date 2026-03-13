import { Provision } from "@/types/provision";

export const MOCK_PRIVATE_PLACEMENT: Provision = {
  id: "mock-private-placement-" + Date.now(),
  code: "WAGES", // Using an existing code key for routing purposes
  ch: "4",
  chName: "Share Capital and Debentures",
  sec: "42",
  sub: "(1)",
  title: "Issue of shares on private placement basis",
  ruleAuth: "Central Government",
  summary: "A company may, subject to the provisions of this section, make a private placement of securities. A private placement shall be made only to a select group of persons who have been identified by the Board (herein referred to as 'identified persons'), whose number shall not exceed fifty or such higher number as may be prescribed.",
  fullText: "Explanation I.—If a company, listed or unlisted, makes an offer to allot or invites subscription, or allots, or enters into an agreement to allot, securities to more than the prescribed number of persons, whether the payment for the securities has been received or not or whether the company intends to list its securities or not on any recognised stock exchange in or outside India, the same shall be deemed to be an offer to the public and shall accordingly be governed by the provisions of Part I of this Chapter.\n\nExplanation II.—For the purposes of this section, the expression—\n(i) 'private placement' means any offer or invitation to subscribe or issue of securities to a select group of persons by a company (other than by way of public offer) through private placement offer-cum-application, which satisfies the conditions specified in this section.",
  oldMappings: [
    {
      act: "Companies Act, 1956",
      sec: "67(3)",
      summary: "Previously governed public offers and what constitutes a private offering.",
      fullText: "Old text regarding 50 persons limit.",
      change: "Stricter penalties and explicit separation of placement application and allotment money.",
      changeTags: ["Penalty Increase", "Procedure Change"]
    }
  ],
  impact: "Critical",
  changeTags: ["High Risk", "FEMA Applicable", "ROC Filing Required"],
  workflowTags: ["Board Resolution", "EGM Required", "Valuation Report"],
  compItems: [
    {
      task: "Obtain Valuation Report from Registered Valuer",
      assignee: "Financial Advisor",
      due: "Pre-Board Meeting"
    },
    {
      task: "Draft and circulate Private Placement Offer Letter (PAS-4)",
      assignee: "Legal Counsel",
      due: "Post-Board Resolution"
    },
    {
      task: "File PAS-3 (Return of Allotment) with ROC within 15 days",
      assignee: "Company Secretary",
      due: "Post-Allotment"
    }
  ],
  draftRules: [
    {
      ref: "Rule 14 of Companies (Prospectus and Allotment of Securities) Rules, 2014",
      summary: "Details the maximum limit of 200 persons (excluding QIBs and employees under ESOP) in a financial year."
    }
  ],
  repealedRules: [],
  forms: [
    {
      ref: "Form PAS-4",
      summary: "Private Placement Offer Letter template."
    },
    {
      ref: "Form PAS-5",
      summary: "Record of a private placement offer to be kept by the company."
    },
    {
      ref: "Form PAS-3",
      summary: "Return of Allotment to be filed with the Registrar."
    }
  ],
  stateNotes: {
    "Maharashtra": "Additional Stamp Duty applicable on share certificates as per the Bombay Stamp Act, 1958. Rate is 0.005% of the value of shares.",
    "Karnataka": "Stamp Duty on allotment of shares is 0.1% of the value."
  },
  stateRuleText: {
    "Maharashtra": "Article 27 of Schedule I of Bombay Stamp Act.",
    "Karnataka": "Article 20(4) of Karnataka Stamp Act, 1957."
  },
  stateCompStatus: {
    "Maharashtra": "In Progress",
    "Karnataka": "Not Started"
  },
  penaltyOld: "Fine which may extend to Rs. 10,000.",
  penaltyNew: "Penalty which may extend to the amount raised through the private placement or Rs. 2 Crores, whichever is lower. The company shall also refund all monies within 30 days.",
  timelineDates: [
    {
      label: "Board Meeting Approval",
      date: "T-30 Days"
    },
    {
      label: "Shareholder Meeting (EGM)",
      date: "T-0 Days"
    },
    {
      label: "Allotment Window Deadline",
      date: "T+60 Days"
    }
  ],
  notes: "URGENT FOR SERIES A: Ensure the valuation report is dated strictly BEFORE the board meeting that approves the private placement. Any mismatch in dates will lead to a severe compliance breach during Due Diligence.",
  verified: true,
  pinned: true,
  assignee: "John Doe (Partner)",
  dueDate: "2024-12-01T00:00:00.000Z"
};
