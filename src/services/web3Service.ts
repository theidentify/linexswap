import Web3 from 'web3';

// JSON-RPC Endpoint: Available Resources
// https://docs.binance.org/smart-chain/developer/rpc.html
const BSC_RPC = 'https://bsc-dataseed1.defibit.io/';

export class Web3Service {
  web3: Web3;

  constructor() {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(BSC_RPC, { keepAlive: true }),
    );
  }


  // ABI (Application Binary Interface) = Smart contract on blockchain
  // By the way, I focus on PancakeSwap so, find the contract name masterChef
  // ref: https://bscscan.com/address/0x73feaa1eE314F8c655E354234017bE2193C9E24E#tokentxns
  getContract = (abi: any, address: string) => {
    return new this.web3.eth.Contract(abi, address);
  }
}