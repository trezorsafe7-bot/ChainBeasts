// import { type ItemType } from './lemonStore';
import ACCESS_KEY_CONTRACT_SOL from './abi/AccessKey.json';
import { lineaTestnet } from 'wagmi/chains';

export const lineaMainnet = {
  id: 59144,
  name: 'Ether Mainnet',
  network: 'linea-mainnet',
  nativeCurrency: {
    name: 'Linea Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.linea.build'],
    },
    public: {
      http: ['https://rpc.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BlockScout',
      url: 'https://explorer.linea.build',
    },
  },
};

const MAINNET = {
  ACCESS_KEY: '0xd622Dc376B30E5657e15E2Be1355F080Ca3A19F2' as `0x${string}`,
  REFERRAL: '0x6e58359d2F3Fd0f870cC187246a52848dc7AFCE8' as `0x${string}`,
  GEMS: '0x6bF309Ad2b7c0eBE44e69a53Bb2cCED79f17FC66' as `0x${string}`,
  PICK_AXE: '0x35D42D4BdC36CfE33A5ea6672A1B81752A963d6d' as `0x${string}`,
};

const TESTNET = {
  ACCESS_KEY: '0x81DEE4AE98De076aa97b20a1F0c932b7D0F9Ff94' as `0x${string}`,
  REFERRAL: '0xF05e54f4e2716448b7579573d72B7e6D8A9c84a2' as `0x${string}`,
  GEMS: '0x027e682024A0A4Bdac25b1098bCa0D30bef4Bb8E' as `0x${string}`,
  PICK_AXE: '0x05B70A9DC808293fe9c98A5977250Ac2E965d72a' as `0x${string}`,
};

export const ACCESS_KEY_CONTRACT_ADDRESS: `0x${string}` =
  process.env.NEXT_PUBLIC_PRODUCTION == 'true'
    ? MAINNET.ACCESS_KEY
    : TESTNET.ACCESS_KEY;
export const GEMS_CONTRACT_ADDRESS: `0x${string}` =
  process.env.NEXT_PUBLIC_PRODUCTION == 'true' ? MAINNET.GEMS : TESTNET.GEMS;
export const REFERRAL_CONTRACT_ADDRESS: `0x${string}` =
  process.env.NEXT_PUBLIC_PRODUCTION == 'true'
    ? MAINNET.REFERRAL
    : TESTNET.REFERRAL;
export const PICK_AXE_CONTRACT_ADDRESS: `0x${string}` =
  process.env.NEXT_PUBLIC_PRODUCTION == 'true'
    ? MAINNET.PICK_AXE
    : TESTNET.PICK_AXE;

export const lineaNetwork =
  process.env.NEXT_PUBLIC_PRODUCTION == 'true' ? lineaMainnet : lineaTestnet;

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface IProxyMintArgs {
  mintRequest: {
    amount: number;
    nonce: string | number;
    sender: string;
    proxy: string;
  };
  signature: string;
  error?: string;
  message?: string;
}

export const proxyMintAccessKey = (args: IProxyMintArgs | boolean) => {
  if (typeof args !== 'object' || !args.mintRequest || !args.signature) return;
  return {
    address: ACCESS_KEY_CONTRACT_ADDRESS,
    abi: ACCESS_KEY_CONTRACT_SOL.abi,
    functionName: 'proxyMint',
    chainId: 59140,
    args: [
      [
        args.mintRequest.sender,
        args.mintRequest.proxy,
        args.mintRequest.amount,
        args.mintRequest.nonce,
      ],
      args.signature,
    ],
  };
};
