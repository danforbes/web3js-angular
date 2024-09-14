import { Component, type Signal } from '@angular/core';
import { AccountsService } from '../web3/accounts.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NgFor],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})
export class AccountsComponent {
  accounts: Signal<string[]>;
  constructor(private service: AccountsService) {
    this.accounts = this.service.accounts;
  }
}
