import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BackHandler, NativeEventSubscription, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop } from "./Backdrop";
import { BottomSheetHeader } from "./Header";

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
  enableDynamicSizing = true,
  backdropComponent,
  handleComponent,
  backgroundStyle,
  topInset = 66,
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetBackgroundColor =
    colorScheme === "dark" ? "#0A0B0D" : "#FFFFFF";

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const renderBackdrop = useCallback<NonNullable<BottomSheetModalProps["backdropComponent"]>>(
    (props) => {
      if (backdropComponent) {
        return backdropComponent(props);
      }

      return <Backdrop {...props} />;
    },
    [backdropComponent],
  );

  const renderHandle = useCallback<NonNullable<BottomSheetModalProps["handleComponent"]>>(
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
      paddingBottom: insets.bottom || 16,
      ...(!enableDynamicSizing && { flexGrow: 1 }),
    }),
    [enableDynamicSizing, insets.bottom],
  );

  useEffect(() => {
    let backHandler: NativeEventSubscription | null = null;

    if (visible) {
      bottomSheetRef.current?.present();
      /**
       * Disable back button to prevent going back to the previous screen when the bottom sheet is visible
       */
      backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );
    } else {
      bottomSheetRef.current?.dismiss();
    }

    return () => {
      backHandler?.remove();
    };
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      topInset={topInset}
      enableOverDrag={false}
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
        <BottomSheetView
          style={contentContainerStyle}
          className={className}
        >
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
};
