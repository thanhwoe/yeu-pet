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
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface IProps {
  onSubmit?: (data: IShippingAddressForm) => Promise<unknown>;
  loading?: boolean;
}

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);
const EnhancedPhoneInputController =
  withBottomSheetKeyboardEvents(PhoneInputController);

export const AddressForm = ({ onSubmit, loading }: IProps) => {
  const { t } = useTranslation();
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
        label={t("commerce.address.form.nameLabel")}
        placeholder={t("commerce.address.form.namePlaceholder")}
      />
      <EnhancedPhoneInputController
        control={control}
        placeholder={t("commerce.address.form.phonePlaceholder")}
        name="phone"
        label={t("commerce.address.form.phoneLabel")}
      />
      <EnhancedInputController
        control={control}
        name="address"
        label={t("commerce.address.form.addressLabel")}
        placeholder={t("commerce.address.form.addressPlaceholder")}
      />
      <CheckboxController<IShippingAddressForm>
        control={control}
        name="is_default"
        label={t("commerce.address.form.defaultLabel")}
      />

      <Button
        size="lg"
        className="mt-2"
        loading={loading}
        onPress={handleSubmit(handleSubmitForm)}
      >
        {t("commerce.address.form.save")}
      </Button>
    </View>
  );
};
