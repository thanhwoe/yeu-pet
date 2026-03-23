import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import { PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import { BackHandler, NativeEventSubscription, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop } from "./Backdrop";
import { BottomSheetHeader } from "./Header";

const StyledBottomSheetModal = cssInterop(BottomSheetModal, {
  backgroundClassName: {
    target: "backgroundStyle",
  },
});

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
  ...rest
}: BottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

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
    <StyledBottomSheetModal
      ref={bottomSheetRef}
      topInset={66}
      enableOverDrag={false}
      backdropComponent={(ps) => (
        <Backdrop {...ps} onPress={() => onDismiss?.()} />
      )}
      handleComponent={() => (
        <BottomSheetHeader
          headerMode={headerMode}
          handleSelectAndCloseOptions={() => onDismiss?.()}
        >
          {titleElement}
        </BottomSheetHeader>
      )}
      onDismiss={onDismiss}
      snapPoints={undefined}
      backgroundClassName="bg-background-foreground rounded-tl-36 rounded-tr-36"
      keyboardBlurBehavior="restore"
      keyboardBehavior={Platform.select({
        android: "fillParent",
        ios: "extend",
      })}
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={enableDynamicSizing}
      {...rest}
    >
      {useScrollView ? (
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: insets.bottom || 16,
            ...(!enableDynamicSizing && { flexGrow: 1 }),
          }}
          // bounces={false}
          className={className}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView
          style={{
            paddingTop: 16,
            paddingBottom: insets.bottom || 16,
            ...(!enableDynamicSizing && { flexGrow: 1 }),
          }}
          className={className}
        >
          {children}
        </BottomSheetView>
      )}
    </StyledBottomSheetModal>
  );
};
