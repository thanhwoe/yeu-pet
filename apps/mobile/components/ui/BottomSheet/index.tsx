import {
  default as GorhomBottomSheet,
  BottomSheetFooter as GorhomBottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ComponentRef,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  View,
} from "react-native";
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
  enableDynamicSizing = true,
  backdropComponent,
  handleComponent,
  backgroundStyle,
  stackBehavior: _stackBehavior,
  enableDismissOnClose: _enableDismissOnClose,
  containerComponent: _containerComponent,
  name: _name,
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
  const bottomSheetRef = useRef<ComponentRef<typeof GorhomBottomSheet>>(null);
  const sheetBackgroundColor = colorScheme === "dark" ? "#0A0B0D" : "#FFFFFF";

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

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
          handleSelectAndCloseOptions={() => bottomSheetRef.current?.close()}
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

  const handleRequestClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => {
      if (!footer) {
        return null;
      }

      return (
        <GorhomBottomSheetFooter
          {...props}
          bottomInset={insets.bottom || 12}
        >
          {footer}
        </GorhomBottomSheetFooter>
      );
    },
    [footer, insets.bottom],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <View style={styles.modalRoot}>
        <GorhomBottomSheet
          ref={bottomSheetRef}
          topInset={topInset}
          enableOverDrag={false}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          handleComponent={renderHandle}
          onClose={handleDismiss}
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
          {useScrollView ? (
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
        </GorhomBottomSheet>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
});
