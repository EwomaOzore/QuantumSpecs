export type OpsFilters = {
  region: string;
  city: string;
  metric: string;
  period: string;
  type: string;
  status: string;
  q: string;
};

export const DEFAULT_OPS_FILTERS: OpsFilters = {
  region: "west-africa",
  city: "lagos",
  metric: "uptime",
  period: "24h",
  type: "",
  status: "",
  q: "",
};

const KEYS: (keyof OpsFilters)[] = ["region", "city", "metric", "period", "type", "status", "q"];

export function parseOpsFilters(params: URLSearchParams): OpsFilters {
  return {
    region: params.get("region") ?? "",
    city: params.get("city") ?? "",
    metric: params.get("metric") ?? DEFAULT_OPS_FILTERS.metric,
    period: params.get("period") ?? DEFAULT_OPS_FILTERS.period,
    type: params.get("type") ?? "",
    status: params.get("status") ?? "",
    q: params.get("q") ?? "",
  };
}

export function serializeOpsFilters(filters: Partial<OpsFilters>, base?: OpsFilters) {
  const merged: OpsFilters = {
    ...DEFAULT_OPS_FILTERS,
    ...base,
    ...filters,
  };
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = merged[key];
    if (value) params.set(key, value);
  }
  return params;
}

export function filtersHref(path: string, filters: Partial<OpsFilters>, base?: OpsFilters) {
  const qs = serializeOpsFilters(filters, base).toString();
  return qs ? `${path}?${qs}` : path;
}
