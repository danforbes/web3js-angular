import {
  Component,
  effect,
  input,
  type InputSignal,
  OnDestroy,
  signal,
  type WritableSignal,
} from '@angular/core';
import { type Address } from 'web3';
import { AccountsService } from '../../web3/accounts.service';
import { Web3Service } from '../../web3/web3.service';
import { NewHeadsSubscription } from 'web3-eth';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css',
})
export class AccountDetailComponent implements OnDestroy {
  address: InputSignal<string> = input.required<Address>();

  balance: WritableSignal<bigint> = signal(0n);

  private newBlockSubscription: NewHeadsSubscription | undefined;

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

  ngOnDestroy(): void {
    if (this.newBlockSubscription) {
      this.newBlockSubscription.unsubscribe();
    }
  }
}
