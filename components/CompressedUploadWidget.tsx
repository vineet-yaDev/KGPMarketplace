'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { CldUploadWidget, type CloudinaryUploadWidgetResults, type CloudinaryUploadWidgetError } from 'next-cloudinary'
import { compressImage, isCompressionSupported, type CompressionResult } from '@/lib/imageCompression'

interface CompressedUploadWidgetProps {
  onSuccess: (result: CloudinaryUploadWidgetResults) => void
  onError: (error: CloudinaryUploadWidgetError) => void
  options: {
    maxFiles?: number
    resourceType?: string
    clientAllowedFormats?: string[]
    maxFileSize?: number
    cropping?: boolean
    multiple?: boolean
    defaultSource?: string
    showPoweredBy?: boolean
    showUploadMoreButton?: boolean
    singleUploadAutoClose?: boolean
  }
  uploadPreset: string
  onOpen?: () => void
  onClose?: () => void
  cloudName?: string
  children: ({ open }: { open: () => void }) => React.ReactNode
  compressionOptions?: {
    maxSizeBytes?: number
    quality?: number
    maxWidth?: number
    maxHeight?: number
    outputFormat?: 'jpeg' | 'webp' | 'png'
  }
}

interface CompressionProgress {
  isCompressing: boolean
  progress: string
  currentFile?: string
}

export default function CompressedUploadWidget({
  onSuccess,
  onError,
  options,
  uploadPreset,
  onOpen,
  onClose,
  cloudName,
  children,
  compressionOptions = {}
}: CompressedUploadWidgetProps) {
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress>({
    isCompressing: false,
    progress: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultCompressionOptions = useMemo(() => ({
    maxSizeBytes: 1024 * 1024, // 1MB
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    outputFormat: 'jpeg' as const,
    ...compressionOptions
  }), [compressionOptions])

  const uploadSingleFile = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      if (cloudName) {
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        
        fetch(url, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            reject(data.error)
          } else {
            // Structure the response to match CldUploadWidget format
            onSuccess({
              event: 'success',
              info: {
                asset_id: data.asset_id || '',
                public_id: data.public_id || '',
                version: data.version || 0,
                version_id: data.version_id || '',
                signature: data.signature || '',
                width: data.width || 0,
                height: data.height || 0,
                format: data.format || 'jpg',
                resource_type: data.resource_type || 'image',
                created_at: data.created_at || new Date().toISOString(),
                tags: data.tags || [],
                bytes: data.bytes || 0,
                type: data.type || 'upload',
                etag: data.etag || '',
                placeholder: data.placeholder || false,
                url: data.url || '',
                secure_url: data.secure_url || '',
                folder: data.folder || '',
                original_filename: data.original_filename || file.name,
                api_key: data.api_key || '000000000000000',
                // Required CloudinaryUploadWidgetInfo properties
                batchId: data.batchId || '',
                hook_execution: data.hook_execution || '',
                id: data.id || data.public_id || '',
                path: data.path || `/${data.public_id}.${data.format}`,
                thumbnail_url: data.thumbnail_url || data.secure_url || '',
                // Optional properties that might be present
                access_mode: data.access_mode || 'public',
                coordinates: data.coordinates || null,
                faces: data.faces || null,
                image_metadata: data.image_metadata || {},
                overwritten: data.overwritten || false,
                pages: data.pages || null,
                phash: data.phash || null,
                delete_token: data.delete_token || null
              }
            })
            resolve()
          }
        })
        .catch(error => {
          console.error('Upload failed:', error)
          reject(error)
        })
      } else {
        reject(new Error('Cloud name not configured'))
      }
    })
  }, [cloudName, uploadPreset, onSuccess])

  const uploadCompressedFiles = useCallback(async (compressedFiles: File[]) => {
    for (const file of compressedFiles) {
      await uploadSingleFile(file)
    }
  }, [uploadSingleFile])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (!isCompressionSupported()) {
      onError({
        status: 'error',
        statusText: 'Image compression not supported in this browser'
      })
      return
    }

    try {
      setCompressionProgress({
        isCompressing: true,
        progress: 'Starting compression...'
      })

      const compressionResults: CompressionResult[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        setCompressionProgress({
          isCompressing: true,
          progress: `Compressing ${i + 1} of ${files.length}...`,
          currentFile: file.name
        })

        const result = await compressImage(file, defaultCompressionOptions)
        compressionResults.push(result)
        
        console.log(`Compressed ${file.name}: ${result.originalSize} bytes -> ${result.compressedSize} bytes (${Math.round(result.compressionRatio * 100)}%)`)
      }

      setCompressionProgress({
        isCompressing: true,
        progress: 'Uploading images...'
      })

      // Now upload the compressed files
      await uploadCompressedFiles(compressionResults.map(r => r.compressedFile))

      setCompressionProgress({
        isCompressing: false,
        progress: ''
      })

      // Call onClose to indicate completion
      onClose?.()

    } catch (error) {
      console.error('Compression/Upload error:', error)
      setCompressionProgress({
        isCompressing: false,
        progress: ''
      })
      onError({
        status: 'error',
        statusText: error instanceof Error ? error.message : 'Failed to compress or upload images'
      })
      onClose?.()
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [defaultCompressionOptions, onError, uploadCompressedFiles, onClose])

  const handleCustomOpen = useCallback(() => {
    if (compressionProgress.isCompressing) return
    
    onOpen?.()
    fileInputRef.current?.click()
  }, [compressionProgress.isCompressing, onOpen])

  // If compression is not supported, fall back to original CldUploadWidget
  if (!isCompressionSupported()) {
    return (
      <CldUploadWidget
        uploadPreset={uploadPreset}
        onSuccess={onSuccess}
        onError={onError}
        options={options}
        onOpen={onOpen}
        onClose={onClose}
      >
        {children}
      </CldUploadWidget>
    )
  }

  return (
    <>
      {/* Hidden file input for compressed uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept={options.clientAllowedFormats?.map((f: string) => `.${f}`).join(',')}
        multiple={options.multiple}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Render children with custom open handler */}
      {children({ open: handleCustomOpen })}

      {/* Compression progress overlay */}
      {compressionProgress.isCompressing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Uploading Images</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {compressionProgress.progress}
              </p>
              {compressionProgress.currentFile && (
                <p className="text-xs text-muted-foreground truncate">
                  {compressionProgress.currentFile}
                </p>
              )}
            </div>
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
