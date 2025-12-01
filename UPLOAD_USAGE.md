# كيفية استخدام Upload Route مع Category Creation

## 📋 الخطوات

### 1️⃣ رفع الصورة أولاً

**Endpoint:** `POST /api/v1/upload/upload`

**Request:**
```javascript
// استخدام FormData
const formData = new FormData();
formData.append('file', file); // file هو File object من input

const response = await fetch('http://your-api.com/api/v1/upload/upload', {
  method: 'POST',
  body: formData,
  // لا تضيف Content-Type header، المتصفح هيعمله تلقائياً
});

const data = await response.json();
// Response:
// {
//   status: "success",
//   message: "Uploaded successfully!",
//   data: {
//     key: "file-1234567890-123456789-image.jpg",
//     url: "https://r2.example.com/file-1234567890-123456789-image.jpg?signature=..."
//   }
// }
```

### 2️⃣ استخدام الـ URL في إنشاء Category

**Endpoint:** `POST /api/v1/categories`

**Request:**
```javascript
const categoryData = {
  name: "Music Events",
  description: "All music-related events",
  image: data.data.url, // الـ URL من الخطوة السابقة
};

const response = await fetch('http://your-api.com/api/v1/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // مطلوب authentication
  },
  body: JSON.stringify(categoryData),
});
```

## 💻 مثال كامل (React)

```jsx
import { useState } from 'react';

function CreateCategoryForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    try {
      // Step 1: Upload the image
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadResponse = await fetch('http://your-api.com/api/v1/upload/upload', {
        method: 'POST',
        body: formData,
        // لا تضيف Authorization هنا إذا كان upload public
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.data.url;

      // Step 2: Create category with the image URL
      setCreating(true);
      const categoryResponse = await fetch('http://your-api.com/api/v1/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          image: imageUrl,
        }),
      });

      if (!categoryResponse.ok) {
        throw new Error('Category creation failed');
      }

      const categoryData = await categoryResponse.json();
      console.log('Category created:', categoryData);
      alert('Category created successfully!');

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create category');
    } finally {
      setUploading(false);
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        required
      />
      <button type="submit" disabled={uploading || creating}>
        {uploading ? 'Uploading...' : creating ? 'Creating...' : 'Create Category'}
      </button>
    </form>
  );
}
```

## 📝 ملاحظات مهمة

1. **الـ Upload Route:**
   - يستقبل ملف من نوع `multipart/form-data`
   - يرجع `key` و `url` مباشرة
   - الـ URL صالح لمدة سنة (يمكن استخدامه مباشرة)

2. **الـ Category Route:**
   - يستقبل `image` كـ URL string (ليس ملف)
   - يحتاج authentication token
   - الـ image URL يجب أن يكون valid URI

3. **Error Handling:**
   - تأكد من معالجة الأخطاء في كل خطوة
   - تحقق من صحة الـ response قبل المتابعة

4. **Loading States:**
   - استخدم loading states منفصلة للـ upload والـ creation
   - هذا يحسن تجربة المستخدم

## 🔄 Flow Diagram

```
Frontend                    Backend
   │                           │
   │──1. Upload File──────────>│
   │   (multipart/form-data)    │
   │                           │──> Save to R2
   │                           │──> Generate Signed URL
   │<──2. Return URL───────────│
   │   { key, url }            │
   │                           │
   │──3. Create Category───────>│
   │   { name, description,    │
   │     image: url }          │
   │                           │──> Validate
   │                           │──> Save to DB
   │<──4. Category Created─────│
   │                           │
```

## 🎯 Alternative: استخدام axios

```javascript
import axios from 'axios';

// Step 1: Upload
const formData = new FormData();
formData.append('file', imageFile);

const uploadResponse = await axios.post(
  'http://your-api.com/api/v1/upload/upload',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
);

const imageUrl = uploadResponse.data.data.url;

// Step 2: Create Category
const categoryResponse = await axios.post(
  'http://your-api.com/api/v1/categories',
  {
    name,
    description,
    image: imageUrl,
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);
```

