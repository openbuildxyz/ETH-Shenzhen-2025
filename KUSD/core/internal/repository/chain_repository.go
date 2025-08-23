package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type ChainRepository struct {
	db *gorm.DB
}

func NewChainRepository(db *gorm.DB) *ChainRepository {
	return &ChainRepository{
		db: db,
	}
}

func (r *ChainRepository) FindAll() ([]model.Chain, error) {
	var chains []model.Chain
	err := r.db.Find(&chains).Error
	return chains, err
}

func (r *ChainRepository) FindEnabled() ([]model.Chain, error) {
	var chains []model.Chain
	err := r.db.Where("enabled = ?", true).Find(&chains).Error
	return chains, err
}

func (r *ChainRepository) FindByID(id uint64) (*model.Chain, error) {
	var chain model.Chain
	err := r.db.Where("id = ?", id).First(&chain).Error
	if err != nil {
		return nil, err
	}
	return &chain, nil
}

func (r *ChainRepository) FindByChainKey(chainKey string) (*model.Chain, error) {
	var chain model.Chain
	err := r.db.Where("chain_key = ? AND enabled = ?", chainKey, true).First(&chain).Error
	if err != nil {
		return nil, err
	}
	return &chain, nil
}

func (r *ChainRepository) FindByChainID(chainID uint64) (*model.Chain, error) {
	var chain model.Chain
	err := r.db.Where("chain_id = ? AND enabled = ?", chainID, true).First(&chain).Error
	if err != nil {
		return nil, err
	}
	return &chain, nil
}