package service

import (
	"time"

	"usdk-backend/internal/repository"
)

type ProofsService struct {
	proofBatchRepo *repository.ProofBatchRepository
}

func NewProofsService(proofBatchRepo *repository.ProofBatchRepository) *ProofsService {
	return &ProofsService{
		proofBatchRepo: proofBatchRepo,
	}
}

type PeriodInfo struct {
	Start int64 `json:"start"`
	End   int64 `json:"end"`
}

type OnchainInfo struct {
	Chain    string `json:"chain"`
	Contract string `json:"contract"`
	Tx       string `json:"tx"`
}

type ProofBatchInfo struct {
	Type       string       `json:"type"`
	Period     PeriodInfo   `json:"period"`
	MerkleRoot string       `json:"merkleRoot"`
	Onchain    *OnchainInfo `json:"onchain"`
}

type ProofsResponse []ProofBatchInfo

func (s *ProofsService) GetLatestProofs() (ProofsResponse, error) {
	// Get latest proof batches that have been published on-chain
	batches, err := s.proofBatchRepo.GetLatestPublished(10)
	if err != nil {
		return nil, err
	}

	var proofs ProofsResponse
	for _, batch := range batches {
		proof := ProofBatchInfo{
			Type:       batch.BatchType,
			MerkleRoot: batch.MerkleRoot,
			Period: PeriodInfo{
				Start: batch.PeriodStart.Unix(),
				End:   batch.PeriodEnd.Unix(),
			},
		}

		// Add onchain info if available
		if batch.OnchainTxHash != nil && batch.Chain != nil && batch.ContractAddr != nil {
			proof.Onchain = &OnchainInfo{
				Chain:    batch.Chain.ChainKey,
				Contract: *batch.ContractAddr,
				Tx:       *batch.OnchainTxHash,
			}
		}

		proofs = append(proofs, proof)
	}

	return proofs, nil
}