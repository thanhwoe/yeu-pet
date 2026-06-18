import { useColorScheme } from "@/hooks/useColorScheme";
import { darkColorTheme, lightColorTheme } from "@/theme/colors";
import { getColors } from "@/theme/utils";
import { PropsWithChildren } from "react";
import { useMemo } from "react";
import RNMarkdown, { MarkdownProps } from "react-native-markdown-display";

export const Markdown = ({
  children,
  ...props
}: PropsWithChildren<MarkdownProps>) => {
  const { colorScheme } = useColorScheme();
  const theme = useMemo(
    () =>
      getColors(colorScheme === "dark" ? darkColorTheme : lightColorTheme),
    [colorScheme],
  );
  const styles = useMemo(() => createMarkdownStyles(theme), [theme]);

  return (
    <RNMarkdown style={styles} {...props}>
      {children}
    </RNMarkdown>
  );
};

const createMarkdownStyles = (
  theme: ReturnType<typeof getColors>,
): MarkdownProps["style"] => {
  return {
    // Body text
    body: {
      fontSize: 16,
      lineHeight: 20,
      color: theme["--text-primary"],
      marginVertical: 0,
    },

    // Headings
    heading1: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700",
      color: theme["--text-primary"],
      marginTop: 24,
      marginBottom: 16,
    },
    heading2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "700",
      color: theme["--text-primary"],
      marginTop: 20,
      marginBottom: 12,
    },
    heading3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600",
      color: theme["--text-primary"],
      marginTop: 16,
      marginBottom: 10,
    },
    heading4: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "600",
      color: theme["--text-secondary"],
      marginTop: 14,
      marginBottom: 8,
    },
    heading5: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      color: theme["--text-secondary"],
      marginTop: 12,
      marginBottom: 6,
    },
    heading6: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "600",
      color: theme["--text-muted"],
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
      color: theme["--text-primary"],
    },
    em: {
      fontStyle: "italic",
    },
    s: {
      textDecorationLine: "line-through",
    },

    // Links
    link: {
      color: theme["--text-link"],
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
      backgroundColor: theme["--text-muted"],
    },
    ordered_list_icon: {
      marginLeft: 8,
      marginRight: 8,
      fontSize: 16,
      lineHeight: 24,
      color: theme["--text-muted"],
    },
    bullet_list_content: {
      flex: 1,
    },
    ordered_list_content: {
      flex: 1,
    },

    // Code blocks
    code_inline: {
      backgroundColor: theme["--background-surface-muted"],
      color: theme["--status-danger-text"],
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: "Courier",
    },
    code_block: {
      backgroundColor: theme["--background-surface-muted"],
      color: theme["--text-primary"],
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 12,
    },
    fence: {
      backgroundColor: theme["--background-surface-muted"],
      color: theme["--text-primary"],
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 12,
    },

    // Blockquote
    blockquote: {
      backgroundColor: theme["--status-info-surface"],
      borderLeftColor: theme["--status-info-border"],
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
      borderColor: theme["--line-subtle"],
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 12,
    },
    thead: {
      backgroundColor: theme["--background-surface-muted"],
    },
    tbody: {},
    th: {
      flex: 1,
      padding: 12,
      fontWeight: "600",
      color: theme["--text-primary"],
      borderRightWidth: 1,
      borderRightColor: theme["--line-subtle"],
    },
    tr: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme["--line-subtle"],
    },
    td: {
      flex: 1,
      padding: 12,
      borderRightWidth: 1,
      borderRightColor: theme["--line-subtle"],
    },

    // Horizontal rule
    hr: {
      backgroundColor: theme["--line-subtle"],
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
