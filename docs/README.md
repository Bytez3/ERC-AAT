# ERC-AAT Documentation

## Overview

ERC-AAT (Automated Achievement Token) is a standard for creating and managing achievement tokens on Ethereum. It provides a simple, secure, and efficient way to recognize user accomplishments and interactions within decentralized applications.

## Features

- **Automated Minting**: Achievements are minted automatically based on on-chain events
- **Duplicate Prevention**: Built-in safeguards against duplicate achievement minting
- **Metadata Support**: Flexible metadata URI system for achievement descriptions
- **Batch Operations**: Efficient batch minting for multiple users
- **Event Tracking**: Comprehensive event emission for frontend integration
- **Access Control**: Role-based access control for minting operations

## Contract Architecture

### Core Components

1. **IERC_AAT Interface**: Defines the standard interface
2. **ERC_AAT Implementation**: Complete implementation with additional features
3. **Access Control**: OpenZeppelin Ownable pattern for security

### Key Functions

#### Achievement Management
- `mintAchievement(address achiever, uint256 achievementId)`: Mint a single achievement
- `batchMintAchievement(address[] achievers, uint256 achievementId)`: Mint to multiple users
- `setAchievementURI(uint256 achievementId, string uri)`: Set achievement metadata

#### Query Functions
- `hasAchievement(address achiever, uint256 achievementId)`: Check achievement status
- `achievementURI(uint256 achievementId)`: Get achievement metadata URI
- `getUserAchievementCount(address user)`: Get total achievements for user
- `getAchievementEarnedCount(uint256 achievementId)`: Get total users with achievement

## Usage Examples

### Basic Setup

```javascript
// Deploy contract
const ERC_AAT = await ethers.getContractFactory("ERC_AAT");
const ercAAT = await ERC_AAT.deploy(owner.address);

// Set up achievements
await ercAAT.setAchievementURI(1, "ipfs://QmExample1/achievement1.json");
await ercAAT.setAchievementURI(2, "ipfs://QmExample2/achievement2.json");

// Mint achievements
await ercAAT.mintAchievement(user1.address, 1);
await ercAAT.mintAchievement(user2.address, 1);
```

### DeFi Integration

```javascript
// Example: Award liquidity provider achievement
async function awardLiquidityProviderAchievement(userAddress) {
    const achievementId = 1; // Liquidity Provider achievement
    
    // Check if user already has achievement
    const hasAchievement = await ercAAT.hasAchievement(userAddress, achievementId);
    
    if (!hasAchievement) {
        await ercAAT.mintAchievement(userAddress, achievementId);
        console.log(`Awarded liquidity provider achievement to ${userAddress}`);
    }
}
```

### Gaming Integration

```javascript
// Example: Award quest completion achievement
async function awardQuestAchievement(userAddress, questId) {
    const achievementId = questId + 100; // Map quest ID to achievement ID
    
    try {
        await ercAAT.mintAchievement(userAddress, achievementId);
        console.log(`Quest ${questId} completed by ${userAddress}`);
    } catch (error) {
        if (error.message.includes("already unlocked")) {
            console.log(`User ${userAddress} already completed quest ${questId}`);
        } else {
            throw error;
        }
    }
}
```

### Education Platform Integration

```javascript
// Example: Award course completion credential
async function awardCourseCredential(userAddress, courseId) {
    const achievementId = courseId + 1000; // Map course ID to achievement ID
    
    // Verify course completion (off-chain or on-chain verification)
    const courseCompleted = await verifyCourseCompletion(userAddress, courseId);
    
    if (courseCompleted) {
        await ercAAT.mintAchievement(userAddress, achievementId);
        console.log(`Course ${courseId} credential awarded to ${userAddress}`);
    }
}
```

## Metadata Standards

### Achievement Metadata Format

```json
{
    "name": "First Trade",
    "description": "Completed your first trade on the platform",
    "image": "ipfs://QmImageHash/achievement.png",
    "attributes": [
        {
            "trait_type": "Category",
            "value": "Trading"
        },
        {
            "trait_type": "Rarity",
            "value": "Common"
        },
        {
            "trait_type": "Points",
            "value": 10
        }
    ],
    "external_url": "https://yourplatform.com/achievements/first-trade"
}
```

## Security Considerations

### Access Control
- Only contract owner can mint achievements
- Only contract owner can set achievement URIs
- Consider using role-based access control for complex scenarios

### Duplicate Prevention
- Built-in checks prevent duplicate achievement minting
- Batch operations skip already achieved users
- Zero address validation in minting functions

### Gas Optimization
- Efficient storage patterns for achievement tracking
- Batch operations for multiple users
- Optimized Solidity compiler settings

## Integration Guide

### Frontend Integration

```javascript
// React hook for achievement tracking
function useAchievements(contractAddress, userAddress) {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function loadAchievements() {
            const contract = new ethers.Contract(contractAddress, ERC_AAT_ABI, provider);
            const achievementCount = await contract.getUserAchievementCount(userAddress);
            
            const userAchievements = [];
            for (let i = 1; i <= achievementCount; i++) {
                const hasAchievement = await contract.hasAchievement(userAddress, i);
                if (hasAchievement) {
                    const uri = await contract.achievementURI(i);
                    userAchievements.push({ id: i, uri });
                }
            }
            
            setAchievements(userAchievements);
            setLoading(false);
        }
        
        loadAchievements();
    }, [contractAddress, userAddress]);
    
    return { achievements, loading };
}
```

### Event Listening

```javascript
// Listen for achievement unlocks
contract.on("AchievementUnlocked", (achiever, achievementId, timestamp) => {
    console.log(`Achievement ${achievementId} unlocked by ${achiever} at ${timestamp}`);
    
    // Update UI or trigger notifications
    showAchievementNotification(achievementId, achiever);
});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run specific test file
npx hardhat test test/ERC_AAT.test.js
```

### Test Coverage

The test suite covers:
- Contract deployment and ownership
- Achievement URI management
- Single and batch achievement minting
- Achievement queries and validation
- Access control and security
- Edge cases and error handling

## Deployment

### Local Development

```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS OWNER_ADDRESS
```

### Mainnet Deployment

```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Verify contract
npx hardhat verify --network mainnet CONTRACT_ADDRESS OWNER_ADDRESS
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details. 