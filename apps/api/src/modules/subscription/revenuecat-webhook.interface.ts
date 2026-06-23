export const REVENUECAT_WEBHOOK_JOB = 'process-rc-webhook';

export const REVENUECAT_SUBSCRIPTION_EVENTS = {
  TEST: 'TEST',
  INITIAL_PURCHASE: 'INITIAL_PURCHASE',
  RENEWAL: 'RENEWAL',
  CANCELLATION: 'CANCELLATION',
  EXPIRATION: 'EXPIRATION',
  UNCANCELLATION: 'UNCANCELLATION',
  BILLING_ISSUE: 'BILLING_ISSUE',
  TRANSFER: 'TRANSFER',
  PRODUCT_CHANGE: 'PRODUCT_CHANGE',
  SUBSCRIPTION_EXTENDED: 'SUBSCRIPTION_EXTENDED',
  TEMPORARY_ENTITLEMENT_GRANT: 'TEMPORARY_ENTITLEMENT_GRANT',
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
  cancel_reason?: string | null;
  entitlement_id?: string | null;
  entitlement_ids?: string[] | null;
  environment?: string;
  event_timestamp_ms?: number;
  expiration_at_ms?: number | null;
  grace_period_expiration_at_ms?: number | null;
  id?: string;
  new_product_id?: string | null;
  original_app_user_id?: string;
  period_type?: string | null;
  product_id?: string | null;
  purchased_at_ms?: number | null;
  transferred_from?: string[];
  transferred_to?: string[];
  type?: string;
}

export type ParsedRevenueCatWebhookEvent = RevenueCatWebhookEvent & {
  event_timestamp_ms: number;
  id: string;
  type: string;
};

export interface RevenueCatWebhookAck {
  eventId: string;
  received: true;
}

export interface RevenueCatWebhookResult {
  accountId?: string;
  eventId?: string;
  eventType?: string;
  processed: boolean;
  reason?: string;
}

export interface RevenueCatEntitlementInfo {
  expires_date?: string | null;
  grace_period_expires_date?: string | null;
  product_identifier?: string | null;
  purchase_date?: string | null;
}

export interface RevenueCatSubscriptionInfo {
  billing_issues_detected_at?: string | null;
  expires_date?: string | null;
  grace_period_expires_date?: string | null;
  period_type?: string | null;
  purchase_date?: string | null;
  unsubscribe_detected_at?: string | null;
}

export interface RevenueCatSubscriberResponse {
  subscriber: {
    entitlements?: Record<string, RevenueCatEntitlementInfo>;
    original_app_user_id?: string;
    subscriptions?: Record<string, RevenueCatSubscriptionInfo>;
  };
}
