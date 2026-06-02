import { withIconClassName } from "@/hocs/withIconClassName";
import { withUploadImage } from "@/hocs/withUploadImage";
import { cn } from "@/utils";
import { ImageProps } from "expo-image";
import { CameraIcon } from "phosphor-react-native";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Body } from "../ui/Typography";

const Camera = withIconClassName(CameraIcon);

interface InputControllerProps<T extends FieldValues, TTransformedValues = T> {
  label: string;
  name: Path<T>;
  control: Control<T, any, TTransformedValues>;
  rules?: RegisterOptions<T>;
}

interface ImageFieldProps extends ImageProps {
  value?: string;
  hasError?: boolean;
  onPress?: () => void;
}
const ImageField = ({
  value,
  onPress,
  hasError,
  ...props
}: ImageFieldProps) => {
  return (
    <TouchableOpacity onPress={onPress} className="self-start">
      <Avatar
        className={cn("border-4 border-line-secondary-pressed  elevation-md", {
          "border-line-negative": hasError,
        })}
        size="huge"
        source={{
          uri: value,
        }}
        {...props}
      />
      <View className="absolute -bottom-0 -right-8 rounded-full p-8 bg-background-secondary-highlight">
        <Camera weight="fill" size={20} className="text-icon-primary-inverse" />
      </View>
    </TouchableOpacity>
  );
};

const AvatarUploader = withUploadImage(ImageField);

export const AvatarInputController = <
  T extends FieldValues,
  TTransformedValues = T,
>({
  name,
  control,
  rules,
  label,
}: InputControllerProps<T, TTransformedValues>) => {
  const {
    field: { value: defaultValue, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <View aria-invalid={!!error?.message} className="gap-6 items-center">
      <AvatarUploader
        onUpload={(v) => {
          onChange(v);
          onBlur();
        }}
        value={defaultValue?.uri}
        hasError={!!error?.message}
      />
      <Body variant="body3">{label}</Body>
      {error?.message && (
        <Body variant="body4" className="text-text-negative">
          {error?.message}
        </Body>
      )}
    </View>
  );
};
