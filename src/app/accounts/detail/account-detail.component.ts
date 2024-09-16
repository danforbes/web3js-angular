import {
  Component,
  effect,
  input,
  type InputSignal,
  OnDestroy,
  type Signal,
  signal,
  type WritableSignal,
} from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  type DataFormat,
  type TransactionReceipt,
  Web3PromiEvent,
  type Address,
} from 'web3';
import { AccountsService } from '../../web3/accounts.service';
import { Web3Service } from '../../web3/web3.service';
import { SendTransactionEvents, type NewHeadsSubscription } from 'web3-eth';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css',
})
export class AccountDetailComponent implements OnDestroy {
  static addressValidator(address: AbstractControl): ValidationErrors | null {
    return AccountsService.isValidAddress(address.value)
      ? null
      : { invalidAddress: address };
  }

  address: InputSignal<string> = input.required<Address>();

  balance: WritableSignal<bigint> = signal(0n);
  transactions: Signal<string>[] = [];

  private newBlockSubscription: NewHeadsSubscription | undefined;

  transferForm: FormGroup = new FormGroup({
    to: new FormControl<Address | undefined>(undefined, [
      AccountDetailComponent.addressValidator,
      Validators.required,
    ]),
    amount: new FormControl<bigint | undefined>(undefined, Validators.required),
  });

  constructor(
    private accountsService: AccountsService,
    private web3Service: Web3Service,
  ) {
    effect(() => {
      accountsService.getBalance(this.address()).then(this.balance.set);
    });

    web3Service.web3.eth
      .subscribe('newBlockHeaders')
      .then((subscription: NewHeadsSubscription) => {
        this.newBlockSubscription = subscription;
        subscription.on('data', () => {
          accountsService.getBalance(this.address()).then(this.balance.set);
        });
      });
  }

  transfer() {
    const to: Address = this.transferForm.controls['to'].value;
    const value: bigint = this.transferForm.controls['amount'].value;
    this.transferForm.reset();
    const status: WritableSignal<string> = signal(
      `Preparing to send ${value} wei to ${to}`,
    );
    this.transactions.push(status);
    const transferEvent: Web3PromiEvent<
      TransactionReceipt,
      SendTransactionEvents<DataFormat>
    > = this.web3Service.web3.eth
      .sendTransaction({
        from: this.address(),
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
  }

  ngOnDestroy(): void {
    if (this.newBlockSubscription) {
      this.newBlockSubscription.unsubscribe();
    }
  }
}
