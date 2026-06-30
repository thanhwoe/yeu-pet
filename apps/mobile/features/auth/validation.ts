import { isValidPhoneNumber } from "libphonenumber-js";
import { type TFunction } from "i18next";
import { z } from "zod/v4";

const required = (t: TFunction, fieldKey: string) =>
  t("validation.required", { field: t(fieldKey) });

const invalid = (t: TFunction, fieldKey: string) =>
  t("validation.invalid", { field: t(fieldKey) });

export const createSignInSchema = (t: TFunction) =>
  z.object({
    phone: z
      .string({
        message: required(t, "validation.fields.phoneNumber"),
      })
      .refine((value) => isValidPhoneNumber(value), {
        message: invalid(t, "validation.fields.phoneNumber"),
      }),
    password: z
      .string({
        message: required(t, "validation.fields.password"),
      })
      .trim()
      .min(8, t("validation.passwordMin")),
  });

export const createSignUpSchema = (t: TFunction) =>
  z.object({
    phone: z
      .string({
        message: required(t, "validation.fields.phoneNumber"),
      })
      .refine((value) => isValidPhoneNumber(value), {
        message: invalid(t, "validation.fields.phoneNumber"),
      }),
    email: z.email(invalid(t, "validation.fields.email")).optional(),
    firstName: z
      .string({
        message: required(t, "validation.fields.firstName"),
      })
      .nonempty({
        message: required(t, "validation.fields.firstName"),
      }),
    lastName: z
      .string({
        message: required(t, "validation.fields.lastName"),
      })
      .nonempty({
        message: required(t, "validation.fields.lastName"),
      }),
    password: z
      .string({
        message: required(t, "validation.fields.password"),
      })
      .trim()
      .min(8, t("validation.passwordMin")),
  });

export const createForgotPasswordSchema = (t: TFunction) =>
  z.object({
    phone: z
      .string({
        message: required(t, "validation.fields.phoneNumber"),
      })
      .refine((value) => isValidPhoneNumber(value), {
        message: invalid(t, "validation.fields.phoneNumber"),
      }),
  });

export const createResetPasswordSchema = (t: TFunction) =>
  z.object({
    phone: z
      .string({
        message: required(t, "validation.fields.phoneNumber"),
      })
      .refine((value) => isValidPhoneNumber(value), {
        message: invalid(t, "validation.fields.phoneNumber"),
      }),
    password: z
      .string({
        message: required(t, "validation.fields.password"),
      })
      .trim()
      .min(8, t("validation.passwordMin")),
    code: z
      .string({
        message: required(t, "validation.fields.otpCode"),
      })
      .min(6, {
        message: t("validation.exactLength", {
          field: t("validation.fields.otpCode"),
          length: 6,
        }),
      })
      .max(6, {
        message: t("validation.exactLength", {
          field: t("validation.fields.otpCode"),
          length: 6,
        }),
      })
      .pipe(
        z.coerce.number({
          message: t("validation.numbersOnly", {
            field: t("validation.fields.otpCode"),
          }),
        }),
      )
      .transform((value) => String(value)),
  });
