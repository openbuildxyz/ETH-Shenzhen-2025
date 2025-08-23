-- USDK Privacy Stablecoin Backend Database Schema
-- MySQL compatible

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS kusd DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kusd;

-- 用户与鉴权表
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  wallet_addr VARCHAR(128) UNIQUE,
  email VARCHAR(128),
  nonce VARCHAR(64) COMMENT 'for SIWE login',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wallet_addr (wallet_addr)
) COMMENT '用户表';

-- 支持的区块链
CREATE TABLE chains (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  chain_key VARCHAR(32) UNIQUE NOT NULL COMMENT 'ethereum, arbitrum, optimism',
  chain_id BIGINT NOT NULL COMMENT '1, 42161, 10',
  name VARCHAR(64) NOT NULL,
  rpc_url VARCHAR(256),
  explorer_base VARCHAR(128),
  usdk_contract VARCHAR(128) COMMENT 'USDK token contract address',
  proof_registry VARCHAR(128) COMMENT 'ProofRegistry contract address',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chain_key (chain_key),
  INDEX idx_chain_id (chain_id)
) COMMENT '支持的区块链';

-- 支持的资产
CREATE TABLE assets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(16) UNIQUE NOT NULL COMMENT 'USDT, USDC, ETH, BTC',
  name VARCHAR(64) NOT NULL,
  decimals INT NOT NULL,
  asset_type VARCHAR(16) NOT NULL COMMENT 'stable, eth, btc',
  min_deposit DECIMAL(38,18) DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_symbol (symbol),
  INDEX idx_asset_type (asset_type)
) COMMENT '支持的资产';

-- 链-资产关系表（多对多）
CREATE TABLE chain_assets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  chain_id BIGINT NOT NULL,
  asset_id BIGINT NOT NULL,
  contract_address VARCHAR(128) COMMENT 'token contract address on this chain',
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE KEY uk_chain_asset (chain_id, asset_id),
  FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) COMMENT '链-资产关系表';

-- 用户专属充值地址
CREATE TABLE deposit_addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  chain_id BIGINT NOT NULL,
  asset_id BIGINT NOT NULL,
  address VARCHAR(128) UNIQUE NOT NULL,
  derivation_path VARCHAR(128) COMMENT 'HD/MPC metadata',
  private_key_ref VARCHAR(256) COMMENT 'encrypted or KMS reference',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_chain_asset (user_id, chain_id, asset_id),
  INDEX idx_address (address),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chain_id) REFERENCES chains(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id)
) COMMENT '用户专属充值地址';

-- 链上充值与提现记录（原始交易）
CREATE TABLE onchain_txs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  direction VARCHAR(8) NOT NULL COMMENT 'in or out',
  user_id BIGINT,
  chain_id BIGINT NOT NULL,
  asset_id BIGINT NOT NULL,
  from_addr VARCHAR(128),
  to_addr VARCHAR(128) NOT NULL,
  tx_hash VARCHAR(128) UNIQUE NOT NULL,
  amount DECIMAL(38,18) NOT NULL,
  block_num BIGINT,
  gas_used BIGINT,
  gas_price DECIMAL(38,18),
  status VARCHAR(16) DEFAULT 'pending' COMMENT 'pending, confirmed, failed',
  confirmations INT DEFAULT 0,
  seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  INDEX idx_user_direction (user_id, direction),
  INDEX idx_chain_block (chain_id, block_num),
  INDEX idx_tx_hash (tx_hash),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (chain_id) REFERENCES chains(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id)
) COMMENT '链上交易记录';

-- 估值快照（用户资产 -> KUSD）
CREATE TABLE valuations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  total_kusd DECIMAL(38,18) NOT NULL,
  detail_json JSON COMMENT '各资产估值明细',
  snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_snapshot (user_id, snapshot_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '资产估值快照';

-- 平台净值与目标 APY
CREATE TABLE platform_metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tvl_kusd DECIMAL(38,18) NOT NULL DEFAULT 0,
  target_apy DECIMAL(10,4) NOT NULL DEFAULT 0.2000 COMMENT '0.2000 = 20%',
  actual_apy DECIMAL(10,4),
  pnl_kusd DECIMAL(38,18) DEFAULT 0,
  yield_generated DECIMAL(38,18) DEFAULT 0,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT '平台指标';

-- 汇率/喂价数据
CREATE TABLE price_feeds (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  asset_id BIGINT NOT NULL,
  price_usd DECIMAL(38,18) NOT NULL,
  source VARCHAR(32) NOT NULL COMMENT 'chainlink, pyth, coingecko',
  confidence DECIMAL(10,4) COMMENT 'confidence interval',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asset_updated (asset_id, updated_at),
  FOREIGN KEY (asset_id) REFERENCES assets(id)
) COMMENT '汇率/喂价数据';

-- 收益&交易账本（内部归集）
CREATE TABLE ledger_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  entry_type VARCHAR(16) NOT NULL COMMENT 'deposit, withdraw, yield, trade, fee',
  chain_id BIGINT,
  asset_id BIGINT,
  amount DECIMAL(38,18) NOT NULL COMMENT '正负值',
  kusd_delta DECIMAL(38,18) NOT NULL,
  kusd_balance_after DECIMAL(38,18),
  ref_tx_hash VARCHAR(128) COMMENT '关联的链上交易',
  ref_onchain_tx_id BIGINT,
  proof_root VARCHAR(128) COMMENT '对应批次 Merkle 根',
  batch_id BIGINT COMMENT '关联 proof_batches',
  metadata JSON COMMENT '额外信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_type_time (user_id, entry_type, created_at),
  INDEX idx_proof_root (proof_root),
  INDEX idx_batch_id (batch_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chain_id) REFERENCES chains(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (ref_onchain_tx_id) REFERENCES onchain_txs(id)
) COMMENT '收益&交易账本';

-- 批次证明（上链）
CREATE TABLE proof_batches (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_type VARCHAR(16) NOT NULL COMMENT 'deposit, yield, trade, withdraw',
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  merkle_root VARCHAR(128) UNIQUE NOT NULL,
  oracle_sig VARCHAR(512) COMMENT '预言机签名',
  onchain_tx_hash VARCHAR(128) COMMENT '上链交易哈希',
  chain_id BIGINT,
  contract_addr VARCHAR(128) COMMENT 'ProofRegistry 合约地址',
  block_num BIGINT,
  gas_used BIGINT,
  status VARCHAR(16) DEFAULT 'pending' COMMENT 'pending, confirmed, failed',
  ipfs_hash VARCHAR(64) COMMENT '详细数据的 IPFS 哈希',
  entry_count INT DEFAULT 0 COMMENT '本批次包含的记录数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  INDEX idx_type_period (batch_type, period_start, period_end),
  INDEX idx_merkle_root (merkle_root),
  INDEX idx_chain_block (chain_id, block_num),
  FOREIGN KEY (chain_id) REFERENCES chains(id)
) COMMENT '批次证明';

-- 提现申请表
CREATE TABLE withdraw_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  chain_id BIGINT NOT NULL,
  asset_id BIGINT NOT NULL,
  amount DECIMAL(38,18) NOT NULL,
  to_address VARCHAR(128) NOT NULL,
  fee DECIMAL(38,18) DEFAULT 0,
  status VARCHAR(16) DEFAULT 'pending' COMMENT 'pending, approved, rejected, processing, completed, failed',
  risk_score DECIMAL(4,2) COMMENT '风控评分',
  admin_notes TEXT,
  tx_hash VARCHAR(128) COMMENT '实际提现交易哈希',
  ledger_entry_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  INDEX idx_user_status (user_id, status),
  INDEX idx_status_created (status, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chain_id) REFERENCES chains(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (ledger_entry_id) REFERENCES ledger_entries(id)
) COMMENT '提现申请表';

-- 用户白名单（提现地址）
CREATE TABLE withdrawal_whitelist (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  chain_id BIGINT NOT NULL,
  address VARCHAR(128) NOT NULL,
  label VARCHAR(64),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_chain_address (user_id, chain_id, address),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chain_id) REFERENCES chains(id)
) COMMENT '提现白名单';

-- 风控配置
CREATE TABLE risk_configs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(64) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '风控配置';

-- 黑名单地址
CREATE TABLE blacklist_addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(128) UNIQUE NOT NULL,
  chain_id BIGINT,
  reason VARCHAR(256),
  source VARCHAR(64) COMMENT 'manual, chainalysis, etc.',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_address_chain (address, chain_id),
  FOREIGN KEY (chain_id) REFERENCES chains(id)
) COMMENT '黑名单地址';

-- 系统配置表
CREATE TABLE system_configs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(64) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  config_type VARCHAR(16) DEFAULT 'string' COMMENT 'string, number, boolean, json',
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '系统配置';

-- 审计日志
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  action VARCHAR(64) NOT NULL,
  resource_type VARCHAR(32),
  resource_id VARCHAR(64),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_action_created (action, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT '审计日志';

-- 插入初始数据
INSERT INTO chains (chain_key, chain_id, name, explorer_base, enabled) VALUES
('ethereum', 1, 'Ethereum Mainnet', 'https://etherscan.io', TRUE),
('arbitrum', 42161, 'Arbitrum One', 'https://arbiscan.io', TRUE),
('optimism', 10, 'Optimism', 'https://optimistic.etherscan.io', TRUE),
('polygon', 137, 'Polygon', 'https://polygonscan.com', TRUE),
('base', 8453, 'Base', 'https://basescan.org', TRUE);

INSERT INTO assets (symbol, name, decimals, asset_type, min_deposit, enabled) VALUES
('USDC', 'USD Coin', 6, 'stable', 10, TRUE),
('USDT', 'Tether USD', 6, 'stable', 10, TRUE),
('DAI', 'Dai Stablecoin', 18, 'stable', 10, TRUE),
('ETH', 'Ethereum', 18, 'eth', 0.01, TRUE),
('WETH', 'Wrapped Ethereum', 18, 'eth', 0.01, TRUE),
('BTC', 'Bitcoin', 8, 'btc', 0.001, FALSE),
('WBTC', 'Wrapped Bitcoin', 8, 'btc', 0.001, TRUE);

-- 插入链-资产关系（示例）
INSERT INTO chain_assets (chain_id, asset_id, contract_address, enabled) VALUES
-- Ethereum mainnet
(1, 1, '0xa0b86a33e6e7f8d5d4df7d1b3b0b1b0b0b0b0b0b', TRUE), -- USDC
(1, 2, '0xdac17f958d2ee523a2206206994597c13d831ec7', TRUE), -- USDT
(1, 3, '0x6b175474e89094c44da98b954eedeac495271d0f', TRUE), -- DAI
(1, 4, '0x0000000000000000000000000000000000000000', TRUE), -- ETH (native)
(1, 5, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', TRUE), -- WETH
(1, 7, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', TRUE), -- WBTC

-- Arbitrum One
(2, 1, '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', TRUE), -- USDC
(2, 2, '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', TRUE), -- USDT
(2, 4, '0x0000000000000000000000000000000000000000', TRUE), -- ETH (native)
(2, 5, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', TRUE), -- WETH
(2, 7, '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', TRUE); -- WBTC

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, config_type, description) VALUES
('target_apy', '0.20', 'number', 'Target APY for the platform (20%)'),
('min_withdrawal_amount', '10', 'number', 'Minimum withdrawal amount in KUSD'),
('max_daily_withdrawal', '50000', 'number', 'Maximum daily withdrawal per user in KUSD'),
('withdrawal_fee_rate', '0.001', 'number', 'Withdrawal fee rate (0.1%)'),
('proof_batch_interval', '86400', 'number', 'Proof batch interval in seconds (24 hours)'),
('confirmation_blocks', '12', 'number', 'Required confirmation blocks for deposits');

-- 插入风控配置
INSERT INTO risk_configs (config_key, config_value, description) VALUES
('max_daily_deposit', '100000', 'Maximum daily deposit per user in KUSD'),
('kyc_withdrawal_limit', '1000', 'Withdrawal limit without KYC in KUSD'),
('suspicious_pattern_threshold', '10000', 'Threshold for suspicious pattern detection'),
('aml_check_enabled', 'true', 'Enable AML checks for transactions');