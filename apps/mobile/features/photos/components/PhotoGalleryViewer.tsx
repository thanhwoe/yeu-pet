import { Modal } from "@/components/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { PhotoView } from "@/features/photos/components/PhotoView";
import { IPhoto } from "@/interfaces";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Image as ExpoImage } from "expo-image";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NEXT_PAGE_THRESHOLD = 6;
const isPrefetchableUrl = (url: string | undefined): url is string =>
  !!url && /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(url);

type PhotoGalleryViewerProps = {
  visible: boolean;
  photos: IPhoto[];
  initialIndex: number;
  deleteAble?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isFetchNextPageError?: boolean;
  fetchNextPage?: () => void | Promise<unknown>;
  onClose: () => void;
};

type PhotoGalleryPageProps = {
  photo: IPhoto;
  isActive: boolean;
  pageHeight: number;
  pageWidth: number;
  deleteAble?: boolean;
  onClose: () => void;
  onDeleted: (photoId: string) => void;
  onInteractionChange: (locked: boolean) => void;
};

const PhotoGalleryPage = memo(
  ({
    photo,
    isActive,
    pageHeight,
    pageWidth,
    deleteAble,
    onClose,
    onDeleted,
    onInteractionChange,
  }: PhotoGalleryPageProps) => {
    const pageStyle = useMemo(
      () => ({ height: pageHeight, width: pageWidth }),
      [pageHeight, pageWidth],
    );

    return (
      <View
        accessibilityElementsHidden={!isActive}
        importantForAccessibility={isActive ? "yes" : "no-hide-descendants"}
        style={[styles.page, pageStyle]}
      >
        <PhotoView
          key={photo.id}
          active={isActive}
          data={photo}
          deleteAble={deleteAble}
          pageHeight={pageHeight}
          pageWidth={pageWidth}
          onDeleted={onDeleted}
          onDismiss={onClose}
          onInteractionChange={onInteractionChange}
        />
      </View>
    );
  },
  (previous, next) =>
    previous.photo === next.photo &&
    previous.isActive === next.isActive &&
    previous.pageHeight === next.pageHeight &&
    previous.pageWidth === next.pageWidth &&
    previous.deleteAble === next.deleteAble &&
    previous.onClose === next.onClose &&
    previous.onDeleted === next.onDeleted &&
    previous.onInteractionChange === next.onInteractionChange,
);

PhotoGalleryPage.displayName = "PhotoGalleryPage";

export const PhotoGalleryViewer = ({
  visible,
  photos,
  initialIndex,
  deleteAble,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  fetchNextPage,
  onClose,
}: PhotoGalleryViewerProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlashList<IPhoto>>(null);
  const wasVisibleRef = useRef(false);
  const lastFetchPhotoCountRef = useRef(-1);
  const pendingIndexAfterDeleteRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewportSize, setViewportSize] = useState({
    height: windowHeight,
    width: windowWidth,
  });
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [isListReady, setIsListReady] = useState(false);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const pageHeight = viewportSize.height;
  const pageWidth = viewportSize.width;

  const visiblePhotos = useMemo(
    () => photos.filter((photo) => !deletedPhotoIds.has(photo.id)),
    [deletedPhotoIds, photos],
  );
  const safeInitialIndex = Math.min(
    Math.max(initialIndex, 0),
    Math.max(visiblePhotos.length - 1, 0),
  );
  const estimatedListSize = useMemo(
    () => ({ height: pageHeight, width: pageWidth }),
    [pageHeight, pageWidth],
  );

  const handleClose = useCallback(() => {
    setIsInteractionLocked(false);
    onClose();
  }, [onClose]);

  const scrollToPage = useCallback(
    (index: number, animated = false) => {
      const safeIndex = Math.min(
        Math.max(index, 0),
        Math.max(visiblePhotos.length - 1, 0),
      );

      listRef.current?.scrollToOffset({
        animated,
        offset: safeIndex * pageHeight,
      });
    },
    [pageHeight, visiblePhotos.length],
  );

  useLayoutEffect(() => {
    if (visible && !wasVisibleRef.current) {
      lastFetchPhotoCountRef.current = -1;
      setCurrentIndex(safeInitialIndex);
      setIsInteractionLocked(false);
      setIsViewportReady(false);
      setIsListReady(false);
    }

    if (!visible) {
      setIsInteractionLocked(false);
      setIsViewportReady(false);
      setIsListReady(false);
    }

    wasVisibleRef.current = visible;
  }, [safeInitialIndex, visible]);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;

    if (height <= 0 || width <= 0) {
      return;
    }

    setViewportSize((current) =>
      current.height === height && current.width === width
        ? current
        : { height, width },
    );
    setIsViewportReady(true);
  }, []);

  useEffect(() => {
    const availableIds = new Set(photos.map((photo) => photo.id));

    setDeletedPhotoIds((current) => {
      const next = new Set(
        [...current].filter((photoId) => availableIds.has(photoId)),
      );

      return next.size === current.size ? current : next;
    });
  }, [photos]);

  useEffect(() => {
    if (!visible || visiblePhotos.length > 0) {
      return;
    }

    handleClose();
  }, [handleClose, visible, visiblePhotos.length]);

  useEffect(() => {
    const pendingIndex = pendingIndexAfterDeleteRef.current;

    if (pendingIndex === null || visiblePhotos.length === 0) {
      return;
    }

    const nextIndex = Math.min(pendingIndex, visiblePhotos.length - 1);
    pendingIndexAfterDeleteRef.current = null;
    setCurrentIndex(nextIndex);
    scrollToPage(nextIndex);
  }, [scrollToPage, visiblePhotos.length]);

  const requestNextPage = useCallback(
    (force = false) => {
      if (
        !fetchNextPage ||
        !hasNextPage ||
        isFetchingNextPage ||
        (!force && lastFetchPhotoCountRef.current === visiblePhotos.length)
      ) {
        return;
      }

      lastFetchPhotoCountRef.current = visiblePhotos.length;

      try {
        void Promise.resolve(fetchNextPage()).catch(() => {
          lastFetchPhotoCountRef.current = -1;
        });
      } catch {
        lastFetchPhotoCountRef.current = -1;
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, visiblePhotos.length],
  );

  useEffect(() => {
    if (visible && visiblePhotos.length - currentIndex <= NEXT_PAGE_THRESHOLD) {
      requestNextPage();
    }
  }, [currentIndex, requestNextPage, visible, visiblePhotos.length]);

  useEffect(() => {
    if (!visible || visiblePhotos.length === 0) {
      return;
    }

    const urls = [currentIndex - 1, currentIndex + 1, currentIndex + 2]
      .map((index) => visiblePhotos[index]?.url?.trim())
      .filter(isPrefetchableUrl);

    if (urls.length > 0) {
      void ExpoImage.prefetch([...new Set(urls)], {
        cachePolicy: "memory-disk",
      }).catch(() => undefined);
    }
  }, [currentIndex, visible, visiblePhotos]);

  const handlePhotoDeleted = useCallback(
    (photoId: string) => {
      const deletedIndex = visiblePhotos.findIndex(
        (photo) => photo.id === photoId,
      );
      const remainingCount = Math.max(visiblePhotos.length - 1, 0);

      setIsInteractionLocked(false);
      setDeletedPhotoIds((current) => new Set(current).add(photoId));

      if (remainingCount === 0) {
        handleClose();
        return;
      }

      pendingIndexAfterDeleteRef.current = Math.min(
        Math.max(deletedIndex, 0),
        remainingCount - 1,
      );
    },
    [handleClose, visiblePhotos],
  );

  const renderItem = useCallback<ListRenderItem<IPhoto>>(
    ({ item, index }) => (
      <PhotoGalleryPage
        photo={item}
        isActive={index === currentIndex}
        pageHeight={pageHeight}
        pageWidth={pageWidth}
        deleteAble={deleteAble}
        onClose={handleClose}
        onDeleted={handlePhotoDeleted}
        onInteractionChange={setIsInteractionLocked}
      />
    ),
    [
      currentIndex,
      deleteAble,
      handleClose,
      handlePhotoDeleted,
      pageHeight,
      pageWidth,
    ],
  );

  const keyExtractor = useCallback((photo: IPhoto) => photo.id, []);
  const overrideItemLayout = useCallback(
    (layout: { size?: number }) => {
      layout.size = pageHeight;
    },
    [pageHeight],
  );
  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageHeight <= 0 || visiblePhotos.length === 0) {
        return;
      }

      const nextIndex = Math.min(
        Math.max(Math.round(event.nativeEvent.contentOffset.y / pageHeight), 0),
        visiblePhotos.length - 1,
      );

      setIsInteractionLocked(false);
      setCurrentIndex((current) =>
        current === nextIndex ? current : nextIndex,
      );
    },
    [pageHeight, visiblePhotos.length],
  );
  const handleListLoad = useCallback(() => {
    if (!visible) {
      return;
    }

    setIsListReady(true);
  }, [visible]);
  const isAtLoadedEnd = currentIndex >= visiblePhotos.length - 1;

  return (
    <Modal visible={visible} onClose={handleClose} presentation="fullscreen">
      <View
        accessibilityViewIsModal
        onLayout={handleViewportLayout}
        style={styles.container}
      >
        {visible && !isListReady && visiblePhotos[safeInitialIndex]?.url && (
          <ExpoImage
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: visiblePhotos[safeInitialIndex].url }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {isViewportReady && visiblePhotos.length > 0 && (
          <FlashList<IPhoto>
            ref={listRef}
            data={visiblePhotos}
            extraData={currentIndex}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={[styles.list, !isListReady && styles.listHidden]}
            estimatedItemSize={pageHeight}
            estimatedListSize={estimatedListSize}
            estimatedFirstItemOffset={0}
            initialScrollIndex={safeInitialIndex}
            overrideItemLayout={overrideItemLayout}
            pagingEnabled
            horizontal={false}
            snapToInterval={pageHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            scrollEnabled={isListReady && !isInteractionLocked}
            accessibilityElementsHidden={!isListReady}
            importantForAccessibility={
              isListReady ? "auto" : "no-hide-descendants"
            }
            onLoad={handleListLoad}
            onMomentumScrollEnd={handleMomentumScrollEnd}
          />
        )}

        {isListReady && isAtLoadedEnd && isFetchingNextPage && (
          <View
            accessibilityLiveRegion="polite"
            className="absolute self-center rounded-full bg-black/55 px-16 py-10"
            style={{ bottom: insets.bottom + 24 }}
          >
            <Spinner size={18} className="text-white" />
          </View>
        )}

        {isListReady && isAtLoadedEnd && isFetchNextPageError && (
          <Pressable
            accessibilityLabel="Retry loading more photos"
            accessibilityRole="button"
            className="absolute min-h-44 self-center justify-center rounded-full bg-black/65 px-18"
            onPress={() => requestNextPage(true)}
            style={{ bottom: insets.bottom + 24 }}
          >
            <Text variant="footnote" className="font-bold text-white">
              Retry loading photos
            </Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
    overflow: "hidden",
  },
  list: {
    flex: 1,
  },
  listHidden: {
    opacity: 0,
  },
  page: {
    backgroundColor: "#000",
    overflow: "hidden",
  },
});
