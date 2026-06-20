import { BottomSheet } from "@/components/ui/BottomSheet";
import { Spinner } from "@/components/ui/Spinner";
import { Body } from "@/components/ui/Typography";
import { IPhotoComment } from "@/interfaces";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  type ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommentActionSheet } from "./CommentActionSheet";
import { CommentComposer } from "./CommentComposer";
import { CommentEmptyState, CommentErrorState } from "./CommentStates";
import { CommentSeparator, PhotoCommentItem } from "./CommentThread";
import { usePhotoCommentsSheet } from "./usePhotoCommentsSheet";

const COMMENTS_SHEET_SNAP_POINT = "76%";

interface PhotoCommentsSheetProps {
  visible: boolean;
  photoId: string;
  photoOwnerId: string;
  onDismiss: () => void;
  onCommentCountChange?: (count: number) => void;
}

export const PhotoCommentsSheet = ({
  visible,
  photoId,
  photoOwnerId,
  onDismiss,
  onCommentCountChange,
}: PhotoCommentsSheetProps) => {
  const [composerHeight, setComposerHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const BottomSheetScrollable =
    useBottomSheetScrollableCreator<ScrollViewProps>();
  const {
    actionComment,
    canDeleteActionComment,
    comments,
    currentUserId,
    error,
    expandedReplyIds,
    handleCancelReply,
    handleCommentActionDismiss,
    handleCommentLongPress,
    handleDeleteActionComment,
    handleDismiss,
    handleEndReached,
    handleReply,
    handleSubmit,
    handleToggleReplies,
    isCreating,
    isDeleting,
    isFetching,
    isFetchingNextPage,
    isLoading,
    listExtraData,
    replyingTo,
    replyFocusKey,
  } = usePhotoCommentsSheet({
    visible,
    photoId,
    photoOwnerId,
    onDismiss,
    onCommentCountChange,
  });

  const renderItem = useCallback<ListRenderItem<IPhotoComment>>(
    ({ item }) => (
      <PhotoCommentItem
        comment={item}
        currentUserId={currentUserId}
        expandedReplyIds={expandedReplyIds}
        photoOwnerId={photoOwnerId}
        photoId={photoId}
        disabled={isDeleting}
        activeCommentId={actionComment?.id}
        onLongPress={handleCommentLongPress}
        onReply={handleReply}
        onToggleReplies={handleToggleReplies}
      />
    ),
    [
      actionComment?.id,
      currentUserId,
      expandedReplyIds,
      handleCommentLongPress,
      handleReply,
      handleToggleReplies,
      isDeleting,
      photoId,
      photoOwnerId,
    ],
  );

  const keyExtractor = useCallback((item: IPhotoComment) => item.id, []);

  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);

    setComposerHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  }, []);

  const footer = useMemo(
    () => (
      <CommentComposer
        isCreating={isCreating}
        onSubmit={handleSubmit}
        replyingTo={replyingTo}
        focusKey={replyFocusKey}
        onCancelReply={handleCancelReply}
        bottomInset={insets.bottom}
        onLayout={handleComposerLayout}
      />
    ),
    [
      handleCancelReply,
      handleComposerLayout,
      handleSubmit,
      insets.bottom,
      isCreating,
      replyFocusKey,
      replyingTo,
    ],
  );

  const commentsContentStyle = useMemo(
    () => ({
      ...styles.commentsContent,
      paddingBottom: Math.max(composerHeight + 20, 112),
    }),
    [composerHeight],
  );

  return (
    <BottomSheet
      visible={visible}
      onDismiss={handleDismiss}
      titleElement={<Body weight="semiBold">Comments</Body>}
      useScrollView={false}
      useContentWrapper={false}
      enableDynamicSizing={false}
      snapPoints={[COMMENTS_SHEET_SNAP_POINT]}
      keyboardBehavior="interactive"
      footer={footer}
      footerBottomInset={0}
    >
      <View style={styles.sheetContent}>
        <View style={styles.commentsFrame}>
          {error && !comments.length ? (
            <CommentErrorState />
          ) : (
            <FlashList<IPhotoComment>
              data={comments}
              extraData={listExtraData}
              style={styles.commentsList}
              renderScrollComponent={BottomSheetScrollable}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              estimatedItemSize={118}
              ItemSeparatorComponent={CommentSeparator}
              ListEmptyComponent={
                <CommentEmptyState isLoading={isLoading || isFetching} />
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="items-center py-16">
                    <Spinner size={20} />
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={commentsContentStyle}
            />
          )}
        </View>
      </View>

      <CommentActionSheet
        visible={!!actionComment}
        canDelete={canDeleteActionComment}
        disabled={isDeleting}
        onDismiss={handleCommentActionDismiss}
        onDelete={handleDeleteActionComment}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  commentsFrame: {
    flex: 1,
    minHeight: 0,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  sheetContent: {
    flex: 1,
    minHeight: 0,
    paddingTop: 16,
  },
});
