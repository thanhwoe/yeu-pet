import { useColorScheme } from "@/hooks/useColorScheme";
import { PropsWithChildren } from "react";
import RNMarkdown, { MarkdownProps } from "react-native-markdown-display";

export const Markdown = ({
  children,
  ...props
}: PropsWithChildren<MarkdownProps>) => {
  const { colorScheme } = useColorScheme();
  const styles = createMarkdownStyles(colorScheme === "dark");

  return (
    <RNMarkdown style={styles} {...props}>
      {children}
    </RNMarkdown>
  );
};

const colors = {
  light: {
    text: "#111827",
    textHeading: "#111827",
    textSecondary: "#374151",
    textTertiary: "#4b5563",
    textMuted: "#6b7280",
    link: "#2563eb",
    codeInlineBg: "#f3f4f6",
    codeInlineText: "#dc2626",
    codeBlockBg: "#1f2937",
    codeBlockText: "#f9fafb",
    blockquoteBg: "#f9fafb",
    blockquoteBorder: "#3b82f6",
    tableBorder: "#e5e7eb",
    tableHeaderBg: "#f9fafb",
    hr: "#e5e7eb",
  },
  dark: {
    text: "#e5e7eb",
    textHeading: "#f9fafb",
    textSecondary: "#d1d5db",
    textTertiary: "#9ca3af",
    textMuted: "#6b7280",
    link: "#60a5fa",
    codeInlineBg: "#374151",
    codeInlineText: "#fca5a5",
    codeBlockBg: "#111827",
    codeBlockText: "#e5e7eb",
    blockquoteBg: "#1f2937",
    blockquoteBorder: "#3b82f6",
    tableBorder: "#374151",
    tableHeaderBg: "#1f2937",
    hr: "#374151",
  },
};

const createMarkdownStyles = (isDark: boolean): MarkdownProps["style"] => {
  const theme = isDark ? colors.dark : colors.light;

  return {
    // Body text
    body: {
      fontSize: 16,
      lineHeight: 20,
      color: theme.text,
      marginVertical: 0,
    },

    // Headings
    heading1: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700",
      color: theme.textHeading,
      marginTop: 24,
      marginBottom: 16,
    },
    heading2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "700",
      color: theme.textHeading,
      marginTop: 20,
      marginBottom: 12,
    },
    heading3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600",
      color: theme.textHeading,
      marginTop: 16,
      marginBottom: 10,
    },
    heading4: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "600",
      color: theme.textSecondary,
      marginTop: 14,
      marginBottom: 8,
    },
    heading5: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      color: theme.textSecondary,
      marginTop: 12,
      marginBottom: 6,
    },
    heading6: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "600",
      color: theme.textTertiary,
      marginTop: 10,
      marginBottom: 6,
    },

    // Paragraph
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
      flexWrap: "wrap",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },

    // Text styles
    strong: {
      fontWeight: "700",
      color: theme.textHeading,
    },
    em: {
      fontStyle: "italic",
    },
    s: {
      textDecorationLine: "line-through",
    },

    // Links
    link: {
      color: theme.link,
      textDecorationLine: "underline",
    },

    // Lists
    bullet_list: {
      marginTop: 8,
      marginBottom: 12,
    },
    ordered_list: {
      marginTop: 8,
      marginBottom: 12,
    },
    list_item: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: 6,
    },
    bullet_list_icon: {
      marginLeft: 8,
      marginRight: 8,
      marginTop: 4,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.textMuted,
    },
    ordered_list_icon: {
      marginLeft: 8,
      marginRight: 8,
      fontSize: 16,
      lineHeight: 24,
      color: theme.textMuted,
    },
    bullet_list_content: {
      flex: 1,
    },
    ordered_list_content: {
      flex: 1,
    },

    // Code blocks
    code_inline: {
      backgroundColor: theme.codeInlineBg,
      color: theme.codeInlineText,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: "Courier",
    },
    code_block: {
      backgroundColor: theme.codeBlockBg,
      color: theme.codeBlockText,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 12,
    },
    fence: {
      backgroundColor: theme.codeBlockBg,
      color: theme.codeBlockText,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 12,
    },

    // Blockquote
    blockquote: {
      backgroundColor: theme.blockquoteBg,
      borderLeftColor: theme.blockquoteBorder,
      borderLeftWidth: 4,
      marginLeft: 0,
      marginTop: 8,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    // Table
    table: {
      borderWidth: 1,
      borderColor: theme.tableBorder,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 12,
    },
    thead: {
      backgroundColor: theme.tableHeaderBg,
    },
    tbody: {},
    th: {
      flex: 1,
      padding: 12,
      fontWeight: "600",
      color: theme.textHeading,
      borderRightWidth: 1,
      borderRightColor: theme.tableBorder,
    },
    tr: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.tableBorder,
    },
    td: {
      flex: 1,
      padding: 12,
      borderRightWidth: 1,
      borderRightColor: theme.tableBorder,
    },

    // Horizontal rule
    hr: {
      backgroundColor: theme.hr,
      height: 1,
      marginTop: 16,
      marginBottom: 16,
    },

    // Images
    image: {
      maxWidth: "100%",
      marginTop: 8,
      marginBottom: 12,
      borderRadius: 8,
    },
  };
};
