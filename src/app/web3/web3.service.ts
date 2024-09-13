import { Injectable, signal, Signal, WritableSignal } from '@angular/core';

import { EIP1193Provider, ProviderRpcError, Web3, Web3APISpec } from 'web3';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: Web3 | undefined;

  private _connected: WritableSignal<boolean> = signal(false);
  connected: Signal<boolean> = this._connected.asReadonly();

  constructor() {
    if (!window.ethereum) {
      console.error("No injected Web3 providers.");
      return;
    }

    this.web3 = new Web3(window.ethereum);
    window.ethereum.on("disconnect", (error: ProviderRpcError) => {
      console.error(`Web3 provider disconnected: ${error}`);
      this.web3 = undefined;
      this._connected.set(false);
    });

    this._connected.set(true);
  }

  get blockNumber(): Signal<bigint> {
    const blockNumber = signal(0n);
    if (!this.web3) {
      console.error("Not connected to Web3.");
      return blockNumber;
    }

    const utils = this.web3.utils;
    this.web3.eth.subscribe("newBlockHeaders").then((subscription) => {
      subscription.on("data", (data) => {
        blockNumber.set(utils.toBigInt(data.number));
      })
    });

    return blockNumber;
  }

  get accounts(): Signal<string[]> {
    const accounts = signal(new Array<string>);
    if (!this.web3) {
      console.error("Not connected to Web3.");
      return accounts;
    }

    this.web3.eth.requestAccounts().then(accounts.set);
    window.ethereum.on("accountsChanged", (accounts.set));
    return accounts;
  }
}

declare global {
  interface Window {
    ethereum: EIP1193Provider<Web3APISpec>;
  }
}
