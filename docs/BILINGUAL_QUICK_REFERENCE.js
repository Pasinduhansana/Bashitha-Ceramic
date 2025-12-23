/**
 * BILINGUAL DATA DISPLAY - QUICK REFERENCE
 * ========================================
 *
 * Copy-paste these code snippets when implementing bilingual data display
 */

// ============================================================================
// 1. IMPORT STATEMENT
// ============================================================================
import {
  splitBilingualText, // For single values
  formatBilingualArray, // For arrays
  getDisplayLanguage, // Get current preference
} from "@/lib/languageUtils";

// ============================================================================
// 2. BASIC USAGE - Single Text Value
// ============================================================================
const category = { name: "Tiles / ටයිල්" };
const displayName = splitBilingualText(category.name);
// Returns: "Tiles" (English) or "ටයිල්" (Sinhala) based on user preference

// ============================================================================
// 3. FORMAT ARRAY OF OBJECTS
// ============================================================================
const categories = [
  { id: 1, name: "Tiles / ටයිල්" },
  { id: 2, name: "Sanitaryware / නල ජල උපකරණ" },
];

const formatted = formatBilingualArray(categories, ["name"]);
// Returns: Array with 'name' field split based on preference

// ============================================================================
// 4. API RESPONSE FORMATTING (Most Common Use Case)
// ============================================================================
const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const response = await fetch("/api/categories");
    const result = await response.json();

    // Format bilingual fields
    const formatted = formatBilingualArray(result.categories, ["name", "description"]);
    setData(formatted);
  };

  fetchData();
}, []);

// ============================================================================
// 5. LISTEN FOR LANGUAGE CHANGES
// ============================================================================
useEffect(() => {
  const handleLanguageChange = () => {
    // Re-fetch or re-format your data here
    fetchData();
  };

  window.addEventListener("displayLanguageChange", handleLanguageChange);

  return () => {
    window.removeEventListener("displayLanguageChange", handleLanguageChange);
  };
}, []);

// ============================================================================
// 6. DISPLAY IN JSX
// ============================================================================
{
  categories.map((category) => <div key={category.id}>{splitBilingualText(category.name)}</div>);
}

// ============================================================================
// 7. MULTIPLE BILINGUAL FIELDS
// ============================================================================
const products = [
  {
    id: 1,
    name: "Floor Tiles / බිම් ටයිල්",
    category: "Tiles / ටයිල්",
    description: "High quality / උසස් තත්ත්වයේ",
  },
];

const formatted = formatBilingualArray(products, ["name", "category", "description"]);

// ============================================================================
// 8. WITH DROPDOWN/SELECT
// ============================================================================
<select>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {splitBilingualText(cat.name)}
    </option>
  ))}
</select>;

// ============================================================================
// 9. GET CURRENT LANGUAGE PREFERENCE
// ============================================================================
const currentLanguage = getDisplayLanguage();
// Returns: 'english' or 'sinhala'

// ============================================================================
// 10. CONDITIONAL RENDERING BASED ON LANGUAGE
// ============================================================================
const language = getDisplayLanguage();

<h2>{language === "english" ? "Categories" : "කාණ්ඩ"}</h2>;

// ============================================================================
// 11. API ROUTE (DO NOT SPLIT ON SERVER)
// ============================================================================
// ❌ WRONG - Don't split on server
export async function GET() {
  const [data] = await db.execute("SELECT * FROM categories");
  const formatted = formatBilingualArray(data, ["name"]); // Don't do this!
  return NextResponse.json(formatted);
}

// ✅ CORRECT - Return full bilingual text
export async function GET() {
  const [data] = await db.execute("SELECT * FROM categories");
  return NextResponse.json({ categories: data }); // Client will handle splitting
}

// ============================================================================
// 12. GET BOTH PARTS SEPARATELY
// ============================================================================
import { getBilingualParts } from "@/lib/languageUtils";

const text = "Tiles / ටයිල්";
const { english, sinhala } = getBilingualParts(text);

console.log(english); // "Tiles"
console.log(sinhala); // "ටයිල්"

// ============================================================================
// 13. FULL COMPONENT EXAMPLE
// ============================================================================
("use client");

import { useState, useEffect } from "react";
import { formatBilingualArray, getDisplayLanguage } from "@/lib/languageUtils";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [language, setLanguage] = useState("english");

  useEffect(() => {
    setLanguage(getDisplayLanguage());
    fetchCategories();

    const handleLanguageChange = () => {
      setLanguage(getDisplayLanguage());
      fetchCategories();
    };

    window.addEventListener("displayLanguageChange", handleLanguageChange);
    return () => window.removeEventListener("displayLanguageChange", handleLanguageChange);
  }, []);

  const fetchCategories = async () => {
    const response = await fetch("/api/categories");
    const data = await response.json();
    const formatted = formatBilingualArray(data.categories, ["name"]);
    setCategories(formatted);
  };

  return (
    <div>
      <h2>{language === "english" ? "Categories" : "කාණ්ඩ"}</h2>
      {categories.map((cat) => (
        <div key={cat.id}>{cat.name}</div>
      ))}
    </div>
  );
}

// ============================================================================
// 14. DATABASE FORMAT (ALWAYS USE THIS)
// ============================================================================
/*
✅ CORRECT:
"Tiles / ටයිල්"
"Bathroom Fixtures / නාන කාමර උපකරණ"
"High Quality Products / උසස් තත්ත්වයේ නිෂ්පාදන"

❌ WRONG:
"Tiles"              // Missing Sinhala
"ටයිල්"              // Missing English
"Tiles/ටයිල්"        // Missing spaces around separator
"Tiles | ටයිල්"     // Wrong separator
*/

// ============================================================================
// 15. TESTING YOUR IMPLEMENTATION
// ============================================================================
/*
1. Go to: Inventory → Settings → Display Settings
2. Toggle between English and සිංහල (Sinhala)
3. Click "Save Changes"
4. Navigate to your component
5. Verify correct language is displayed
6. Switch language again and verify it updates
*/

// ============================================================================
// COMMON PATTERNS SUMMARY
// ============================================================================
/*
┌─────────────────────────────────────────────────────────────────────┐
│ Use Case                    │ Function to Use                        │
├─────────────────────────────────────────────────────────────────────┤
│ Single text value           │ splitBilingualText(text)               │
│ Array of objects            │ formatBilingualArray(array, fields)    │
│ Get current preference      │ getDisplayLanguage()                   │
│ Get both parts              │ getBilingualParts(text)                │
│ Listen for changes          │ addEventListener('displayLanguageChange')│
└─────────────────────────────────────────────────────────────────────┘
*/
