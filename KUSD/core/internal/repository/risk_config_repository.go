package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type RiskConfigRepository struct {
	db *gorm.DB
}

func NewRiskConfigRepository(db *gorm.DB) *RiskConfigRepository {
	return &RiskConfigRepository{
		db: db,
	}
}

func (r *RiskConfigRepository) FindByKey(key string) (*model.RiskConfig, error) {
	var config model.RiskConfig
	err := r.db.Where("config_key = ?", key).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func (r *RiskConfigRepository) FindAll() ([]model.RiskConfig, error) {
	var configs []model.RiskConfig
	err := r.db.Find(&configs).Error
	return configs, err
}

func (r *RiskConfigRepository) Create(config *model.RiskConfig) error {
	return r.db.Create(config).Error
}

func (r *RiskConfigRepository) Update(config *model.RiskConfig) error {
	return r.db.Save(config).Error
}

func (r *RiskConfigRepository) UpdateByKey(key, value string) error {
	return r.db.Model(&model.RiskConfig{}).
		Where("config_key = ?", key).
		Updates(map[string]interface{}{
			"config_value": value,
			"updated_at":   gorm.Expr("NOW()"),
		}).Error
}