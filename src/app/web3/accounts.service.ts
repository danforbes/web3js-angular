import {
  computed,
  Injectable,
  type OnDestroy,
  type Signal,
  signal,
  type WritableSignal,
} from '@angular/core';
import { Web3Service } from './web3.service';
import {
  Address,
  type DataFormat,
  type TransactionReceipt,
  type Web3PromiEvent,
  type ProviderAccounts,
  type Web3,
} from 'web3';
import { SendTransactionEvents } from 'web3-eth';

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

  transfer(from: Address, to: Address, value: bigint): Signal<string> {
    const status: WritableSignal<string> = signal(
      `Preparing to send ${value} wei to ${to}`,
    );
    const transferEvent: Web3PromiEvent<
      TransactionReceipt,
      SendTransactionEvents<DataFormat>
    > = this.web3Service.web3.eth
      .sendTransaction({
        from,
        to,
        value,
      })
      .on('sent', () => {
        status.set(`Sending ${value} wei to ${to}`);
      })
      .on('transactionHash', (data) => {
        status.set(`Sending ${value} wei to ${to} [Hash: ${data}]`);
      })
      .on('receipt', (data) => {
        status.set(
          `${value} wei sent to ${to} [Hash: ${data.transactionHash} Block #: ${data.blockNumber}]`,
        );
      })
      .on('confirmation', (data) => {
        const numConfirmations: bigint = data.confirmations;
        const receipt = data.receipt;
        status.set(
          `${value} wei sent to ${to} [Hash: ${receipt.transactionHash} Block #: ${receipt.blockNumber} Confirmations: ${numConfirmations}]`,
        );
        if (numConfirmations > 5) {
          transferEvent.removeAllListeners();
        }
      })
      .on('error', (data) => {
        status.set(`Error sending ${value} wei to ${to}: ${data}`);
        transferEvent.removeAllListeners();
      });

    return status;
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
