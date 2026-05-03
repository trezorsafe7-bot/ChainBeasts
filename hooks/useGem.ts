import useLinea from './useLinea';
import { useWaitForTransaction } from 'wagmi';
import { lineaNetwork } from '../helpers/linea';
import GEMS_CONTRACT_SOL from '../helpers/abi/Gem.json';
import { GEMS_CONTRACT_ADDRESS, timeout } from '../helpers/linea';
import { parseEther } from 'viem';
import { useState } from 'react';

export interface INft {
  id: string;
  image: string;
  tokenId: string;
  rank: number;
}

const useGem = () => {
  const [reset, setReset] = useState<boolean>(false);
  const { address, publicClient, walletClient } = useLinea();
  const [mintMergeGemHash, setMergeGemHash] = useState<`0x${string}`>();

  const { isSuccess: successMergeGem } = useWaitForTransaction({
    hash: mintMergeGemHash,
  });

  if (!address || !walletClient) {
    return {};
  }

  const getRanks = async (gems: string[]) => {
    const promises = gems.map(async (gem: string) => {
      const metaURI = (await publicClient.readContract({
        address: GEMS_CONTRACT_ADDRESS,
        abi: GEMS_CONTRACT_SOL.abi,
        functionName: 'tokenURI',
        args: [gem],
      })) as string;
      const rank = parseInt(metaURI.split('/').at(-1) as string);
      return rank;
    });
  
    return await Promise.all(promises);
  }

  const mergeGem = async (gem1: string, gem2: string, price: number) => {
    try {
      const { request } = await publicClient.simulateContract({
        account: address,
        address: GEMS_CONTRACT_ADDRESS,
        abi: GEMS_CONTRACT_SOL.abi,
        chain: lineaNetwork,
        functionName: 'merge',
        gas: 200_000n,
        args: [gem1, gem2],
        value: parseEther(price.toString()),
      });
      const hash = await walletClient?.writeContract(request);
      if (hash) setMergeGemHash(hash);
    } catch (e) {
      const { message } = e as Error;
      // console.log(message);
      setReset(true);
      setTimeout(() => {
        setReset(false);
      });
    }
  };

  const getGemList = async () => {
    if (!address) return;
    await timeout(2000);
    const data = await fetch(`/api/linea/gems?address=${address}`);

    const {
      result: {
        data: { user },
      },
    } = await data.json();

    const gems = user?.tokens || [];

    gems.map((gem: INft) => {
      gem.image = gem.rank + '.png';
      return gem;
    });

    return gems;
  };

  return {
    mergeGem,
    successMergeGem,
    getGemList,
    getRanks,
    reset,
  };
};

export default useGem;
