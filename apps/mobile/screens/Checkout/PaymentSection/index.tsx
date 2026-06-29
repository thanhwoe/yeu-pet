import { Checkbox } from "@/components/ui/Checkbox";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { PaymentMethod } from "@/hooks/usePayment";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const OPTIONS = [
  {
    label: "VnPay",
    logo: require("@/assets/images/vnpay-logo.png"),
    value: PaymentMethod.VNPAY,
  },
  // {
  //   label: "ZaloPay",
  //   logo: require("@/assets/images/zalopay-logo.png"),
  //   value: PaymentMethod.ZALOPAY,
  // },
];

export type IPaymentSectionProps = {
  paymentMethod?: PaymentMethod | null;
  setPaymentMethod: (paymentMethod: PaymentMethod | null) => void;
};

export const PaymentSection = ({
  paymentMethod,
  setPaymentMethod,
}: IPaymentSectionProps) => {
  const { t } = useTranslation();

  return (
    <View className="border border-line-tertiary py-2 px-3 bg-background-card-info rounded-xl">
      <Text className="font-semibold">
        {t("commerce.checkout.paymentMethod")}
      </Text>
      <View className="gap-3 mt-3">
        {OPTIONS.map((option) => (
          <Checkbox
            key={option.value}
            className="justify-between"
            reverse
            checked={paymentMethod === option.value}
            onChange={(checked) =>
              setPaymentMethod(checked ? option.value : null)
            }
          >
            <View className="flex-row items-center">
              <Image source={option.logo} className="w-8 h-8 mr-2" />
              <Text>{option.label}</Text>
            </View>
          </Checkbox>
        ))}
      </View>
    </View>
  );
};
