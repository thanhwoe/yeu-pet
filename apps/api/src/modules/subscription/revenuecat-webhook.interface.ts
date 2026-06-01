export const REVENUECAT_SUBSCRIPTION_EVENTS = {
  INITIAL_PURCHASE: 'INITIAL_PURCHASE',
  RENEWAL: 'RENEWAL',
  PRODUCT_CHANGE: 'PRODUCT_CHANGE',
  SUBSCRIPTION_EXTENDED: 'SUBSCRIPTION_EXTENDED',
  TEMPORARY_ENTITLEMENT_GRANT: 'TEMPORARY_ENTITLEMENT_GRANT',
  UNCANCELLATION: 'UNCANCELLATION',
  EXPIRATION: 'EXPIRATION',
} as const;

export type RevenueCatSubscriptionEventType =
  (typeof REVENUECAT_SUBSCRIPTION_EVENTS)[keyof typeof REVENUECAT_SUBSCRIPTION_EVENTS];

export interface RevenueCatWebhookPayload {
  api_version?: string;
  event?: RevenueCatWebhookEvent;
}

export interface RevenueCatWebhookEvent {
  aliases?: string[];
  app_user_id?: string;
  entitlement_id?: string | null;
  entitlement_ids?: string[] | null;
  event_timestamp_ms?: number;
  expiration_at_ms?: number | null;
  id?: string;
  original_app_user_id?: string;
  type?: string;
}

export interface RevenueCatWebhookResult {
  accountId?: string;
  eventId?: string;
  eventType?: string;
  processed: boolean;
  reason?: string;
}
