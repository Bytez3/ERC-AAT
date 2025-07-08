// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ERC-AAT Interface
 * @dev Interface for the Automated Achievement Token standard
 * @author Steven Isaac
 */
interface IERC_AAT {
    /**
     * @dev Emitted when an achievement is unlocked for a user
     * @param achiever The address that unlocked the achievement
     * @param achievementId The ID of the achievement that was unlocked
     * @param timestamp The timestamp when the achievement was unlocked
     */
    event AchievementUnlocked(
        address indexed achiever,
        uint256 indexed achievementId,
        uint256 timestamp
    );

    /**
     * @dev Mints an achievement token to the specified address
     * @param achiever The address to mint the achievement to
     * @param achievementId The ID of the achievement to mint
     */
    function mintAchievement(address achiever, uint256 achievementId) external;

    /**
     * @dev Checks if an address has already earned a specific achievement
     * @param achiever The address to check
     * @param achievementId The ID of the achievement to check
     * @return True if the address has the achievement, false otherwise
     */
    function hasAchievement(address achiever, uint256 achievementId) external view returns (bool);

    /**
     * @dev Retrieves the metadata URI for the given achievement
     * @param achievementId The ID of the achievement
     * @return The metadata URI for the achievement
     */
    function achievementURI(uint256 achievementId) external view returns (string memory);
} 