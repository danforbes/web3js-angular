import {
  Injectable,
  type OnDestroy,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';

import {
  type BlockHeaderOutput,
  type EIP1193Provider,
  Web3,
  type Web3APISpec,
} from 'web3';
import { type NewHeadsSubscription } from 'web3-eth';

@Injectable({
  providedIn: 'root',
})
export class Web3Service implements OnDestroy {
  web3: Web3 = new Web3();
  provider: EIP1193Provider<Web3APISpec> | undefined;

  private _chainId: WritableSignal<bigint> = signal(0n);
  chainId: Signal<bigint> = this._chainId.asReadonly();

  private _blockNumber: WritableSignal<bigint> = signal(0n);
  blockNumber: Signal<bigint> = this._blockNumber.asReadonly();
  private blockNumberSubscription: NewHeadsSubscription | undefined;

  constructor() {
    if (!window.ethereum) {
      return;
    }

    this.provider = window.ethereum;
    this.web3.setProvider(this.provider);
    this.web3.eth.getChainId().then(this._chainId.set);
    this.web3.eth.getBlockNumber().then(this._blockNumber.set);

    this.web3.eth
      .subscribe('newBlockHeaders')
      .then((subscription: NewHeadsSubscription) => {
        this.blockNumberSubscription = subscription;
        subscription.on('data', (data: BlockHeaderOutput) => {
          this._blockNumber.set(this.web3.utils.toBigInt(data.number));
        });
      });

    this.provider.on('chainChanged', this.handleChainChanged);
  }

  ngOnDestroy(): void {
    if (this.blockNumberSubscription) {
      this.blockNumberSubscription.unsubscribe();
    }

    if (this.provider) {
      this.provider.removeListener('chainChanged', this.handleChainChanged);
    }
  }

  private async handleChainChanged() {
    window.location.reload();
  }
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider<Web3APISpec>;
  }
}
