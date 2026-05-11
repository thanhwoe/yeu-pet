import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";

export const CARD_WIDTH = SCREEN_WIDTH * 0.68;
export const CARD_HEIGHT = CARD_WIDTH * 1.35;
export const SCALE_CENTER = 1;
export const SCALE_SIDE = 0.88;

export const CARD_THEME = [
  {
    color: "bg-purple-30",
    accentColor: "bg-purple-50",
    icon: "text-purple-70",
    detail: "bg-purple-10",
  },
  {
    color: "bg-pink-30",
    accentColor: "bg-pink-50",
    icon: "text-pink-70",
    detail: "bg-pink-10",
  },
  {
    color: "bg-green-30",
    accentColor: "bg-green-50",
    icon: "text-green-70",
    detail: "bg-green-10",
  },
  {
    color: "bg-blue-30",
    accentColor: "bg-blue-50",
    icon: "text-blue-70",
    detail: "bg-purple-10",
  },
  {
    color: "bg-orange-30",
    accentColor: "bg-orange-50",
    icon: "text-orange-70",
    detail: "bg-orange-10",
  },
  {
    color: "bg-cyan-30",
    accentColor: "bg-cyan-50",
    icon: "text-cyan-70",
    detail: "bg-cyan-10",
  },
  {
    color: "bg-yellow-30",
    accentColor: "bg-yellow-50",
    icon: "text-yellow-70",
    detail: "bg-yellow-10",
  },
  {
    color: "bg-grey-30",
    accentColor: "bg-grey-50",
    icon: "text-grey-70",
    detail: "bg-grey-10",
  },
  {
    color: "bg-teal-30",
    accentColor: "bg-teal-50",
    icon: "text-teal-70",
    detail: "bg-teal-10",
  },
  {
    color: "bg-lilac-30",
    accentColor: "bg-lilac-50",
    icon: "text-lilac-70",
    detail: "bg-lilac-10",
  },
];

export function seedColorRandom(seed: number, max: number) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}
