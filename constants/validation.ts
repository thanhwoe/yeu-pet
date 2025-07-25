import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import { ERROR_MESSAGE } from "./messages";

export const REGEX = {
  date: /^\d{2}\/\d{2}\/\d{4}$/,
};

export const signUpSchema = z.object({
  phone: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Phone number"),
    })
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGE.FIELD_INVALID("Phone number"),
    }),
  email: z.email(ERROR_MESSAGE.FIELD_INVALID("Email")).optional(),
  firstName: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("First name"),
  }),
  lastName: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Last name"),
  }),
  password: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Password"),
    })
    .trim()
    .min(8, ERROR_MESSAGE.PASSWORD_CANNOT_BE_LESS_THAN_8_CHARACTERS),
});

export const signInSchema = z.object({
  phone: z
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
    .min(8, ERROR_MESSAGE.PASSWORD_CANNOT_BE_LESS_THAN_8_CHARACTERS),
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

export const petInfoSchema = z.object({
  name: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Name"),
  }),
  age: z
    .string()
    .optional()
    .refine((val) => Number(val) >= 0 && Number(val) <= 100, {
      message: ERROR_MESSAGE.FIELD_INVALID("Age"),
    })
    .nullable(),
  birthdate: z.any().optional().nullable(),
  breed: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  color: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Color"),
  }),
  avatar_url: z.string().optional().nullable(),
  gender: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Gender"),
  }),
  species: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Species"),
  }),
  notes: z
    .string()
    .max(250, { message: "Notes must be at most 250 characters" })
    .trim()
    .optional()
    .nullable(),
});

export type IPetInfoForm = z.infer<typeof petInfoSchema>;

export type IReminderForm = z.infer<typeof reminderSchema>;

export type ISignInForm = z.infer<typeof signInSchema>;

export type ISignUpForm = z.infer<typeof signUpSchema>;
