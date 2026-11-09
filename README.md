# @sudobility/subscription_pages

Ready-to-use subscription page components for React **web** applications.

This package composes data hooks from `@sudobility/subscription_lib` with UI
primitives from `@sudobility/components` to render complete subscription /
paywall pages. It also ships the **web RevenueCat adapter** (`@revenuecat/purchases-js`)
that backs `subscription_lib`, plus auth-aware React providers for lazy-loading
the RevenueCat SDK.

- **Language**: TypeScript · **Build**: Vite library mode (ESM only) + `tsc` declarations
- **Package manager**: Bun
- **License**: BUSL-1.1

## Installation

This package is published to **GitHub Packages** (not the public npm registry).
Consumers need an `.npmrc` that maps the `@sudobility` scope to GitHub Packages:

```
@sudobility:registry=https://npm.pkg.github.com
```

Then:

```bash
bun add @sudobility/subscription_pages
```

You must also install the peer dependencies (see [Peer Dependencies](#peer-dependencies)).

## What's exported

| Export | Kind | Purpose |
|--------|------|---------|
| `SubscriptionByDurationPage` | Component | Paywall grouping packages by billing period (monthly/yearly), with a segmented control to switch |
| `SubscriptionByOfferPage` | Component | Paywall organizing packages by offering (Free + each offering), with a per-offering duration list |
| `SubscriptionByDurationPageProps`, `SubscriptionByOfferPageProps` | Types | Props for the pages above |
| `createRevenueCatAdapter` | Function | Web `SubscriptionAdapter` for `subscription_lib` (`@revenuecat/purchases-js`) |
| `configureRevenueCatAdapter` | Function | Set the RevenueCat API key before initializing `subscription_lib` |
| `setRevenueCatUser`, `clearRevenueCatUser`, `hasRevenueCatUser` | Functions | Manage the current RevenueCat user (login/logout) |
| `LazySubscriptionProvider` | Component | Auth-aware provider that lazy-loads the RevenueCat SDK (~600KB) only for logged-in users |
| `SafeSubscriptionContext`, `useSafeSubscription`, `STUB_SUBSCRIPTION_VALUE` | Context/hook/value | Safe subscription context with stub defaults for unauthenticated users |

## Usage

### 1. Wire up the adapter and provider

```tsx
import {
  configureRevenueCatAdapter,
  createRevenueCatAdapter,
  LazySubscriptionProvider,
} from '@sudobility/subscription_pages';
import { initializeSubscription } from '@sudobility/subscription_lib';

// Once, at startup:
configureRevenueCatAdapter(REVENUECAT_API_KEY);
initializeSubscription({ adapter: createRevenueCatAdapter() });

// Wrap your app (uses @sudobility/auth_lib to detect login):
<LazySubscriptionProvider apiKey={REVENUECAT_API_KEY} entityId={user?.uid}>
  <App />
</LazySubscriptionProvider>;
```

### 2. Render a page

```tsx
import {
  SubscriptionByDurationPage,
  SubscriptionByOfferPage,
} from '@sudobility/subscription_pages';

// Duration-based: segmented control for monthly / yearly / ...
<SubscriptionByDurationPage
  onNavigateToLogin={(offerId, packageId) => navigate('/login')}
  userId={user?.uid}
  userEmail={user?.email}
  featuresByPackage={{
    pro_monthly: ['Unlimited projects', 'Priority support'],
    pro_yearly: ['Unlimited projects', 'Priority support', 'Save 20%'],
  }}
  freeFeatures={['3 projects', 'Community support']}
/>

// Offer-based: segmented control for Free + each offering
<SubscriptionByOfferPage
  onNavigateToLogin={(offerId, packageId) => navigate('/login')}
  userId={user?.uid}
  userEmail={user?.email}
  freeFeatures={['3 projects']}
  renderOfferingContent={offerId => <OfferingBlurb id={offerId} />}
/>
```

> **Note**: These pages decide whether to show purchase CTAs by calling
> `useIsUserSubscribable()` from `subscription_lib` — there is **no `isLoggedIn`
> prop**. Login state flows through the provider / `subscription_lib`, not props.

## API

### Common props (both pages)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onNavigateToLogin` | `(offerId?: string, packageId?: string) => void` | Yes | Called when an unauthenticated user triggers a CTA; the offer/package are passed when a specific tile was clicked |
| `userId` | `string` | No | User ID for subscription lookup (undefined if not logged in) |
| `userEmail` | `string` | No | User email for purchase operations |
| `featuresByPackage` | `Record<string, string[]>` | No | Features per `packageId` |
| `freeFeatures` | `string[]` | No | Features for the free tier |
| `title` | `string` | No | Page title (default: `"Choose Your Plan"`) |
| `className` | `string` | No | Additional CSS classes |
| `currentPlatform` | `SubscriptionPlatform` | No | Defaults to `Web`; used for cross-platform detection |
| `networkClient` | `NetworkClient` | No | Network client for the backend subscription fetch |
| `baseUrl` | `string` | No | Backend API base URL |
| `token` | `string` | No | Auth token for the backend API |
| `testMode` | `boolean` | No | Include sandbox purchases |
| `t` | `(key: string, fallback: string) => string` | No | Translation function; falls back to the given string |

When `networkClient` + `baseUrl` + `token` + `userId` are all provided, the page
fetches the backend subscription and, if its `platform` differs from
`currentPlatform`, renders a read-only cross-platform info panel instead of the
purchase UI.

### `SubscriptionByDurationPage` only

| Prop | Type | Description |
|------|------|-------------|
| `getFeaturesByPackageId` | `(offerId, packageId) => string[]` | Resolve features per package (takes precedence over `featuresByPackage`) |
| `getFeaturesByEntitlement` | `(entitlement) => string[]` | Resolve features from a package's first entitlement |

### `SubscriptionByOfferPage` only

| Prop | Type | Description |
|------|------|-------------|
| `renderOfferingContent` | `(offerId) => React.ReactNode` | Render a description block for a paid offering |
| `initialOfferId` | `string` | Auto-select this offering on mount (must match a RevenueCat offering id) |

## Peer Dependencies

All of these must be supplied by the consuming app (they are externalized from the
build so the app provides a single copy):

| Package | Range |
|---------|-------|
| `react` / `react-dom` | `^18.0.0 \|\| ^19.0.0` |
| `@revenuecat/purchases-js` | `^1.0.0` |
| `@sudobility/subscription_lib` | `^0.0.65` |
| `@sudobility/components` | `^5.3.64` |
| `@sudobility/types` | `^1.9.78` |
| `@sudobility/design` | `^1.1.69` |
| `@sudobility/di` | `^1.5.85` |
| `@sudobility/auth_lib` | `^0.0.128` |

## Development

```bash
bun install          # Install dependencies (requires GitHub Packages auth for @sudobility scope)
bun run build        # tsc declarations + vite build + fix-esm-imports → dist/
bun run dev          # vite build --watch
bun run type-check   # tsc --noEmit  (note: hyphenated, not "typecheck")
bun run lint         # eslint .
bun run lint:fix     # eslint . --fix
bun run format       # prettier --write
bun run test:unit    # vitest run  (NOT `bun test` — see below)
bun run test:watch   # vitest watch
```

> **Testing gotcha**: there is no `test` script, so `bun test` invokes Bun's own
> test runner, not Vitest. The suites use Vitest + jsdom + React Testing Library
> and must be run with `bun run test:unit`.

## License

BUSL-1.1
