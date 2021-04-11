import BigNumber from 'bignumber.js';
import _ from 'lodash';

export const toDecimal = (wei: any, decimals: number) =>
  new BigNumber(wei).dividedBy(new BigNumber(`1e${decimals}`));

  export const formatNumber = (
    input: number,
    options?: Intl.NumberFormatOptions
  ) => {
    return Number(input).toLocaleString(
      undefined,
      _.merge(
        {},
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
        options
      )
    );
  };
  
  export const isValidAddress = (address: string) =>
    /^0x[a-fA-F0-9]{40}$/g.test(address);
  
  export const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;