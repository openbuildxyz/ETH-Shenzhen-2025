package repository

import (
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"usdk-backend/internal/model"
)

type LedgerRepository struct {
	db *gorm.DB
}

func NewLedgerRepository(db *gorm.DB) *LedgerRepository {
	return &LedgerRepository{
		db: db,
	}
}

func (r *LedgerRepository) Create(entry *model.LedgerEntry) error {
	return r.db.Create(entry).Error
}

func (r *LedgerRepository) GetUserKUSDBalance(userID uint64) (decimal.Decimal, error) {
	var result struct {
		Balance decimal.Decimal
	}
	
	err := r.db.Table("ledger_entries").
		Select("COALESCE(SUM(kusd_delta), 0) as balance").
		Where("user_id = ?", userID).
		Scan(&result).Error
	
	if err != nil {
		return decimal.Zero, err
	}
	
	return result.Balance, nil
}

func (r *LedgerRepository) GetUserRecordsPaginated(userID uint64, entryType string, offset uint64, limit int) ([]model.LedgerEntry, error) {
	query := r.db.Preload("Chain").Preload("Asset").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(int(offset)).
		Limit(limit)
	
	if entryType != "" {
		query = query.Where("entry_type = ?", entryType)
	}
	
	var entries []model.LedgerEntry
	err := query.Find(&entries).Error
	return entries, err
}

func (r *LedgerRepository) FindByBatchID(batchID uint64) ([]model.LedgerEntry, error) {
	var entries []model.LedgerEntry
	err := r.db.Preload("User").Preload("Chain").Preload("Asset").
		Where("batch_id = ?", batchID).Find(&entries).Error
	return entries, err
}

func (r *LedgerRepository) GetUserEntriesByType(userID uint64, entryType string) ([]model.LedgerEntry, error) {
	var entries []model.LedgerEntry
	err := r.db.Preload("Chain").Preload("Asset").
		Where("user_id = ? AND entry_type = ?", userID, entryType).
		Order("created_at DESC").Find(&entries).Error
	return entries, err
}