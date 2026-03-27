import {
  budgetCategorySchema,
  IBudgetCategoryForm,
} from "@/constants/validation";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaintBucketIcon } from "phosphor-react-native";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";
import { InputController } from "../InputController";
import { OptionInputController } from "../OptionInputController";
import { Button } from "../ui/Button";

interface IProps {
  onSubmit: (data: IBudgetCategoryForm) => Promise<void>;
  defaultValues?: IBudgetCategoryForm;
  submitting?: boolean;
}

const OPTIONS = [
  {
    label: "Red",
    value: "#E5535B",
    icon: <PaintBucketIcon color="#E5535B" weight="fill" />,
  },
  {
    label: "Orange",
    value: "#FF8000",
    icon: <PaintBucketIcon color="#FF8000" weight="fill" />,
  },
  {
    label: "Yellow",
    value: "#F0C400",
    icon: <PaintBucketIcon color="#F0C400" weight="fill" />,
  },
  {
    label: "Green",
    value: "#4FB876",
    icon: <PaintBucketIcon color="#4FB876" weight="fill" />,
  },
  {
    label: "Blue",
    value: "#7E90FF",
    icon: <PaintBucketIcon color="#7E90FF" weight="fill" />,
  },
  {
    label: "Lilac",
    value: "#AEA6CA",
    icon: <PaintBucketIcon color="#AEA6CA" weight="fill" />,
  },
  {
    label: "Teal",
    value: "#3B786A",
    icon: <PaintBucketIcon color="#3B786A" weight="fill" />,
  },
  {
    label: "Lime",
    value: "#C0D000",
    icon: <PaintBucketIcon color="#C0D000" weight="fill" />,
  },
  {
    label: "Grey",
    value: "#89909E",
    icon: <PaintBucketIcon color="#89909E" weight="fill" />,
  },
  {
    label: "Pink",
    value: "#FF70AD",
    icon: <PaintBucketIcon color="#FF70AD" weight="fill" />,
  },
  {
    label: "Purple",
    value: "#B87DFF",
    icon: <PaintBucketIcon color="#B87DFF" weight="fill" />,
  },
  {
    label: "Cyan",
    value: "#33D3D9",
    icon: <PaintBucketIcon color="#33D3D9" weight="fill" />,
  },
];

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);

export const BudgetCategoryForm = ({
  onSubmit,
  defaultValues,
  submitting,
}: IProps) => {
  const { control, handleSubmit } = useForm<IBudgetCategoryForm>({
    resolver: zodResolver(budgetCategorySchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const handleSubmitForm = (data: IBudgetCategoryForm) => {
    onSubmit(data);
  };
  return (
    <KeyboardAvoidingView
      className="px-26 gap-16 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <EnhancedInputController<IBudgetCategoryForm>
        control={control}
        name="name"
        label="Name"
        placeholder="Category name"
      />
      <EnhancedInputController<IBudgetCategoryForm>
        control={control}
        name="emoji"
        label="Emoji Icon"
        placeholder="E.g 🐶"
      />
      <OptionInputController<IBudgetCategoryForm>
        control={control}
        name="color"
        label="Color"
        placeholder="Color theme"
        options={OPTIONS}
      />

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={submitting}
        className="mt-24"
        loading={submitting}
      >
        {!!defaultValues ? "Update Category" : "Add Category"}
      </Button>
    </KeyboardAvoidingView>
  );
};
