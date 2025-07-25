import { withUploadImage } from "@/hocs/withUploadImage";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Text } from "../ui/Text";

interface InputControllerProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  onProcess?: (val: boolean) => void;
}

const AvatarUploader = withUploadImage(Avatar);

export const AvatarInputController = <T extends FieldValues>({
  name,
  control,
  rules,
  label,
  onProcess,
}: InputControllerProps<T>) => {
  const {
    field: { value: defaultValue, onChange },
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <View aria-invalid={!!error?.message} className="gap-1">
      <Text variant="caption1" className="mb-4">
        {label}
      </Text>
      <AvatarUploader
        onUpload={onChange}
        onProcess={onProcess}
        size="huge"
        source={{
          uri: defaultValue || "https://avatar.iran.liara.run/public/32",
        }}
      />
      <Text className="text-red-500" variant="footnote">
        {error?.message}
      </Text>
    </View>
  );
};
