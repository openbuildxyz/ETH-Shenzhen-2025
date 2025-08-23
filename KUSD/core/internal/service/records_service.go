package service

import (
	"encoding/base64"
	"strconv"
	"time"

	"usdk-backend/internal/repository"
)

type RecordsService struct {
	ledgerRepo *repository.LedgerRepository
}

func NewRecordsService(ledgerRepo *repository.LedgerRepository) *RecordsService {
	return &RecordsService{
		ledgerRepo: ledgerRepo,
	}
}

type RecordItem struct {
	ID        uint64    `json:"id"`
	Type      string    `json:"type"`
	Amount    string    `json:"amount"`
	KusdDelta string    `json:"kusdDelta"`
	Chain     *string   `json:"chain"`
	Asset     *string   `json:"asset"`
	TxHash    *string   `json:"txHash"`
	ProofRoot *string   `json:"proofRoot"`
	CreatedAt time.Time `json:"createdAt"`
}

type RecordsResponse struct {
	Records    []RecordItem `json:"records"`
	NextCursor *string      `json:"nextCursor"`
}

func (s *RecordsService) GetUserRecords(userID uint64, recordType, cursor string, limit int) (*RecordsResponse, error) {
	var offset uint64 = 0
	
	// Parse cursor if provided
	if cursor != "" {
		cursorBytes, err := base64.StdEncoding.DecodeString(cursor)
		if err == nil {
			if parsedOffset, err := strconv.ParseUint(string(cursorBytes), 10, 64); err == nil {
				offset = parsedOffset
			}
		}
	}

	// Get records from repository
	entries, err := s.ledgerRepo.GetUserRecordsPaginated(userID, recordType, offset, limit+1)
	if err != nil {
		return nil, err
	}

	// Process records
	var records []RecordItem
	hasMore := len(entries) > limit
	
	recordsToProcess := entries
	if hasMore {
		recordsToProcess = entries[:limit]
	}

	for _, entry := range recordsToProcess {
		record := RecordItem{
			ID:        entry.ID,
			Type:      entry.EntryType,
			Amount:    entry.Amount.String(),
			KusdDelta: entry.KusdDelta.String(),
			TxHash:    entry.RefTxHash,
			ProofRoot: entry.ProofRoot,
			CreatedAt: entry.CreatedAt,
		}

		// Add chain and asset info if available
		if entry.Chain != nil {
			record.Chain = &entry.Chain.ChainKey
		}
		if entry.Asset != nil {
			record.Asset = &entry.Asset.Symbol
		}

		records = append(records, record)
	}

	// Generate next cursor if there are more records
	var nextCursor *string
	if hasMore {
		nextOffset := offset + uint64(limit)
		cursorStr := base64.StdEncoding.EncodeToString([]byte(strconv.FormatUint(nextOffset, 10)))
		nextCursor = &cursorStr
	}

	return &RecordsResponse{
		Records:    records,
		NextCursor: nextCursor,
	}, nil
}