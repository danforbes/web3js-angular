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
import { type ProviderAccounts, type Web3 } from 'web3';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AccountsComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy {
  private web3: Web3;

  hasProvider: boolean;
  chainId: Signal<bigint>;
  blockNumber: Signal<bigint>;

  hasAccounts: WritableSignal<boolean> = signal(false);
  private accountsChangedHandler: (accounts: ProviderAccounts) => void =
    this.handleAccountsChanged.bind(this);

  constructor(private web3Service: Web3Service) {
    this.web3 = web3Service.web3;
    this.chainId = web3Service.chainId;
    this.blockNumber = web3Service.blockNumber;
    if (!web3Service.provider) {
      this.hasProvider = false;
      return;
    }

    this.hasProvider = true;
    this.web3.eth.getAccounts().then((accounts: string[]) => {
      this.hasAccounts.set(accounts.length !== 0);
    });

    web3Service.provider.on('accountsChanged', this.accountsChangedHandler);
  }

  async requestAccounts(): Promise<void> {
    try {
      await this.web3.eth.requestAccounts();
    } catch {
      console.error('Failed to request accounts.');
    }
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
    this.hasAccounts.set(accounts.length !== 0);
  }
}
