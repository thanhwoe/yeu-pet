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

export interface IDeviceResponse {
  id: string;
  isActive: boolean | null;
  accountId: string;
  pushToken: string;
  deviceName: string | null;
  osVersion: string | null;
  platform: "unknown" | "android" | "ios" | null;
}

export interface IUpdateProfileParams {
  firstName?: string;
  lastName?: string;
}

export interface IEmailChangeRequest {
  requestId: string;
  newEmail: string;
  maskedEmail: string;
  expiresAt: string;
  resendAvailableAt?: string;
}

export interface IVerifyEmailChangeResponse {
  account: IUser;
}

export interface IAvatarUploadResponse {
  queued: boolean;
  profile: IUser;
}
