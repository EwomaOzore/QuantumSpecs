"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { DEFAULT_HUB, findHub, type OpsHub } from "@/lib/ops-geo";
import {
  DEFAULT_OPS_FILTERS,
  filtersHref,
  parseOpsFilters,
  serializeOpsFilters,
  type OpsFilters,
} from "@/lib/ops-filters";

export function useOpsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseOpsFilters(searchParams), [searchParams]);
  const hub = useMemo(() => findHub(filters.city || "lagos"), [filters.city]);

  useEffect(() => {
    if (filters.city) return;
    const qs = serializeOpsFilters(
      { region: DEFAULT_HUB.regionSlug, city: DEFAULT_HUB.slug },
      filters,
    ).toString();
    const url = `${pathname}?${qs}`;
    const current = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    if (current === url) return;
    window.history.replaceState(window.history.state, "", url);
  }, [filters, pathname, searchParams]);

  const replace = useCallback(
    (patch: Partial<OpsFilters>, path = pathname) => {
      const qs = serializeOpsFilters(patch, { ...filters, ...patch }).toString();
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    },
    [filters, pathname, router],
  );

  const selectHub = useCallback(
    (next: OpsHub, path = pathname) => {
      replace(
        {
          region: next.regionSlug,
          city: next.slug,
        },
        path,
      );
    },
    [pathname, replace],
  );

  const hrefFor = useCallback((path: string) => filtersHref(path, filters), [filters]);

  return { filters, hub, replace, selectHub, hrefFor, defaults: DEFAULT_OPS_FILTERS };
}
