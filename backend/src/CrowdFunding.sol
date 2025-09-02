// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdFunding{
    string public name;
    string public description;
    uint256 public goal;
    uint256 public deadline;
    address public owner;
    bool public pause;

    enum CampaignState{ Active, Success, Failed}
    CampaignState public state;

    constructor(
        address _owner,
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 durationInDays
    ){
        name = _name;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + (durationInDays * 1 days);
        owner = _owner;
        state = CampaignState.Active;
    }

    struct Tier{
        string name;
        uint256 amount;
        uint256 backers;
    }

    struct Backer{
        uint256 totalContribution;
        mapping(uint256 => bool) fundedTier;
    }

    Tier[] public tiers;
    mapping(address => Backer) public backers;

    modifier onlyOwner(){
        require(msg.sender == owner, "Not The owner");
        _;
    }

    modifier campaignOpen(){
        require(state == CampaignState.Active, "Campaign Closed");
        _;
    }

    modifier notPaused(){
        require(!pause, "Contract is Paused");
        _;
    }

    function checkAndUpdateCampaignState() internal {
        if(state == CampaignState.Active){
            if(block.timestamp >= deadline){
                state = address(this).balance >= goal ? CampaignState.Success : CampaignState.Failed;
            }
            else {
                state = address(this).balance >= goal ? CampaignState.Success : CampaignState.Active;
            }
        }
    }

    function fund(uint256 _tierIndex) public payable campaignOpen notPaused{
        require(_tierIndex < tiers.length, "Invalid Index");
        require(msg.value == tiers[_tierIndex].amount, "Amount Less than the specified amount in tier");

        tiers[_tierIndex].backers++;
        backers[msg.sender].totalContribution += msg.value;
        backers[msg.sender].fundedTier[_tierIndex] = true;
        checkAndUpdateCampaignState();
    }

    function addTier(string memory _name, uint256 _amount) public onlyOwner{
        require(_amount > 0, "Amount Should be greater than zero");
        tiers.push(Tier(_name, _amount, 0));
    }

    function removeTier(uint256 _index ) public onlyOwner{
        require(_index < tiers.length, "Index out of Range");
        tiers[_index] = tiers[tiers.length - 1];
        tiers.pop();

    }

    function withdraw() public onlyOwner{
        checkAndUpdateCampaignState();
        require(state == CampaignState.Success, "Campaign not successful yet");
        uint256 balance = address(this).balance;
        require(balance > 0, "Current Balance : 0");

        payable(owner).transfer(balance);
    }

    function getContractBalance() public view returns(uint256){
        return address(this).balance;
    }

    function refund() public {
        checkAndUpdateCampaignState();
        require(state == CampaignState.Failed,"Refund for this campaign not available");
        uint256 amount = backers[msg.sender].totalContribution;
        require(amount > 0 , "No Contribution available");

        backers[msg.sender].totalContribution = 0;
        payable(msg.sender).transfer(amount);
    }

    function hasFundedTier(address _backer, uint256 _tierIndex) public view returns (bool){
        return backers[_backer].fundedTier[_tierIndex];
    }

    function getTiers() public view returns (Tier[] memory){
        return tiers;
    }

    function togglePause() public onlyOwner{
        pause = !pause;
    }

    function getCampaignStatus() public view returns(CampaignState){
        if(state == CampaignState.Active && block.timestamp > deadline){
            return address(this).balance >= goal ? CampaignState.Success : CampaignState.Failed;
        }
        return state;
    }

    function extendDeadline(uint256 _daysToAdd) public onlyOwner campaignOpen{
        deadline += _daysToAdd * 1 days;
    }
}

