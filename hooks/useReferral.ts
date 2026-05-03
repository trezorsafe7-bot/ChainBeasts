import { REFERRAL_CONTRACT_ADDRESS } from '../helpers/linea';
import REFERRAL_CONTRACT_SOL from '../helpers/abi/Referral.json';
import { lineaNetwork } from '../helpers/linea';
import useLinea from './useLinea';
import { type UserType } from './useAuth';

export const useReferral = () => {
  const { publicClient, walletClient } = useLinea();

  const getConductorAddress = async (token: string, code: string) => {
    const res = await fetch(`/battlemon-api/referrals?referralCode=${code}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return (await res.json()) as { address: string };
  };

  const createReferralCode = async (token: string, code: string) => {
    const res = await fetch(`/battlemon-api/users/me`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode: code,
      }),
    });
    return (await res.json()) as UserType;
  };

  const addReferral = async (conductorAddress: string) => {
    try {
      const { request } = await publicClient.simulateContract({
        address: REFERRAL_CONTRACT_ADDRESS,
        abi: REFERRAL_CONTRACT_SOL.abi,
        chain: lineaNetwork,
        functionName: 'addReferral',
        args: [conductorAddress],
      });
      const hash = await walletClient?.writeContract(request);
    } catch (e) {
      const { message } = e as Error;
      // console.log(message);
    }
  };

  const isReferral = async (userAddress: string) => {
    return (await publicClient.readContract({
      address: REFERRAL_CONTRACT_ADDRESS,
      abi: REFERRAL_CONTRACT_SOL.abi,
      functionName: 'isReferral',
      args: [userAddress],
    })) as boolean;
  };

  return {
    addReferral,
    getConductorAddress,
    createReferralCode,
    isReferral,
  };
};
