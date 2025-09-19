"use client";
import { client } from "@/app/client";
import TierCard from "@/app/components/TierCard";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  defineChain,
  getContract,
  prepareContractCall,
  ThirdwebContract,
} from "thirdweb";
import {
    lightTheme,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";

export default function CampaignPage() {
  const { campaignAddress } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const account = useActiveAccount();

  const contract = getContract({
    client: client,
    chain: defineChain(7001),
    address: campaignAddress as string,
  });

  // Name of the campaign
  const { data: name, isPending: isPendingName } = useReadContract({
    contract: contract,
    method: "function name() view returns (string)",
    params: [],
  });

  // Description of the campaign
  const { data: description } = useReadContract({
    contract,
    method: "function description() view returns (string)",
    params: [],
  });

  // Campaign deadline
  const { data: deadline, isPending: isPendingDeadline } = useReadContract({
    contract: contract,
    method: "function deadline() view returns (uint256)",
    params: [],
  });
  // Convert deadline to a date
  const deadlineDate = new Date(
    parseInt(deadline?.toString() as string) * 1000,
  );
  // Check if deadline has passed
  const hasDeadlinePassed = deadlineDate < new Date();

  // Goal amount of the campaign
  const { data: goal, isPending: isPendingGoal } = useReadContract({
    contract: contract,
    method: "function goal() view returns (uint256)",
    params: [],
  });

  // Total funded balance of the campaign
  const { data: balance, isPending: isPendingBalance } = useReadContract({
    contract: contract,
    method: "function getContractBalance() view returns (uint256)",
    params: [],
  });

  // Calulate the total funded balance percentage
  const totalBalance = balance?.toString();
  const totalGoal = goal?.toString();
  let balancePercentage =
    (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;

  // If balance is greater than or equal to goal, percentage should be 100
  if (balancePercentage >= 100) {
    balancePercentage = 100;
  }

  // Get tiers for the campaign
  const { data: tiers, isPending: isPendingTiers } = useReadContract({
    contract: contract,
    method:
      "function getTiers() view returns ((string name, uint256 amount, uint256 backers)[])",
    params: [],
  });

  // Get owner of the campaign
  const { data: owner, isPending: isPendingOwner } = useReadContract({
    contract: contract,
    method: "function owner() view returns (address)",
    params: [],
  });

  // Get status of the campaign
  const { data: status } = useReadContract({
    contract,
    method: "function state() view returns (uint8)",
    params: [],
  });

  const deadlineNumber = typeof deadline === "bigint" ? Number(deadline) : 0;

  // Calculate the remaining days
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const timeLeftInSeconds = Math.max(0, deadlineNumber - nowInSeconds);
  const daysLeft = Math.floor(timeLeftInSeconds / 86400);

  return (
    <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        {!isPendingName && (
          <p className="text-3xl sm:text-4xl font-semibold">{name}</p>
        )}
        {account && owner === account.address ? (
          <div className="flex flex-row">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Edit
            </button>
          </div>
        ) : null}
      </div>

      <div className="my-4">
        <p className="text-lg font-semibold">Description:</p>
        <p>{description}</p>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">Deadline</p>
        {!isPendingDeadline && <p>{deadlineDate.toDateString()}</p>}
      </div>

      {/* Progress Bar and Funded Amount */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-lg font-semibold text-zinc-800">
            Current Funding: ${isPendingBalance ? "Loading..." : totalBalance}
          </p>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${balancePercentage}%` }}
          />
        </div>
      </div>

      {/* Goal and Days Left */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-zinc-500 text-sm sm:text-base font-medium leading-none mt-2">
        <span className="mb-2 sm:mb-0">Goal: ${totalGoal}</span>
        <span>
          {daysLeft > 1
            ? `${daysLeft} days left`
            : daysLeft === 1
              ? "1 day left"
              : "Ended"}
        </span>
      </div>

      <div className="mt-8">
        <p className="text-xl font-semibold mb-4">Tiers:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isPendingTiers ? (
            <p className="col-span-full text-center">Loading tiers...</p>
          ) : tiers && tiers.length > 0 ? (
            tiers.map((tier, index) => (
              <TierCard
                key={index}
                tier={tier}
                index={index}
                contract={contract}
                isEditing={isEditing}
              />
            ))
          ) : (
            !isEditing ? (
              <p className="col-span-full text-center">No Tiers Found</p>
            ) : null
          )}
          {isEditing && (
            <button
              className="max-w-sm flex flex-col text-center justify-center items-center font-semibold p-6 bg-blue-500 text-white border border-slate-100 rounded-lg shadow"
              onClick={() => setIsModalOpen(true)}
            >
              Add Tier
            </button>
          )}
        </div>
      </div>
      {isModalOpen && (
        <CreateTierModal setIsModalOpen={setIsModalOpen} contract={contract} />
      )}
    </div>
  );
}

type CreateTierModalProps = {
  setIsModalOpen: (value: boolean) => void;
  contract: ThirdwebContract;
};

const CreateTierModal = ({
  setIsModalOpen,
  contract,
}: CreateTierModalProps) => {
  const [tierName, setTierName] = useState<string>("");
  const [tierAmount, setTierAmount] = useState<bigint>(1n);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
      <div className="w-1/2 bg-slate-100 p-6 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold">Create a Funding Tier</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
        <div className="flex flex-col">
          <label>Tier Name:</label>
          <input
            type="text"
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
            placeholder="Enter tier name"
            className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
          ></input>

          <label>Tier Amount(USD):</label>
          <input
            type="number"
            value={parseInt(tierAmount.toString())}
            onChange={(e) => setTierAmount(BigInt(e.target.value))}
            className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
          ></input>
          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract,
                method: "function addTier(string _name, uint256 _amount)",
                params: [tierName, tierAmount],
              })
            }
            onTransactionConfirmed={async () => {
              alert("Tier Added Successfully!");
              setIsModalOpen(false);
            }}
            theme={lightTheme()}
          >
            Add Tier
          </TransactionButton>
        </div>
      </div>
    </div>
  );
};
