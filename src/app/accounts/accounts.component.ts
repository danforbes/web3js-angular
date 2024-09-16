import { Component, type Signal } from '@angular/core';
import { AccountsService } from '../web3/accounts.service';
import { NgFor, SlicePipe } from '@angular/common';
import { AccountDetailComponent } from './detail/account-detail.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NgFor, SlicePipe, AccountDetailComponent],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})
export class AccountsComponent {
  accounts: Signal<string[]>;
  selectedAccount: Signal<string>;
  constructor(service: AccountsService) {
    this.accounts = service.accounts;
    this.selectedAccount = service.selectedAccount;
  }
}
