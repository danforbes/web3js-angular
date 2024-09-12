import { AsyncPipe } from '@angular/common';
import { Component, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Web3Service } from './web3/web3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'web3js-angular';
  blockNumber: Signal<bigint>;
  accounts: Promise<string[] | undefined>;
  private web3: Web3Service;

  constructor(web3Service: Web3Service) {
    this.web3 = web3Service;
    this.blockNumber = this.web3.blockNumber();
    this.accounts = this.web3.accounts;
  }
}
