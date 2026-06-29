import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { i18n } from "@/i18n";
import { SitterFilters } from "@/interfaces";
import {
  createSitterFilterDraft,
  normalizeSitterFilterDraft,
  SitterDraftFilters,
} from "./filters";

type AppliedFilterKey = keyof SitterFilters;

interface SitterFiltersContextValue {
  appliedFilters: SitterFilters;
  draftFilters: SitterDraftFilters;
  filterRevision: number;
  beginEditing: () => void;
  discardDraft: () => void;
  resetDraft: () => void;
  updateDraft: (filters: Partial<SitterDraftFilters>) => void;
  applyDraft: () => string | null;
  clearAppliedFilters: () => void;
  removeAppliedFilter: (key: AppliedFilterKey) => void;
}

const EMPTY_FILTERS: SitterFilters = {};

const SitterFiltersContext = createContext<SitterFiltersContextValue | null>(
  null,
);

export const SitterFiltersProvider = ({ children }: PropsWithChildren) => {
  const [appliedFilters, setAppliedFilters] =
    useState<SitterFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<SitterDraftFilters>(() =>
    createSitterFilterDraft(EMPTY_FILTERS),
  );
  const [filterRevision, setFilterRevision] = useState(0);

  const beginEditing = useCallback(() => {
    setDraftFilters(createSitterFilterDraft(appliedFilters));
  }, [appliedFilters]);

  const discardDraft = useCallback(() => {
    setDraftFilters(createSitterFilterDraft(appliedFilters));
  }, [appliedFilters]);

  const resetDraft = useCallback(() => {
    setDraftFilters(createSitterFilterDraft(EMPTY_FILTERS));
  }, []);

  const updateDraft = useCallback((filters: Partial<SitterDraftFilters>) => {
    setDraftFilters((current) => ({ ...current, ...filters }));
  }, []);

  const applyDraft = useCallback(() => {
    const result = normalizeSitterFilterDraft(draftFilters);

    if (!result.filters) {
      return result.error ?? i18n.t("apiError.genericText");
    }

    setAppliedFilters(result.filters);
    setDraftFilters(createSitterFilterDraft(result.filters));
    setFilterRevision((revision) => revision + 1);
    return null;
  }, [draftFilters]);

  const clearAppliedFilters = useCallback(() => {
    setAppliedFilters(EMPTY_FILTERS);
    setFilterRevision((revision) => revision + 1);
  }, []);

  const removeAppliedFilter = useCallback((key: AppliedFilterKey) => {
    setAppliedFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setFilterRevision((revision) => revision + 1);
  }, []);

  const value = useMemo<SitterFiltersContextValue>(
    () => ({
      appliedFilters,
      draftFilters,
      filterRevision,
      beginEditing,
      discardDraft,
      resetDraft,
      updateDraft,
      applyDraft,
      clearAppliedFilters,
      removeAppliedFilter,
    }),
    [
      appliedFilters,
      applyDraft,
      beginEditing,
      clearAppliedFilters,
      discardDraft,
      draftFilters,
      filterRevision,
      removeAppliedFilter,
      resetDraft,
      updateDraft,
    ],
  );

  return (
    <SitterFiltersContext.Provider value={value}>
      {children}
    </SitterFiltersContext.Provider>
  );
};

export const useSitterFilters = () => {
  const context = useContext(SitterFiltersContext);

  if (!context) {
    throw new Error(
      "useSitterFilters must be used inside SitterFiltersProvider",
    );
  }

  return context;
};
