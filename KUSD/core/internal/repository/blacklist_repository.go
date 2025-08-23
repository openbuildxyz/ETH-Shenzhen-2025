package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type BlacklistRepository struct {
	db *gorm.DB
}

func NewBlacklistRepository(db *gorm.DB) *BlacklistRepository {
	return &BlacklistRepository{
		db: db,
	}
}

func (r *BlacklistRepository) FindByAddress(address string, chainID uint64) (*model.BlacklistAddress, error) {
	var blacklistAddr model.BlacklistAddress
	err := r.db.Where("address = ? AND (chain_id = ? OR chain_id IS NULL) AND is_active = ?", 
		address, chainID, true).First(&blacklistAddr).Error
	if err != nil {
		return nil, err
	}
	return &blacklistAddr, nil
}

func (r *BlacklistRepository) Create(blacklistAddr *model.BlacklistAddress) error {
	return r.db.Create(blacklistAddr).Error
}

func (r *BlacklistRepository) Update(blacklistAddr *model.BlacklistAddress) error {
	return r.db.Save(blacklistAddr).Error
}

func (r *BlacklistRepository) FindAll() ([]model.BlacklistAddress, error) {
	var addresses []model.BlacklistAddress
	err := r.db.Preload("Chain").Where("is_active = ?", true).Find(&addresses).Error
	return addresses, err
}

func (r *BlacklistRepository) FindByChain(chainID uint64) ([]model.BlacklistAddress, error) {
	var addresses []model.BlacklistAddress
	err := r.db.Where("chain_id = ? AND is_active = ?", chainID, true).Find(&addresses).Error
	return addresses, err
}

func (r *BlacklistRepository) DeactivateByAddress(address string) error {
	return r.db.Model(&model.BlacklistAddress{}).
		Where("address = ?", address).
		Update("is_active", false).Error
}