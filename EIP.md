# EIP: TBD
**Title:** ERC-AAT: Automated Achievement Token Standard  
**Author:** Steven Isaac  
**Status:** Draft  
**Type:** Standards Track  
**Category:** ERC  
**Created:** 2025-07-07  

## Abstract

ERC-AAT introduces a standard interface for Ethereum tokens designed to automatically mint achievement tokens based on specific on-chain user interactions or events within decentralized applications (dApps). This standard simplifies the implementation of gamified experiences, provides verifiable on-chain credentials, and enhances user engagement across dApps.

## Motivation

The Ethereum ecosystem lacks a standardized and seamless approach to recognizing and rewarding users for their interactions and achievements within dApps. By automating the issuance of achievements, developers can foster user engagement, gamification, and transparent on-chain credentialing.

## Specification

### Interface

```solidity
interface IERC_AAT {
    event AchievementUnlocked(address indexed achiever, uint256 indexed achievementId, uint256 timestamp);

    function mintAchievement(address achiever, uint256 achievementId) external;
    function hasAchievement(address achiever, uint256 achievementId) external view returns (bool);
    function achievementURI(uint256 achievementId) external view returns (string memory);
}
```

### Functions

* `mintAchievement(address achiever, uint256 achievementId)`: Mints an achievement token to the specified address.
* `hasAchievement(address achiever, uint256 achievementId)`: Checks if an address has already earned a specific achievement.
* `achievementURI(uint256 achievementId)`: Retrieves the metadata URI for the given achievement.

### Events

* `AchievementUnlocked(address indexed achiever, uint256 indexed achievementId, uint256 timestamp)`: Triggered when an achievement is unlocked.

## Rationale

The ERC-AAT standard leverages existing Ethereum best practices and OpenZeppelin standards, providing simplicity, security, and ease of implementation. The event-driven architecture allows seamless integration with front-end applications and analytics.

## Security Considerations

* Ensure minting rights are restricted via ownership or role-based access controls.
* Implement safeguards against duplicate achievement minting.
* Clearly document metadata standards for achievement tokens.

## Reference Implementation

A complete reference implementation of ERC-AAT can be found in the `contracts/` directory.

## Usage Examples

* **DeFi Platforms:** Automatically mint tokens to recognize liquidity providers.
* **Gaming:** Award achievements for completing quests.
* **Education:** Issue credentials upon completion of educational courses.

## Next Steps

* Submit proposal for community review.
* Gather and incorporate feedback.
* Finalize and submit to Ethereum GitHub repository. 