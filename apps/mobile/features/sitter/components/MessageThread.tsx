import { InputController } from "@/components/InputController";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
import { ISitterMessageForm, sitterMessageSchema } from "@/constants/validation";
import { useSitterBookingMessages } from "@/features/sitter/useSitters";
import { ISitterBooking } from "@/interfaces";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { SitterSkeleton } from "./SitterPrimitives";

export const MessageThread = ({
  booking,
  currentUserId,
  onSend,
  loading,
}: {
  booking: ISitterBooking;
  currentUserId?: string;
  onSend: (data: ISitterMessageForm) => Promise<void>;
  loading: boolean;
}) => {
  const messagesQuery = useSitterBookingMessages(booking.id);
  const { control, handleSubmit, reset } = useForm<ISitterMessageForm>({
    resolver: zodResolver(sitterMessageSchema),
    defaultValues: { content: "" },
  });

  const messages = messagesQuery.data?.data ?? [];

  const submit = async (data: ISitterMessageForm) => {
    await onSend(data);
    reset({ content: "" });
  };

  return (
    <View className="gap-16">
      {messagesQuery.isLoading ? (
        <SitterSkeleton />
      ) : messagesQuery.isError ? (
        <StateView
          variant="error"
          title="Messages could not load"
          description="Try again to refresh this booking thread."
          actionLabel="Retry"
          onAction={() => messagesQuery.refetch()}
          className="min-h-140"
        />
      ) : messages.length ? (
        <View className="gap-10">
          {messages.map((message) => {
            const isOwn = message.senderAccountId === currentUserId;
            return (
              <View
                key={message.id}
                className={cn(
                  "max-w-[82%] rounded-18 px-12 py-10",
                  isOwn
                    ? "self-end bg-action-primary"
                    : "self-start bg-background-surface-muted",
                )}
              >
                <Body
                  variant="body5"
                  className={
                    isOwn
                      ? "text-action-primary-foreground/80"
                      : "text-text-muted"
                  }
                >
                  {message.createdAt
                    ? dayjs(message.createdAt).format("DD MMM, HH:mm")
                    : "Just now"}
                </Body>
                <Body
                  variant="body3"
                  className={
                    isOwn ? "text-action-primary-foreground" : undefined
                  }
                >
                  {message.content}
                </Body>
              </View>
            );
          })}
        </View>
      ) : (
        <StateView
          variant="empty"
          title="No messages yet"
          description="Use this thread to confirm care details before the visit."
          className="min-h-140"
        />
      )}

      <InputController<ISitterMessageForm>
        control={control}
        name="content"
        label="Message"
        placeholder="Ask or share care details"
        multiline
        numberOfLines={3}
      />
      <Button loading={loading} onPress={() => handleSubmit(submit)()}>
        Send message
      </Button>
    </View>
  );
};
