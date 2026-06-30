import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod/v4";
import { ERROR_MESSAGE, VALIDATION_MESSAGE } from "./messages";
import { isVietnamProvinceCityName } from "./vietnam-location-options";

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
      message: VALIDATION_MESSAGE.BIRTHDATE_NOT_FUTURE(),
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
    message: VALIDATION_MESSAGE.IMAGE_TYPES(),
  })
  .refine((val) => !val || !val.size || val.size <= MAX_FILE_SIZE, {
    message: VALIDATION_MESSAGE.FILE_SIZE_MAX_MB(),
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
    .max(100, VALIDATION_MESSAGE.MAX_LENGTH("Name", 100)),
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
    z
      .enum(["dog", "cat", "bird", "rabbit", "hamster", "other"])
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
            message: VALIDATION_MESSAGE.IMAGE_TYPES(),
          })
          .refine((val) => !val.size || val.size <= MAX_FILE_SIZE, {
            message: VALIDATION_MESSAGE.FILE_SIZE_MAX_MB(),
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

const startOfLocalDayTime = (date: Date) => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);

  return localDate.getTime();
};

export const sitterProfileSchema = z.object({
  displayName: optionalTrimmedString(
    100,
    VALIDATION_MESSAGE.MAX_LENGTH("Display name", 100),
  ),
  city: optionalTrimmedString(
    100,
    VALIDATION_MESSAGE.MAX_LENGTH("City", 100),
  ).refine((value) => value === undefined || isVietnamProvinceCityName(value), {
    message: VALIDATION_MESSAGE.SELECT_VIETNAM_CITY(),
  }),
  district: optionalTrimmedString(
    100,
    VALIDATION_MESSAGE.MAX_LENGTH("District", 100),
  ),
  ward: optionalTrimmedString(100, VALIDATION_MESSAGE.MAX_LENGTH("Ward", 100)),
  experience: optionalTrimmedString(
    200,
    VALIDATION_MESSAGE.MAX_LENGTH("Experience", 200),
  ),
  bio: optionalTrimmedString(200, VALIDATION_MESSAGE.MAX_LENGTH("Bio", 200)),
  serviceNotes: optionalTrimmedString(
    400,
    VALIDATION_MESSAGE.MAX_LENGTH("Service notes", 400),
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
        message: VALIDATION_MESSAGE.MAX_BOOKINGS_RANGE(),
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
      VALIDATION_MESSAGE.MAX_LENGTH("Owner notes", 500),
    ),
    careInstructions: optionalTrimmedString(
      500,
      VALIDATION_MESSAGE.MAX_LENGTH("Care instructions", 500),
    ),
  })
  .refine(
    (data) => data.type !== "hourly" || data.startTime.getTime() > Date.now(),
    {
      message: VALIDATION_MESSAGE.START_TIME_FUTURE(),
      path: ["startTime"],
    },
  )
  .refine(
    (data) =>
      data.type !== "daily" ||
      startOfLocalDayTime(data.startTime) > startOfLocalDayTime(new Date()),
    {
      message: VALIDATION_MESSAGE.DAILY_START_TOMORROW(),
      path: ["startTime"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "daily") {
        return (
          startOfLocalDayTime(data.endTime) >=
          startOfLocalDayTime(data.startTime)
        );
      }

      return data.endTime.getTime() > data.startTime.getTime();
    },
    {
      message: VALIDATION_MESSAGE.END_AFTER_START(),
      path: ["endTime"],
    },
  );

export const sitterCancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(240, VALIDATION_MESSAGE.MAX_LENGTH("Reason", 240))
    .optional(),
});

export const sitterMessageSchema = z.object({
  content: z
    .string({
      message: ERROR_MESSAGE.FIELD_REQUIRED("Message"),
    })
    .trim()
    .min(1, ERROR_MESSAGE.FIELD_REQUIRED("Message"))
    .max(2000, VALIDATION_MESSAGE.MAX_LENGTH("Message", 2000)),
});

export const sitterReviewSchema = z.object({
  rating: z.enum(["1", "2", "3", "4", "5"], {
    message: ERROR_MESSAGE.FIELD_REQUIRED("Rating"),
  }),
  comment: z
    .string()
    .trim()
    .max(500, VALIDATION_MESSAGE.MAX_LENGTH("Review", 500))
    .optional(),
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
