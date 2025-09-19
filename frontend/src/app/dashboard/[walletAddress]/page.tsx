'use client';
import { client } from "@/app/client";
import CampaignCard from "@/app/components/CampaignCard";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import { useState } from "react";
import { defineChain, getContract } from "thirdweb";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react";

export default function DashboardPage() {
  const account = useActiveAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contract = getContract({
    client: client,
    chain: defineChain(7001),
    address: CROWDFUNDING_FACTORY,
  });

  const { data, isPending } = useReadContract({
    contract,
    method:
      "function getUserCampaigns(address _user) view returns ((address campaignAddress, address campaignOwner, string name, uint256 creationTime)[])",
    params: [account?.address as string],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
      <div className="flex flex-row justify-between items-center mb-8">
        <p className="text-4xl font-semibold">Dashboard</p>
        <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={()=> setIsModalOpen(true)}
        >Create Campaign</button>
      </div>
      <p className="text-2xl font-semibold mb-4">My Campaigns:</p>
      <div className="grid grid-cols-3 gap-4">
        {!isPending &&
          data &&
          (data && data.length > 0 ? (
            data.map((campaign, index) => (
              <CampaignCard
                key={index}
                campaignAddress={campaign.campaignAddress}
              />
            ))
          ) : (
            <p className="col-span-full text-center">No Campaigns Found</p>
          ))}
      </div>
      {isModalOpen &&(
        <CreateCampaignModal setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}


type CreateCampaignModalProps = {
    setIsModalOpen: (value: boolean) => void;
};

const CreateCampaignModal = ({ setIsModalOpen }: CreateCampaignModalProps) => {
    const account = useActiveAccount();
    const [campaignName,setCampaignName] = useState<string>("");
    const[campaignDescription, setCampaignDescription] = useState<string>("");
    const[campaignGoal,setCampaignGoal] = useState<number>(1);
    const[campaignDeadline,setCampaignDeadline] = useState<number>(1);
    const[isDeployingContract,setIsDeployingContract] = useState<boolean>(false);


    const handleDeployContract = async() =>{
        setIsDeployingContract(true);
        try{

            const contractAddress = await deployPublishedContract({
                client: client,
                chain: defineChain(7001),
                account: account!,
                contractId:"TrustFlow",
                contractParams:{
                    campaignName,
                    campaignDescription,
                    campaignGoal,
                    campaignDeadline
                },
                publisher:"0x43104B8D7667cA1Dc01fD3881354F8B22f423c45",
                version: 'latest',
            });
            alert('Campaign Created Successfully at address: '+ contractAddress);

        }catch(error){
            console.error(error);
        }finally{
            setIsDeployingContract(false);
            setIsModalOpen(false);
        }
    }

    function handleCampaignGoal(value: number) {
      if (value < 1) {
        setCampaignGoal(1);
      }
      else{
        setCampaignGoal(value);
      }
    }

    function handleCampaignDeadline(value: number) {
      if (value < 1) {
        setCampaignDeadline(1);
      }
      else{
        setCampaignDeadline(value);
      }
    }
    return(
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-1/2 bg-slate-100 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Create a Campaign</p>
                    <button onClick={()=> setIsModalOpen(false)} className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md">Close</button>
                </div>
                <div className="flex flex-col">
                    <label>Campaign Name:</label>
                    <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Campaign Name"
                    className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
                    />
                    <label>Campaign Description</label>
                    <textarea
                    value={campaignDescription}
                    onChange={(e)=> setCampaignDescription(e.target.value)}
                    placeholder="Description"
                    className=" mb-4 px-4 py-2 bg-slate-300 rounded-md"
                    />
                    <label>Campaign Goal:</label>
                    <input
                    type="number"
                    value={campaignGoal}
                    onChange={(e) => handleCampaignGoal(Number(e.target.value))}
                    className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
                    />
                    <label>Campaign Length (in days):</label>
                    <div className="flex space-x-4">
                    <input
                    type="number"
                    value={campaignDeadline}
                    onChange={(e) => handleCampaignDeadline(Number(e.target.value))}
                    className="mb-4 px-4 py-2 bg-slate-300 rounded-md flex-1"
                    />

                    </div>
                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handleDeployContract} disabled={isDeployingContract}>
                        {isDeployingContract ? "Creating Campaign..." : "Create Campaign"}
                    </button>
                </div>
            </div>
        </div>
                
    )
};