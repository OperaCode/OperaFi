// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OperaFi is ERC20, Ownable {
    // STATE VARIABLES

    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;

    uint256 public constant INITIAL_SUPPLY = 100 * 10 ** 18;

    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;

    uint256 public constant NO_MINT_PERIOD = 24 hours;

    mapping(address => uint256) public lastClaimTime;

    event TokensRequested(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event TokenMinted(address indexed to, uint256 amount);

    constructor(
        address initialOwner
    ) ERC20("Opera Finance", "OFI") Ownable(initialOwner) {
        require(INITIAL_SUPPLY <= MAX_SUPPLY, "Initial exceeds max");
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    function requestToken() external {
        // require(amount <= FAUCET_AMOUNT, "Amount exceeds faucet limit");
        // require(block.timestamp - lastClaimTime[msg.sender] >= NO_MINT_PERIOD, "Cooldown period not passed");
        // lastClaimTime[msg.sender] = block.timestamp;
        // _mint(msg.sender, amount);
        // emit TokensRequested(msg.sender, amount, block.timestamp);

        address user = msg.sender;

        uint256 nextMintTime = lastClaimTime[user] + NO_MINT_PERIOD;

        require(block.timestamp >= nextMintTime, "Cooldown active");
        require(
            totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY,
            "Max supply reached"
        );

        lastClaimTime[user] = block.timestamp;
        _mint(user, FAUCET_AMOUNT);

        emit TokensRequested(user, FAUCET_AMOUNT, block.timestamp);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to address zero");

        require(amount > 0, "Amount must be greater than zero");

        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Maximum supply reached"
        );

        _mint(to, amount);

        emit TokenMinted(to, amount);
    }

    function getUntilNextRequestTime(
        address user
    ) external view returns (uint256) {
        uint256 nextAllowedTime = lastClaimTime[user] + NO_MINT_PERIOD;

        if (block.timestamp >= nextAllowedTime) {
            return 0;
        }
        return nextAllowedTime - block.timestamp;
    }

    function canRequestTokens(address user) external view returns (bool) {
        return block.timestamp >= lastClaimTime[user] + NO_MINT_PERIOD;
    }

    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    function faucetStatus(
        address user
    ) external view returns (bool canClaim, uint256 timeRemaining) {
        uint256 nextTime = lastClaimTime[user] + NO_MINT_PERIOD;

        if (block.timestamp >= nextTime) {
            return (true, 0);
        }

        return (false, nextTime - block.timestamp);
    }
}
