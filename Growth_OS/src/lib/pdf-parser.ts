// PDF解析工具库 - 使用Aspose PDF
export interface PDFParseResult {
  text: string
  numPages: number
  title?: string
  author?: string
  metadata?: Record<string, unknown>
}

/**
 * 解析PDF文件并提取文本内容（使用Aspose PDF）
 * @param file PDF文件
 * @returns 解析结果
 */
export async function parsePDF(file: File): Promise<PDFParseResult> {
  try {
    return await parsePDFWithAspose(file)
  } catch (error) {
    console.warn('Aspose PDF parsing failed:', error)
    throw new Error(`PDF解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 使用Aspose PDF解析PDF
 */
async function parsePDFWithAspose(file: File): Promise<PDFParseResult> {
  return new Promise((resolve, reject) => {
    try {
      // 确保Aspose PDF已加载
      if (typeof (window as unknown as Record<string, unknown>).AsposePdfExtractText === 'undefined') {
        // 动态加载Aspose PDF库
        const script = document.createElement('script')
        script.src = '/AsposePDFforJS.js'
        script.onload = () => {
          // 库加载完成后，重新调用解析函数
          setTimeout(() => parseWithAspose(), 2000) // 给WebAssembly更多加载时间
        }
        script.onerror = () => {
          reject(new Error('无法加载Aspose PDF库'))
        }
        document.head.appendChild(script)
        return
      }
      
      parseWithAspose()
      
      function parseWithAspose() {
        const file_reader = new FileReader()
        file_reader.onload = (event) => {
          try {
            if (!event.target?.result) {
              reject(new Error('文件读取失败'))
              return
            }
            
            // 等待WebAssembly模块加载完成
            const checkModule = () => {
              const windowObj = window as unknown as Record<string, unknown>
              if (typeof windowObj.Module !== 'undefined' && (windowObj.Module as Record<string, unknown>).PdfExtractText) {
                try {
                  // 调用Aspose PDF提取文本函数
                  const json = (windowObj.AsposePdfExtractText as (data: string | ArrayBuffer | null, filename: string) => {
                    errorCode: number;
                    extractText?: string;
                    errorText?: string;
                  })(event.target!.result, file.name)
                  
                  if (json.errorCode === 0) {
                    resolve({
                      text: json.extractText || '',
                      numPages: 1,
                      title: file.name.replace('.pdf', ''),
                      metadata: {}
                    })
                  } else {
                    reject(new Error(`Aspose PDF错误: ${json.errorText}`))
                  }
                } catch (error) {
                  reject(new Error(`PDF解析出错: ${error instanceof Error ? error.message : '未知错误'}`))
                }
              } else {
                // 如果模块还没准备好，等待一会再试
                setTimeout(checkModule, 500)
              }
            }
            
            checkModule()
          } catch (error) {
            reject(new Error(`文件读取时出错: ${error instanceof Error ? error.message : '未知错误'}`))
          }
        }
        
        file_reader.onerror = () => {
          reject(new Error('文件读取出错'))
        }
        
        file_reader.readAsArrayBuffer(file)
      }
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 验证文件是否为PDF格式
 * @param file 文件对象
 * @returns 是否为有效PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * 清理和优化提取的PDF文本
 * @param text 原始文本
 * @returns 清理后的文本
 */
export function cleanPDFText(text: string): string {
  return text
    // 移除多余的空白行
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // 移除页眉页脚常见模式
    .replace(/^---\s*Page\s+\d+\s*---\s*$/gm, '')
    // 修复断行单词
    .replace(/([a-z])-\s*\n\s*([a-z])/g, '$1$2')
    // 标准化空白字符
    .replace(/\s+/g, ' ')
    // 移除开头和结尾的空白
    .trim()
}

/**
 * 从PDF文本中提取摘要
 * @param text PDF文本内容
 * @param maxLength 最大长度
 * @returns 摘要文本
 */
export function extractPDFSummary(text: string, maxLength: number = 1000): string {
  const cleanText = cleanPDFText(text)
  
  // 尝试找到摘要、介绍或概述部分
  const summaryPatterns = [
    /(?:abstract|summary|introduction|overview|executive summary)[\s\S]*?(?=\n\n|\n[A-Z])/i,
    /(?:摘要|概述|简介|引言)[\s\S]*?(?=\n\n|\n[^\w\s])/i
  ]
  
  for (const pattern of summaryPatterns) {
    const match = cleanText.match(pattern)
    if (match && match[0].length > 50) {
      return match[0].substring(0, maxLength).trim()
    }
  }
  
  // 如果没有找到特定部分，返回前部分内容
  return cleanText.substring(0, maxLength).trim() + (cleanText.length > maxLength ? '...' : '')
}