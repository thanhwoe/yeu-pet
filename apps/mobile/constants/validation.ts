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

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : undefined;
};

const optionalPetTextField = (maxLength = 100) =>
  z.preprocess(
    emptyStringToUndefined,
    z.string().max(maxLength).optional().nullable(),
  );

const optionalPetDate = z.preprocess(
  (value) => {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    const parsedDate = new Date(value as string | number);

    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate;
  },
  z
    .date({ message: ERROR_MESSAGE.FIELD_INVALID("Birthdate") })
    .nullable()
    .optional()
    .refine((value) => !value || value.getTime() <= Date.now(), {
      message: "Birthdate cannot be in the future",
    }),
);

const petAvatarSchema = z
  .object({
    uri: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    size: z.number().optional(),
  })
  .nullable()
  .optional()
  .refine((val) => !val || ACCEPTED_IMAGE_TYPES.includes(val.type), {
    message: "Only .jpg, .jpeg, .png, .webp formats are accepted",
  })
  .refine((val) => !val || !val.size || val.size <= MAX_FILE_SIZE, {
    message: "File size must be less than 5MB",
  });

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
    .trim()
    .min(1, ERROR_MESSAGE.FIELD_REQUIRED("Name"))
    .max(100, "Name must be at most 100 characters"),
  age: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || (Number(val) >= 0 && Number(val) <= 100), {
      message: ERROR_MESSAGE.FIELD_INVALID("Age"),
    }),
  birthdate: optionalPetDate,
  breed: optionalPetTextField(),
  weight: optionalPetTextField(),
  color: optionalPetTextField(),
  avatar: petAvatarSchema,
  gender: z.preprocess(
    emptyStringToUndefined,
    z.enum(["male", "female", "unknown"]).optional().nullable(),
  ),
  species: z.preprocess(
    emptyStringToUndefined,
    z.enum(["dog", "cat", "bird", "rabbit", "hamster", "other"])
      .optional()
      .nullable(),
  ),
  notes: optionalPetTextField(250),
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

const optionalTrimmedString = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => value || undefined);

export const sitterProfileSchema = z.object({
  displayName: optionalTrimmedString(
    100,
    "Display name must be at most 100 characters.",
  ),
  address: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Service area"),
    })
    .trim()
    .min(3, ERROR_MESSAGE.FIELD_INVALID("Service area")),
  city: optionalTrimmedString(100, "City must be at most 100 characters."),
  district: optionalTrimmedString(
    100,
    "District must be at most 100 characters.",
  ),
  ward: optionalTrimmedString(100, "Ward must be at most 100 characters."),
  experience: optionalTrimmedString(
    200,
    "Experience must be at most 200 characters.",
  ),
  bio: optionalTrimmedString(200, "Bio must be at most 200 characters."),
  serviceNotes: optionalTrimmedString(
    400,
    "Service notes must be at most 400 characters.",
  ),
  hourlyRate: sitterRateSchema("Hourly rate"),
  dailyRate: sitterRateSchema("Daily rate"),
  maxConcurrentBookings: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine(
      (value) =>
        value === undefined ||
        (Number.isInteger(value) && value >= 1 && value <= 10),
      {
        message: "Max bookings must be between 1 and 10.",
      },
    ),
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
    ownerNotes: optionalTrimmedString(
      500,
      "Owner notes must be at most 500 characters.",
    ),
    careInstructions: optionalTrimmedString(
      500,
      "Care instructions must be at most 500 characters.",
    ),
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

export type ISitterBookingFormInput = z.input<typeof sitterBookingSchema>;
export type ISitterBookingFormValues = z.output<typeof sitterBookingSchema>;
export type ISitterCancelForm = z.infer<typeof sitterCancelSchema>;
export type ISitterMessageForm = z.infer<typeof sitterMessageSchema>;
export type ISitterReviewFormValues = z.infer<typeof sitterReviewSchema>;

export type ISignInForm = z.infer<typeof signInSchema>;

export type ISignUpForm = z.infer<typeof signUpSchema>;

export type IForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export type IResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export type IShippingAddressForm = z.infer<typeof shippingAddressSchema>;
