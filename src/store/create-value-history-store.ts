"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type LocalHistoryItem,
  LOCAL_HISTORY_LIMIT,
  makeHistoryItem,
  markLocalHistoryUsed,
  mergeLocalHistory,
  stampHistoryUsed,
  usedFromLocalHistory,
} from "@/lib/local-history";

type ValueHistoryStore = {
  history: LocalHistoryItem[];
  used: LocalHistoryItem[];
  pushGenerated: (items: { id: string; display: string }[]) => void;
  markUsed: (item: { id: string; display: string }) => void;
  clearHistory: () => void;
};

export function createValueHistoryStore(storageKey: string) {
  return create<ValueHistoryStore>()(
    persist(
      (set, get) => ({
        history: [],
        used: [],
        pushGenerated: (items) => {
          const now = new Date().toISOString();
          const nextItems = items.map((item) =>
            makeHistoryItem(item.id, item.display, now),
          );
          set({
            history: mergeLocalHistory(
              get().history,
              nextItems,
              LOCAL_HISTORY_LIMIT,
            ),
          });
        },
        markUsed: (item) => {
          const usedAt = new Date().toISOString();
          const known =
            get().history.find((entry) => entry.id === item.id) ??
            makeHistoryItem(item.id, item.display, usedAt);
          const withDisplay = { ...known, display: item.display };
          set({
            used: markLocalHistoryUsed(get().used, withDisplay, usedAt),
            history: stampHistoryUsed(get().history, item.id, usedAt),
          });
        },
        clearHistory: () => set({ history: [], used: [] }),
      }),
      {
        name: storageKey,
        partialize: (state) => ({
          history: state.history,
          used: state.used,
        }),
      },
    ),
  );
}

export function selectUsedItems(historyUsed: LocalHistoryItem[]) {
  return usedFromLocalHistory(historyUsed);
}
