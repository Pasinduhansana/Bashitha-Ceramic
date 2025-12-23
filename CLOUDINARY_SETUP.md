# Cloud Image Upload Setup Guide

## Platform: Cloudinary (Recommended)

**Website:** https://cloudinary.com

### Why Cloudinary?

- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Automatic image optimization (WebP, quality compression)
- ✅ On-the-fly transformations (resize, crop, format conversion)
- ✅ CDN delivery worldwide for fast loading
- ✅ Easy integration with Next.js

---

## Setup Steps

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com
2. Click "Sign Up For Free"
3. Register with your email or Google account
4. Verify your email address

### 2. Get Your Credentials

1. After logging in, go to the **Dashboard**
2. You'll see your credentials at the top:
   ```
   Cloud Name: your_cloud_name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz123456
   ```
3. **IMPORTANT:** Keep your API Secret confidential!

### 3. Configure Your Application

#### Step 3.1: Install Cloudinary Package

Open terminal in your project directory and run:

```bash
npm install cloudinary
```

#### Step 3.2: Create Environment Variables

Create or edit `.env.local` file in your project root and add:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Replace** `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual credentials from Cloudinary Dashboard.

#### Step 3.3: Add .env.local to .gitignore

Make sure `.env.local` is in your `.gitignore` file:

```gitignore
.env.local
.env*.local
```

### 4. Restart Development Server

After adding environment variables, restart your dev server:

```bash
npm run dev
```

---

## How to Use Image Upload

### For User Profile Images

1. Click on the **Profile** icon in the header
2. Click the **camera icon** on the avatar
3. Select an image (JPEG, PNG, GIF, or WebP)
4. Image will automatically upload to Cloudinary
5. Click **Save** to update your profile

### For Product Images

The same API endpoint (`/api/upload`) can be used for products:

```javascript
const formData = new FormData();
formData.append("file", imageFile);
formData.append("folder", "products"); // Organizes images in Cloudinary

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
// data.url contains the Cloudinary image URL
```

---

## Image Specifications

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Size Limits

- Maximum file size: **5MB**
- Recommended size: 1-2MB for optimal performance

### Automatic Optimizations

Cloudinary automatically applies:

- **Compression:** Reduces file size without quality loss
- **WebP conversion:** Modern format for better compression
- **Responsive sizing:** Serves appropriate sizes based on device
- **Lazy loading:** Images load as users scroll

---

## Cloudinary Dashboard Features

### 1. Media Library

- View all uploaded images
- Organize images in folders (profiles, products, general)
- Search and filter images
- Preview and download images

### 2. Transformations

- Resize images on-the-fly
- Apply filters and effects
- Generate thumbnails
- Crop and format conversion

### 3. Usage Monitoring

- Track bandwidth usage
- Monitor storage consumption
- View request statistics

### 4. URL Parameters

Add parameters to Cloudinary URLs for transformations:

```
Original: https://res.cloudinary.com/your-cloud/image/upload/v123/sample.jpg

Resize to 300x300:
https://res.cloudinary.com/your-cloud/image/upload/w_300,h_300,c_fill/v123/sample.jpg

Add border:
https://res.cloudinary.com/your-cloud/image/upload/bo_5px_solid_black/v123/sample.jpg
```

---

## Folder Organization

Your images are organized in Cloudinary as:

```
bashitha-ceramics/
├── profiles/       (User profile pictures)
├── products/       (Product images)
└── general/        (Other images)
```

---

## Alternative Platforms

If you prefer other services, here are alternatives:

### 1. **ImgBB** (https://imgbb.com)

- Free tier: Unlimited storage
- Simpler API
- No automatic optimizations

### 2. **Imgur** (https://imgur.com)

- Popular image hosting
- Free tier available
- Good for temporary images

### 3. **AWS S3 + CloudFront**

- More control and scalability
- Requires more setup
- Pay-as-you-go pricing

### 4. **Firebase Storage**

- Integrated with Firebase ecosystem
- 5GB free storage
- Good for existing Firebase projects

---

## Troubleshooting

### Error: "Cloudinary not configured"

- Check if `.env.local` file exists
- Verify all three environment variables are set
- Restart dev server after adding variables

### Error: "Invalid file type"

- Only JPEG, PNG, GIF, and WebP are supported
- Check file extension

### Error: "File size exceeds 5MB limit"

- Compress image before uploading
- Use online tools like TinyPNG or Squoosh

### Image not appearing

- Check browser console for errors
- Verify Cloudinary URL is accessible
- Check if image uploaded successfully in Cloudinary Dashboard

---

## API Endpoints

### POST /api/upload

Upload an image to Cloudinary

**Request:**

```javascript
FormData with:
- file: Image file
- folder: "profiles" | "products" | "general"
```

**Response:**

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "publicId": "bashitha-ceramics/profiles/abc123",
  "width": 1000,
  "height": 1000,
  "format": "jpg",
  "size": 245678
}
```

### DELETE /api/upload

Delete an image from Cloudinary

**Request:**

```json
{
  "publicId": "bashitha-ceramics/profiles/abc123"
}
```

**Response:**

```json
{
  "success": true,
  "result": "ok"
}
```

---

## Best Practices

1. **Compress images** before uploading when possible
2. **Use descriptive folder names** for organization
3. **Monitor your usage** to avoid exceeding free tier limits
4. **Delete unused images** to save storage space
5. **Use transformations** to serve optimized images for different devices

---

## Support

- **Cloudinary Documentation:** https://cloudinary.com/documentation
- **API Reference:** https://cloudinary.com/documentation/image_upload_api_reference
- **Community Forum:** https://community.cloudinary.com

---

## Summary

✅ **Setup Complete When:**

1. Cloudinary account created
2. Credentials added to `.env.local`
3. `npm install cloudinary` completed
4. Dev server restarted
5. Can upload images via Profile panel

🚀 **Next Steps:**

- Test image upload in User Profile
- Add image upload to Product forms
- Explore Cloudinary transformations
- Monitor usage in Cloudinary Dashboard
