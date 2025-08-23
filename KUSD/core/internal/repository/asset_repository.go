package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type AssetRepository struct {
	db *gorm.DB
}

func NewAssetRepository(db *gorm.DB) *AssetRepository {
	return &AssetRepository{
		db: db,
	}
}

func (r *AssetRepository) FindAll() ([]model.Asset, error) {
	var assets []model.Asset
	err := r.db.Find(&assets).Error
	return assets, err
}

func (r *AssetRepository) FindEnabled() ([]model.Asset, error) {
	var assets []model.Asset
	err := r.db.Where("enabled = ?", true).Find(&assets).Error
	return assets, err
}

func (r *AssetRepository) FindByID(id uint64) (*model.Asset, error) {
	var asset model.Asset
	err := r.db.Where("id = ?", id).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (r *AssetRepository) FindBySymbol(symbol string) (*model.Asset, error) {
	var asset model.Asset
	err := r.db.Where("symbol = ? AND enabled = ?", symbol, true).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}