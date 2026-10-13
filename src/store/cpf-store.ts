"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type BrazilianUF,
  type CPFHistoryItem,
  type CPFResult,
  generateCPF,
  generateManyCPF,
  markCpfUsed,
  mergeGenerated,
  onlyDigits,
  usedFromHistory,
} from "@/lib/cpf";

export type QuantityOption = 1 | 10 | 50 | 100;

type GenerateOptions = {
  saveHistory?: boolean;
};

type CPFStore = {
  mask: boolean;
  quantity: QuantityOption;
  uf: BrazilianUF | "random";
  latest: CPFResult[];
  history: CPFHistoryItem[];
  used: CPFHistoryItem[];
  favorites: CPFResult[];
  setMask: (mask: boolean) => void;
  setQuantity: (quantity: QuantityOption) => void;
  setUF: (uf: BrazilianUF | "random") => void;
  generate: (
    quantityOverride?: number,
    options?: GenerateOptions,
  ) => CPFResult[];
  markUsed: (item: CPFResult) => void;
  clearHistory: () => void;
  toggleFavorite: (item: CPFResult) => void;
  removeFavorite: (cpf: string) => void;
};

export const useCPFStore = create<CPFStore>()(
  persist(
    (set, get) => ({
      mask: true,
      quantity: 1,
      uf: "random",
      latest: [],
      history: [],
      used: [],
      favorites: [],
      setMask: (mask) => set({ mask }),
      setQuantity: (quantity) => set({ quantity }),
      setUF: (uf) => set({ uf }),
      generate: (quantityOverride, options) => {
        const { quantity, uf, history } = get();
        const count = Math.min(Math.max(quantityOverride ?? quantity, 1), 100);
        const generateOptions = { uf, mask: true };
        const items =
          count === 1
            ? [generateCPF(generateOptions)]
            : generateManyCPF(count, generateOptions);
        const saveHistory = options?.saveHistory !== false;

        set({
          latest: items,
          history: saveHistory ? mergeGenerated(history, items) : history,
        });

        return items;
      },
      markUsed: (item) => {
        const usedAt = new Date().toISOString();
        const { history, used } = get();
        const digits = onlyDigits(item.cpf);
        const known =
          history.find((entry) => entry.cpf === digits) ?? {
            ...item,
            cpf: digits,
          };
        set({
          used: markCpfUsed(used, known, usedAt),
          history: history.map((entry) =>
            entry.cpf === digits ? { ...entry, usedAt } : entry,
          ),
        });
      },
      clearHistory: () => set({ history: [], used: [] }),
      toggleFavorite: (item) => {
        const { favorites } = get();
        const exists = favorites.some((f) => f.cpf === item.cpf);
        set({
          favorites: exists
            ? favorites.filter((f) => f.cpf !== item.cpf)
            : [item, ...favorites].slice(0, 50),
        });
      },
      removeFavorite: (cpf) =>
        set({ favorites: get().favorites.filter((f) => f.cpf !== cpf) }),
    }),
    {
      name: "devkit-cpf",
      version: 2,
      partialize: (state) => ({
        mask: state.mask,
        uf: state.uf,
        latest: state.latest,
        history: state.history,
        used: state.used,
        favorites: state.favorites,
      }),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<{
          mask: boolean;
          uf: BrazilianUF | "random";
          latest: CPFResult[];
          history: CPFHistoryItem[];
          used: CPFHistoryItem[];
          favorites: CPFResult[];
        }>;
        return {
          mask: state.mask ?? true,
          uf: state.uf ?? "random",
          latest: state.latest ?? [],
          history: state.history ?? [],
          used:
            version < 2
              ? usedFromHistory(state.history ?? [])
              : (state.used ?? []),
          favorites: state.favorites ?? [],
        };
      },
    },
  ),
);
