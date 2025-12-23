# 🖼️ CLOUDINARY IMAGE UPLOAD - QUICK START

## 📋 Setup Checklist

### 1️⃣ Create Account

- Go to: **https://cloudinary.com**
- Click "Sign Up For Free"
- Verify email

### 2️⃣ Get Credentials

Dashboard shows:

```
Cloud Name: [your_cloud_name]
API Key: [your_api_key]
API Secret: [your_api_secret]
```

### 3️⃣ Install Package

```bash
npm install cloudinary
```

### 4️⃣ Add Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5️⃣ Restart Server

```bash
npm run dev
```

---

## ✅ What's Already Done

✅ API endpoint created: `/api/upload`
✅ User profile image upload integrated
✅ Image utilities library created
✅ Example component for products
✅ Automatic image optimization
✅ 5MB size limit validation
✅ Supported formats: JPEG, PNG, GIF, WebP

---

## 🎯 How to Use

### User Profile Images

1. Click **Profile** icon in header
2. Click **camera** icon on avatar
3. Select image → Uploads automatically
4. Click **Save** button

### Product Images (Example Code)

```jsx
import ProductImageUpload from "@/components/examples/ProductImageUpload";

<ProductImageUpload value={productImage} onChange={(url, publicId) => setProductImage(url)} onRemove={() => setProductImage("")} />;
```

### Manual Upload (Any Component)

```javascript
import { uploadImage } from "@/lib/imageUtils";

const handleUpload = async (file) => {
  const result = await uploadImage(file, "products");
  console.log(result.url); // Cloudinary URL
};
```

---

## 📁 File Organization

```
API Routes:
├── /api/upload (POST)   → Upload image
└── /api/upload (DELETE) → Delete image

Components:
├── UserProfilePanel.js          → Profile image upload
└── examples/ProductImageUpload.js → Product image example

Utilities:
└── lib/imageUtils.js → Reusable upload functions
```

---

## 🚀 Next Steps

1. **Complete setup** (steps 1-5 above)
2. **Test** user profile upload
3. **Add product images** using example component
4. **Explore** Cloudinary Dashboard
5. **Monitor** usage and bandwidth

---

## 🔗 Important Links

- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Documentation:** https://cloudinary.com/documentation
- **Setup Guide:** See `CLOUDINARY_SETUP.md` for details
- **Image Library:** Dashboard → Media Library

---

## 💡 Key Features

✨ **Automatic Optimization**

- WebP format for modern browsers
- Quality compression
- Responsive sizing

✨ **Easy Organization**

- `profiles/` folder for avatars
- `products/` folder for product images
- `general/` for other images

✨ **CDN Delivery**

- Fast loading worldwide
- Cached images
- Bandwidth optimization

---

## ⚠️ Troubleshooting

**"Cloudinary not configured"**
→ Check `.env.local` file exists and has all 3 variables
→ Restart dev server

**"Image too large"**
→ Max 5MB, compress before upload

**"Invalid file type"**
→ Only JPEG, PNG, GIF, WebP supported

---

## 📊 Free Tier Limits

- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** 25,000/month
- **Images:** Unlimited uploads

Monitor usage at: https://cloudinary.com/console/usage

---

## 🎓 Learn More

Full documentation: `CLOUDINARY_SETUP.md`
Example code: `src/components/examples/ProductImageUpload.js`
Utilities: `src/lib/imageUtils.js`
