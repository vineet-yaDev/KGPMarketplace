/**
 * Client-side image compression utility
 * Compresses images to under 1MB while maintaining quality
 */

export interface CompressionOptions {
  maxSizeBytes?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'jpeg' | 'webp' | 'png';
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeBytes: 1024 * 1024, // 1MB
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  outputFormat: 'jpeg'
};

/**
 * Compresses an image file to meet size and quality requirements
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // If file is already under the size limit, return as-is
  if (file.size <= opts.maxSizeBytes) {
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1
    };
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          opts.maxWidth,
          opts.maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels to achieve target size
        compressToTargetSize(canvas, opts, file.name)
          .then(compressedFile => {
            resolve({
              compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: compressedFile.size / file.size
            });
          })
          .catch(reject);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Scale down if image is larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  return { width, height };
}

/**
 * Compress canvas to target file size by adjusting quality
 */
async function compressToTargetSize(
  canvas: HTMLCanvasElement,
  options: Required<CompressionOptions>,
  fileName: string
): Promise<File> {
  const { maxSizeBytes, outputFormat } = options;
  
  // Determine output format based on original or specified format
  let mimeType: string;
  let fileExtension: string;
  
  if (outputFormat === 'webp') {
    mimeType = 'image/webp';
    fileExtension = '.webp';
  } else if (outputFormat === 'png') {
    mimeType = 'image/png';
    fileExtension = '.png';
  } else {
    mimeType = 'image/jpeg';
    fileExtension = '.jpg';
  }

  // For PNG, we can't adjust quality, so we'll only resize
  if (outputFormat === 'png') {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }
        const compressedFile = new File(
          [blob],
          getCompressedFileName(fileName, fileExtension),
          { type: mimeType }
        );
        resolve(compressedFile);
      }, mimeType);
    });
  }

  // For JPEG and WebP, try different quality levels
  let quality = options.quality;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) {
      throw new Error('Failed to create blob');
    }

    // If we've achieved the target size or quality is too low, use this result
    if (blob.size <= maxSizeBytes || quality <= 0.1) {
      return new File(
        [blob],
        getCompressedFileName(fileName, fileExtension),
        { type: mimeType }
      );
    }

    // Reduce quality for next attempt
    quality *= 0.9;
    attempts++;
  }

  throw new Error('Could not compress image to target size');
}

/**
 * Generate a filename for the compressed image
 */
function getCompressedFileName(originalName: string, newExtension: string): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}_compressed${newExtension}`;
}

/**
 * Compress multiple images in batch
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Utility to format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if the browser supports the required APIs for compression
 */
export function isCompressionSupported(): boolean {
  return !!(
    typeof HTMLCanvasElement !== 'undefined' &&
    'toBlob' in HTMLCanvasElement.prototype &&
    typeof File !== 'undefined' &&
    typeof FileReader !== 'undefined'
  );
}