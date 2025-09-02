// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {CrowdFunding} from "./CrowdFunding.sol";

contract CrowdFundingFactory{
    address public owner;
    bool public pause;


    struct Campaign{
        address campaignAddress;
        address campaignOwner;
        string name;
        uint256 creationTime;
    }

    Campaign[] public Campaigns;
    mapping (address => Campaign[]) public userCampaigns;

    modifier onlyOwner() {
        require(msg.sender == owner , "Not Owner");
        _;
    }

    modifier notPaused() {
        require(!pause, "Campaign Paused");
        _;
    }

    constructor(){
        owner = msg.sender;
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays) external notPaused {

        CrowdFunding newCampaign = new CrowdFunding(
            msg.sender,
            _name,
            _description,
            _goal,
            _durationInDays
        );
        address campaignAddress = address(newCampaign);

        Campaign memory campaign = Campaign({
            campaignAddress: campaignAddress,
            campaignOwner:msg.sender,
            name:_name,
            creationTime:block.timestamp
        });      

        Campaigns.push(campaign);
        userCampaigns[msg.sender].push(campaign);
    }

    function getUserCampaigns(address _user) external view returns(Campaign[] memory){
        return userCampaigns[_user];
    }

    function getAllCampaigns() external view returns(Campaign[] memory){
        return Campaigns;
    }

    function togglePause() external onlyOwner{
        pause = !pause;
    }
}