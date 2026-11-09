# Subscription Pages - AI Development Guide

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it. Stay on the current branch; do not create
> feature branches for code changes.

## Overview

Ready-to-use subscription/paywall page components for React **web** apps. Composes
data hooks from `@sudobility/subscription_lib` with UI from `@sudobility/components`.
Also ships the **web RevenueCat adapter** (the `SubscriptionAdapter` implementation
that `subscription_lib` injects) and auth-aware providers.

- **Package**: `@sudobility/subscription_pages` (see package.json for current version)
- **License**: BUSL-1.1 · **Package manager**: Bun
- Published to **GitHub Packages**, not public npm (`.npmrc` maps `@sudobility` scope;
  CI publishes with `publish-target: github`).

## Tech Stack

- TypeScript, React 18/19, Bun
- Build: Vite library mode (ESM only) + `tsc` declarations + post-build ESM-import fixer
- Testing: Vitest + jsdom + React Testing Library

## Project Structure

```
src/
├── index.ts                 # Public barrel (pages + adapters + providers)
├── pages/
│   ├── SubscriptionByDurationPage.tsx   # Group packages by billing period
│   └── SubscriptionByOfferPage.tsx      # Group packages by offering (Free + offerings)
├── adapters/
│   └── revenuecat-web.ts    # Web SubscriptionAdapter (@revenuecat/purchases-js), lazy-loaded
├── providers/
│   ├── LazySubscriptionProvider.tsx     # Lazy-loads RevenueCat SDK only when logged in
│   ├── SubscriptionProviderWrapper.tsx  # NOT exported — lazy-imported by the above
│   └── SafeSubscriptionContext.tsx      # Stub-default subscription context
└── components/
    └── CrossPlatformSubscriptionInfo.tsx # Read-only panel for cross-platform subs
```
`plans/MIGRATION.md` documents the original multi-repo platform-awareness migration.

## Commands

```bash
bun install          # needs GitHub Packages auth for @sudobility scope
bun run build        # tsc + vite build + node scripts/fix-esm-imports.mjs → dist/
bun run dev          # vite build --watch
bun run type-check   # tsc --noEmit  (hyphenated!)
bun run lint         # eslint .
bun run lint:fix
bun run format       # prettier
bun run test:unit    # vitest run  (there is NO `test` script)
bun run test:watch
```

## Key Exports

- Pages: `SubscriptionByDurationPage`, `SubscriptionByOfferPage` (+ their `*Props`)
- Adapter: `createRevenueCatAdapter`, `configureRevenueCatAdapter`, `setRevenueCatUser`,
  `clearRevenueCatUser`, `hasRevenueCatUser`
- Providers: `LazySubscriptionProvider`, `SafeSubscriptionContext`, `useSafeSubscription`,
  `STUB_SUBSCRIPTION_VALUE`

## Peer Dependencies (all required)

`react`/`react-dom` (^18||^19), `@revenuecat/purchases-js`, `@sudobility/subscription_lib`,
`@sudobility/components`, `@sudobility/types`, `@sudobility/design`, `@sudobility/di`,
`@sudobility/auth_lib`. All are externalized by the Vite build; consumers supply one copy.

## Architecture & Conventions

- **Pages compose hooks + UI**: pages call `subscription_lib` hooks
  (`usePackagesByDuration`, `useAllOfferings`, `useOfferingPackages`, `useUserSubscription`,
  `useBackendSubscription`, `useIsUserSubscribable`) and render `@sudobility/components/subscription`
  primitives (`SubscriptionLayout`, `SubscriptionTile`, `SegmentedControl`).
- **Purchase flow**: `getSubscriptionInstance().purchase(...)` then `refreshSubscription()`
  (both from the `subscription_lib` singleton).
- **CTA logic** keys off `useIsUserSubscribable()` (NOT an `isLoggedIn` prop — there is none)
  plus subscription state: not subscribable → "Try it for Free"/"Log in to Continue" →
  `onNavigateToLogin`; subscribable, no sub → Free is current, paid tiles "Subscribe";
  has sub → current plan marked, others go to the management URL.
- **Cross-platform**: when `networkClient`+`baseUrl`+`token`+`userId` are all set and the
  backend subscription's `platform` ≠ `currentPlatform` (default `Web`), render
  `CrossPlatformSubscriptionInfo` instead of purchase UI.
- **Localization**: optional `t(key, fallback)` prop; all user strings go through a local
  `loc()` that falls back to the literal.

## Gotchas

- **`type-check` is hyphenated** — `bun run typecheck` silently does nothing.
- **`bun test` ≠ the test suite** — no `test` script exists, so `bun test` runs Bun's native
  runner. Use `bun run test:unit` (Vitest).
- **UI/types package is `@sudobility/components`**, not `@sudobility/subscription-components`
  (an old name). Subscription primitives live under `@sudobility/components/subscription`.
- **Build is ESM-only and 3 steps**: `tsc && vite build && node scripts/fix-esm-imports.mjs`.
  The last step rewrites extensionless relative imports in `dist/` to explicit `.js`/`index.js`
  so Node's ESM loader can resolve them.
- **Context identity**: the Vite build externalizes `@sudobility/*`, `react*`, `@revenuecat/*`
  so the host app's AuthProvider/SubscriptionProvider instance is the one read here — do not
  bundle them.
- **`SubscriptionProviderWrapper` is intentionally not exported**; `LazySubscriptionProvider`
  lazy-imports it to keep the ~600KB RevenueCat SDK in its own chunk.
- **`useOfferingPackages` is always called** (hooks can't be conditional) with a fallback
  `offerId` when the Free segment is selected.

## Pre-Commit Checklist

```bash
bun run type-check && bun run lint && bun run test:unit && bun run build
```
