import {
  computed,
  Injectable,
  type OnDestroy,
  type Signal,
  signal,
  type WritableSignal,
} from '@angular/core';
import { Web3Service } from './web3.service';
import { Address, type ProviderAccounts, type Web3 } from 'web3';

@Injectable({
  providedIn: 'root',
})
export class AccountsService implements OnDestroy {
  static isValidAddress(address: Address): boolean {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
  }

  private web3: Web3;

  private _accounts: WritableSignal<string[]> = signal([]);
  accounts: Signal<string[]> = this._accounts.asReadonly();
  private accountsChangedHandler: (accounts: ProviderAccounts) => void =
    this.handleAccountsChanged.bind(this);

  selectedAccount: Signal<string> = computed(() => this.accounts()[0]);

  constructor(private web3Service: Web3Service) {
    if (web3Service.provider === undefined) {
      throw new Error('No Web3 provider.');
    }

    this.web3 = web3Service.web3;
    this.web3.eth.requestAccounts().then(this._accounts.set);
    web3Service.provider.on('accountsChanged', this.accountsChangedHandler);
  }

  getBalance(address: Address): Promise<bigint> {
    if (!AccountsService.isValidAddress(address)) {
      return Promise.resolve(0n);
    }

    return this.web3.eth.getBalance(address);
  }

  ngOnDestroy(): void {
    if (!this.web3Service.provider) {
      return;
    }

    this.web3Service.provider.removeListener(
      'accountsChanged',
      this.accountsChangedHandler,
    );
  }

  private handleAccountsChanged(accounts: ProviderAccounts) {
    this._accounts.set(accounts);
  }
}
