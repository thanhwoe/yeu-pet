import { Toast } from "@/components/Toast";
import { Body } from "@/components/ui/Typography";
import { DefaultFileParam, UploadFileParam } from "@/interfaces";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { FileItem } from "./FileItem";
import { BYTES_PER_MB, DEFAULT_MAX_FILES, DEFAULT_MAX_SIZE_MB } from "./utils";
import { ZoneUploader } from "./ZoneUploader";

// Unified shape for rendering — either an existing server file or a new local pick
type FileListItem =
  | { kind: "existing"; data: DefaultFileParam }
  | { kind: "new"; data: UploadFileParam };

interface InputControllerProps<T extends FieldValues, TTransformedValues = T> {
  label?: string;
  name: Path<T>;
  existingName: Path<T>;
  control: Control<T, any, TTransformedValues>;
  rules?: RegisterOptions<T>;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const DocumentsInputController = <
  T extends FieldValues,
  TTransformedValues = T,
>({
  name,
  existingName,
  control,
  rules,
  label,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
}: InputControllerProps<T, TTransformedValues>) => {
  const { t } = useTranslation();
  const {
    field: { value: newFiles, onChange: onChangeNew, onBlur: onBlurNew },
    fieldState: { error },
  } = useController({ name, control, rules });

  const {
    field: { value: existingFiles, onChange: onChangeExisting },
  } = useController({ name: existingName, control });

  const localFiles: UploadFileParam[] = newFiles ?? [];
  const serverFiles: DefaultFileParam[] = existingFiles ?? [];

  // Merge into a single unified list for rendering
  const allItems: FileListItem[] = [
    ...serverFiles.map((data): FileListItem => ({ kind: "existing", data })),
    ...localFiles.map((data): FileListItem => ({ kind: "new", data })),
  ];

  const totalCount = allItems.length;

  const handleUpload = (uploaded: UploadFileParam) => {
    if (uploaded.size && uploaded.size > maxSizeMB * BYTES_PER_MB) {
      Toast.error({
        title: t("common.documents.tooLargeTitle"),
        text: t("common.documents.tooLargeText", {
          name: uploaded.name,
          size: maxSizeMB,
        }),
      });
      return;
    }

    const isDuplicate = localFiles.some(
      (f) => f.name === uploaded.name && f.uri === uploaded.uri,
    );

    if (isDuplicate) {
      Toast.error({
        title: t("common.documents.alreadyAddedTitle"),
        text: t("common.documents.alreadyAddedText", {
          name: uploaded.name,
        }),
      });
      return;
    }

    if (totalCount >= maxFiles) {
      Toast.error({
        title: t("common.documents.limitReachedTitle"),
        text: t("common.documents.limitReachedText", { count: maxFiles }),
      });
      return;
    }

    onChangeNew([...localFiles, uploaded]);
    onBlurNew();
  };

  const handleRemoveExisting = (id: string) => {
    onChangeExisting(serverFiles.filter((f) => f.id !== id));
  };

  const handleRemoveNew = (index: number) => {
    onChangeNew(localFiles.filter((_, i) => i !== index));
    onBlurNew();
  };

  return (
    <View className="gap-12">
      {!!label && (
        <Body variant="body3" weight="semiBold">
          {label}
        </Body>
      )}

      {totalCount < maxFiles && (
        <ZoneUploader
          onUpload={handleUpload}
          hasError={!!error?.message}
          maxSizeMB={maxSizeMB}
        />
      )}

      {allItems.map((item, index) => {
        if (item.kind === "existing") {
          return (
            <FileItem
              key={`existing-${item.data.id}`}
              name={item.data.name}
              uri={item.data.url}
              onRemove={() => handleRemoveExisting(item.data.id)}
            />
          );
        }

        return (
          <FileItem
            key={`new-${index}`}
            name={item.data.name}
            uri={item.data.uri}
            onRemove={() => handleRemoveNew(index - serverFiles.length)}
          />
        );
      })}

      {!!error?.message && (
        <Body variant="body4" className="text-text-negative">
          {error.message}
        </Body>
      )}

      {totalCount > 0 && (
        <Body variant="body3" className="text-text-tertiary text-right">
          {totalCount}/{maxFiles} files
        </Body>
      )}
    </View>
  );
};
