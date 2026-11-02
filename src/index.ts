export {
  SubscriptionByDurationPage,
  type SubscriptionByDurationPageProps,
  SubscriptionByOfferPage,
  type SubscriptionByOfferPageProps,
} from './pages';

// Web RevenueCat adapter (implements subscription_lib's SubscriptionAdapter).
// Inject via initializeSubscription({ adapter: createRevenueCatAdapter() }).
export {
  configureRevenueCatAdapter,
  createRevenueCatAdapter,
  setRevenueCatUser,
  clearRevenueCatUser,
  hasRevenueCatUser,
} from './adapters';

// Auth-aware subscription providers (moved here from building_blocks so that
// building_blocks keeps no dependency on subscription_lib / subscription_pages).
export {
  SafeSubscriptionContext,
  STUB_SUBSCRIPTION_VALUE,
  useSafeSubscription,
  LazySubscriptionProvider,
} from './providers';
