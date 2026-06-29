import {
  budgetCategorySchema,
  IBudgetCategoryForm,
} from "@/constants/validation";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaintBucketIcon } from "phosphor-react-native";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";

interface IProps {
  onSubmit: (data: IBudgetCategoryForm) => Promise<void>;
  defaultValues?: IBudgetCategoryForm;
  submitting?: boolean;
}

const OPTIONS = [
  {
    labelKey: "budget.colors.red",
    value: "#E5535B",
    icon: <PaintBucketIcon color="#E5535B" weight="fill" />,
  },
  {
    labelKey: "budget.colors.orange",
    value: "#FF8000",
    icon: <PaintBucketIcon color="#FF8000" weight="fill" />,
  },
  {
    labelKey: "budget.colors.yellow",
    value: "#F0C400",
    icon: <PaintBucketIcon color="#F0C400" weight="fill" />,
  },
  {
    labelKey: "budget.colors.green",
    value: "#4FB876",
    icon: <PaintBucketIcon color="#4FB876" weight="fill" />,
  },
  {
    labelKey: "budget.colors.blue",
    value: "#7E90FF",
    icon: <PaintBucketIcon color="#7E90FF" weight="fill" />,
  },
  {
    labelKey: "budget.colors.lilac",
    value: "#AEA6CA",
    icon: <PaintBucketIcon color="#AEA6CA" weight="fill" />,
  },
  {
    labelKey: "budget.colors.teal",
    value: "#3B786A",
    icon: <PaintBucketIcon color="#3B786A" weight="fill" />,
  },
  {
    labelKey: "budget.colors.lime",
    value: "#C0D000",
    icon: <PaintBucketIcon color="#C0D000" weight="fill" />,
  },
  {
    labelKey: "budget.colors.grey",
    value: "#89909E",
    icon: <PaintBucketIcon color="#89909E" weight="fill" />,
  },
  {
    labelKey: "budget.colors.pink",
    value: "#FF70AD",
    icon: <PaintBucketIcon color="#FF70AD" weight="fill" />,
  },
  {
    labelKey: "budget.colors.purple",
    value: "#B87DFF",
    icon: <PaintBucketIcon color="#B87DFF" weight="fill" />,
  },
  {
    labelKey: "budget.colors.cyan",
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
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<IBudgetCategoryForm>({
    resolver: zodResolver(budgetCategorySchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const handleSubmitForm = (data: IBudgetCategoryForm) => {
    onSubmit(data);
  };
  const colorOptions = useMemo(
    () =>
      OPTIONS.map(({ labelKey, ...item }) => ({
        ...item,
        label: t(labelKey),
      })),
    [t],
  );

  return (
    <KeyboardAvoidingView
      className="px-26 gap-16 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <EnhancedInputController
        control={control}
        name="name"
        label={t("budget.form.categoryName.label")}
        placeholder={t("budget.form.categoryName.placeholder")}
      />
      <EnhancedInputController
        control={control}
        name="emoji"
        label={t("budget.form.emoji.label")}
        placeholder={t("budget.form.emoji.placeholder")}
      />
      <OptionInputController<IBudgetCategoryForm>
        control={control}
        name="color"
        label={t("budget.form.color.label")}
        placeholder={t("budget.form.color.placeholder")}
        options={colorOptions}
      />

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={submitting}
        className="mt-24"
        loading={submitting}
      >
        {defaultValues
          ? t("budget.actions.updateCategory")
          : t("budget.actions.addCategory")}
      </Button>
    </KeyboardAvoidingView>
  );
};
