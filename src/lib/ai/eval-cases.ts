export type EvalCase = {
  id: string;
  query: string;
  category: string;
  expectedTools: string[];
  expectEvidence?: string[];
  minConfidence?: number;
};

export const EVAL_CASES: EvalCase[] = [
  {
    id: "rev-drop",
    query: "Why did revenue drop?",
    category: "analytics",
    expectedTools: ["get_transaction_metrics"],
    expectEvidence: ["checkout", "fail"],
  },
  {
    id: "failed-tx",
    query: "Find failed transactions",
    category: "search",
    expectedTools: ["get_transaction_metrics"],
    expectEvidence: ["fail"],
  },
  {
    id: "ng-vs-gh",
    query: "Compare Nigeria vs Ghana",
    category: "regions",
    expectedTools: ["compare_regions"],
    expectEvidence: ["Nigeria vs Ghana"],
    minConfidence: 0.9,
  },
  {
    id: "create-inc",
    query: "Create incident",
    category: "actions",
    expectedTools: ["search_incidents", "get_transaction_metrics"],
    expectEvidence: ["Related incidents"],
  },
  {
    id: "summarize-outage",
    query: "Why did checkout failures increase this morning?",
    category: "investigation",
    expectedTools: ["get_transaction_metrics", "get_deployment", "query_logs"],
    expectEvidence: ["API POST", "Payment provider latency"],
    minConfidence: 0.85,
  },
];
