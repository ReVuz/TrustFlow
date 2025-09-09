import { getContract } from "thirdweb";
import { client } from "../client";
import { defineChain } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import Link from "next/link";

type CampaignCardProps = {
  campaignAddress: string;
};

export default function CampaignCard({ campaignAddress }: CampaignCardProps) {
  const contract = getContract({
    client: client,
    chain: defineChain(7001),
    address: campaignAddress,
  });

  const { data: campaignName } = useReadContract({
    contract,
    method: "function name() view returns (string)",
    params: [],
  });

  const { data: campaignDescription } = useReadContract({
    contract,
    method: "function description() view returns (string)",
    params: [],
  });

  const { data: goal } = useReadContract({
    contract,
    method: "function goal() view returns (uint256)",
    params: [],
  });

  const { data: balance } = useReadContract({
    contract,
    method: "function getContractBalance() view returns (uint256)",
    params: [],
  });

  const { data: deadline } = useReadContract({
    contract,
    method: "function deadline() view returns (uint256)",
    params: [],
  });

  const totalBalance = balance?.toString() || "0";
  const totalGoal = goal?.toString() || "0";
  const deadlineNumber = typeof deadline === "bigint" ? Number(deadline) : 0;

  // Calculate the remaining days
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const timeLeftInSeconds = Math.max(0, deadlineNumber - nowInSeconds);
  const daysLeft = Math.floor(timeLeftInSeconds / 86400);

  // Calculate the percentage and clamp it between 0 and 100
  const balancePercentage =
    totalGoal !== "0"
      ? Math.min(100, (parseInt(totalBalance) / parseInt(totalGoal)) * 100)
      : 0;

  return (
    <Link href={`/campaign/${campaignAddress}`} passHref = {true}>
    <div className="flex flex-col w-full max-w-sm p-6 space-y-4 rounded-xl border border-neutral-300 border-opacity-70 bg-white shadow-sm">
      {/* Title and Description Section */}
      <div className="flex flex-col">
        <h2 className="text-black text-base font-extrabold leading-normal break-words">
          {campaignName || "Loading..."}
        </h2>
        <p className="text-zinc-500 text-sm font-normal leading-tight break-words">
          {campaignDescription || "Loading..."}
        </p>
      </div>

      {/* Progress Bar and Details Section */}
      <div className="flex flex-col space-y-2">
        {/* Current Balance */}
        <div className="flex items-end justify-between">
          <span className="text-lg font-extrabold leading-normal text-black">
            ${totalBalance}
          </span>
          <span className="text-sm font-bold leading-tight text-black">
            {balancePercentage.toFixed(0)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 rounded-sm h-1.5 overflow-hidden">
          <div
            className="h-full bg-amber-300 transition-all duration-500 ease-out"
            style={{ width: `${balancePercentage}%` }}
          />
        </div>

        {/* Goal and Days Left */}
        <div className="flex justify-between items-center text-zinc-500 text-xs font-medium leading-none mt-2">
          <span>Goal: ${totalGoal}</span>
          <span>
            {daysLeft > 1
              ? `${daysLeft} days left`
              : daysLeft === 1
                ? "1 day left"
                : "Ended"}
          </span>
        </div>
      </div>
    </div>
    </Link>
  );
}
