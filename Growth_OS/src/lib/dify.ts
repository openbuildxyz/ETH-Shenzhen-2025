// Dify API client
const DIFY_API_URL = process.env.NEXT_PUBLIC_DIFY_API_URL || 'https://instance.hellodify.com/v1'
const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY || ''

if (!DIFY_API_KEY) {
  console.warn('DIFY_API_KEY is not set. Dify integration will not work.')
}

// Type for file upload response
export interface DifyFile {
  id: string
  name: string
  size: number
  extension: string
  mime_type: string
  created_by: string
  created_at: number
  preview_url: string | null
}

/**
 * Upload a file to Dify
 * @param file The file to upload
 * @param user The user identifier
 * @returns The uploaded file information
 */
export async function uploadFileToDify(file: File, user: string): Promise<DifyFile> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', user)

  const response = await fetch(`${DIFY_API_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Failed to upload file to Dify: ${response.statusText}`)
  }

  const data: DifyFile = await response.json()
  return data
}

/**
 * Run a workflow in Dify
 * @param inputs The inputs for the workflow
 * @param user The user identifier
 * @returns The workflow run response
 */
export async function runDifyWorkflow(inputs: Record<string, unknown>, user: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${DIFY_API_URL}/workflows/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs,
      response_mode: "blocking",
      user
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Dify API error response:', errorText)
    throw new Error(`Failed to run workflow in Dify: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('Dify workflow completed successfully:', data)
  return data
}