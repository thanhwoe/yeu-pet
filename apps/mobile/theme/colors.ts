import { generateColorKeys, generateThemeKeys } from "./utils";

export const colorPalette = {
  "--red-100": "#200809",
  "--red-90": "#3A0F12",
  "--red-80": "#5A171B",
  "--red-70": "#7A2025",
  "--red-60": "#9C2A30",
  "--red-50": "#C43A41",
  "--red-40": "#E5535B",
  "--red-30": "#F27478",
  "--red-20": "#F79A9D",
  "--red-15": "#F9B3B6",
  "--red-10": "#FBCBCC",
  "--red-5": "#FDE7E8",
  "--red-0": "#FEF3F3",

  "--orange-100": "#1C0A00",
  "--orange-90": "#3B1E00",
  "--orange-80": "#613100",
  "--orange-70": "#874400",
  "--orange-60": "#AD5700",
  "--orange-50": "#E57300",
  "--orange-40": "#FF8000",
  "--orange-30": "#FF9947",
  "--orange-20": "#FFB373",
  "--orange-15": "#FFCCA0",
  "--orange-10": "#FFE2C5",
  "--orange-5": "#FFF1E2",
  "--orange-0": "#FFF8F3",

  "--amber-100": "#1A0C02",
  "--amber-90": "#351A05",
  "--amber-80": "#582B08",
  "--amber-70": "#7B3D0B",
  "--amber-60": "#9E4E0E",
  "--amber-50": "#D06814",
  "--amber-40": "#F97E1F",
  "--amber-30": "#FA954A",
  "--amber-20": "#FBAC75",
  "--amber-15": "#FCC3A0",
  "--amber-10": "#FDDACA",
  "--amber-5": "#FEF1E5",
  "--amber-0": "#FFF8F2",

  "--yellow-100": "#1C1700",
  "--yellow-90": "#423500",
  "--yellow-80": "#6B5701",
  "--yellow-70": "#947900",
  "--yellow-60": "#B29200",
  "--yellow-50": "#D6AF00",
  "--yellow-40": "#F0C400",
  "--yellow-30": "#FFD000",
  "--yellow-20": "#FFDA30",
  "--yellow-15": "#FFE25C",
  "--yellow-10": "#FFEB8C",
  "--yellow-5": "#FFF4C4",
  "--yellow-0": "#FFFBEB",

  "--green-100": "#0B1F14",
  "--green-90": "#123321",
  "--green-80": "#1A4A2F",
  "--green-70": "#23623F",
  "--green-60": "#2E7B50",
  "--green-50": "#3E9A63",
  "--green-40": "#4FB876",
  "--green-30": "#6FD18F",
  "--green-20": "#95E3AC",
  "--green-15": "#B2EDC3",
  "--green-10": "#CFF6DA",
  "--green-5": "#E7FBEE",
  "--green-0": "#F3FDF7",

  "--slate-100": "#151515",
  "--slate-90": "#1E1E1E",
  "--slate-80": "#222322",
  "--slate-70": "#323534",
  "--slate-60": "#484E4C",
  "--slate-50": "#5F6362",
  "--slate-40": "#757877",
  "--slate-30": "#929594",
  "--slate-20": "#AFB1B0",
  "--slate-15": "#C5C6C6",
  "--slate-10": "#DBDBDB",
  "--slate-5": "#EFEDEB",
  "--slate-0": "#F5F7F6",

  "--blue-100": "#11173A",
  "--blue-90": "#192358",
  "--blue-80": "#293A93",
  "--blue-70": "#3A52D0",
  "--blue-60": "#4765FF",
  "--blue-50": "#5570FF",
  "--blue-40": "#7E90FF",
  "--blue-30": "#9EA9FF",
  "--blue-20": "#B9C1FF",
  "--blue-15": "#D4D8FF",
  "--blue-10": "#E5EAFF",
  "--blue-5": "#F2F4FF",
  "--blue-0": "#FCFCFD",

  "--lilac-100": "#18171C",
  "--lilac-90": "#25242C",
  "--lilac-80": "#32303B",
  "--lilac-70": "#535061",
  "--lilac-60": "#7B768F",
  "--lilac-50": "#958EAD",
  "--lilac-40": "#AEA6CA",
  "--lilac-30": "#B7ACE0",
  "--lilac-20": "#D2C7FF",
  "--lilac-15": "#E0D8FF",
  "--lilac-10": "#EBE6FE",
  "--lilac-5": "#F1EDFF",
  "--lilac-0": "#F7F4FF",

  "--teal-100": "#091A16",
  "--teal-90": "#0B1F1A",
  "--teal-80": "#0F2B25",
  "--teal-70": "#143C33",
  "--teal-60": "#1D5448",
  "--teal-50": "#236758",
  "--teal-40": "#3B786A",
  "--teal-30": "#5E9284",
  "--teal-20": "#81AB9E",
  "--teal-15": "#95B7AC",
  "--teal-10": "#BDCDC8",
  "--teal-5": "#D5E0DD",
  "--teal-0": "#E1E9E7",

  "--lime-100": "#0F0F00",
  "--lime-90": "#202200",
  "--lime-80": "#282B00",
  "--lime-70": "#404500",
  "--lime-60": "#575E00",
  "--lime-50": "#889300",
  "--lime-40": "#C0D000",
  "--lime-30": "#D6E800",
  "--lime-20": "#E1F400",
  "--lime-15": "#EBFF00",
  "--lime-10": "#F2FF93",
  "--lime-5": "#F7FFC6",
  "--lime-0": "#FBFFE3",

  "--grey-100": "#0A0B0D",
  "--grey-90": "#1E2025",
  "--grey-80": "#33353D",
  "--grey-70": "#464B55",
  "--grey-60": "#5B616E",
  "--grey-50": "#717886",
  "--grey-40": "#89909E",
  "--grey-30": "#B1B7C3",
  "--grey-20": "#CED2DB",
  "--grey-15": "#DFE1E7",
  "--grey-10": "#EBEDF0",
  "--grey-5": "#F7F8F9",
  "--grey-0": "#FFFFFF",

  "--pink-100": "#2A0012",
  "--pink-90": "#4A0021",
  "--pink-80": "#750035",
  "--pink-70": "#A3004B",
  "--pink-60": "#CC0060",
  "--pink-50": "#FF4F9A",
  "--pink-40": "#FF70AD",
  "--pink-30": "#FF8FBD",
  "--pink-20": "#FFADCE",
  "--pink-15": "#FFC4DC",
  "--pink-10": "#FFD9E9",
  "--pink-5": "#FFECF4",
  "--pink-0": "#FFF7FA",

  // Purple
  "--purple-100": "#1A0026",
  "--purple-90": "#2F004A",
  "--purple-80": "#4B007A",
  "--purple-70": "#6600A3",
  "--purple-60": "#8200CC",
  "--purple-50": "#A259FF",
  "--purple-40": "#B87DFF",
  "--purple-30": "#C89BFF",
  "--purple-20": "#DAB8FF",
  "--purple-15": "#E6CCFF",
  "--purple-10": "#F0E0FF",
  "--purple-5": "#F9F5FF",
  "--purple-0": "#FCFAFF",

  // Cyan
  "--cyan-100": "#002223",
  "--cyan-90": "#003B3D",
  "--cyan-80": "#005F63",
  "--cyan-70": "#008489",
  "--cyan-60": "#00AAB0",
  "--cyan-50": "#00C4CC",
  "--cyan-40": "#33D3D9",
  "--cyan-30": "#5CE6EB",
  "--cyan-20": "#8DF1F4",
  "--cyan-15": "#B5F8FA",
  "--cyan-10": "#D4FBFD",
  "--cyan-5": "#EAFDFE",
  "--cyan-0": "#F6FEFF",
};

export const lightColorTheme = {
  // ---------------------------------------------------------------------------
  // TEXT
  // ---------------------------------------------------------------------------
  "--text-primary": "--orange-100",
  "--text-secondary": "--slate-60",
  "--text-muted": "--slate-50",
  "--text-subtle": "--slate-40",
  "--text-placeholder": "--grey-40",
  "--text-disabled": "--grey-40",
  "--text-primary-disabled": "--grey-40",
  "--text-accent": "--orange-60",
  "--text-link": "--amber-70",
  "--text-link-disabled": "--amber-30",

  "--text-primary-inverse": "--grey-0",
  "--text-primary-inverse-disabled": "--grey-30",
  "--text-secondary-inverse": "--orange-5",
  "--text-secondary-inverse-disabled": "--orange-20",
  "--text-tertiary": "--slate-40",
  "--text-tertiary-inverse": "--grey-20",

  "--text-warning": "--yellow-60",
  "--text-positive": "--green-60",
  "--text-negative": "--red-50",

  "--text-emphasis": "--orange-60",
  "--text-emphasis-inverse": "--orange-5",
  "--text-emphasis-disabled": "--orange-20",

  // ---------------------------------------------------------------------------
  // BACKGROUND / SURFACE
  // ---------------------------------------------------------------------------
  "--background": "--orange-0",
  "--background-foreground": "--grey-0",

  "--background-primary": "--orange-50",
  "--background-primary-pressed": "--orange-60",
  "--background-primary-disabled": "--orange-10",

  "--background-secondary": "--orange-5",
  "--background-secondary-pressed": "--orange-10",
  "--background-secondary-highlight": "--orange-15",

  "--background-tertiary": "--grey-5",
  "--background-tertiary-highlight": "--grey-10",

  "--background-surface": "--grey-0",
  "--background-surface-muted": "--orange-5",
  "--background-surface-raised": "--grey-0",
  "--background-card": "--grey-0",
  "--background-card-highlight": "--orange-5",
  "--background-calendar": "--orange-5",

  "--background-overlay": "--grey-100",
  "--background-scrim": "--grey-100",

  "--background-positive": "--green-10",
  "--background-positive-highlight": "--green-15",
  "--background-positive-foreground": "--green-70",

  "--background-negative": "--red-5",
  "--background-negative-foreground": "--red-70",
  "--background-negative-pressed": "--red-10",

  "--background-warning": "--yellow-5",
  "--background-warning-foreground": "--yellow-80",

  "--background-info": "--blue-5",
  "--background-info-foreground": "--blue-70",

  "--background-cancel": "--grey-10",

  // ---------------------------------------------------------------------------
  // LINE / BORDER
  // ---------------------------------------------------------------------------
  "--line-primary": "--slate-10",
  "--line-secondary": "--orange-10",
  "--line-tertiary": "--orange-5",
  "--line-subtle": "--grey-10",
  "--line-strong": "--slate-15",
  "--line-highlight": "--orange-30",

  "--line-primary-inverse": "--grey-60",
  "--line-secondary-inverse": "--grey-20",
  "--line-secondary-pressed": "--orange-10",
  "--line-inverse": "--grey-70",

  "--line-negative": "--red-20",
  "--line-positive": "--green-20",
  "--line-warning": "--yellow-20",
  "--line-info": "--blue-20",

  // ---------------------------------------------------------------------------
  // ICON
  // ---------------------------------------------------------------------------
  "--icon-primary": "--slate-80",
  "--icon-secondary": "--slate-50",
  "--icon-tertiary": "--slate-40",
  "--icon-muted": "--grey-40",
  "--icon-primary-highlight": "--orange-50",
  "--icon-primary-inverse": "--grey-0",

  "--icon-warning": "--yellow-60",
  "--icon-positive": "--green-60",
  "--icon-negative": "--red-50",
  "--icon-info": "--blue-50",

  // ---------------------------------------------------------------------------
  // ACTION
  // ---------------------------------------------------------------------------
  "--action-primary": "--orange-50",
  "--action-primary-pressed": "--orange-60",
  "--action-primary-foreground": "--grey-0",
  "--action-primary-disabled": "--orange-15",

  "--action-secondary": "--orange-10",
  "--action-secondary-pressed": "--orange-15",
  "--action-secondary-foreground": "--orange-70",

  "--action-ghost": "--grey-0",
  "--action-ghost-pressed": "--orange-5",
  "--action-ghost-foreground": "--slate-80",

  "--action-danger": "--red-50",
  "--action-danger-pressed": "--red-60",
  "--action-danger-foreground": "--grey-0",

  // ---------------------------------------------------------------------------
  // STATUS
  // ---------------------------------------------------------------------------
  "--status-success-surface": "--green-5",
  "--status-success-border": "--green-20",
  "--status-success-text": "--green-70",
  "--status-success-icon": "--green-60",

  "--status-warning-surface": "--yellow-5",
  "--status-warning-border": "--yellow-20",
  "--status-warning-text": "--yellow-80",
  "--status-warning-icon": "--yellow-60",

  "--status-danger-surface": "--red-5",
  "--status-danger-border": "--red-20",
  "--status-danger-text": "--red-70",
  "--status-danger-icon": "--red-50",

  "--status-info-surface": "--blue-5",
  "--status-info-border": "--blue-20",
  "--status-info-text": "--blue-70",
  "--status-info-icon": "--blue-50",

  "--danger-surface": "--red-5",
  "--danger-text": "--red-60",

  // ---------------------------------------------------------------------------
  // FEATURE ACCENTS
  // surface = soft background, bold = icon/primary label, foreground = text on bold
  // ---------------------------------------------------------------------------
  "--accent-orange": "--orange-10",
  "--accent-orange-bold": "--orange-50",
  "--accent-orange-foreground": "--grey-0",

  "--accent-yellow": "--yellow-10",
  "--accent-yellow-bold": "--yellow-60",
  "--accent-yellow-foreground": "--yellow-100",

  "--accent-blue": "--blue-10",
  "--accent-blue-bold": "--blue-50",
  "--accent-blue-foreground": "--grey-0",

  "--accent-purple": "--purple-10",
  "--accent-purple-bold": "--purple-50",
  "--accent-purple-foreground": "--grey-0",

  "--accent-teal": "--teal-10",
  "--accent-teal-bold": "--teal-50",
  "--accent-teal-foreground": "--grey-0",

  "--accent-cyan": "--cyan-10",
  "--accent-cyan-bold": "--cyan-50",
  "--accent-cyan-foreground": "--grey-100",

  "--accent-red": "--red-10",
  "--accent-red-bold": "--red-50",
  "--accent-red-foreground": "--grey-0",

  "--accent-green": "--green-10",
  "--accent-green-bold": "--green-50",
  "--accent-green-foreground": "--grey-0",

  "--accent-pink": "--pink-10",
  "--accent-pink-bold": "--pink-50",
  "--accent-pink-foreground": "--grey-0",

  "--feature-pet-surface": "--orange-10",
  "--feature-pet-accent": "--orange-50",
  "--feature-reminder-surface": "--yellow-10",
  "--feature-reminder-accent": "--yellow-60",
  "--feature-medical-surface": "--green-10",
  "--feature-medical-accent": "--green-60",
  "--feature-budget-surface": "--amber-10",
  "--feature-budget-accent": "--amber-60",
  "--feature-photos-surface": "--pink-10",
  "--feature-photos-accent": "--pink-50",
  "--feature-sitter-surface": "--teal-10",
  "--feature-sitter-accent": "--teal-50",
  "--feature-ai-surface": "--blue-10",
  "--feature-ai-accent": "--blue-50",
  "--feature-settings-surface": "--slate-0",
  "--feature-settings-accent": "--slate-70",

  // ---------------------------------------------------------------------------
  // CHARTS
  // ---------------------------------------------------------------------------
  "--chart-1": "--orange-50",
  "--chart-2": "--green-50",
  "--chart-3": "--blue-50",
  "--chart-4": "--pink-50",
  "--chart-5": "--teal-50",
  "--chart-grid": "--line-subtle",

  // ---------------------------------------------------------------------------
  // LEGACY COMPATIBILITY
  // ---------------------------------------------------------------------------
  "--background-screen": "--orange-0",
  "--background-white": "--grey-0",
  "--background-card-info": "--blue-5",
  "--background-chat-left": "--orange-5",
  "--background-chat-right": "--orange-10",
  "--background-default-highlight": "--orange-5",
  "--background-default-pressed": "--orange-10",

  "--line-card-highlight": "--grey-10",
  "--line-primary-foreground": "--grey-0",
  "--line-selected": "--orange-50",
  "--line-typing": "--orange-30",

  "--icon-foreground": "--grey-0",
  "--icon-highlight": "--orange-50",
  "--icon-primary-disabled": "--grey-40",
  "--icon-primary-foreground": "--grey-0",

  "--text-highlight": "--orange-60",
  "--text-highlight-swarthy": "--slate-70",
  "--text-upcoming-title": "--orange-100",

  // ---------------------------------------------------------------------------
  // SHADOW
  // ---------------------------------------------------------------------------
  "--shadow-primary": "--grey-100",
};

export const darkColorTheme = {
  // ---------------------------------------------------------------------------
  // TEXT
  // ---------------------------------------------------------------------------
  "--text-primary": "--grey-5",
  "--text-secondary": "--slate-20",
  "--text-muted": "--slate-30",
  "--text-subtle": "--slate-40",
  "--text-placeholder": "--slate-40",
  "--text-disabled": "--slate-50",
  "--text-primary-disabled": "--slate-50",
  "--text-accent": "--orange-30",
  "--text-link": "--blue-30",
  "--text-link-disabled": "--blue-60",

  "--text-primary-inverse": "--grey-100",
  "--text-primary-inverse-disabled": "--grey-60",
  "--text-secondary-inverse": "--slate-80",
  "--text-secondary-inverse-disabled": "--grey-50",
  "--text-tertiary": "--slate-30",
  "--text-tertiary-inverse": "--grey-20",

  "--text-warning": "--yellow-30",
  "--text-positive": "--green-30",
  "--text-negative": "--red-30",

  "--text-emphasis": "--orange-30",
  "--text-emphasis-inverse": "--orange-90",
  "--text-emphasis-disabled": "--orange-60",

  // ---------------------------------------------------------------------------
  // BACKGROUND / SURFACE
  // ---------------------------------------------------------------------------
  "--background": "--blue-100",
  "--background-foreground": "--grey-100",

  "--background-primary": "--orange-40",
  "--background-primary-pressed": "--orange-50",
  "--background-primary-disabled": "--orange-80",

  "--background-secondary": "--blue-90",
  "--background-secondary-pressed": "--blue-80",
  "--background-secondary-highlight": "--blue-70",

  "--background-tertiary": "--grey-90",
  "--background-tertiary-highlight": "--grey-80",

  "--background-surface": "--blue-90",
  "--background-surface-muted": "--blue-80",
  "--background-surface-raised": "--blue-90",
  "--background-card": "--blue-90",
  "--background-card-highlight": "--blue-80",
  "--background-calendar": "--blue-90",

  "--background-overlay": "--grey-100",
  "--background-scrim": "--grey-100",

  "--background-positive": "--green-90",
  "--background-positive-highlight": "--green-80",
  "--background-positive-foreground": "--green-10",

  "--background-negative": "--red-90",
  "--background-negative-foreground": "--red-10",
  "--background-negative-pressed": "--red-80",

  "--background-warning": "--yellow-90",
  "--background-warning-foreground": "--yellow-10",

  "--background-info": "--blue-90",
  "--background-info-foreground": "--blue-10",

  "--background-cancel": "--grey-70",

  // ---------------------------------------------------------------------------
  // LINE / BORDER
  // ---------------------------------------------------------------------------
  "--line-primary": "--blue-80",
  "--line-secondary": "--blue-70",
  "--line-tertiary": "--blue-90",
  "--line-subtle": "--blue-80",
  "--line-strong": "--blue-70",
  "--line-highlight": "--orange-40",

  "--line-primary-inverse": "--grey-20",
  "--line-secondary-inverse": "--grey-80",
  "--line-secondary-pressed": "--blue-80",
  "--line-inverse": "--grey-10",

  "--line-negative": "--red-70",
  "--line-positive": "--green-70",
  "--line-warning": "--yellow-70",
  "--line-info": "--blue-60",

  // ---------------------------------------------------------------------------
  // ICON
  // ---------------------------------------------------------------------------
  "--icon-primary": "--grey-10",
  "--icon-secondary": "--slate-30",
  "--icon-tertiary": "--slate-40",
  "--icon-muted": "--slate-50",
  "--icon-primary-highlight": "--orange-30",
  "--icon-primary-inverse": "--grey-90",

  "--icon-warning": "--yellow-30",
  "--icon-positive": "--green-30",
  "--icon-negative": "--red-30",
  "--icon-info": "--blue-30",

  // ---------------------------------------------------------------------------
  // ACTION
  // ---------------------------------------------------------------------------
  "--action-primary": "--orange-40",
  "--action-primary-pressed": "--orange-30",
  "--action-primary-foreground": "--orange-100",
  "--action-primary-disabled": "--orange-80",

  "--action-secondary": "--blue-80",
  "--action-secondary-pressed": "--blue-70",
  "--action-secondary-foreground": "--grey-5",

  "--action-ghost": "--blue-90",
  "--action-ghost-pressed": "--blue-80",
  "--action-ghost-foreground": "--grey-5",

  "--action-danger": "--red-40",
  "--action-danger-pressed": "--red-30",
  "--action-danger-foreground": "--red-100",

  // ---------------------------------------------------------------------------
  // STATUS
  // ---------------------------------------------------------------------------
  "--status-success-surface": "--green-90",
  "--status-success-border": "--green-70",
  "--status-success-text": "--green-20",
  "--status-success-icon": "--green-30",

  "--status-warning-surface": "--yellow-90",
  "--status-warning-border": "--yellow-70",
  "--status-warning-text": "--yellow-20",
  "--status-warning-icon": "--yellow-30",

  "--status-danger-surface": "--red-90",
  "--status-danger-border": "--red-70",
  "--status-danger-text": "--red-20",
  "--status-danger-icon": "--red-30",

  "--status-info-surface": "--blue-90",
  "--status-info-border": "--blue-70",
  "--status-info-text": "--blue-20",
  "--status-info-icon": "--blue-30",

  "--danger-surface": "--red-90",
  "--danger-text": "--red-30",

  // ---------------------------------------------------------------------------
  // FEATURE ACCENTS
  // ---------------------------------------------------------------------------
  "--accent-orange": "--orange-80",
  "--accent-orange-bold": "--orange-30",
  "--accent-orange-foreground": "--orange-100",

  "--accent-yellow": "--yellow-90",
  "--accent-yellow-bold": "--yellow-30",
  "--accent-yellow-foreground": "--yellow-100",

  "--accent-blue": "--blue-80",
  "--accent-blue-bold": "--blue-30",
  "--accent-blue-foreground": "--blue-100",

  "--accent-purple": "--purple-90",
  "--accent-purple-bold": "--purple-30",
  "--accent-purple-foreground": "--purple-100",

  "--accent-teal": "--teal-90",
  "--accent-teal-bold": "--teal-30",
  "--accent-teal-foreground": "--teal-100",

  "--accent-cyan": "--cyan-90",
  "--accent-cyan-bold": "--cyan-30",
  "--accent-cyan-foreground": "--cyan-100",

  "--accent-red": "--red-90",
  "--accent-red-bold": "--red-30",
  "--accent-red-foreground": "--red-100",

  "--accent-green": "--green-90",
  "--accent-green-bold": "--green-30",
  "--accent-green-foreground": "--green-100",

  "--accent-pink": "--pink-90",
  "--accent-pink-bold": "--pink-30",
  "--accent-pink-foreground": "--pink-100",

  "--feature-pet-surface": "--orange-90",
  "--feature-pet-accent": "--orange-30",
  "--feature-reminder-surface": "--yellow-90",
  "--feature-reminder-accent": "--yellow-30",
  "--feature-medical-surface": "--green-90",
  "--feature-medical-accent": "--green-30",
  "--feature-budget-surface": "--amber-90",
  "--feature-budget-accent": "--amber-30",
  "--feature-photos-surface": "--pink-90",
  "--feature-photos-accent": "--pink-30",
  "--feature-sitter-surface": "--teal-90",
  "--feature-sitter-accent": "--teal-30",
  "--feature-ai-surface": "--blue-80",
  "--feature-ai-accent": "--blue-30",
  "--feature-settings-surface": "--blue-90",
  "--feature-settings-accent": "--slate-20",

  // ---------------------------------------------------------------------------
  // CHARTS
  // ---------------------------------------------------------------------------
  "--chart-1": "--orange-30",
  "--chart-2": "--green-30",
  "--chart-3": "--blue-30",
  "--chart-4": "--pink-30",
  "--chart-5": "--teal-30",
  "--chart-grid": "--line-subtle",

  // ---------------------------------------------------------------------------
  // LEGACY COMPATIBILITY
  // ---------------------------------------------------------------------------
  "--background-screen": "--blue-100",
  "--background-white": "--grey-100",
  "--background-card-info": "--blue-90",
  "--background-chat-left": "--blue-80",
  "--background-chat-right": "--blue-80",
  "--background-default-highlight": "--blue-80",
  "--background-default-pressed": "--blue-70",

  "--line-card-highlight": "--blue-80",
  "--line-primary-foreground": "--grey-100",
  "--line-selected": "--orange-40",
  "--line-typing": "--orange-40",

  "--icon-foreground": "--grey-100",
  "--icon-highlight": "--orange-30",
  "--icon-primary-disabled": "--slate-50",
  "--icon-primary-foreground": "--grey-100",

  "--text-highlight": "--orange-30",
  "--text-highlight-swarthy": "--slate-20",
  "--text-upcoming-title": "--grey-5",

  // ---------------------------------------------------------------------------
  // SHADOW
  // ---------------------------------------------------------------------------
  "--shadow-primary": "--grey-100",
};

export const colors = {
  transparent: "transparent",
  black: "#000000",
  white: "#FFFFFF",
  current: "currentColor",
  inherit: "inherit",
  ...generateThemeKeys(lightColorTheme),
  ...generateColorKeys(colorPalette),
};
