/**
 * Example: Image Upload Component for Products
 *
 * This shows how to integrate Cloudinary image upload
 * into your product creation/edit forms
 *
 * Copy and adapt this code for your needs
 */

"use client";

import { useState } from "react";
import { Camera, X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImage, getThumbnailUrl, deleteImage } from "@/lib/imageUtils";

export default function ProductImageUpload({ value, onChange, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Cloudinary
      const result = await uploadImage(file, "products");

      // Update preview
      setPreview(result.url);

      // Notify parent component
      if (onChange) {
        onChange(result.url, result.publicId);
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Product Image</label>

      {preview ? (
        // Show uploaded image
        <div className="relative w-full h-48 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden group">
          <img src={preview} alt="Product" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="cursor-pointer bg-white dark:bg-gray-800 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <Camera className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </label>
            <button onClick={handleRemove} className="bg-red-500 p-2 rounded-lg hover:bg-red-600 transition-colors">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        // Show upload area
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-4 border-[#1fb8a2] border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Click to upload image</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, WebP (Max 5MB)</p>
            </div>
          )}
        </label>
      )}
    </div>
  );
}

/**
 * Usage Example in Product Form:
 *
 * import ProductImageUpload from "./ProductImageUpload";
 *
 * function ProductForm() {
 *   const [productData, setProductData] = useState({
 *     name: "",
 *     price: "",
 *     image: "",
 *     imagePublicId: "",
 *   });
 *
 *   return (
 *     <form>
 *       <input
 *         type="text"
 *         value={productData.name}
 *         onChange={(e) => setProductData({...productData, name: e.target.value})}
 *       />
 *
 *       <ProductImageUpload
 *         value={productData.image}
 *         onChange={(url, publicId) => {
 *           setProductData({
 *             ...productData,
 *             image: url,
 *             imagePublicId: publicId
 *           });
 *         }}
 *         onRemove={() => {
 *           setProductData({
 *             ...productData,
 *             image: "",
 *             imagePublicId: ""
 *           });
 *         }}
 *       />
 *
 *       <button type="submit">Save Product</button>
 *     </form>
 *   );
 * }
 */
