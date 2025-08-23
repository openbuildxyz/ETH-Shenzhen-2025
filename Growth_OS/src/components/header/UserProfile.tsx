'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { User, DropdownMenuItem } from '@/types'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useWallet } from '@/hooks/useWallet'

interface UserProfileProps {
  user: User
  isDropdownOpen: boolean
  onToggleDropdown: () => void
  onCloseDropdown: () => void
  menuItems: DropdownMenuItem[]
  isWalletConnected?: boolean
}

export function UserProfile({ 
  user, 
  isDropdownOpen, 
  onToggleDropdown, 
  onCloseDropdown,
  menuItems,
  isWalletConnected = false
}: UserProfileProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { connect, disconnect, balance } = useWallet()
  
  useClickOutside(dropdownRef, onCloseDropdown, isDropdownOpen)

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={onToggleDropdown}
        className="bg-white rounded-full pl-2 pr-12 py-1 h-10 flex items-start gap-2 hover:bg-gray-50 transition-colors min-w-[180px]"
      >
        <Image 
          src={user.avatar}
          alt="User Avatar" 
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover mt-0.5"
        />
        <div className="flex flex-col items-start justify-center flex-1">
          <span className="text-text-primary text-sm font-medium leading-tight">
            {user.username}
          </span>
          <span className="text-text-muted text-[8px] leading-tight">
            {isWalletConnected ? (balance ? `${balance} ETH` : 'Connected') : user.walletAddress}
          </span>
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-[180px] bg-white rounded-lg shadow-dropdown p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={item.id}>
                <button 
                  className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    item.action()
                    onCloseDropdown()
                  }}
                >
                  {item.label}
                </button>
                {index < menuItems.length - 1 && <hr className="border-gray-200" />}
              </div>
            ))}
            
            <hr className="border-gray-200" />
            
            {/* 钱包连接/断开按钮 */}
            <button 
              className="w-full text-left px-2 py-2 text-sm text-text-primary hover:bg-gray-100 rounded transition-colors"
              onClick={() => {
                if (isWalletConnected) {
                  disconnect()
                } else {
                  connect()
                }
                onCloseDropdown()
              }}
            >
              {isWalletConnected ? 'Disconnect Wallet' : 'Connect to wallet'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}