'use client'

import { useState, useCallback } from 'react'
import { UserProfile } from '@/types/web3'
import { useAuth } from '@/providers/AuthProvider'
import { MessageCircle, CreditCard, Linkedin, Globe, CheckCircle, Lock, AlertCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfileFormProps {
  profile: UserProfile
  onSave: () => void
  onCancel: () => void
}

export function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const { updateProfile, connectWallet } = useAuth()
  
  const [formData, setFormData] = useState({
    username: profile.username,
    bio: profile.bio || '',
    avatar: profile.avatar,
    wechat: profile.social?.wechat || '',
    alipay: profile.social?.alipay || '',
    linkedin: profile.social?.linkedin || '',
    website: profile.social?.website || '',
    creditCard: {
      number: '',
      expiry: '',
      cvv: '',
      holderName: '',
      type: '' as 'visa' | 'master' | 'jcb' | 'unionpay' | ''
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [validating, setValidating] = useState<{[key: string]: boolean}>({})
  const [showCreditCard, setShowCreditCard] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 检查是否有验证错误
    if (Object.keys(validationErrors).length > 0) {
      alert('Please fix the validation errors before saving.')
      return
    }
    
    setLoading(true)

    try {
      await updateProfile({
        username: formData.username,
        bio: formData.bio,
        avatar: formData.avatar,
        social: {
          wechat: formData.wechat,
          alipay: formData.alipay,
          linkedin: formData.linkedin,
          website: formData.website,
          twitter: '',
          github: '',
        }
      })
      
      onSave()
    } catch (error) {
      console.error('Failed to save profile:', error)
      // 检查是否是唯一性约束错误
      if (error instanceof Error && error.message.includes('duplicate')) {
        alert('One of your social accounts is already linked to another user. Please use different accounts.')
      } else {
        alert('Failed to save profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 验证Ethereum地址格式
  const isValidEthereumAddress = (address: string): boolean => {
    // Ethereum地址是0x开头的42个字符的十六进制
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethereumAddressRegex.test(address.trim())
  }

  // 验证信用卡号格式并检测卡类型
  const validateCreditCard = (number: string): { isValid: boolean; type: 'visa' | 'master' | 'jcb' | 'unionpay' | '' } => {
    const cleanNumber = number.replace(/\s/g, '')
    
    // 卡类型检测正则
    const cardTypes = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      master: /^5[1-5][0-9]{14}$/,
      jcb: /^35(?:2[89]|[3-8][0-9])[0-9]{12}$/,
      unionpay: /^62[0-9]{14,17}$/
    }
    
    let detectedType: 'visa' | 'master' | 'jcb' | 'unionpay' | '' = ''
    let isValid = false
    
    for (const [type, regex] of Object.entries(cardTypes)) {
      if (regex.test(cleanNumber)) {
        detectedType = type as 'visa' | 'master' | 'jcb' | 'unionpay'
        isValid = true
        break
      }
    }
    
    return { isValid, type: detectedType }
  }

  // 格式化信用卡号显示
  const formatCardNumber = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '')
    return cleanNumber.replace(/(.{4})/g, '$1 ').trim()
  }

  // 验证到期日期格式 (MM/YY)
  const isValidExpiry = (expiry: string): boolean => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!expiryRegex.test(expiry)) return false
    
    const [month, year] = expiry.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    const expiryYear = parseInt(year)
    const expiryMonth = parseInt(month)
    
    return expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth)
  }

  const handleConnectWallet = async () => {
    if (!walletAddress.trim()) {
      alert('Please enter an Ethereum wallet address')
      return
    }

    if (!isValidEthereumAddress(walletAddress)) {
      alert('Please enter a valid Ethereum address. Ethereum addresses start with 0x and are 42 characters long.')
      return
    }

    setConnectingWallet(true)
    try {
      await connectWallet(walletAddress.trim())
      setWalletAddress('')
      alert('Ethereum wallet connected successfully!')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      if (error instanceof Error && error.message.includes('duplicate')) {
        alert('This Ethereum address is already connected to another account.')
      } else {
        alert('Failed to connect wallet. Please try again.')
      }
    } finally {
      setConnectingWallet(false)
    }
  }

  // 验证社交账号唯一性
  const validateSocialAccount = useCallback(async (field: string, value: string) => {
    if (!value.trim() || !supabase) return
    
    setValidating(prev => ({ ...prev, [field]: true }))
    
    try {
      const dbField = field === 'wechat' ? 'social_wechat' :
                     field === 'alipay' ? 'social_alipay' :
                     field === 'linkedin' ? 'social_linkedin' :
                     field === 'website' ? 'social_website' : null
      
      if (!dbField) return

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq(dbField, value.trim())
        .neq('id', profile.id)
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setValidationErrors(prev => ({ 
          ...prev, 
          [field]: `This ${field} account is already linked to another user` 
        }))
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    } catch (error) {
      console.error(`Failed to validate ${field}:`, error)
    } finally {
      setValidating(prev => ({ ...prev, [field]: false }))
    }
  }, [profile.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 清除之前的错误
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // 对社交账号字段进行验证
    if (['wechat', 'alipay', 'linkedin', 'website'].includes(field) && value.trim()) {
      // 延迟验证，避免频繁请求
      setTimeout(() => validateSocialAccount(field, value), 500)
    }
  }

  // 处理信用卡输入
  const handleCreditCardChange = (field: string, value: string) => {
    let processedValue = value
    
    if (field === 'number') {
      // 格式化卡号，自动添加空格
      processedValue = formatCardNumber(value.replace(/\D/g, ''))
      
      // 检测卡类型
      const validation = validateCreditCard(processedValue)
      setFormData(prev => ({
        ...prev,
        creditCard: {
          ...prev.creditCard,
          [field]: processedValue,
          type: validation.type
        }
      }))
      
      // 验证卡号
      if (processedValue.length >= 13 && !validation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          creditCardNumber: 'Invalid credit card number'
        }))
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.creditCardNumber
          return newErrors
        })
      }
    } else if (field === 'expiry') {
      // 格式化到期日期 MM/YY
      processedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substring(0, 5)
      
      setFormData(prev => ({
        ...prev,
        creditCard: { ...prev.creditCard, [field]: processedValue }
      }))
      
      // 验证到期日期
      if (processedValue.length === 5 && !isValidExpiry(processedValue)) {
        setValidationErrors(prev => ({
          ...prev,
          creditCardExpiry: 'Invalid or expired date'
        }))
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.creditCardExpiry
          return newErrors
        })
      }
    } else if (field === 'cvv') {
      // CVV只允许数字，限制长度
      processedValue = value.replace(/\D/g, '').substring(0, 4)
      
      setFormData(prev => ({
        ...prev,
        creditCard: { ...prev.creditCard, [field]: processedValue }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        creditCard: { ...prev.creditCard, [field]: value }
      }))
    }
  }

  // 获取卡类型图标和颜色
  const getCardTypeInfo = (type: string) => {
    switch (type) {
      case 'visa':
        return { name: 'Visa', color: 'text-blue-600', bg: 'bg-blue-50' }
      case 'master':
        return { name: 'MasterCard', color: 'text-red-600', bg: 'bg-red-50' }
      case 'jcb':
        return { name: 'JCB', color: 'text-green-600', bg: 'bg-green-50' }
      case 'unionpay':
        return { name: 'UnionPay', color: 'text-purple-600', bg: 'bg-purple-50' }
      default:
        return { name: '', color: 'text-gray-400', bg: 'bg-gray-50' }
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              placeholder="Email cannot be changed"
            />
            <p className="text-xs text-gray-500 mt-1">Email is linked to your account and cannot be changed</p>
          </div>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Wallet Connection */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Ethereum Wallet</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {profile.walletAddress ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Connected Wallet</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Ethereum wallet cannot be changed once connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Connected
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Connect your Ethereum wallet (optional)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ethereum address (e.g., 0x742d...8efb)"
                  />
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={connectingWallet}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {connectingWallet ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WeChat */}
            <div>
              <label className="flex items-center text-sm font-medium text-text-secondary mb-2">
                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                WeChat ID
                {validating.wechat && (
                  <span className="ml-2 text-xs text-gray-500">Checking...</span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={formData.wechat}
                    onChange={(e) => handleInputChange('wechat', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10 ${
                      validationErrors.wechat ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your WeChat ID"
                  />
                  {validationErrors.wechat && (
                    <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  )}
                </div>
                <button
                  type="button"
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  onClick={() => alert('WeChat verification feature coming soon!')}
                >
                  Verify
                </button>
              </div>
              {validationErrors.wechat && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.wechat}</p>
              )}
            </div>

            {/* Alipay */}
            <div>
              <label className="flex items-center text-sm font-medium text-text-secondary mb-2">
                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                Alipay Account
                {validating.alipay && (
                  <span className="ml-2 text-xs text-gray-500">Checking...</span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={formData.alipay}
                    onChange={(e) => handleInputChange('alipay', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10 ${
                      validationErrors.alipay ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your Alipay account"
                  />
                  {validationErrors.alipay && (
                    <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  )}
                </div>
                <button
                  type="button"
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  onClick={() => alert('Alipay verification feature coming soon!')}
                >
                  Verify
                </button>
              </div>
              {validationErrors.alipay && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.alipay}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="flex items-center text-sm font-medium text-text-secondary mb-2">
                <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                LinkedIn
                {validating.linkedin && (
                  <span className="ml-2 text-xs text-gray-500">Checking...</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10 ${
                    validationErrors.linkedin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://linkedin.com/in/username"
                />
                {validationErrors.linkedin && (
                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {validationErrors.linkedin && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.linkedin}</p>
              )}
            </div>

            {/* Personal Website */}
            <div>
              <label className="flex items-center text-sm font-medium text-text-secondary mb-2">
                <Globe className="w-4 h-4 mr-2 text-purple-600" />
                Personal Website
                {validating.website && (
                  <span className="ml-2 text-xs text-gray-500">Checking...</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10 ${
                    validationErrors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://yourwebsite.com"
                />
                {validationErrors.website && (
                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {validationErrors.website && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.website}</p>
              )}
            </div>
          </div>
        </div>

        {/* Credit Card Information */}
        <div>
          <button
            type="button"
            onClick={() => setShowCreditCard(!showCreditCard)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              <h3 className="text-lg font-medium text-text-primary">
                Payment Information
              </h3>
              <span className="ml-2 text-sm text-gray-500">(Optional)</span>
            </div>
            {showCreditCard ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showCreditCard && (
            <div className="mt-4 bg-gray-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-4">
              Add your credit card for faster checkout. Your information is encrypted and secure.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Number */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.creditCard.number}
                    onChange={(e) => handleCreditCardChange('number', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-20 ${
                      validationErrors.creditCardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {formData.creditCard.type && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium ${getCardTypeInfo(formData.creditCard.type).bg} ${getCardTypeInfo(formData.creditCard.type).color}`}>
                      {getCardTypeInfo(formData.creditCard.type).name}
                    </div>
                  )}
                  {validationErrors.creditCardNumber && (
                    <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  )}
                </div>
                {validationErrors.creditCardNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.creditCardNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported: Visa, MasterCard, JCB, UnionPay
                </p>
              </div>

              {/* Cardholder Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={formData.creditCard.holderName}
                  onChange={(e) => handleCreditCardChange('holderName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={formData.creditCard.expiry}
                  onChange={(e) => handleCreditCardChange('expiry', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    validationErrors.creditCardExpiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {validationErrors.creditCardExpiry && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.creditCardExpiry}</p>
                )}
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  CVV
                </label>
                <input
                  type="password"
                  value={formData.creditCard.cvv}
                  onChange={(e) => handleCreditCardChange('cvv', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="123"
                  maxLength={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  3-4 digits on the back of your card
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Your payment information is secure</p>
                  <p>We use industry-standard encryption and never store your CVV.</p>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || Object.keys(validationErrors).length > 0}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}