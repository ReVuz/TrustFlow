# TrustFlow: A Decentralized Crowdfunding Platform

TrustFlow is a secure and transparent crowdfunding platform built on the Ethereum blockchain. It removes the need for centralized intermediaries by allowing creators to launch their own fundraising campaigns and backers to contribute directly via smart contracts. This project is a demonstration of a factory-based contract architecture, which enables scalable and efficient deployment of multiple, independent crowdfunding campaigns.

## Key Features

  * **Decentralized Campaign Creation**: Any user can deploy a new, dedicated crowdfunding campaign with a single transaction using the factory contract.
  * **Transparent & Trustless Funding**: All contributions and fund distributions are managed by smart contracts, ensuring the process is transparent and verifiable on the blockchain.
  * **Tier-Based Contributions**: Campaign creators can define different funding tiers with specific amounts and benefits.
  * **Automatic Fund Management**: Funds are held securely in the smart contract. They are released to the creator only upon a successful campaign or are made available for refunds if the campaign fails.
  * **Admin Controls**: The factory owner can pause the platform, and individual campaign owners can manage their specific campaigns (e.g., adding tiers, extending deadlines).

-----

## Smart Contracts

The project is composed of two main contracts:

### 1\. `CrowdFunding.sol`

This is the core contract for a **single campaign**. It is a reusable blueprint that manages a campaign's state, contributions, and fund flow.

  * `constructor()`: Initializes a new campaign with a name, description, goal, and deadline. The caller of this function becomes the campaign's owner.
  * `fund()`: A `payable` function that allows users to contribute to a specific tier.
  * `addTier()`: Allows the campaign owner to define new contribution levels.
  * `withdraw()`: Enables the owner to withdraw collected funds if the campaign goal is met.
  * `refund()`: Allows backers to retrieve their contributions if the campaign fails.
  * `togglePause()`: Gives the campaign owner the ability to pause or unpause their specific campaign.

-----

### 2\. `CrowdFundingFactory.sol`

This contract acts as a central **hub for all campaigns**. It's the primary entry point for creators.

  * `createCampaign()`: The key function that deploys a new instance of the `CrowdFunding` contract. It takes campaign details as parameters and makes the caller the owner of the newly deployed campaign.
  * `Campaigns[]`: A public array that stores a record of every campaign created by the factory, making them discoverable.
  * `userCampaigns`: A mapping that tracks all campaigns created by a specific user.


## Getting Started

To interact with the smart contracts, you will need a development environment like Hardhat or Truffle and an Ethereum wallet.

1.  Clone the repository:
    ```bash
    git clone [your-repo-url]
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Compile the contracts:
    ```bash
    npx thirdweb compile
    ```