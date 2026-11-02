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
