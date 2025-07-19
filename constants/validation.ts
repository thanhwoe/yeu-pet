import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import { ERROR_MESSAGE } from "./messages";

export const REGEX = {
  date: /^\d{2}\/\d{2}\/\d{4}$/,
};

export const signUpSchema = z.object({
  phoneNumber: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Phone number"),
    })
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGE.FIELD_INVALID("Phone number"),
    }),
  password: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Password"),
    })
    .trim()
    .min(8, ERROR_MESSAGE.FIELD_INVALID("Password")),
});

export const signInSchema = z.object({
  phoneNumber: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Phone number"),
    })
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGE.FIELD_INVALID("Phone number"),
    }),
  password: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Password"),
    })
    .trim()
    .min(8, ERROR_MESSAGE.FIELD_INVALID("Password")),
});

export const reminderSchema = z.object({
  title: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Title"),
  }),
  description: z.string().optional(),
  address: z.string().optional(),
  date: z.date(),
  petId: z.string(),
});

export type IReminderForm = z.infer<typeof reminderSchema>;

export type ISignInForm = z.infer<typeof signInSchema>;

export type ISignUpForm = z.infer<typeof signUpSchema>;
