package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type ProofBatchRepository struct {
	db *gorm.DB
}

func NewProofBatchRepository(db *gorm.DB) *ProofBatchRepository {
	return &ProofBatchRepository{
		db: db,
	}
}

func (r *ProofBatchRepository) Create(batch *model.ProofBatch) error {
	return r.db.Create(batch).Error
}

func (r *ProofBatchRepository) FindByID(id uint64) (*model.ProofBatch, error) {
	var batch model.ProofBatch
	err := r.db.Preload("Chain").Where("id = ?", id).First(&batch).Error
	if err != nil {
		return nil, err
	}
	return &batch, nil
}

func (r *ProofBatchRepository) GetLatestPublished(limit int) ([]model.ProofBatch, error) {
	var batches []model.ProofBatch
	err := r.db.Preload("Chain").
		Where("status = ? AND onchain_tx_hash IS NOT NULL", "confirmed").
		Order("published_at DESC").
		Limit(limit).
		Find(&batches).Error
	return batches, err
}

func (r *ProofBatchRepository) FindPendingBatches() ([]model.ProofBatch, error) {
	var batches []model.ProofBatch
	err := r.db.Preload("Chain").
		Where("status = ?", "pending").
		Order("created_at ASC").
		Find(&batches).Error
	return batches, err
}

func (r *ProofBatchRepository) Update(batch *model.ProofBatch) error {
	return r.db.Save(batch).Error
}