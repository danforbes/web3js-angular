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
import { type Address } from 'web3';
import { AccountsService } from '../../web3/accounts.service';
import { Web3Service } from '../../web3/web3.service';
import { type NewHeadsSubscription } from 'web3-eth';
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

  transferForm: FormGroup = new FormGroup({
    to: new FormControl<Address | undefined>(undefined, [
      AccountDetailComponent.addressValidator,
      Validators.required,
    ]),
    amount: new FormControl<bigint | undefined>(undefined, Validators.required),
  });

  private newBlockSubscription: NewHeadsSubscription | undefined;

  constructor(
    private accountsService: AccountsService,
    web3Service: Web3Service,
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

  transfer(): void {
    const to: Address = this.transferForm.controls['to'].value;
    const value: bigint = this.transferForm.controls['amount'].value;
    const status: Signal<string> = this.accountsService.transfer(
      this.address(),
      to,
      value,
    );
    this.transactions.push(status);
    this.transferForm.reset();
  }

  ngOnDestroy(): void {
    if (this.newBlockSubscription) {
      this.newBlockSubscription.unsubscribe();
    }
  }
}
