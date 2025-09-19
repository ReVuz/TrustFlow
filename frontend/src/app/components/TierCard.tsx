import { prepareContractCall, ThirdwebContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";

type Tier = {
  name: string;
  amount: bigint;
  backers: bigint;
}

type TierCardProps = {
  tier: Tier;
  index: number;
  contract: ThirdwebContract;
  isEditing: boolean;
}

export default function TierCard({ tier, index, contract, isEditing }: TierCardProps) {
  return(
    <div className="max-w-full flex flex-col justify-between p-6 bg-white border border-slate-100 rounded-lg shadow">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">{tier.name}</p>
          <p className="text-xl sm:text-2xl font-semibold">${tier.amount.toString()}</p>
        </div>
      </div>
      <div className="flex flex-grow flex-col sm:flex-row justify-between items-end mt-4">
        <p className="text-sm font-semibold mb-2 sm:mb-0">Total Backers: {tier.backers.toString()}</p>
        <TransactionButton transaction={()=> prepareContractCall({
          contract: contract,
          method: "function fund(uint256 _tierIndex) payable",
          params: [BigInt(index)],
          value: tier.amount
        })}
        onTransactionConfirmed={async()=>{alert('Transaction Confirmed!')}}
        style={{
            marginTop: "1rem",
            backgroundColor: "#2563EB",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
          }}>Select</TransactionButton>
      </div>
      {isEditing &&(
        <TransactionButton transaction={() => prepareContractCall({
      contract,
      method: "function removeTier(uint256 _index)",
      params: [BigInt(index)],
    })}
    onTransactionConfirmed={async()=>{alert('Tier Removed Succesfully')}}style={{
                        marginTop: "1rem",
                        backgroundColor: "red",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                    }}>Remove</TransactionButton>
      )}
    </div>
  )
}