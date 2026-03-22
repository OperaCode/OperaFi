import { useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { OPERAFI_ABI } from "../abi/OperaFi";
import { CONTRACT_ADDRESS } from "../utils/constants";

export interface TokenStats {
  name: string;
  symbol: string;
  totalSupply: bigint;
  maxSupply: bigint;
  remainingSupply: bigint;
  faucetAmount: bigint;
  initialSupply: bigint;
  noMintPeriod: bigint;
  owner: string;
}

export interface UserStats {
  balance: bigint;
  canRequest: boolean;
  secondsUntilNext: bigint;
  lastClaimTime: bigint;
  faucetStatusCanClaim: boolean;
  faucetStatusTimeRemaining: bigint;
}

export function useContract() {
  const { address, isConnected } = useAccount();

  // Safe fallback — zero address used when wallet not yet connected. This keeps the contracts array always defined so wagmi v3 can register the calls and fire them the moment address arrives.
  const userAddress = (address ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
  } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const { data: tokenData, refetch: refetchToken } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "name",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "symbol",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "totalSupply",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "MAX_SUPPLY",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "remainingSupply",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "FAUCET_AMOUNT",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "INITIAL_SUPPLY",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "NO_MINT_PERIOD",
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "owner",
      },
    ],
  });

  const { data: userData, refetch: refetchUser } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "balanceOf",
        args: [userAddress],
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "canRequestTokens",
        args: [userAddress],
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "getUntilNextRequestTime",
        args: [userAddress],
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "lastClaimTime",
        args: [userAddress],
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "faucetStatus",
        args: [userAddress],
      },
    ],
  });

  //  Parse token data
  const tokenStats: TokenStats | null = tokenData
    ? {
        name: (tokenData[0].result as string) ?? "—",
        symbol: (tokenData[1].result as string) ?? "—",
        totalSupply: (tokenData[2].result as bigint) ?? 0n,
        maxSupply: (tokenData[3].result as bigint) ?? 0n,
        remainingSupply: (tokenData[4].result as bigint) ?? 0n,
        faucetAmount: (tokenData[5].result as bigint) ?? 0n,
        initialSupply: (tokenData[6].result as bigint) ?? 0n,
        noMintPeriod: (tokenData[7].result as bigint) ?? 0n,
        owner: (tokenData[8].result as string) ?? "",
      }
    : null;

  // Parse user data
  const faucetStatusResult = userData?.[4]?.result as
    | { canClaim: boolean; timeRemaining: bigint }
    | undefined;

//   const secondsRaw = (userData?.[2]?.result as bigint) ?? 1n;

const secondsRaw = BigInt(userData?.[2]?.result?.toString() ?? '1');

console.log('raw userData[2]:', userData?.[2])
console.log('secondsRaw:', secondsRaw)
console.log('secondsRaw === 0n:', secondsRaw === 0n)
console.log('full userData:', userData)

  const userStats: UserStats | null =
    userData && userData.length === 5
      ? {
          balance: (userData[0].result as bigint) ?? 0n,
        //   canRequest: secondsRaw === 0n,
        canRequest: secondsRaw === 0n || Number(userData?.[2]?.result ?? 1) === 0,  
        secondsUntilNext: secondsRaw === 1n ? 0n : secondsRaw,
          lastClaimTime: (userData[3].result as bigint) ?? 0n,
          faucetStatusCanClaim: faucetStatusResult?.canClaim ?? false,
          faucetStatusTimeRemaining: faucetStatusResult?.timeRemaining ?? 0n,
        }
      : null;

  // Refetch after confirmed transaction
  useEffect(() => {
    if (isTxConfirmed) {
      refetchToken();
      refetchUser();
    }
  }, [isTxConfirmed]);

  // Write functions
  const requestToken = useCallback(() => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: OPERAFI_ABI,
      functionName: "requestToken",
    });
  }, [writeContract]);

  const mint = useCallback(
    (to: string, amount: string) => {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "mint",
        args: [to as `0x${string}`, parseEther(amount)],
      });
    },
    [writeContract],
  );

  const transfer = useCallback(
    (to: string, amount: string) => {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: OPERAFI_ABI,
        functionName: "transfer",
        args: [to as `0x${string}`, parseEther(amount)],
      });
    },
    [writeContract],
  );

  return {
    address,
    isConnected,
    tokenStats,
    userStats,
    requestToken,
    mint,
    transfer,
    isLoading: isWritePending || isTxConfirming,
    isTxConfirmed,
    txHash,
    refetch: () => {
      refetchToken();
      refetchUser();
    },
  };
}
