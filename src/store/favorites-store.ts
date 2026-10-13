"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesStore = {
  favorites: string[];
  toggleFavorite: (href: string) => void;
  isFavorite: (href: string) => boolean;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (href) => {
        const current = get().favorites;
        set({
          favorites: current.includes(href)
            ? current.filter((item) => item !== href)
            : [...current, href],
        });
      },
      isFavorite: (href) => get().favorites.includes(href),
      clearFavorites: () => set({ favorites: [] }),
    }),
    { name: "devkit-tool-favorites" },
  ),
);
