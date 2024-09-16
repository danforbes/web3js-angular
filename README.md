# Web3.js + Angular Sample

This is a sample project that demonstrates using [Web3.js](https://web3js.org/) with the
[Angular](https://angular.dev/) front-end framework.

- [Web3.js Docs](https://docs.web3js.org/)
- [Angular Docs](https://angular.dev/overview)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version
18.2.3.

## Project Design

This sample project comprises two [injectable services](https://angular.dev/guide/di) and three
[components](https://angular.dev/essentials/components). To demonstrate best practices the services
and components that register event-handlers implement the
[Angular `OnDestroy` interface](https://angular.dev/api/core/OnDestroy#) and use the `ngOnDestroy`
function to clean up the event-handlers they register.

### Web3 Service

The Web3 service is a [singleton service](https://angular.dev/guide/ngmodules/singleton-services#)
that is defined in [./src/app/web3/web3.service.ts](./src/app/web3/web3.service.ts). It can be
consumed by components and other services that depend on Web3.js capabilities.

The Web3 service exposes an instance of the Web3.js
[`Web3` class](https://docs.web3js.org/api/web3/class/Web3) as well as a `provider` property that
exposes the [injected](https://docs.web3js.org/guides/web3_providers_guide/#injected-provider)
[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) provider. This service is designed to function
without a provider, which preserves access to the offline capabilities of Web3.js (e.g. the Web3.js
[`utils` package](https://docs.web3js.org/libdocs/Utils)). The Web3 service listens for
[EIP-1193 `chainChanged` events](https://docs.metamask.io/wallet/reference/provider-api/#chainchanged)
and handles them by reloading the page. For demonstration purposes, the Web3 service defines two
[signals](https://angular.dev/guide/signals): a chain ID signal and a block number signal.

### Accounts Service

The accounts service is defined in
[./src/app/web3/accounts.service.ts](./src/app/web3/accounts.service.ts) and demonstrates using the
Web3 service to provide account-related capabilities. Unlike the Web3 service, the accounts service
will not function without an injected provider. The accounts service exposes two signals: a list of
all of the available accounts and the selected account. This service exposes a static function for
validating addresses and methods for getting the balance of an account and transferring ETH from one
account to another.

### App Component

The app component uses the Web3 service to check if an injected provider is present. If no provider
is present, the app component displays a list of browser extension wallets. If a provider is
present, the app component displays the chain ID and current block number. If account access has not
been granted, the app component displays a button that can be used to request account access. If
account access has been granted, the app component displays information about the available
accounts.

### Accounts Component

The accounts component lists the selected account and the other available accounts. An account
details component is provided for each account.

### Account Details Component

The account details component displays the balance of an account as well as a form for transferring
ETH from that account to another account.
