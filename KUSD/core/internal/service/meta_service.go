package service

import (
	"usdk-backend/internal/model"
	"usdk-backend/internal/repository"
)

type MetaService struct {
	chainRepo     *repository.ChainRepository
	assetRepo     *repository.AssetRepository
	chainAssetRepo *repository.ChainAssetRepository
}

func NewMetaService(chainRepo *repository.ChainRepository, assetRepo *repository.AssetRepository, chainAssetRepo *repository.ChainAssetRepository) *MetaService {
	return &MetaService{
		chainRepo:     chainRepo,
		assetRepo:     assetRepo,
		chainAssetRepo: chainAssetRepo,
	}
}

type AssetInfo struct {
	Symbol     string `json:"symbol"`
	Decimals   int    `json:"decimals"`
	MinDeposit string `json:"minDeposit"`
}

type ChainWithAssets struct {
	Chain   string      `json:"chain"`
	ChainID uint64      `json:"chainId"`
	Assets  []AssetInfo `json:"assets"`
}

func (s *MetaService) GetSupportedChains() ([]ChainWithAssets, error) {
	chains, err := s.chainRepo.FindEnabled()
	if err != nil {
		return nil, err
	}

	var result []ChainWithAssets
	for _, chain := range chains {
		chainAssets, err := s.chainAssetRepo.FindByChainIDWithAsset(chain.ID)
		if err != nil {
			return nil, err
		}

		var assets []AssetInfo
		for _, ca := range chainAssets {
			if ca.Enabled && ca.Asset.Enabled {
				assets = append(assets, AssetInfo{
					Symbol:     ca.Asset.Symbol,
					Decimals:   ca.Asset.Decimals,
					MinDeposit: ca.Asset.MinDeposit.String(),
				})
			}
		}

		result = append(result, ChainWithAssets{
			Chain:   chain.ChainKey,
			ChainID: chain.ChainID,
			Assets:  assets,
		})
	}

	return result, nil
}