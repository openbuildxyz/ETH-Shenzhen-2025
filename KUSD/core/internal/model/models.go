package model

import (
	"encoding/json"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// User 用户表
type User struct {
	ID         uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	WalletAddr *string   `json:"walletAddr" gorm:"uniqueIndex;size:128"`
	Email      *string   `json:"email" gorm:"size:128"`
	Nonce      *string   `json:"nonce" gorm:"size:64"` // for SIWE login
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// Chain 支持的区块链
type Chain struct {
	ID            uint64  `json:"id" gorm:"primaryKey;autoIncrement"`
	ChainKey      string  `json:"chainKey" gorm:"uniqueIndex;size:32;not null"` // ethereum, arbitrum
	ChainID       uint64  `json:"chainId" gorm:"not null"`                      // 1, 42161
	Name          string  `json:"name" gorm:"size:64;not null"`
	RpcURL        *string `json:"rpcUrl" gorm:"size:256"`
	ExplorerBase  *string `json:"explorerBase" gorm:"size:128"`
	UsdkContract  *string `json:"usdkContract" gorm:"size:128"`  // USDK token contract
	ProofRegistry *string `json:"proofRegistry" gorm:"size:128"` // ProofRegistry contract
	Enabled       bool    `json:"enabled" gorm:"default:true"`
	CreatedAt     time.Time `json:"createdAt"`
}

// Asset 支持的资产
type Asset struct {
	ID         uint64          `json:"id" gorm:"primaryKey;autoIncrement"`
	Symbol     string          `json:"symbol" gorm:"uniqueIndex;size:16;not null"` // USDT, USDC
	Name       string          `json:"name" gorm:"size:64;not null"`
	Decimals   int             `json:"decimals" gorm:"not null"`
	AssetType  string          `json:"assetType" gorm:"size:16;not null"` // stable, eth, btc
	MinDeposit decimal.Decimal `json:"minDeposit" gorm:"type:decimal(38,18);default:0"`
	Enabled    bool            `json:"enabled" gorm:"default:true"`
	CreatedAt  time.Time       `json:"createdAt"`
}

// ChainAsset 链-资产关系表
type ChainAsset struct {
	ID              uint64  `json:"id" gorm:"primaryKey;autoIncrement"`
	ChainID         uint64  `json:"chainId" gorm:"not null;uniqueIndex:idx_chain_asset"`
	AssetID         uint64  `json:"assetId" gorm:"not null;uniqueIndex:idx_chain_asset"`
	ContractAddress *string `json:"contractAddress" gorm:"size:128"` // token contract on this chain
	Enabled         bool    `json:"enabled" gorm:"default:true"`
	Chain           Chain   `json:"chain" gorm:"foreignKey:ChainID"`
	Asset           Asset   `json:"asset" gorm:"foreignKey:AssetID"`
}

// DepositAddress 用户专属充值地址
type DepositAddress struct {
	ID             uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID         uint64    `json:"userId" gorm:"not null;uniqueIndex:idx_user_chain_asset"`
	ChainID        uint64    `json:"chainId" gorm:"not null;uniqueIndex:idx_user_chain_asset"`
	AssetID        uint64    `json:"assetId" gorm:"not null;uniqueIndex:idx_user_chain_asset"`
	Address        string    `json:"address" gorm:"uniqueIndex;size:128;not null"`
	DerivationPath *string   `json:"derivationPath" gorm:"size:128"` // HD/MPC metadata
	PrivateKeyRef  *string   `json:"privateKeyRef" gorm:"size:256"`  // encrypted or KMS reference
	IsActive       bool      `json:"isActive" gorm:"default:true"`
	CreatedAt      time.Time `json:"createdAt"`
	User           User      `json:"user" gorm:"foreignKey:UserID"`
	Chain          Chain     `json:"chain" gorm:"foreignKey:ChainID"`
	Asset          Asset     `json:"asset" gorm:"foreignKey:AssetID"`
}

// OnchainTx 链上交易记录
type OnchainTx struct {
	ID            uint64           `json:"id" gorm:"primaryKey;autoIncrement"`
	Direction     string           `json:"direction" gorm:"size:8;not null"` // in, out
	UserID        *uint64          `json:"userId"`
	ChainID       uint64           `json:"chainId" gorm:"not null"`
	AssetID       uint64           `json:"assetId" gorm:"not null"`
	FromAddr      *string          `json:"fromAddr" gorm:"size:128"`
	ToAddr        string           `json:"toAddr" gorm:"size:128;not null"`
	TxHash        string           `json:"txHash" gorm:"uniqueIndex;size:128;not null"`
	Amount        decimal.Decimal  `json:"amount" gorm:"type:decimal(38,18);not null"`
	BlockNum      *uint64          `json:"blockNum"`
	GasUsed       *uint64          `json:"gasUsed"`
	GasPrice      *decimal.Decimal `json:"gasPrice" gorm:"type:decimal(38,18)"`
	Status        string           `json:"status" gorm:"size:16;default:'pending'"` // pending, confirmed, failed
	Confirmations int              `json:"confirmations" gorm:"default:0"`
	SeenAt        time.Time        `json:"seenAt" gorm:"default:CURRENT_TIMESTAMP"`
	ConfirmedAt   *time.Time       `json:"confirmedAt"`
	User          *User            `json:"user" gorm:"foreignKey:UserID"`
	Chain         Chain            `json:"chain" gorm:"foreignKey:ChainID"`
	Asset         Asset            `json:"asset" gorm:"foreignKey:AssetID"`
}

// Valuation 资产估值快照
type Valuation struct {
	ID         uint64          `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID     uint64          `json:"userId" gorm:"not null"`
	TotalKusd  decimal.Decimal `json:"totalKusd" gorm:"type:decimal(38,18);not null"`
	DetailJSON json.RawMessage `json:"detailJson" gorm:"type:json"` // 各资产估值明细
	SnapshotAt time.Time       `json:"snapshotAt" gorm:"default:CURRENT_TIMESTAMP"`
	User       User            `json:"user" gorm:"foreignKey:UserID"`
}

// PlatformMetrics 平台指标
type PlatformMetrics struct {
	ID             uint64           `json:"id" gorm:"primaryKey;autoIncrement"`
	TvlKusd        decimal.Decimal  `json:"tvlKusd" gorm:"type:decimal(38,18);not null;default:0"`
	TargetApy      decimal.Decimal  `json:"targetApy" gorm:"type:decimal(10,4);not null;default:0.2000"` // 20%
	ActualApy      *decimal.Decimal `json:"actualApy" gorm:"type:decimal(10,4)"`
	PnlKusd        decimal.Decimal  `json:"pnlKusd" gorm:"type:decimal(38,18);default:0"`
	YieldGenerated decimal.Decimal  `json:"yieldGenerated" gorm:"type:decimal(38,18);default:0"`
	PeriodStart    *time.Time       `json:"periodStart"`
	PeriodEnd      *time.Time       `json:"periodEnd"`
	CreatedAt      time.Time        `json:"createdAt"`
}

// PriceFeed 价格喂送数据
type PriceFeed struct {
	ID         uint64           `json:"id" gorm:"primaryKey;autoIncrement"`
	AssetID    uint64           `json:"assetId" gorm:"not null"`
	PriceUsd   decimal.Decimal  `json:"priceUsd" gorm:"type:decimal(38,18);not null"`
	Source     string           `json:"source" gorm:"size:32;not null"` // chainlink, pyth, coingecko
	Confidence *decimal.Decimal `json:"confidence" gorm:"type:decimal(10,4)"`
	UpdatedAt  time.Time        `json:"updatedAt"`
	Asset      Asset            `json:"asset" gorm:"foreignKey:AssetID"`
}

// LedgerEntry 账本记录
type LedgerEntry struct {
	ID                uint64           `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID            uint64           `json:"userId" gorm:"not null"`
	EntryType         string           `json:"entryType" gorm:"size:16;not null"` // deposit, withdraw, yield, trade, fee
	ChainID           *uint64          `json:"chainId"`
	AssetID           *uint64          `json:"assetId"`
	Amount            decimal.Decimal  `json:"amount" gorm:"type:decimal(38,18);not null"` // 正负值
	KusdDelta         decimal.Decimal  `json:"kusdDelta" gorm:"type:decimal(38,18);not null"`
	KusdBalanceAfter  *decimal.Decimal `json:"kusdBalanceAfter" gorm:"type:decimal(38,18)"`
	RefTxHash         *string          `json:"refTxHash" gorm:"size:128"`
	RefOnchainTxID    *uint64          `json:"refOnchainTxId"`
	ProofRoot         *string          `json:"proofRoot" gorm:"size:128"`
	BatchID           *uint64          `json:"batchId"`
	Metadata          json.RawMessage  `json:"metadata" gorm:"type:json"`
	CreatedAt         time.Time        `json:"createdAt"`
	User              User             `json:"user" gorm:"foreignKey:UserID"`
	Chain             *Chain           `json:"chain" gorm:"foreignKey:ChainID"`
	Asset             *Asset           `json:"asset" gorm:"foreignKey:AssetID"`
	RefOnchainTx      *OnchainTx       `json:"refOnchainTx" gorm:"foreignKey:RefOnchainTxID"`
}

// ProofBatch 批次证明
type ProofBatch struct {
	ID            uint64     `json:"id" gorm:"primaryKey;autoIncrement"`
	BatchType     string     `json:"batchType" gorm:"size:16;not null"` // deposit, yield, trade, withdraw
	PeriodStart   time.Time  `json:"periodStart" gorm:"not null"`
	PeriodEnd     time.Time  `json:"periodEnd" gorm:"not null"`
	MerkleRoot    string     `json:"merkleRoot" gorm:"uniqueIndex;size:128;not null"`
	OracleSig     *string    `json:"oracleSig" gorm:"size:512"`
	OnchainTxHash *string    `json:"onchainTxHash" gorm:"size:128"`
	ChainID       *uint64    `json:"chainId"`
	ContractAddr  *string    `json:"contractAddr" gorm:"size:128"`
	BlockNum      *uint64    `json:"blockNum"`
	GasUsed       *uint64    `json:"gasUsed"`
	Status        string     `json:"status" gorm:"size:16;default:'pending'"` // pending, confirmed, failed
	IpfsHash      *string    `json:"ipfsHash" gorm:"size:64"`
	EntryCount    int        `json:"entryCount" gorm:"default:0"`
	CreatedAt     time.Time  `json:"createdAt"`
	PublishedAt   *time.Time `json:"publishedAt"`
	Chain         *Chain     `json:"chain" gorm:"foreignKey:ChainID"`
}

// WithdrawRequest 提现申请
type WithdrawRequest struct {
	ID              uint64           `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID          uint64           `json:"userId" gorm:"not null"`
	ChainID         uint64           `json:"chainId" gorm:"not null"`
	AssetID         uint64           `json:"assetId" gorm:"not null"`
	Amount          decimal.Decimal  `json:"amount" gorm:"type:decimal(38,18);not null"`
	ToAddress       string           `json:"toAddress" gorm:"size:128;not null"`
	Fee             decimal.Decimal  `json:"fee" gorm:"type:decimal(38,18);default:0"`
	Status          string           `json:"status" gorm:"size:16;default:'pending'"` // pending, approved, rejected, processing, completed, failed
	RiskScore       *decimal.Decimal `json:"riskScore" gorm:"type:decimal(4,2)"`
	AdminNotes      *string          `json:"adminNotes" gorm:"type:text"`
	TxHash          *string          `json:"txHash" gorm:"size:128"`
	LedgerEntryID   *uint64          `json:"ledgerEntryId"`
	CreatedAt       time.Time        `json:"createdAt"`
	ProcessedAt     *time.Time       `json:"processedAt"`
	User            User             `json:"user" gorm:"foreignKey:UserID"`
	Chain           Chain            `json:"chain" gorm:"foreignKey:ChainID"`
	Asset           Asset            `json:"asset" gorm:"foreignKey:AssetID"`
	LedgerEntry     *LedgerEntry     `json:"ledgerEntry" gorm:"foreignKey:LedgerEntryID"`
}

// WithdrawalWhitelist 提现白名单
type WithdrawalWhitelist struct {
	ID        uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    uint64    `json:"userId" gorm:"not null;uniqueIndex:idx_user_chain_address"`
	ChainID   uint64    `json:"chainId" gorm:"not null;uniqueIndex:idx_user_chain_address"`
	Address   string    `json:"address" gorm:"size:128;not null;uniqueIndex:idx_user_chain_address"`
	Label     *string   `json:"label" gorm:"size:64"`
	IsActive  bool      `json:"isActive" gorm:"default:true"`
	CreatedAt time.Time `json:"createdAt"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Chain     Chain     `json:"chain" gorm:"foreignKey:ChainID"`
}

// RiskConfig 风控配置
type RiskConfig struct {
	ID          uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	ConfigKey   string    `json:"configKey" gorm:"uniqueIndex;size:64;not null"`
	ConfigValue string    `json:"configValue" gorm:"type:text;not null"`
	Description *string   `json:"description" gorm:"type:text"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// BlacklistAddress 黑名单地址
type BlacklistAddress struct {
	ID        uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	Address   string    `json:"address" gorm:"uniqueIndex;size:128;not null"`
	ChainID   *uint64   `json:"chainId"`
	Reason    *string   `json:"reason" gorm:"size:256"`
	Source    *string   `json:"source" gorm:"size:64"` // manual, chainalysis, etc.
	IsActive  bool      `json:"isActive" gorm:"default:true"`
	CreatedAt time.Time `json:"createdAt"`
	Chain     *Chain    `json:"chain" gorm:"foreignKey:ChainID"`
}

// SystemConfig 系统配置
type SystemConfig struct {
	ID          uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	ConfigKey   string    `json:"configKey" gorm:"uniqueIndex;size:64;not null"`
	ConfigValue string    `json:"configValue" gorm:"type:text;not null"`
	ConfigType  string    `json:"configType" gorm:"size:16;default:'string'"` // string, number, boolean, json
	Description *string   `json:"description" gorm:"type:text"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// AuditLog 审计日志
type AuditLog struct {
	ID           uint64          `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID       *uint64         `json:"userId"`
	Action       string          `json:"action" gorm:"size:64;not null"`
	ResourceType *string         `json:"resourceType" gorm:"size:32"`
	ResourceID   *string         `json:"resourceId" gorm:"size:64"`
	OldValues    json.RawMessage `json:"oldValues" gorm:"type:json"`
	NewValues    json.RawMessage `json:"newValues" gorm:"type:json"`
	IPAddress    *string         `json:"ipAddress" gorm:"size:45"`
	UserAgent    *string         `json:"userAgent" gorm:"type:text"`
	CreatedAt    time.Time       `json:"createdAt"`
	User         *User           `json:"user" gorm:"foreignKey:UserID"`
}

// TableName methods for custom table names if needed
func (User) TableName() string              { return "users" }
func (Chain) TableName() string             { return "chains" }
func (Asset) TableName() string             { return "assets" }
func (ChainAsset) TableName() string        { return "chain_assets" }
func (DepositAddress) TableName() string    { return "deposit_addresses" }
func (OnchainTx) TableName() string         { return "onchain_txs" }
func (Valuation) TableName() string         { return "valuations" }
func (PlatformMetrics) TableName() string   { return "platform_metrics" }
func (PriceFeed) TableName() string         { return "price_feeds" }
func (LedgerEntry) TableName() string       { return "ledger_entries" }
func (ProofBatch) TableName() string        { return "proof_batches" }
func (WithdrawRequest) TableName() string   { return "withdraw_requests" }
func (WithdrawalWhitelist) TableName() string { return "withdrawal_whitelist" }
func (RiskConfig) TableName() string        { return "risk_configs" }
func (BlacklistAddress) TableName() string  { return "blacklist_addresses" }
func (SystemConfig) TableName() string      { return "system_configs" }
func (AuditLog) TableName() string          { return "audit_logs" }