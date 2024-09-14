import {
  computed,
  Injectable,
  type OnDestroy,
  type Signal,
  signal,
  type WritableSignal,
} from '@angular/core';
import { Web3Service } from './web3.service';
import { ProviderAccounts } from 'web3';

@Injectable({
  providedIn: 'root',
})
export class AccountsService implements OnDestroy {
  private _accounts: WritableSignal<string[]> = signal([]);
  accounts: Signal<string[]> = this._accounts.asReadonly();
  selectedAccount: Signal<string> = computed(() => this.accounts()[0]);

  private accountsChangedHandler: (accounts: ProviderAccounts) => void =
    this.handleAccountsChanged.bind(this);

  constructor(private web3: Web3Service) {
    if (!window.ethereum) {
      throw new Error('No Web3 provider.');
    }

    this.web3.requestAccounts().then(this._accounts.set);
    window.ethereum.on('accountsChanged', this.accountsChangedHandler);
  }

  ngOnDestroy(): void {
    if (!window.ethereum) {
      return;
    }

    window.ethereum.removeListener(
      'accountsChanged',
      this.accountsChangedHandler,
    );
  }

  private handleAccountsChanged(accounts: ProviderAccounts) {
    this._accounts.set(accounts);
  }
}
