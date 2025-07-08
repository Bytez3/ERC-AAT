// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC_AAT.sol";

/**
 * @title ERC-AAT Implementation
 * @dev Implementation of the Automated Achievement Token standard
 * @author Steven Isaac
 */
contract ERC_AAT is IERC_AAT, Ownable {
    // Mapping from user address to achievement ID to achievement status
    mapping(address => mapping(uint256 => bool)) private _achievements;
    
    // Mapping from achievement ID to metadata URI
    mapping(uint256 => string) private _achievementURIs;
    
    // Mapping to track total achievements per user
    mapping(address => uint256) private _userAchievementCount;
    
    // Mapping to track total users who have earned each achievement
    mapping(uint256 => uint256) private _achievementEarnedCount;

    /**
     * @dev Modifier to ensure achievement hasn't been earned yet
     * @param achiever The address attempting to earn the achievement
     * @param achievementId The ID of the achievement
     */
    modifier notYetAchieved(address achiever, uint256 achievementId) {
        require(!_achievements[achiever][achievementId], "ERC-AAT: Achievement already unlocked");
        _;
    }

    /**
     * @dev Modifier to ensure achievement URI exists
     * @param achievementId The ID of the achievement
     */
    modifier achievementExists(uint256 achievementId) {
        require(bytes(_achievementURIs[achievementId]).length > 0, "ERC-AAT: Achievement does not exist");
        _;
    }

    /**
     * @dev Constructor sets the initial owner
     * @param initialOwner The initial owner of the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Mints an achievement token to the specified address
     * @param achiever The address to mint the achievement to
     * @param achievementId The ID of the achievement to mint
     */
    function mintAchievement(address achiever, uint256 achievementId)
        external
        onlyOwner
        achievementExists(achievementId)
        notYetAchieved(achiever, achievementId)
    {
        require(achiever != address(0), "ERC-AAT: Cannot mint to zero address");
        
        _achievements[achiever][achievementId] = true;
        _userAchievementCount[achiever]++;
        _achievementEarnedCount[achievementId]++;
        
        emit AchievementUnlocked(achiever, achievementId, block.timestamp);
    }

    /**
     * @dev Checks if an address has already earned a specific achievement
     * @param achiever The address to check
     * @param achievementId The ID of the achievement to check
     * @return True if the address has the achievement, false otherwise
     */
    function hasAchievement(address achiever, uint256 achievementId) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _achievements[achiever][achievementId];
    }

    /**
     * @dev Retrieves the metadata URI for the given achievement
     * @param achievementId The ID of the achievement
     * @return The metadata URI for the achievement
     */
    function achievementURI(uint256 achievementId) 
        external 
        view 
        override 
        returns (string memory) 
    {
        return _achievementURIs[achievementId];
    }

    /**
     * @dev Sets the metadata URI for an achievement (owner only)
     * @param achievementId The ID of the achievement
     * @param uri The metadata URI for the achievement
     */
    function setAchievementURI(uint256 achievementId, string calldata uri) 
        external 
        onlyOwner 
    {
        require(bytes(uri).length > 0, "ERC-AAT: URI cannot be empty");
        _achievementURIs[achievementId] = uri;
    }

    /**
     * @dev Gets the total number of achievements earned by a user
     * @param user The address to check
     * @return The total number of achievements earned
     */
    function getUserAchievementCount(address user) external view returns (uint256) {
        return _userAchievementCount[user];
    }

    /**
     * @dev Gets the total number of users who have earned a specific achievement
     * @param achievementId The ID of the achievement
     * @return The total number of users who have earned the achievement
     */
    function getAchievementEarnedCount(uint256 achievementId) external view returns (uint256) {
        return _achievementEarnedCount[achievementId];
    }

    /**
     * @dev Batch mint achievements to multiple users
     * @param achievers Array of addresses to mint achievements to
     * @param achievementId The ID of the achievement to mint
     */
    function batchMintAchievement(address[] calldata achievers, uint256 achievementId)
        external
        onlyOwner
        achievementExists(achievementId)
    {
        require(achievers.length > 0, "ERC-AAT: Empty achievers array");
        require(achievers.length <= 100, "ERC-AAT: Too many achievers in batch");
        
        for (uint256 i = 0; i < achievers.length; i++) {
            address achiever = achievers[i];
            if (achiever != address(0) && !_achievements[achiever][achievementId]) {
                _achievements[achiever][achievementId] = true;
                _userAchievementCount[achiever]++;
                _achievementEarnedCount[achievementId]++;
                
                emit AchievementUnlocked(achiever, achievementId, block.timestamp);
            }
        }
    }
} 