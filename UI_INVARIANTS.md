# Buddy Blind UI invariants

These are product rules. They are not notes about the current layout.

Read this before changing shared UI, responsive behaviour, or navigation.

If a requested change conflicts with an invariant, do not silently override it. Report the conflict first.

Desktop Website, Mobile Website, and the App are not the same product surface. Keep intentional differences unless the request explicitly changes that surface.

## Mobile Website and App navigation

When someone taps to a different main page on the Mobile Website or the App, that page opens at the top.

Main pages: Home, Venues, Quick Meet, Private, Me Time, Profile.

This applies only to that navigation. Do not scroll to the top on every render or on same-page updates such as popups, filters, editing, saving, or joining while staying on the page.

Do not apply this rule to the Desktop Website unless a request says so.

The visible scroll is the shared app panel, not the browser window. Both the Mobile Website and the App must go through `navigateAppPage` in `lib/appScroll.js`. Do not reimplement this inside individual pages.

`npm test` (`lib/appScroll.test.mjs`) guards this. A change that removes the shared reset should fail that test.

## Responsive information parity

The same venue or event must keep the same meaningful information on the Desktop Website, the Mobile Website, and the App.

A narrower layout may rearrange, wrap, compact, or resize that information. It must not drop it because the screen is smaller.

Meaningful information includes, where that venue or event has it: place and time, seats left, cuisine, address, hours, price tier, pet friendly, interests, orientation, age range, and who opened or joined the table.

Prefer one data source so the three surfaces cannot drift.

## App and Mobile Website typography

App and Mobile Website main-page headings share one hierarchy. The shared heading token is `APP_HEAD` in `components/StoreApp.js`.

On How it works, the 01–10 captions stay smaller than that main heading and larger than body text.

Changing one heading, caption, font size, or spacing value must not change unrelated shared type. Do not retune the Desktop Website heading system while changing App or Mobile type, and do not retune App or Mobile type while changing the Desktop Website.

## Scoped visual changes

For font size, icon size, card size, spacing, margin, padding, alignment, or responsive layout: change only the requested scope.

If a shared style or component has to change, check its other uses and keep their current look and behaviour unless the request includes them.

## When a test is worth adding

Protect an invariant with a regression test when the test can fail because the behaviour was removed, without locking pixels, copy, or spacing.

Do not add brittle screenshot or pixel tests for ordinary cosmetic tweaks.

The navigation rule above already has that test. Information parity and typography are guarded by this document and by keeping one shared data source and one shared heading token, not by pixel comparison.
