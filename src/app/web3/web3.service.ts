import { Injectable, OnDestroy, signal, Signal, WritableSignal } from '@angular/core';

import { BlockHeaderOutput, EIP1193Provider, ProviderInfo, ProviderRpcError, Web3, Web3APISpec } from 'web3';
import { NewHeadsSubscription } from 'web3-eth';

@Injectable({
  providedIn: 'root',
})
export class Web3Service implements OnDestroy {
  private web3: Web3 = new Web3();
  utils = this.web3.utils;

  private _connected: WritableSignal<boolean> = signal(false);
  connected: Signal<boolean> = this._connected.asReadonly();

  private _chainId: WritableSignal<bigint> = signal(0n);
  chainId: Signal<bigint> = this._chainId.asReadonly();

  private _blockNumber: WritableSignal<bigint> = signal(0n);
  blockNumber: Signal<bigint> = this._blockNumber.asReadonly();
  private blockNumberSubscription: NewHeadsSubscription | undefined;

  constructor() {
    if (!window.ethereum) {
      return;
    }

    this.web3.setProvider(window.ethereum);
    this._connected.set(true);
    this.web3.eth.getChainId().then(this._chainId.set);
    this.web3.eth.getBlockNumber().then(this._blockNumber.set);

    this.web3.eth.subscribe('newBlockHeaders').then((subscription: NewHeadsSubscription) => {
      this.blockNumberSubscription = subscription;
      subscription.on('data', (data: BlockHeaderOutput) => {
        this._blockNumber.set(this.web3.utils.toBigInt(data.number));
      });
    });

    window.ethereum.on('disconnect', this.handleDisconnect);
    window.ethereum.on("connect", this.handleConnect);
    window.ethereum.on('chainChanged', this.handleChainChanged);
  }

  ngOnDestroy(): void {
    if (this.blockNumberSubscription) {
      this.blockNumberSubscription.unsubscribe();
    }

    if (window.ethereum) {
      window.ethereum.removeListener('disconnect', this.handleDisconnect);
      window.ethereum.removeListener("connect", this.handleConnect);
      window.ethereum.removeListener("connect", this.handleConnect);
    }
  }

  private handleDisconnect(error: ProviderRpcError): void {
    console.error(`Web3 provider disconnected: ${error}`);
    this.web3.setProvider(undefined);
    this._connected.set(false);
    this._chainId.set(0n);
    this._blockNumber.set(0n);
  }

  private async handleConnect(info: ProviderInfo): Promise<void> {
    this.web3.setProvider(window.ethereum);
    this._connected.set(true);
    this._chainId.set(this.utils.toBigInt(info.chainId));
    this._blockNumber.set(await this.web3.eth.getBlockNumber());
  }

  private async handleChainChanged(chainId: string) {
    this._chainId.set(this.web3.utils.toBigInt(chainId));
    this._blockNumber.set(await this.web3.eth.getBlockNumber());
  }
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider<Web3APISpec>;
  }
}
