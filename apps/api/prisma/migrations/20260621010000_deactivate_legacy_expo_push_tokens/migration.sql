-- Expo push tokens cannot be delivered through Firebase Admin. Deactivate
-- legacy registrations so only Firebase Cloud Messaging tokens are targeted.
UPDATE "account_devices"
SET
  "is_active" = false,
  "updated_at" = CURRENT_TIMESTAMP
WHERE
  "push_token" LIKE 'ExpoPushToken[%'
  OR "push_token" LIKE 'ExponentPushToken[%';
