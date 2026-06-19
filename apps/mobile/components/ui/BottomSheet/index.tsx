import {
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetFooter as GorhomBottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/hooks/useColorScheme";
import { darkColorTheme, lightColorTheme } from "@/theme/colors";
import { getColors } from "@/theme/utils";
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop } from "./Backdrop";
import { BottomSheetHeader } from "./Header";

const FALLBACK_SNAP_POINTS = ["50%"];

export interface BottomSheetProps extends PropsWithChildren<BottomSheetModalProps> {
  visible: boolean;
  className?: string;
  titleElement?: React.ReactNode;
  headerMode?: "back" | "close";
  /**
   * Default is true, to support dynamic sizing of the bottom sheet
   * Set to false if you have other scroll element inside the bottom sheet
   */
  useScrollView?: boolean;
  footer?: ReactNode;
  footerBottomInset?: number;
  useContentWrapper?: boolean;
}

export const BottomSheet = ({
  visible,
  children,
  titleElement,
  headerMode = "close",
  onDismiss,
  className,
  useScrollView = true,
  footer,
  footerBottomInset,
  useContentWrapper = true,
  enableDynamicSizing = true,
  backdropComponent,
  handleComponent,
  backgroundStyle,
  stackBehavior = "switch",
  enableDismissOnClose = true,
  containerComponent,
  name,
  topInset = 66,
  index = 0,
  snapPoints,
  animateOnMount = true,
  keyboardBlurBehavior = "restore",
  keyboardBehavior = Platform.select({
    android: "fillParent",
    ios: "extend",
  }),
  android_keyboardInputMode = "adjustResize",
  ...rest
}: BottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const bottomSheetRef = useRef<GorhomBottomSheetModal>(null);
  const isPresentedRef = useRef(false);
  const themeColors = useMemo(
    () =>
      getColors(colorScheme === "dark" ? darkColorTheme : lightColorTheme),
    [colorScheme],
  );
  const sheetBackgroundColor = themeColors["--background-surface"];

  const handleDismiss = useCallback(() => {
    isPresentedRef.current = false;
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      isPresentedRef.current = true;
      return;
    }

    if (isPresentedRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback<
    NonNullable<BottomSheetModalProps["backdropComponent"]>
  >(
    (props) => {
      if (backdropComponent) {
        return backdropComponent(props);
      }

      return <Backdrop {...props} />;
    },
    [backdropComponent],
  );

  const renderHandle = useCallback<
    NonNullable<BottomSheetModalProps["handleComponent"]>
  >(
    (props) => {
      if (handleComponent) {
        return handleComponent(props);
      }

      return (
        <BottomSheetHeader
          headerMode={headerMode}
          handleSelectAndCloseOptions={() => bottomSheetRef.current?.dismiss()}
        >
          {titleElement}
        </BottomSheetHeader>
      );
    },
    [handleComponent, headerMode, titleElement],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: 16,
      paddingBottom: footer ? 0 : insets.bottom || 16,
      ...(!enableDynamicSizing && { flex: 1, flexGrow: 1 }),
    }),
    [enableDynamicSizing, footer, insets.bottom],
  );

  const resolvedSnapPoints = useMemo(() => {
    if (snapPoints) {
      return snapPoints;
    }

    return enableDynamicSizing ? undefined : FALLBACK_SNAP_POINTS;
  }, [enableDynamicSizing, snapPoints]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => {
      if (!footer) {
        return null;
      }

      return (
        <GorhomBottomSheetFooter
          {...props}
          bottomInset={footerBottomInset ?? (insets.bottom || 12)}
        >
          {footer}
        </GorhomBottomSheetFooter>
      );
    },
    [footer, footerBottomInset, insets.bottom],
  );

  return (
    <GorhomBottomSheetModal
      ref={bottomSheetRef}
      name={name}
      stackBehavior={stackBehavior}
      enableDismissOnClose={enableDismissOnClose}
      containerComponent={containerComponent}
      topInset={topInset}
      enableOverDrag={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      onDismiss={handleDismiss}
      backgroundStyle={[
        {
          backgroundColor: sheetBackgroundColor,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
        },
        backgroundStyle,
      ]}
      keyboardBlurBehavior={keyboardBlurBehavior}
      keyboardBehavior={keyboardBehavior}
      android_keyboardInputMode={android_keyboardInputMode}
      enableDynamicSizing={enableDynamicSizing}
      footerComponent={footer ? renderFooter : undefined}
      index={index}
      snapPoints={resolvedSnapPoints}
      animateOnMount={animateOnMount}
      {...rest}
    >
      {!useContentWrapper ? (
        children
      ) : useScrollView ? (
        <BottomSheetScrollView
          contentContainerStyle={contentContainerStyle}
          className={className}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={contentContainerStyle} className={className}>
          {children}
        </BottomSheetView>
      )}
    </GorhomBottomSheetModal>
  );
};
