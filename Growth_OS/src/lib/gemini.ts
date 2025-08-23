// Gemini AI API client
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

if (!GEMINI_API_KEY) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY is not set. Gemini AI integration will not work.')
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
    finishReason?: string
  }>
}

/**
 * 等待指定毫秒数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 调用Gemini API生成内容，带重试机制
 * @param prompt 生成提示词
 * @param maxRetries 最大重试次数
 * @returns 生成的文本内容
 */
export async function generateWithGemini(prompt: string, maxRetries: number = 3): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 如果不是第一次尝试，添加延迟
      if (attempt > 1) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // 指数退避，最多10秒
        console.log(`Attempt ${attempt}/${maxRetries} for Gemini API call, waiting ${delayMs}ms...`)
        await delay(delayMs)
      }

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        const error = new Error(`Gemini API error: ${response.status}`)
        
        // 如果是429错误（频率限制）并且还有重试次数，继续重试
        if (response.status === 429 && attempt < maxRetries) {
          console.warn(`Rate limited (429), attempt ${attempt}/${maxRetries}`)
          lastError = error
          continue
        }
        
        // 其他错误直接抛出
        throw error
      }

      const data: GeminiResponse = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API')
      }

      const candidate = data.candidates[0]
      if (!candidate || !candidate.content) {
        throw new Error('Invalid response structure from Gemini API')
      }

      // 处理MAX_TOKENS情况 - content.parts可能为空
      if (!candidate.content.parts || candidate.content.parts.length === 0) {
        if (candidate.finishReason === 'MAX_TOKENS') {
          throw new Error('Response truncated due to token limit. Please try with shorter content.')
        }
        throw new Error('No content in response from Gemini API')
      }

      const generatedText = candidate.content.parts[0]?.text || ''
      if (!generatedText.trim()) {
        throw new Error('Empty response from Gemini API')
      }
      
      // 成功获取响应，返回结果
      return generatedText.trim()

    } catch (error) {
      console.error(`Gemini API error on attempt ${attempt}:`, error)
      lastError = error as Error
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        break
      }
    }
  }

  // 所有重试都失败了
  throw lastError || new Error('All Gemini API retry attempts failed')
}

/**
 * 根据README内容生成产品信息
 * @param readmeContent README文件内容
 * @returns 生成的产品信息
 */
export async function generateProductInfoFromReadme(readmeContent: string) {
  const contentSnippet = readmeContent.substring(0, 600)
  
  const titlePrompt = `Generate ONLY a concise product title (max 50 chars) for this project. Return PLAIN TEXT only, no markdown, no formatting, no quotes, no prefixes. Just the title text:\n\n${contentSnippet}...`

  const descriptionPrompt = `Generate ONLY a product description (max 200 words) highlighting key features and benefits for this project. Return PLAIN TEXT only, no markdown formatting, no bullets, no bold text, no line breaks. Write as continuous prose:\n\n${contentSnippet}...`

  const marketingPrompt = `Generate ONLY marketing copy (max 150 words) with persuasive tone for this project. Return PLAIN TEXT only, no markdown formatting, no bullets, no bold text, no emojis. Write as continuous prose:\n\n${contentSnippet}...`

  const keywordsPrompt = `Generate ONLY 5 relevant keywords for this project. Return as comma-separated plain text, no markdown, no formatting, no quotes. Format: keyword1, keyword2, keyword3, keyword4, keyword5:\n\n${contentSnippet}...`

  const twitterPrompt = `Generate an EXCITING Twitter post (max 280 chars) for this project. Make it sound revolutionary and impressive! Use power words like "breakthrough", "game-changer", "revolutionary". Include compelling emojis and trending hashtags. Make developers want to check it out immediately! Return PLAIN TEXT only:\n\n${contentSnippet}...`

  const xhsPrompt = `Generate a VIRAL Chinese Xiaohongshu post for this project. Make it super engaging with lots of emojis! Use phrases like "绝了!", "太香了!", "强推!", "宝藏发现!". Include bullet points with benefits, make it sound exclusive and valuable. Create FOMO (fear of missing out). Max 500 chars, Chinese language, PLAIN TEXT only:\n\n${contentSnippet}...`

  try {
    // 为了避免429错误，将并发请求分批执行
    console.log('Starting AI content generation with sequential batches...')
    
    // 第一批：基础内容
    const [title, description] = await Promise.all([
      generateWithGemini(titlePrompt),
      generateWithGemini(descriptionPrompt)
    ])
    
    // 短暂延迟后执行第二批
    await delay(1000)
    
    // 第二批：营销内容
    const [marketing, keywordsText] = await Promise.all([
      generateWithGemini(marketingPrompt),
      generateWithGemini(keywordsPrompt)
    ])
    
    // 再次延迟后执行第三批
    await delay(1000)
    
    // 第三批：社交媒体内容
    const [twitterPost, xhsPost] = await Promise.all([
      generateWithGemini(twitterPrompt),
      generateWithGemini(xhsPrompt)
    ])

    // Parse keywords from comma-separated text
    const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0)

    return {
      title,
      description,
      marketing,
      keywords: keywords.slice(0, 5), // Limit to 5 keywords
      price: 29.99, // Default price
      currency: 'SOL',
      category: 'development', // Default category for README-based projects
      image_url: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4', // Default image
      images: [
        {
          url: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
          alt: title + ' - Product Image'
        }
      ],
      socialPosts: {
        twitter: twitterPost,
        linkedin: xhsPost // Use XHS content for linkedin field to maintain compatibility
      }
    }

  } catch (error) {
    console.error('Failed to generate product info with Gemini:', error)
    throw error
  }
}