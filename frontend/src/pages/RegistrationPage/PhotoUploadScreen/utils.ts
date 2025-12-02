/**
 * Utilities for photo processing: cropping and optimization
 */

/**
 * Crop image to square (center crop)
 */
export function cropImageToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Determine square size (smaller dimension)
        const size = Math.min(img.width, img.height);

        // Set canvas size
        canvas.width = size;
        canvas.height = size;

        // Calculate offset for centering
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        // Draw cropped image
        ctx.drawImage(
          img,
          offsetX,
          offsetY, // source x, y
          size,
          size, // source width, height
          0,
          0, // destination x, y
          size,
          size // destination width, height
        );

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimize image (resize if needed)
 */
export function optimizeImage(imageBlob: Blob, maxDimension: number = 1200, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);
    img.src = imageUrl;

    img.onload = () => {
      // If image is already optimal size
      if (img.width <= maxDimension && img.height <= maxDimension) {
        URL.revokeObjectURL(imageUrl);
        resolve(imageBlob);
        return;
      }

      // Resize
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Canvas context not available'));
        return;
      }

      const scale = maxDimension / Math.max(img.width, img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(imageUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image'));
    };
  });
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Пожалуйста, выберите изображение' };
  }

  // Check file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Файл слишком большой. Максимум 10 МБ' };
  }

  return { valid: true };
}



