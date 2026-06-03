export const SUBSCRIPTION_LIMITS = {
  free: {
    maxPets: 2,
    maxActiveReminders: 5,
    recurringReminders: false,
    maxMedicalRecords: 10,
    maxImagesPerMedicalRecord: 1,
    maxBudgetTransactionsPerMonth: 20,
    yearlyBudgetStats: false,
    maxPhotos: 20,
    aiMessagesPerMonth: 5,
    aiWithPetContext: false,
    aiWithMedicalHistory: false,
    exportMedicalSummary: false,
  },
  premium: {
    maxPets: -1,
    maxActiveReminders: -1,
    recurringReminders: true,
    maxMedicalRecords: -1,
    maxImagesPerMedicalRecord: 5,
    maxBudgetTransactionsPerMonth: -1,
    yearlyBudgetStats: true,
    maxPhotos: -1,
    aiMessagesPerMonth: 300,
    aiWithPetContext: true,
    aiWithMedicalHistory: true,
    exportMedicalSummary: true,
  },
} as const;

export type SubscriptionLimits =
  (typeof SUBSCRIPTION_LIMITS)[keyof typeof SUBSCRIPTION_LIMITS];

export const SUBSCRIPTION_FEATURE_KEYS = {
  aiMessages: 'ai_messages',
} as const;
