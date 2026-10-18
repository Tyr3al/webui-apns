# Change Log

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Fixed
- Push Devices: per-device action buttons now line up with their device row (one table row per device, the account cell spans them). On narrow screens both Push Devices and My Devices show one card per device instead of a horizontally scrolling table.

## [1.0.11-apns.1] - 2026-10-17

Fork versions follow `<upstream-version>-apns.<N>`, resetting `N` to 1 each time the fork
rebases onto a newer upstream release. Release candidates leading up to a version are tagged
`-rc.<M>` and marked as a GitHub prerelease.

### Changed
- Rebased onto upstream [v1.0.11](https://github.com/stalwartlabs/webui/blob/main/CHANGELOG.md) (from v1.0.8), picking up the server-configurable OAuth client ID (honors the `oauthClientId` setting on `Application` in Stalwart 0.16.19+), Sievepad integration, and the schema-default fix for re-added map entries.

### Added
- XAPS push device management: admin "Push Devices" page listing all accounts' registered iOS devices (per-device delete, per-account remove-all, hidden from accounts without account-read permission), and a "My Devices" self-service page for users to manage their own registrations. Both offer a "Send test push" action and scroll horizontally on narrow screens.
- Refresh the signed-in account's effective permissions after editing a Role or Account object, so newly granted settings pages appear without a manual reload.

## [1.0.11] - 2026-09-15

### Added
- Sievepad integration.

### Changed

### Fixed

## [1.0.10] - 2026-09-04

### Added

### Changed

### Fixed
- Re-added map entries and object list items are seeded with their schema defaults, including a value for every non-nullable boolean.

## [1.0.9] - 2026-08-24

### Added
- Server configurable OAuth client ID.

### Changed

### Fixed

## [1.0.8] - 2026-07-31

### Added
- Remember the last visited page when switching sections (credits @LinkPhoenix).

### Changed
- Enum list filters with many options render as a searchable combobox (credits @LinkPhoenix).
- Object cells display the variant label as a badge instead of the raw type name (credits @LinkPhoenix).
- Empty date pickers open on the current date and time (credits @LinkPhoenix).

### Fixed
- Custom logos no longer flash when navigating between pages.
- Landing no longer flashes "Select a view" before redirecting to the default page.

## [1.0.7] - 2026-07-30

### Added
- `Ctrl+K` / `Cmd+K` command palette for global search (credits @LinkPhoenix).
- Calendar date picker for date and time fields (credits @LinkPhoenix).
- Dynamic document titles per page (credits @LinkPhoenix).

### Changed
- Code-split the admin shell and heavy feature pages to speed up the initial load (credits @LinkPhoenix).
- Center forms horizontally on wide screens (credits @LinkPhoenix).

### Fixed
- Redirect URLs without a view to the first accessible page of their section (credits @LinkPhoenix).
- Sidebar groups auto-open and scroll the active item into view after navigation (credits @LinkPhoenix).
- Keep the sidebar section synced with the URL on full page loads (credits @LinkPhoenix).
- Date and time fields no longer shift values by the UTC offset when editing (credits @LinkPhoenix).
- Clip the table header background inside the rounded card border (credits @LinkPhoenix).
- Keep the selected account across page reloads (#17).
- Refresh open views when switching accounts (#17).
- Custom logos no longer flash the default logo while loading.

## [1.0.6] - 2026-07-28

### Added
- WebUI version is now displayed when hovering over the logo.

### Changed

### Fixed
- Properly serialize `date` filters when applying them to the list filter.

## [1.0.5] - 2026-06-21

### Added

### Changed

### Fixed
- Redirect to `/login` when there is no refresh token.
- Include required JMAP capabilities in `using`.
- Default scopes omit `offline_access`.

## [1.0.4] - 2026-05-11

### Added

### Changed

### Fixed
- Align `base32` alphabet with the server.

## [1.0.3] - 2026-05-05

### Added

### Changed

### Fixed
- Broken "Delivery History" link on OSS/Community editions.
- Resolve object ids in map keys.

## [1.0.2] - 2026-04-30

### Added
- OIDC:
    - Include `email` and `profile` scopes in OIDC authentication requests.
- TOTP:
    - Add "Copy Secret" button to TOTP setup flow.

### Changed

### Fixed
- Display validation errors returned by the server.

## [1.0.1] - 2026-04-25

### Added
- OIDC:
    - Logout users from IdP when logging out of the app.
    - Include `openid` scope in OIDC authentication requests.

### Changed

### Fixed
- Mobile display issues.
- Editing a secret clears its masked value.
- Array label properties crashes app.

## [1.0.0] - 2026-04-20

### Added
- Initial release.

### Changed

### Fixed
