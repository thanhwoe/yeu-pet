export interface SubscriptionLimits {
  maxPets: number;
  maxActiveReminders: number;
  maxMedicalRecords: number;
  maxMedicalImagesPerRecord: number;
  maxBudgetTransactionsPerMonth: number;
  maxPhotoUploads: number;
  aiMessagesPerMonth: number;
  aiWithPetContext: boolean;
  aiWithMedicalHistory: boolean;
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
  currentPeriodEnd?: string | null;
}
