import { Injectable, signal, Signal } from '@angular/core';

import { SupportedProviders, Web3 } from 'web3';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: Web3 | undefined;
  private _accounts: string[] | undefined;

  constructor() {
    if (!window.ethereum) {
      console.error("MetaMask is not installed.");
      return;
    }

    this.web3 = new Web3(window.ethereum);
  }

  get accounts(): Promise<string[] | undefined> {
    if (this._accounts) {
      return Promise.resolve(this._accounts);
    }

    if (this.web3) {
      return this.web3.eth.requestAccounts();
    }

    return Promise.resolve(undefined);
  }

  blockNumber(): Signal<bigint> {
    const blockNumber = signal(0n);
    if (this.web3) {
      const utils = this.web3.utils;
      this.web3.eth.subscribe("newBlockHeaders").then((subscription) => {
        subscription.on("data", (data) => {
          blockNumber.set(utils.toBigInt(data.number));
        })
      });
    }
    return blockNumber;
  }
}

declare global {
  interface Window {
    ethereum: SupportedProviders;
  }
}
