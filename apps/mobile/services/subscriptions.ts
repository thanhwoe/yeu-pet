import { API_ROUTES } from "@/constants/api-routes";
import { SubscriptionEntitlements } from "@/interfaces";
import { APIs } from "./api-helper";

export const getSubscriptionQuery = () =>
  APIs.get<SubscriptionEntitlements>(API_ROUTES.SUBSCRIPTIONS_ME);

export const getEntitlementsQuery = () =>
  APIs.get<SubscriptionEntitlements>(API_ROUTES.SUBSCRIPTION_ENTITLEMENTS);

export const mockUpgradeSubscriptionMutation = () =>
  APIs.post<SubscriptionEntitlements>(API_ROUTES.SUBSCRIPTION_MOCK_UPGRADE);

export const mockDowngradeSubscriptionMutation = () =>
  APIs.post<SubscriptionEntitlements>(API_ROUTES.SUBSCRIPTION_MOCK_DOWNGRADE);
