import useLinea from './useLinea';
import { useWaitForTransaction } from 'wagmi';
import { lineaNetwork } from '../helpers/linea';
import PICK_AXE_CONTRACT_SOL from '../helpers/abi/PickAxe.json';
import GEMS_CONTRACT_SOL from '../helpers/abi/Gem.json';
import {
  PICK_AXE_CONTRACT_ADDRESS,
  GEMS_CONTRACT_ADDRESS,
  timeout,
} from '../helpers/linea';
import { parseEther } from 'viem';
import { useState } from 'react';
import { StaticImageData } from 'next/image';
import { create } from 'zustand';

export interface INft {
  id: string;
  image: StaticImageData;
  tokenId: string;
  rank: number;
}

import Pick1 from '../public/resources/assets/256/IcePick-2.png';
import Pick2 from '../public/resources/assets/256/IcePick-3.png';
import Pick3 from '../public/resources/assets/256/IcePick-1.png';

const pickAxeImages: Record<number, StaticImageData> = {
  0: Pick1,
  1: Pick2,
  2: Pick3,
};

const useMining = () => {
  const { address, publicClient, walletClient } = useLinea();
  const [reset, setReset] = useState<boolean>(false);
  const [chipOffHashHash, setChipOffHash] = useState<`0x${string}`>();
  const [sharpHash, setSharpHash] = useState<`0x${string}`>();

  const { isSuccess: successChipOff, data: chipOffData } =
    useWaitForTransaction({
      hash: chipOffHashHash,
    });

  const { isSuccess: successSharp } = useWaitForTransaction({
    hash: sharpHash,
  });

  if (!address || !walletClient) {
    return {};
  }

  const chipOff = async (tokenId: string) => {
    // console.log(tokenId);
    try {
      const { request } = await publicClient.simulateContract({
        account: address,
        address: PICK_AXE_CONTRACT_ADDRESS,
        abi: PICK_AXE_CONTRACT_SOL.abi,
        chain: lineaNetwork,
        functionName: 'chipOff',
        gas: 200_000n,
        args: [tokenId],
      });
      const hash = await walletClient?.writeContract(request);
      if (hash) setChipOffHash(hash);
    } catch (e) {
      const { message } = e as Error;
      // console.log(message);
      setReset(true);
      setTimeout(() => {
        setReset(false);
      });
    }
  };

  const sharp = async (pickAxe: INft) => {
    try {
      const { request } = await publicClient.simulateContract({
        account: address,
        address: PICK_AXE_CONTRACT_ADDRESS,
        abi: PICK_AXE_CONTRACT_SOL.abi,
        chain: lineaNetwork,
        functionName: 'sharp',
        args: [pickAxe.tokenId],
        value: parseEther(['0.0001', '0.00022', '0.001'][pickAxe.rank]),
      });
      const hash = await walletClient?.writeContract(request);
      if (hash) setSharpHash(hash);
    } catch (e) {
      const { message } = e as Error;
      // console.log(message);
      setReset(true);
      setTimeout(() => {
        setReset(false);
      });
    }
  };

  const getSharpnessOf = async (tokenId: string): Promise<number> => {
    let sharpness = 100;
    try {
      sharpness = (await publicClient.readContract({
        address: PICK_AXE_CONTRACT_ADDRESS,
        abi: PICK_AXE_CONTRACT_SOL.abi,
        functionName: 'sharpnessOf',
        args: [tokenId],
      })) as number;
    } catch (e) {
      const { message } = e as Error;
      // console.log(message);
      setReset(true);
      setTimeout(() => {
        setReset(false);
      });
    }
    return sharpness;
  };

  const getGemRank = async (tokenId: string): Promise<number> => {
    const metaURI = (await publicClient.readContract({
      address: GEMS_CONTRACT_ADDRESS,
      abi: GEMS_CONTRACT_SOL.abi,
      functionName: 'tokenURI',
      args: [tokenId],
    })) as string;
    const rank = parseInt(metaURI.split('/').at(-1) as string);
    return rank;
  };

  const getPickAxesList = async () => {
    if (!address) return;
    await timeout(2000);
    const data = await fetch(`/api/linea/pickaxes?address=${address}`);
    const {
      result: {
        data: { user },
      },
    } = await data.json();

    const pickaxes = user?.tokens || [];

    pickaxes.map((pickAxe: INft) => {
      pickAxe.image = pickAxeImages[pickAxe.rank];
      return pickAxe;
    });

    return pickaxes;
  };

  return {
    chipOff,
    successChipOff,
    sharp,
    successSharp,
    chipOffData,
    getSharpnessOf,
    getPickAxesList,
    getGemRank,
    reset,
  };
};

interface MiningStoreProp {
  startMining?: (rank: number) => void;
  showPickAxe?: (rank: number) => void;
  startGemAppear?: (rank: number) => void;
  startSharp?: (rank: number) => void;
  stopSharp?: (rank: number) => void;
  startUnsuccess?: () => void;
}

export const useMiningStore = create<MiningStoreProp>((set) => ({}));

export default useMining;
