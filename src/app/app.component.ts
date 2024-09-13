import { Component, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Web3Service } from './web3/web3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private web3: Web3Service;

  connected: Signal<boolean>;
  chainId: Signal<bigint>;
  blockNumber: Signal<bigint>;

  constructor(web3Service: Web3Service) {
    this.web3 = web3Service;
    this.connected = this.web3.connected;
    this.chainId = this.web3.chainId;
    this.blockNumber = this.web3.blockNumber;
  }
}
