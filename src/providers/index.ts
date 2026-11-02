// Subscription providers (web). These require @sudobility/components auth +
// subscription contexts and this package's RevenueCat web adapter.
export {
  SafeSubscriptionContext,
  STUB_SUBSCRIPTION_VALUE,
  useSafeSubscription,
} from './SafeSubscriptionContext';

export { LazySubscriptionProvider } from './LazySubscriptionProvider';

// SubscriptionProviderWrapper is intentionally NOT exported: LazySubscriptionProvider
// lazy-imports it so the RevenueCat SDK (~600KB) stays in its own chunk and only
// loads for authenticated users.
