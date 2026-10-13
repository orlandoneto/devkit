"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createDynamicQRId,
  normalizeDestination,
  type DynamicQRItem,
} from "@/lib/qrcode/dynamic";

type DynamicQRStore = {
  items: DynamicQRItem[];
  upsert: (input: {
    id?: string;
    name: string;
    destination: string;
    status: "ativo" | "pausado";
    expiresAt: string | null;
  }) => DynamicQRItem;
  remove: (id: string) => void;
  bumpScan: (id: string) => void;
  clear: () => void;
};

export const useDynamicQRStore = create<DynamicQRStore>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (input) => {
        const now = new Date().toISOString();
        const existing = input.id
          ? get().items.find((item) => item.id === input.id)
          : undefined;

        const next: DynamicQRItem = {
          id: existing?.id ?? createDynamicQRId(),
          name: input.name.trim() || "Campanha",
          destination: normalizeDestination(input.destination),
          status: input.status,
          expiresAt: input.expiresAt,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          scans: existing?.scans ?? 0,
        };

        set({
          items: existing
            ? get().items.map((item) => (item.id === existing.id ? next : item))
            : [next, ...get().items],
        });

        return next;
      },
      remove: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
      bumpScan: (id) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, scans: item.scans + 1 } : item,
          ),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "devkit-dynamic-qr" },
  ),
);
