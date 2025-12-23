/**
 * Example Component: Category Display with Bilingual Support
 *
 * This is a reference implementation showing how to use the bilingual
 * data display feature with the categories table.
 *
 * To integrate this into your app:
 * 1. Create the API route for categories (if not exists)
 * 2. Use this component wherever you need to display categories
 * 3. The text will automatically display in user's preferred language
 */

"use client";

import { useState, useEffect } from "react";
import { splitBilingualText, formatBilingualArray, getDisplayLanguage } from "@/lib/languageUtils";
import { Package } from "lucide-react";

export default function CategoryDisplayExample() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("english");

  useEffect(() => {
    // Set initial language
    setCurrentLanguage(getDisplayLanguage());

    // Fetch categories
    fetchCategories();

    // Listen for language preference changes
    const handleLanguageChange = () => {
      setCurrentLanguage(getDisplayLanguage());
      // Re-fetch to apply new language preference
      fetchCategories();
    };

    window.addEventListener("displayLanguageChange", handleLanguageChange);

    return () => {
      window.removeEventListener("displayLanguageChange", handleLanguageChange);
    };
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // In production, this would be an actual API call
      // const response = await fetch('/api/categories');
      // const data = await response.json();

      // Mock data matching the database structure
      const mockData = [
        { id: 1, name: "Tiles / ටයිල්" },
        { id: 2, name: "Bathroom & Kitchen Fixtures / නාන කාමර සහ මුළුතැන්ගෙයි උපකරණ" },
        { id: 3, name: "Sanitaryware & Fittings / නල ජල උපකරණ" },
        { id: 4, name: "Accessories / උපාංග" },
        { id: 5, name: "Construction Materials / සෙරමික් සන්නිවේදන භාණ්ඩ" },
        { id: 6, name: "Decorative Items / අලංකාර භාණ්ඩ" },
      ];

      // Format the bilingual data based on user preference
      const formatted = formatBilingualArray(mockData, ["name"]);

      setCategories(formatted);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1fb8a2]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{currentLanguage === "english" ? "Product Categories" : "නිෂ්පාදන කාණ්ඩ"}</h2>
        <p className="text-sm text-gray-500">
          {currentLanguage === "english"
            ? "Displaying in English - Change preference in Settings"
            : "සිංහලෙන් ප්‍රදර්ශනය කරයි - සැකසීම්වල මනාපය වෙනස් කරන්න"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] text-white">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-xs text-gray-500">Category {category.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Code Example Display */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Implementation Example:</h3>
        <pre className="text-xs text-gray-700 overflow-x-auto">
          {`// Original database value
const dbValue = "Tiles / ටයිල්";

// After applying splitBilingualText()
const displayed = "${categories[0]?.name || "Tiles"}";

// Current preference: ${currentLanguage}`}
        </pre>
      </div>
    </div>
  );
}

/**
 * USAGE IN OTHER COMPONENTS:
 *
 * 1. Simple text splitting:
 * ```
 * import { splitBilingualText } from "@/lib/languageUtils";
 *
 * const categoryName = splitBilingualText("Tiles / ටයිල්");
 * ```
 *
 * 2. Array formatting:
 * ```
 * import { formatBilingualArray } from "@/lib/languageUtils";
 *
 * const formatted = formatBilingualArray(categories, ['name', 'description']);
 * ```
 *
 * 3. React to preference changes:
 * ```
 * useEffect(() => {
 *   const handler = () => fetchData();
 *   window.addEventListener('displayLanguageChange', handler);
 *   return () => window.removeEventListener('displayLanguageChange', handler);
 * }, []);
 * ```
 */
