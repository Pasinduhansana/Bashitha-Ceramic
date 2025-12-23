/**
 * Image Upload Utilities for Cloudinary Integration
 *
 * This module provides reusable functions for uploading images to Cloudinary
 * Can be used across components (Products, User Profiles, etc.)
 */

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Folder name in Cloudinary (e.g., 'profiles', 'products')
 * @returns {Promise<Object>} Upload result with image URL
 */
export async function uploadImage(file, folder = "general") {
  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Image size must be less than 5MB");
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
  }

  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // Upload to API
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to upload image");
  }

  return data;
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The Cloudinary public ID of the image
 * @returns {Promise<Object>} Delete result
 */
export async function deleteImage(publicId) {
  if (!publicId) {
    throw new Error("No public ID provided");
  }

  const response = await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to delete image");
  }

  return data;
}

/**
 * Preview image before upload
 * @param {File} file - The image file
 * @returns {Promise<string>} Data URL for preview
 */
export function previewImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Get optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || !url.includes("cloudinary.com")) {
    return url; // Return original URL if not Cloudinary
  }

  const { width, height, quality = "auto", format = "auto", crop = "fill" } = options;

  // Extract parts of the URL
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  // Build transformation string
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  // Reconstruct URL with transformations
  return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`;
}

/**
 * Generate thumbnail URL from Cloudinary URL
 * @param {string} url - Original Cloudinary URL
 * @param {number} size - Thumbnail size (default: 150)
 * @returns {string} Thumbnail URL
 */
export function getThumbnailUrl(url, size = 150) {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    quality: "auto:good",
    crop: "fill",
  });
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null
 */
export function extractPublicId(url) {
  if (!url || !url.includes("cloudinary.com")) {
    return null;
  }

  // Match pattern: /upload/[transformations/]v[version]/[public_id].[extension]
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  if (!match) return null;

  // Remove transformations if present
  const publicId = match[1].replace(/^[^/]+\//, "");
  return publicId;
}

/**
 * Validate image dimensions
 * @param {File} file - The image file
 * @param {Object} constraints - Min/max width and height
 * @returns {Promise<boolean>} True if valid
 */
export function validateImageDimensions(file, constraints = {}) {
  return new Promise((resolve, reject) => {
    const { minWidth, maxWidth, minHeight, maxHeight } = constraints;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;
      let isValid = true;
      let error = "";

      if (minWidth && width < minWidth) {
        isValid = false;
        error = `Image width must be at least ${minWidth}px`;
      }
      if (maxWidth && width > maxWidth) {
        isValid = false;
        error = `Image width must not exceed ${maxWidth}px`;
      }
      if (minHeight && height < minHeight) {
        isValid = false;
        error = `Image height must be at least ${minHeight}px`;
      }
      if (maxHeight && height > maxHeight) {
        isValid = false;
        error = `Image height must not exceed ${maxHeight}px`;
      }

      if (isValid) {
        resolve(true);
      } else {
        reject(new Error(error));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Compress image before upload (client-side)
 * @param {File} file - The image file
 * @param {number} maxSizeMB - Maximum size in MB (default: 1)
 * @param {number} quality - Quality 0-1 (default: 0.8)
 * @returns {Promise<File>} Compressed image file
 */
export async function compressImage(file, maxSizeMB = 1, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        const maxDimension = 2000; // Max width or height
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from file
 * @param {File} file - The image file
 * @returns {Promise<Object>} Object with width and height
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
