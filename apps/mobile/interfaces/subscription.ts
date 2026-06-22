export interface SubscriptionLimits {
  maxPets: number;
  maxActiveReminders: number;
  recurringReminders: boolean;
  maxMedicalRecords: number;
  maxImagesPerMedicalRecord: number;
  maxBudgetTransactionsPerMonth: number;
  yearlyBudgetStats: boolean;
  maxPhotos: number;
  aiMessagesPerMonth: number;
  aiWithPetContext: boolean;
  aiWithMedicalHistory: boolean;
  exportMedicalSummary: boolean;
}

export interface SubscriptionUsage {
  pets: number;
  activeReminders: number;
  medicalRecords: number;
  budgetTransactionsThisMonth: number;
  photos: number;
  aiMessagesThisMonth: number;
}

export interface SubscriptionEntitlements {
  tier: "free" | "premium";
  status:
    | "free"
    | "trialing"
    | "active"
    | "grace_period"
    | "expired"
    | "cancelled";
  planCode: string;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  expiresAt: string | null;
}
