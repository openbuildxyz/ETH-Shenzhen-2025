package repository

import (
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type PlatformMetricsRepository struct {
	db *gorm.DB
}

func NewPlatformMetricsRepository(db *gorm.DB) *PlatformMetricsRepository {
	return &PlatformMetricsRepository{
		db: db,
	}
}

func (r *PlatformMetricsRepository) Create(metrics *model.PlatformMetrics) error {
	return r.db.Create(metrics).Error
}

func (r *PlatformMetricsRepository) GetLatest() (*model.PlatformMetrics, error) {
	var metrics model.PlatformMetrics
	err := r.db.Order("created_at DESC").First(&metrics).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &metrics, nil
}

func (r *PlatformMetricsRepository) GetByPeriod(periodStart, periodEnd string) ([]model.PlatformMetrics, error) {
	var metrics []model.PlatformMetrics
	err := r.db.Where("period_start >= ? AND period_end <= ?", periodStart, periodEnd).
		Order("created_at DESC").Find(&metrics).Error
	return metrics, err
}