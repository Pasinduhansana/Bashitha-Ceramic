# Bilingual Data Display Configuration

## Overview

This feature allows users to choose between English and Sinhala display for database content that contains both languages in a single field.

## Database Format

All bilingual data should be stored in the following format:

```
"English Text / සිංහල පෙළ"
```

### Examples:

- `"Tiles / ටයිල්"`
- `"Bathroom & Kitchen Fixtures / නාන කාමර සහ මුළුතැන්ගෙයි උපකරණ"`
- `"Sanitaryware & Fittings / නල ජල උපකරණ"`

## User Settings

Users can change their language preference in **Settings > Display Settings > Bilingual Data Display**

The preference is stored in `localStorage` and persists across sessions.

## How to Use in Components

### 1. Import the utility functions

```javascript
import { splitBilingualText, formatBilingualArray, getDisplayLanguage } from "@/lib/languageUtils";
```

### 2. Basic Usage - Single Text Value

```javascript
const category = { id: 1, name: "Tiles / ටයිල්" };

// Display the category name based on user preference
const displayName = splitBilingualText(category.name);
console.log(displayName); // "Tiles" (if English is selected) or "ටයිල්" (if Sinhala is selected)
```

### 3. Format Array of Items

```javascript
const categories = [
  { id: 1, name: "Tiles / ටයිල්" },
  { id: 2, name: "Bathroom Fixtures / නාන කාමර උපකරණ" },
  { id: 3, name: "Sanitaryware / නල ජල උපකරණ" },
];

// Format all items at once
const formattedCategories = formatBilingualArray(categories, ["name"]);

// Now formattedCategories will have:
// If English selected: [{ id: 1, name: "Tiles" }, ...]
// If Sinhala selected: [{ id: 1, name: "ටයිල්" }, ...]
```

### 4. API Response Formatting

When fetching data from API that contains bilingual fields:

```javascript
// In your component
const [categories, setCategories] = useState([]);

useEffect(() => {
  const fetchCategories = async () => {
    const response = await fetch("/api/categories");
    const data = await response.json();

    // Format bilingual fields based on user preference
    const formatted = formatBilingualArray(data.categories, ["name", "description"]);
    setCategories(formatted);
  };

  fetchCategories();
}, []);
```

### 5. Multiple Bilingual Fields

If an object has multiple bilingual fields:

```javascript
const product = {
  id: 1,
  name: "Floor Tiles / බිම් ටයිල්",
  category: "Tiles / ටයිල්",
  description: "High quality ceramic tiles / උසස් තත්ත්වයේ සෙරමික් ටයිල්",
};

// Format all bilingual fields at once
const formatted = formatBilingualArray([product], ["name", "category", "description"])[0];
```

### 6. React Component Example

```javascript
"use client";

import { useState, useEffect } from "react";
import { splitBilingualText, getDisplayLanguage } from "@/lib/languageUtils";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [language, setLanguage] = useState(getDisplayLanguage());

  useEffect(() => {
    // Re-fetch or re-format data when language changes
    const handleLanguageChange = () => {
      setLanguage(getDisplayLanguage());
      fetchAndFormatCategories();
    };

    window.addEventListener("displayLanguageChange", handleLanguageChange);

    fetchAndFormatCategories();

    return () => {
      window.removeEventListener("displayLanguageChange", handleLanguageChange);
    };
  }, []);

  const fetchAndFormatCategories = async () => {
    const response = await fetch("/api/categories");
    const data = await response.json();
    setCategories(data.categories);
  };

  return (
    <div>
      {categories.map((category) => (
        <div key={category.id}>{splitBilingualText(category.name)}</div>
      ))}
    </div>
  );
}
```

### 7. Get Both Languages

If you need both English and Sinhala parts separately:

```javascript
import { getBilingualParts } from "@/lib/languageUtils";

const text = "Tiles / ටයිල්";
const { english, sinhala } = getBilingualParts(text);

console.log(english); // "Tiles"
console.log(sinhala); // "ටයිල්"
```

## API Implementation Examples

### Example 1: Categories API

```javascript
// src/app/api/categories/route.js
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request) {
  try {
    const db = getDb();

    // Fetch categories with bilingual names
    const [categories] = await db.execute(`SELECT id, name FROM categories ORDER BY id`);

    // Note: DO NOT split on the server side
    // Return the full bilingual text and let the client handle it
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
```

### Example 2: Products with Category Names

```javascript
// When joining tables with bilingual fields
const [products] = await db.execute(`
  SELECT 
    p.id,
    p.name,
    p.size,
    p.qty,
    c.name as category_name
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
`);

// In your component:
const displayProducts = formatBilingualArray(products, ["category_name"]);
```

## Important Notes

1. **Server-Side**: The utility functions can be used on the server side, but they will default to 'english' since localStorage is not available.

2. **Always Store Both Languages**: Always store data in the format "English / සිංහල" in the database. Never store only one language.

3. **Client-Side Rendering**: Language preference is a client-side feature. Use these utilities in client components ("use client").

4. **Re-rendering**: Components will automatically re-render when the language preference changes if you listen to the 'displayLanguageChange' event.

5. **Default Behavior**: If a field doesn't contain the " / " separator, the original text will be returned as-is.

6. **Fallback**: If Sinhala text is missing, the English text will be used as fallback.

## Future Integration Checklist

When implementing this feature for new data:

- [ ] Ensure database fields contain bilingual text in "English / සිංහල" format
- [ ] Import `splitBilingualText` or `formatBilingualArray` in your component
- [ ] Apply formatting to API responses before displaying
- [ ] Test with both English and Sinhala preferences
- [ ] Add event listener for 'displayLanguageChange' if component needs to update on preference change

## Testing

To test the feature:

1. Go to **Inventory > Settings > Display Settings**
2. Toggle between English and Sinhala under "Bilingual Data Display"
3. Click "Save Changes"
4. Navigate to components that display bilingual data (e.g., categories, product types)
5. Verify the correct language is displayed

## Examples of Fields to Apply This To

- Category names
- Product types
- Product descriptions
- Supplier types
- Status labels
- Any other user-facing text that should support both languages
