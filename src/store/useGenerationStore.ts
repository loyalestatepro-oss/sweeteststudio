import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudioType = "video" | "image" | "music" | "voice" | "avatar";

export interface GeneratedItem {
  id: string;
  studio: StudioType;
  prompt: string;
  preset: string;
  model: string;
  meta: string;
  createdAt: number;
  // For image: real image URL
  imageUrl?: string;
  // For video: ordered keyframe URLs animated as a preview
  frames?: string[];
  // Display gradient fallback
  gradient: string;
}

interface GenerationState {
  items: GeneratedItem[];
  addItems: (newItems: GeneratedItem[]) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
}

// Real Unsplash images for different studio types
const IMAGE_SEEDS = {
  image: [
    "https://picsum.photos/seed/product1/1024/576",
    "https://picsum.photos/seed/fashion2/1024/576",
    "https://picsum.photos/seed/art3/1024/576",
    "https://picsum.photos/seed/studio4/1024/576",
    "https://picsum.photos/seed/concept5/1024/576",
    "https://picsum.photos/seed/editorial6/1024/576",
  ],
  video: [
    "https://picsum.photos/seed/cinematic1/1024/576",
    "https://picsum.photos/seed/film2/1024/576",
    "https://picsum.photos/seed/scene3/1024/576",
    "https://picsum.photos/seed/motion4/1024/576",
  ],
  avatar: [
    "https://picsum.photos/seed/portrait1/512/512",
    "https://picsum.photos/seed/face2/512/512",
    "https://picsum.photos/seed/person3/512/512",
    "https://picsum.photos/seed/avatar4/512/512",
  ],
  music: [] as string[],
  voice: [] as string[],
};

export const getImageForStudio = (studio: StudioType, index: number): string | undefined => {
  const pool = IMAGE_SEEDS[studio];
  if (!pool || pool.length === 0) return undefined;
  return pool[index % pool.length];
};

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      items: [],
      addItems: (newItems) =>
        set((state) => ({ items: [...newItems, ...state.items].slice(0, 100) })),
      deleteItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearAll: () => set({ items: [] }),
    }),
    { name: "sweetest-generations" }
  )
);
