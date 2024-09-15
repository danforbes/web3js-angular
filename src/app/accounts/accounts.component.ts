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
  constructor(private service: AccountsService) {
    this.accounts = this.service.accounts;
    this.selectedAccount = this.service.selectedAccount;
  }
}
