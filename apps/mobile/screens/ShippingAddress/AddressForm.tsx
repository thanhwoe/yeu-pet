import { CheckboxController } from "@/components/CheckboxController";
import { InputController } from "@/components/InputController";
import { PhoneInputController } from "@/components/PhoneInputController";
import { Button } from "@/components/ui/Button";
import {
  IShippingAddressForm,
  shippingAddressSchema,
} from "@/constants/validation";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";

interface IProps {
  onSubmit?: (data: IShippingAddressForm) => Promise<unknown>;
  loading?: boolean;
}

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);
const EnhancedPhoneInputController =
  withBottomSheetKeyboardEvents(PhoneInputController);

export const AddressForm = ({ onSubmit, loading }: IProps) => {
  const { control, handleSubmit } = useForm<IShippingAddressForm>({
    resolver: zodResolver(shippingAddressSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const handleSubmitForm = (data: IShippingAddressForm) => {
    onSubmit?.(data);
  };
  return (
    <View className="px-5">
      <EnhancedInputController
        control={control}
        name="full_name"
        label="Name"
        placeholder="Enter your full name"
      />
      <EnhancedPhoneInputController
        control={control}
        placeholder="Enter your phone number"
        name="phone"
        label="Phone"
      />
      <EnhancedInputController
        control={control}
        name="address"
        label="Shipping Address"
        placeholder="Enter your shipping address"
      />
      <CheckboxController<IShippingAddressForm>
        control={control}
        name="is_default"
        label="Set as default address"
      />

      <Button
        size="lg"
        className="mt-2"
        loading={loading}
        onPress={handleSubmit(handleSubmitForm)}
      >
        Save address
      </Button>
    </View>
  );
};
