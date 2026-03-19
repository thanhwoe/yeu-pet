import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "body1",
            "body2",
            "body3",
            "body4",
            "body5",

            "body1-md",
            "body2-md",
            "body3-md",
            "body4-md",
            "body5-md",

            "heading1",
            "heading2",
            "heading3",
            "heading4",
            "heading5",
            "heading6",

            "heading1-md",
            "heading2-md",
            "heading3-md",
            "heading4-md",
            "heading5-md",
            "heading6-md",
          ],
        },
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => {
  return customTwMerge(clsx(inputs));
};
