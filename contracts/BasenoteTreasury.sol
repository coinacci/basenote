// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BasenoteTreasury
 * @notice x402 ödemelerini toplar, aylık dağıtım yapar.
 *
 * Dağıtım oranları:
 *   - Platform : %26
 *   - Yazarlar : %56 (okuma payına göre ağırlıklı)
 *   - Okuyucular: %18 (en aktif okuyucular)
 */
contract BasenoteTreasury is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    uint256 public constant PLATFORM_BPS  = 1500; // %26
    uint256 public constant AUTHOR_BPS    = 7000; // %56
    uint256 public constant READER_BPS    = 1500; // %18
    uint256 public constant BPS_DENOM     = 10000;

    uint256 public distributionInterval = 30 days;
    uint256 public lastDistribution;

    address public platformWallet;

    // Yazar istatistikleri
    struct AuthorStats {
        uint256 totalEarned;   // toplam kazanılan USDC (wei)
        uint256 readCount;     // toplam okuma sayısı
        bool registered;
    }
    mapping(address => AuthorStats) public authors;
    address[] public authorList;

    // Okuyucu istatistikleri (bu ay)
    struct ReaderStats {
        uint256 spentThisCycle; // bu dönemde harcanan USDC
    }
    mapping(address => ReaderStats) public readers;
    address[] public readerList;

    // Makale → yazar
    mapping(bytes32 => address) public articleAuthor;
    // Makale → fiyat (USDC wei)
    mapping(bytes32 => uint256) public articlePrice;

    event ArticlePublished(bytes32 indexed articleId, address indexed author, uint256 price);
    event ArticlePurchased(bytes32 indexed articleId, address indexed reader, address indexed author, uint256 price);
    event DistributionExecuted(uint256 platformAmount, uint256 authorPoolAmount, uint256 readerPoolAmount, uint256 timestamp);
    event AuthorPaid(address indexed author, uint256 amount);
    event ReaderRewarded(address indexed reader, uint256 amount);

    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
        lastDistribution = block.timestamp;
    }

    // ─── YAZAR FONKSİYONLARI ───────────────────────────────────────────

    /**
     * @notice Yazar makale yayınlar. articleId frontend'de uuid'den türetilir.
     */
    function publishArticle(bytes32 articleId, uint256 priceUsdc) external {
        require(articleAuthor[articleId] == address(0), "Makale zaten var");
        require(priceUsdc > 0, "Fiyat sifir olamaz");

        articleAuthor[articleId] = msg.sender;
        articlePrice[articleId] = priceUsdc;

        if (!authors[msg.sender].registered) {
            authors[msg.sender].registered = true;
            authorList.push(msg.sender);
        }

        emit ArticlePublished(articleId, msg.sender, priceUsdc);
    }

    // ─── OKUYUCU FONKSİYONLARI (x402 akışı) ──────────────────────────

    /**
     * @notice x402 ödeme: okuyucu makaleye erişim için USDC öder.
     *         Önce approve, sonra bu fonksiyon çağrılır.
     */
    function purchaseArticle(bytes32 articleId) external nonReentrant {
        address author = articleAuthor[articleId];
        require(author != address(0), "Makale bulunamadi");

        uint256 price = articlePrice[articleId];
        require(usdc.transferFrom(msg.sender, address(this), price), "USDC transfer basarisiz");

        // Yazar okuma sayısını artır
        authors[author].readCount += 1;

        // Okuyucu istatistiklerini güncelle
        if (readers[msg.sender].spentThisCycle == 0) {
            readerList.push(msg.sender);
        }
        readers[msg.sender].spentThisCycle += price;

        emit ArticlePurchased(articleId, msg.sender, author, price);
    }

    // ─── DAĞITIM ──────────────────────────────────────────────────────

    /**
     * @notice Aylık dağıtımı gerçekleştirir.
     *         Owner veya herhangi biri tetikleyebilir (interval geçtikten sonra).
     */
    function distribute(
        address[] calldata topAuthors,
        uint256[] calldata authorWeights,
        address[] calldata topReaders,
        uint256[] calldata readerWeights
    ) external nonReentrant {
        require(block.timestamp >= lastDistribution + distributionInterval, "Henuz zaman dolmadi");
        require(topAuthors.length == authorWeights.length, "Yanlis author params");
        require(topReaders.length == readerWeights.length, "Yanlis reader params");

        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "Kasa bos");

        uint256 platformAmount = (balance * PLATFORM_BPS) / BPS_DENOM;
        uint256 authorPool     = (balance * AUTHOR_BPS)   / BPS_DENOM;
        uint256 readerPool     = balance - platformAmount - authorPool;

        // Platform payı
        require(usdc.transfer(platformWallet, platformAmount), "Platform transfer basarisiz");

        // Yazar payları (ağırlıklı dağıtım)
        _distributeWeighted(topAuthors, authorWeights, authorPool, true);

        // Okuyucu ödülleri
        _distributeWeighted(topReaders, readerWeights, readerPool, false);

        // Okuyucu istatistiklerini sıfırla
        _resetReaderStats();

        lastDistribution = block.timestamp;

        emit DistributionExecuted(platformAmount, authorPool, readerPool, block.timestamp);
    }

    function _distributeWeighted(
        address[] calldata recipients,
        uint256[] calldata weights,
        uint256 pool,
        bool isAuthor
    ) internal {
        uint256 totalWeight;
        for (uint256 i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
        }
        if (totalWeight == 0) return;

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 amount = (pool * weights[i]) / totalWeight;
            if (amount == 0) continue;
            require(usdc.transfer(recipients[i], amount), "Dagitim transfer basarisiz");

            if (isAuthor) {
                authors[recipients[i]].totalEarned += amount;
                emit AuthorPaid(recipients[i], amount);
            } else {
                emit ReaderRewarded(recipients[i], amount);
            }
        }
    }

    function _resetReaderStats() internal {
        for (uint256 i = 0; i < readerList.length; i++) {
            delete readers[readerList[i]];
        }
        delete readerList;
    }

    // ─── VIEW FONKSİYONLARI ───────────────────────────────────────────

    function treasuryBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function nextDistributionAt() external view returns (uint256) {
        return lastDistribution + distributionInterval;
    }

    function getAuthorStats(address author) external view returns (uint256 earned, uint256 reads) {
        return (authors[author].totalEarned, authors[author].readCount);
    }

    function getAuthorList() external view returns (address[] memory) {
        return authorList;
    }

    // ─── ADMIN ────────────────────────────────────────────────────────

    function setPlatformWallet(address _wallet) external onlyOwner {
        platformWallet = _wallet;
    }

    function setDistributionInterval(uint256 _seconds) external onlyOwner {
        distributionInterval = _seconds;
    }
}
