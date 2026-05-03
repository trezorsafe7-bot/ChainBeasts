import useLinea from './useLinea';
import { useWaitForTransaction } from 'wagmi';
import { lineaNetwork } from '../helpers/linea';
import { PICK_AXE_CONTRACT_ADDRESS } from '../helpers/linea';
import PICK_AXE_CONTRACT_SOL from '../helpers/abi/PickAxe.json';
import { parseEther } from 'viem';
import { useEffect, useState } from 'react';

const usePickAxe = () => {
  const [reset, setReset] = useState<boolean>(false);
  const { address, publicClient, walletClient } = useLinea();
  const [mintPickAxeHash, setMintPickAxeHash] = useState<`0x${string}`>();
  const [supplies, setSupply] = useState<{ [key: number]: string }>({});

  const { isSuccess: successMintPickAxe } = useWaitForTransaction({
    hash: mintPickAxeHash,
  });

  useEffect(() => {
    if (!address) return;
    getSupply(0);
    getSupply(1);
    getSupply(2);
  }, [address, successMintPickAxe]);

  if (!address || !walletClient) {
    return {};
  }

  const getSupply = async (rank: number) => {
    try {
      const supply = (await publicClient.readContract({
        address: PICK_AXE_CONTRACT_ADDRESS,
        abi: PICK_AXE_CONTRACT_SOL.abi,
        functionName: 'supplyOf',
        args: [rank],
      })) as number;
      setSupply((supplies) => ({ ...supplies, [rank]: supply.toString() }));
    } catch (e) {
      const { message } = e as Error;
      // console.log(message);
    }
  };

  const mintPickAxe = async (rank: number, amount: number) => {
    try {
      const { request } = await publicClient.simulateContract({
        address: PICK_AXE_CONTRACT_ADDRESS,
        abi: PICK_AXE_CONTRACT_SOL.abi,
        chain: lineaNetwork,
        functionName: 'mint',
        args: [address, rank],
        value: parseEther(amount.toString()),
      });
      const hash = await walletClient?.writeContract(request);
      if (hash) setMintPickAxeHash(hash);
    } catch (e) {
      const { message } = e as Error;
      // console.log(message);
      setReset(true);
      setTimeout(() => {
        setReset(false);
      });
    }
  };

  return { mintPickAxe, successMintPickAxe, supplies, reset };
};

export default usePickAxe;
