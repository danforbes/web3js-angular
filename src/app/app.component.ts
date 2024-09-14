import { Component, type Signal } from '@angular/core';
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
  hasProvider: boolean;
  chainId: Signal<bigint>;
  blockNumber: Signal<bigint>;

  constructor(private web3: Web3Service) {
    this.hasProvider = this.web3.hasProvider;
    this.chainId = this.web3.chainId;
    this.blockNumber = this.web3.blockNumber;
  }
}
