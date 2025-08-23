package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type DepositAddressRepository struct {
	db *gorm.DB
}

func NewDepositAddressRepository(db *gorm.DB) *DepositAddressRepository {
	return &DepositAddressRepository{
		db: db,
	}
}

func (r *DepositAddressRepository) Create(depositAddress *model.DepositAddress) error {
	return r.db.Create(depositAddress).Error
}

func (r *DepositAddressRepository) FindByUserChainAsset(userID, chainID, assetID uint64) (*model.DepositAddress, error) {
	var depositAddress model.DepositAddress
	err := r.db.Where("user_id = ? AND chain_id = ? AND asset_id = ? AND is_active = ?", 
		userID, chainID, assetID, true).First(&depositAddress).Error
	if err != nil {
		return nil, err
	}
	return &depositAddress, nil
}

func (r *DepositAddressRepository) FindByAddress(address string) (*model.DepositAddress, error) {
	var depositAddress model.DepositAddress
	err := r.db.Preload("User").Preload("Chain").Preload("Asset").
		Where("address = ? AND is_active = ?", address, true).First(&depositAddress).Error
	if err != nil {
		return nil, err
	}
	return &depositAddress, nil
}

func (r *DepositAddressRepository) FindByUserID(userID uint64) ([]model.DepositAddress, error) {
	var addresses []model.DepositAddress
	err := r.db.Preload("Chain").Preload("Asset").
		Where("user_id = ? AND is_active = ?", userID, true).Find(&addresses).Error
	return addresses, err
}