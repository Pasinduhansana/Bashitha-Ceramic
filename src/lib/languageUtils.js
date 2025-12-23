/**
 * Utility functions for handling bilingual data display
 * Used to split database values containing both English and Sinhala text
 * Format: "English Text / සිංහල පෙළ"
 */

/**
 * Get the user's language preference from localStorage
 * @returns {'english' | 'sinhala'} - User's preferred display language
 */
export function getDisplayLanguage() {
  if (typeof window === "undefined") return "english"; // Server-side default
  return localStorage.getItem("displayLanguage") || "english";
}

/**
 * Split bilingual text and return the appropriate part based on user preference
 * @param {string} text - Bilingual text (e.g., "Tiles / ටයිල්")
 * @param {string} [language] - Optional language override, otherwise uses stored preference
 * @returns {string} - The text in the selected language
 *
 * @example
 * // With stored preference as 'english'
 * splitBilingualText("Tiles / ටයිල්") // Returns "Tiles"
 *
 * @example
 * // With stored preference as 'sinhala'
 * splitBilingualText("Tiles / ටයිල්") // Returns "ටයිල්"
 *
 * @example
 * // With language override
 * splitBilingualText("Tiles / ටයිල්", "sinhala") // Returns "ටයිල්"
 */
export function splitBilingualText(text, language = null) {
  if (!text) return "";

  // Use provided language or get from localStorage
  const displayLang = language || getDisplayLanguage();

  // Split by " / " separator
  const parts = text.split(" / ");

  // If there's no separator, return the original text
  if (parts.length === 1) return text.trim();

  // Return the appropriate part based on language preference
  // English is first part (index 0), Sinhala is second part (index 1)
  return displayLang === "english" ? parts[0].trim() : (parts[1] || parts[0]).trim();
}

/**
 * Get both English and Sinhala parts from bilingual text
 * @param {string} text - Bilingual text (e.g., "Tiles / ටයිල්")
 * @returns {{english: string, sinhala: string}} - Object with both parts
 *
 * @example
 * getBilingualParts("Tiles / ටයිල්")
 * // Returns { english: "Tiles", sinhala: "ටයිල්" }
 */
export function getBilingualParts(text) {
  if (!text) return { english: "", sinhala: "" };

  const parts = text.split(" / ");

  return {
    english: parts[0]?.trim() || "",
    sinhala: parts[1]?.trim() || parts[0]?.trim() || "",
  };
}

/**
 * Format array of bilingual items based on user preference
 * @param {Array<Object>} items - Array of items with bilingual fields
 * @param {string[]} fields - Array of field names to split
 * @param {string} [language] - Optional language override
 * @returns {Array<Object>} - Items with split fields
 *
 * @example
 * const categories = [
 *   { id: 1, name: "Tiles / ටයිල්" },
 *   { id: 2, name: "Sanitaryware / නාන කාමර උපකරණ" }
 * ];
 *
 * formatBilingualArray(categories, ['name'])
 * // With english preference, returns:
 * // [
 * //   { id: 1, name: "Tiles" },
 * //   { id: 2, name: "Sanitaryware" }
 * // ]
 */
export function formatBilingualArray(items, fields = [], language = null) {
  if (!Array.isArray(items)) return items;

  const displayLang = language || getDisplayLanguage();

  return items.map((item) => {
    const formatted = { ...item };

    fields.forEach((field) => {
      if (formatted[field]) {
        formatted[field] = splitBilingualText(formatted[field], displayLang);
      }
    });

    return formatted;
  });
}

/**
 * Hook to watch for language preference changes
 * Use this in React components that need to re-render on language change
 */
export function useDisplayLanguage() {
  if (typeof window === "undefined") return "english";

  const [language, setLanguage] = React.useState(getDisplayLanguage());

  React.useEffect(() => {
    const handleStorageChange = () => {
      setLanguage(getDisplayLanguage());
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event when language is changed in the same tab
    window.addEventListener("displayLanguageChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("displayLanguageChange", handleStorageChange);
    };
  }, []);

  return language;
}
