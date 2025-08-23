package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type ChainAssetRepository struct {
	db *gorm.DB
}

func NewChainAssetRepository(db *gorm.DB) *ChainAssetRepository {
	return &ChainAssetRepository{
		db: db,
	}
}

func (r *ChainAssetRepository) FindByChainIDWithAsset(chainID uint64) ([]model.ChainAsset, error) {
	var chainAssets []model.ChainAsset
	err := r.db.Preload("Asset").Where("chain_id = ?", chainID).Find(&chainAssets).Error
	return chainAssets, err
}

func (r *ChainAssetRepository) FindByChainAndAsset(chainID, assetID uint64) (*model.ChainAsset, error) {
	var chainAsset model.ChainAsset
	err := r.db.Preload("Chain").Preload("Asset").
		Where("chain_id = ? AND asset_id = ? AND enabled = ?", chainID, assetID, true).
		First(&chainAsset).Error
	if err != nil {
		return nil, err
	}
	return &chainAsset, nil
}