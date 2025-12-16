import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IShippingAddress } from "@/interfaces";
import { useRouter } from "expo-router";
import parsePhoneNumber from "libphonenumber-js";
import { isEmpty } from "lodash";
import { CaretDoubleRightIcon, MapPinIcon } from "phosphor-react-native";
import { Pressable, View } from "react-native";

const AddressIcon = withIconClassName(MapPinIcon);
const EditIcon = withIconClassName(CaretDoubleRightIcon);

interface IAddressSectionProps {
  data?: IShippingAddress;
}

export const AddressSection = ({ data }: IAddressSectionProps) => {
  const router = useRouter();

  if (isEmpty(data)) {
    return (
      <View className="border rounded-xl items-center border-line-negative py-2 px-3 gap-2 bg-background-card-info">
        <Text className="text-center text-text-secondary" variant="body2">
          Add your shipping address {"\n"} for a smoother checkout.
        </Text>
        <Button
          className=""
          size="sm"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/shipping-address",
              params: {
                action: "add",
              },
            })
          }
        >
          Add address
        </Button>
      </View>
    );
  }
  return (
    <>
      <View className="border rounded-xl border-line-tertiary flex-row py-2 px-3 gap-2 bg-background-card-info">
        <AddressIcon size={20} weight="fill" className="text-icon-primary" />
        <View className="flex-1">
          <Text numberOfLines={1} className="font-semibold" variant="callout">
            {data?.full_name} -{" "}
            {parsePhoneNumber(data?.phone ?? "")?.formatNational()}
          </Text>
          <Text
            numberOfLines={2}
            variant="body2"
            className="text-text-secondary"
          >
            {data?.address}
          </Text>
        </View>
        <Pressable onPress={() => router.push("/shipping-address")}>
          <EditIcon size={18} weight="bold" className="text-icon-tertiary" />
        </Pressable>
      </View>
    </>
  );
};
