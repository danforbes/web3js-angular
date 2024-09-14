import {
  Component,
  type OnDestroy,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Web3Service } from './web3/web3.service';
import { AccountsComponent } from './accounts/accounts.component';
import { type ProviderAccounts } from 'web3';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AccountsComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy {
  hasProvider: boolean;
  chainId: Signal<bigint>;
  blockNumber: Signal<bigint>;

  connectedAccounts: WritableSignal<boolean> = signal(false);
  private accountsChangedHandler: (accounts: ProviderAccounts) => void =
    this.handleAccountsChanged.bind(this);

  constructor(private web3: Web3Service) {
    this.hasProvider = this.web3.hasProvider;
    this.chainId = this.web3.chainId;
    this.blockNumber = this.web3.blockNumber;
    this.web3.getAccounts().then((accounts: string[]) => {
      if (accounts.length === 0) {
        return;
      }

      this.connectedAccounts.set(true);
    });

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.accountsChangedHandler);
    }
  }

  async requestAccounts(): Promise<void> {
    try {
      await this.web3.requestAccounts();
    } catch {
      console.error('Failed to request accounts.');
    }
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
    this.connectedAccounts.set(accounts.length !== 0);
  }
}
