package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type WithdrawRequestRepository struct {
	db *gorm.DB
}

func NewWithdrawRequestRepository(db *gorm.DB) *WithdrawRequestRepository {
	return &WithdrawRequestRepository{
		db: db,
	}
}

func (r *WithdrawRequestRepository) Create(request *model.WithdrawRequest) error {
	return r.db.Create(request).Error
}

func (r *WithdrawRequestRepository) FindByID(id uint64) (*model.WithdrawRequest, error) {
	var request model.WithdrawRequest
	err := r.db.Preload("User").Preload("Chain").Preload("Asset").
		Where("id = ?", id).First(&request).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *WithdrawRequestRepository) FindByUserID(userID uint64) ([]model.WithdrawRequest, error) {
	var requests []model.WithdrawRequest
	err := r.db.Preload("Chain").Preload("Asset").
		Where("user_id = ?", userID).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *WithdrawRequestRepository) FindPendingRequests() ([]model.WithdrawRequest, error) {
	var requests []model.WithdrawRequest
	err := r.db.Preload("User").Preload("Chain").Preload("Asset").
		Where("status = ?", "pending").Order("created_at ASC").Find(&requests).Error
	return requests, err
}

func (r *WithdrawRequestRepository) Update(request *model.WithdrawRequest) error {
	return r.db.Save(request).Error
}