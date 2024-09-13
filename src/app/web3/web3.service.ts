import { Injectable, signal, Signal, WritableSignal } from '@angular/core';

import { EIP1193Provider, ProviderRpcError, Web3, Web3APISpec } from 'web3';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: Web3 | undefined;

  private _connected: WritableSignal<boolean> = signal(false);
  connected: Signal<boolean> = this._connected.asReadonly();

  private _chainId: WritableSignal<bigint> = signal(0n);
  chainId: Signal<bigint> = this._chainId.asReadonly();

  constructor() {
    if (!window.ethereum) {
      console.error("No injected Web3 providers.");
      return;
    }

    this.web3 = new Web3(window.ethereum);
    const utils = this.web3.utils;

    window.ethereum.on("disconnect", (error: ProviderRpcError) => {
      console.error(`Web3 provider disconnected: ${error}`);
      this.web3 = undefined;
      this._connected.set(false);
      this._chainId.set(0n);
    });
    this._connected.set(true);

    window.ethereum.on("chainChanged", (chainId: string) => {
      this._chainId.set(utils.toBigInt(chainId));
    });
    this.web3.eth.getChainId().then(this._chainId.set);
  }

  get blockNumber(): Signal<bigint> {
    const blockNumber = signal(0n);
    if (!this.web3) {
      console.error("Not connected to Web3.");
      return blockNumber;
    }

    const eth = this.web3.eth;
    const utils = this.web3.utils;

    eth.getBlockNumber().then(blockNumber.set);

    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        eth.getBlockNumber().then(blockNumber.set);
      });
    }

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

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accounts.set);
    }

    this.web3.eth.requestAccounts().then(accounts.set);
    return accounts;
  }
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider<Web3APISpec>;
  }
}
