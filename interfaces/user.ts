export interface IUser {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  onboardingCompleted: boolean;
  avatarUrl: string | null;
  role: string;
  subscription: string;
  subscriptionExpiresAt: string | null;
  isVerified: boolean;
}
