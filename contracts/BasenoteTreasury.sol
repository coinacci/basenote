// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BasenoteTreasury is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    uint256 public constant PLATFORM_BPS = 1500;  // %15
    uint256 public constant AUTHOR_BPS   = 7000;  // %70
    uint256 public constant READER_BPS   = 1500;  // %15
    uint256 public constant BPS_DENOM    = 10000;

    address public platformWallet;
    uint256 public cycleStart;
    uint256 public cycleDuration = 7 days;

    event PaymentReceived(address indexed reader, address indexed author, bytes32 articleId, uint256 amount);
    event Distributed(uint256 platformAmount, uint256 authorPool, uint256 readerPool, uint256 timestamp);
    event AuthorPaid(address indexed author, uint256 amount);
    event ReaderRewarded(address indexed reader, uint256 amount);

    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
        cycleStart = block.timestamp;
    }

    // Okuyucu ödeme yapar — frontend transfer yapıp bu fonksiyonu çağırmaz
    // Transfer direkt USDC.transfer ile yapılır, bu sadece event için
    function recordPayment(
        address reader,
        address author,
        bytes32 articleId,
        uint256 amount
    ) external onlyOwner {
        emit PaymentReceived(reader, author, articleId, amount);
    }

    // Aylık dağıtım
    function distribute(
        address[] calldata authors,
        uint256[] calldata authorShares,
        address[] calldata readers,
        uint256[] calldata readerShares
    ) external onlyOwner nonReentrant {
        require(block.timestamp >= cycleStart + cycleDuration, "Cycle not ended");
        require(authors.length == authorShares.length, "Author params mismatch");
        require(readers.length == readerShares.length, "Reader params mismatch");

        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "Treasury empty");

        uint256 platformAmount = (balance * PLATFORM_BPS) / BPS_DENOM;
        uint256 authorPool     = (balance * AUTHOR_BPS)   / BPS_DENOM;
        uint256 readerPool     = balance - platformAmount - authorPool;

        // Platform
        require(usdc.transfer(platformWallet, platformAmount), "Platform transfer failed");

        // Yazarlar
        _distributePool(authors, authorShares, authorPool, true);

        // Okuyucular
        _distributePool(readers, readerShares, readerPool, false);

        // Yeni dönem başlat
        cycleStart = block.timestamp;

        emit Distributed(platformAmount, authorPool, readerPool, block.timestamp);
    }

    function _distributePool(
        address[] calldata recipients,
        uint256[] calldata shares,
        uint256 pool,
        bool isAuthor
    ) internal {
        uint256 totalShares;
        for (uint256 i = 0; i < shares.length; i++) totalShares += shares[i];
        if (totalShares == 0) return;

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 amount = (pool * shares[i]) / totalShares;
            if (amount == 0) continue;
            require(usdc.transfer(recipients[i], amount), "Transfer failed");
            if (isAuthor) emit AuthorPaid(recipients[i], amount);
            else emit ReaderRewarded(recipients[i], amount);
        }
    }

    function treasuryBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function nextDistributionAt() external view returns (uint256) {
        return cycleStart + cycleDuration;
    }

    function setPlatformWallet(address _wallet) external onlyOwner {
        platformWallet = _wallet;
    }

    function setCycleDuration(uint256 _seconds) external onlyOwner {
        cycleDuration = _seconds;
    }
}
