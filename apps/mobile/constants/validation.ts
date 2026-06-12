import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import { ERROR_MESSAGE } from "./messages";

export const REGEX = {
  date: /^\d{2}\/\d{2}\/\d{4}$/,
  emoji: /^\p{Emoji_Presentation}$/u,
};

const parseLocalNumber = (val: string): number => {
  // remove all dots (thousand separators)
  const clean = val.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(clean);
};

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const signUpSchema = z.object({
  phone: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Phone number"),
    })
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGE.FIELD_INVALID("Phone number"),
    }),
  email: z.email(ERROR_MESSAGE.FIELD_INVALID("Email")).optional(),
  firstName: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("First name"),
    })
    .nonempty({
      message: ERROR_MESSAGE.FIELD_REQUIRED("First name"),
    }),
  lastName: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Last name"),
    })
    .nonempty({
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

export const forgotPasswordSchema = z.object({
  phone: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Phone number"),
    })
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGE.FIELD_INVALID("Phone number"),
    }),
});

export const resetPasswordSchema = z.object({
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
  code: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("OTP code"),
    })
    .min(6, {
      message: ERROR_MESSAGE.FIELD_LENGTH("OTP code", 6),
    })
    .max(6, {
      message: ERROR_MESSAGE.FIELD_LENGTH("OTP code", 6),
    })
    .pipe(
      z.coerce.number({
        message: ERROR_MESSAGE.NUMBER_ONLY("OTP code"),
      }),
    )
    .transform((v) => String(v)),
});

export const reminderSchema = z.object({
  title: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Reminder name"),
    })
    .trim()
    .min(1, ERROR_MESSAGE.FIELD_REQUIRED("Reminder name")),
  description: z.string().trim().optional(),
  petId: z.string().optional().nullable(),
  type: z.enum(["grooming", "feeding", "vaccination", "medication"], {
    message: ERROR_MESSAGE.FIELD_REQUIRED("Type"),
  }),
  scheduledAt: z.date({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Schedule"),
  }),
  repeatFrequency: z
    .enum(["none", "daily", "weekly", "monthly", "yearly"])
    .optional(),
  repeatInterval: z.number().int().min(1).max(365).optional(),
  repeatUntil: z.date().optional().nullable(),
  timezone: z.string().optional(),
});

export const petInfoSchema = z.object({
  name: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Name"),
    })
    .nonempty({
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
  avatar: z
    .object({
      uri: z.string().min(1),
      name: z.string().min(1),
      type: z.string().min(1),
      size: z.number().optional(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: ERROR_MESSAGE.FIELD_REQUIRED("Avatar"),
    })
    .refine((val) => !val || ACCEPTED_IMAGE_TYPES.includes(val.type), {
      message: "Only .jpg, .jpeg, .png, .webp formats are accepted",
    })
    .refine((val) => !val || !val.size || val.size <= MAX_FILE_SIZE, {
      message: "File size must be less than 5MB",
    }),
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

export const budgetCategorySchema = z.object({
  name: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Title"),
    })
    .nonempty({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Title"),
    }),
  color: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Color"),
    })
    .nonempty({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Color"),
    }),
  emoji: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Emoji"),
    })
    .regex(REGEX.emoji, ERROR_MESSAGE.FIELD_INVALID("Emoji")),
});

export const budgetTransactionSchema = z.object({
  description: z
    .string({
      message: ERROR_MESSAGE.FIELD_INVALID("Description"),
    })
    .optional()
    .nullable(),
  amount: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Amount"),
    })
    .min(1, ERROR_MESSAGE.FIELD_REQUIRED("Amount"))
    .refine((val) => !isNaN(parseLocalNumber(val)), {
      message: ERROR_MESSAGE.FIELD_INVALID("Amount"),
    })
    .transform(parseLocalNumber)
    .pipe(z.number().min(1, ERROR_MESSAGE.FIELD_INVALID("Amount"))),
  categoryId: z.string({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Category"),
  }),
  petId: z
    .string()
    .optional()
    .transform((value) => (value === "__no_pet__" ? undefined : value)),
  date: z.date({
    message: ERROR_MESSAGE.FIELD_REQUIRED("Date"),
  }),
});

export const medicalRecordSchema = z
  .object({
    title: z
      .string({
        message: ERROR_MESSAGE.FIELD_REQUIRED("Title"),
      })
      .nonempty({
        message: ERROR_MESSAGE.FIELD_REQUIRED("Title"),
      }),
    description: z.string().optional(),
    vetClinic: z.string().optional(),
    vetName: z.string().optional(),

    petId: z.string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Pet"),
    }),
    recordType: z.enum(["vaccination", "checkup", "surgery", "medication"], {
      message: ERROR_MESSAGE.FIELD_REQUIRED("Record type"),
    }),
    date: z.date({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Date"),
    }),
    attachmentIds: z
      .array(
        z.object({
          id: z.string(),
          url: z.string(),
          name: z.string(),
        }),
      )
      .optional(),
    attachments: z
      .array(
        z
          .object({
            uri: z.string().min(1),
            name: z.string().min(1),
            type: z.string().min(1),
            size: z.number().optional(),
          })
          .refine((val) => ACCEPTED_IMAGE_TYPES.includes(val.type), {
            message: "Only .jpg, .jpeg, .png, .webp formats are accepted",
          })
          .refine((val) => !val.size || val.size <= MAX_FILE_SIZE, {
            message: "File size must be less than 5MB",
          }),
      )
      .optional(),
  })
  .check((ctx) => {
    if (!ctx.value.attachmentIds?.length && !ctx.value.attachments?.length) {
      ctx.issues.push({
        code: "custom",
        message: ERROR_MESSAGE.FIELD_REQUIRED("Attachments"),
        input: ctx.value,
        path: ["attachments"],
      });
    }
  });

const sitterRateSchema = (label: string) =>
  z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED(label),
    })
    .min(1, ERROR_MESSAGE.FIELD_REQUIRED(label))
    .refine((val) => !isNaN(parseLocalNumber(val)), {
      message: ERROR_MESSAGE.FIELD_INVALID(label),
    })
    .transform((val) => parseLocalNumber(val));

export const sitterProfileSchema = z.object({
  address: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Service area"),
    })
    .trim()
    .min(3, ERROR_MESSAGE.FIELD_INVALID("Service area")),
  bio: z
    .string()
    .trim()
    .max(200, "Bio must be at most 200 characters.")
    .optional()
    .transform((value) => value || undefined),
  hourlyRate: sitterRateSchema("Hourly rate"),
  dailyRate: sitterRateSchema("Daily rate"),
  isAvailable: z.boolean().optional(),
});

export const sitterBookingSchema = z
  .object({
    petId: z.string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Pet"),
    }),
    type: z.enum(["hourly", "daily"], {
      message: ERROR_MESSAGE.FIELD_REQUIRED("Service type"),
    }),
    startTime: z.date({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Start time"),
    }),
    endTime: z.date({
      message: ERROR_MESSAGE.FIELD_REQUIRED("End time"),
    }),
  })
  .refine((data) => data.startTime.getTime() > Date.now(), {
    message: "Start time must be in the future.",
    path: ["startTime"],
  })
  .refine((data) => data.endTime.getTime() > data.startTime.getTime(), {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export const sitterCancelSchema = z.object({
  reason: z.string().trim().max(240, "Reason must be at most 240 characters.").optional(),
});

export const sitterMessageSchema = z.object({
  content: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Message"),
    })
    .trim()
    .min(1, ERROR_MESSAGE.FIELD_REQUIRED("Message"))
    .max(2000, "Message must be at most 2000 characters."),
});

export const sitterReviewSchema = z.object({
  rating: z.enum(["1", "2", "3", "4", "5"], {
    message: ERROR_MESSAGE.FIELD_REQUIRED("Rating"),
  }),
  comment: z.string().trim().max(500, "Review must be at most 500 characters.").optional(),
});

export const shippingAddressSchema = z.object({
  phone: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Phone number"),
    })
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGE.FIELD_INVALID("Phone number"),
    }),
  full_name: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Name"),
    })
    .nonempty({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Name"),
    }),
  address: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Address"),
    })
    .nonempty({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Address"),
    }),
  is_default: z.boolean().optional(),
});

export type IPetInfoForm = z.output<typeof petInfoSchema>;
export type IPetInfoFormInput = z.input<typeof petInfoSchema>;

export type IBudgetCategoryForm = z.infer<typeof budgetCategorySchema>;

export type IBudgetTransactionForm = z.infer<typeof budgetTransactionSchema>;
export type IBudgetTransactionFormInput = z.input<
  typeof budgetTransactionSchema
>;
export type IBudgetTransactionFormOutput = z.output<
  typeof budgetTransactionSchema
>;

export type IReminderForm = z.infer<typeof reminderSchema>;

export type IMedicalRecordForm = z.infer<typeof medicalRecordSchema>;

export type ISitterProfileForm = z.output<typeof sitterProfileSchema>;
export type ISitterProfileFormInput = z.input<typeof sitterProfileSchema>;

export type ISitterBookingFormValues = z.infer<typeof sitterBookingSchema>;
export type ISitterCancelForm = z.infer<typeof sitterCancelSchema>;
export type ISitterMessageForm = z.infer<typeof sitterMessageSchema>;
export type ISitterReviewFormValues = z.infer<typeof sitterReviewSchema>;

export type ISignInForm = z.infer<typeof signInSchema>;

export type ISignUpForm = z.infer<typeof signUpSchema>;

export type IForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export type IResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export type IShippingAddressForm = z.infer<typeof shippingAddressSchema>;
