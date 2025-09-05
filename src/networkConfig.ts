import { getFullnodeUrl } from '@mysten/sui.js/client';
import { createNetworkConfig } from '@mysten/dapp-kit';
import { COUNTER_PACKAGE_ID } from './constants';

function resolvePackageId(): string {
  try {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('sui_pkg');
      if (stored && stored.startsWith('0x')) return stored;
    }
  } catch {}
  return COUNTER_PACKAGE_ID;
}

const { networkConfig, useNetworkVariable } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl('testnet'),
      variables: {
        counterPackageId: resolvePackageId(),
      },
    },
    mainnet: {
      url: getFullnodeUrl('mainnet'),
      variables: {
        counterPackageId: resolvePackageId(),
      },
    },
  });

export { useNetworkVariable, networkConfig };
