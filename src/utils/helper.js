// Helper functions for Datacore Flexilis
// Version: 4.0.0-UTILITY

function isValidEntry(entry) {
  return entry && typeof entry === "object" && entry.$path;
}

function extractValue(field) {
  if (field === null || field === undefined) return "";
  if (typeof field === "object") {
    if ("value" in field) return field.value;
    if ("raw" in field) return field.raw;
  }
  return field;
}

function getProperty(entry, property) {
  if (!entry || typeof entry !== "object") return undefined;
  
  // 1. Clean Obsidian Virtual Properties
  if (property.endsWith(".obsidian")) {
    const key = property.replace(".obsidian", "");
    if (key === "name") {
      if (typeof entry.value === "function") {
        const val = entry.value("name");
        if (val !== undefined) return val;
      }
      return entry.$name || (entry.$path ? entry.$path.split("/").pop().replace(/\.[^/.]+$/, "") : undefined);
    }
    if (key === "ctime" || key === "mtime") {
      const dateVal = entry[key] || entry["$" + key] || (typeof entry.value === "function" ? entry.value(key) : undefined);
      if (dateVal) {
        if (typeof dateVal === "number") return new Date(dateVal * 1000).toISOString();
        if (typeof dateVal.toISO === "function") return dateVal.toISO();
        if (dateVal instanceof Date) return dateVal.toISOString();
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) return d.toISOString();
      }
      return undefined;
    }
    // Fallback for other .obsidian metadata
    const normKey = key;
    if (typeof entry.value === "function") {
      const val = entry.value(normKey);
      if (val !== undefined) return val;
    }
    return entry[normKey] || entry["$" + normKey];
  }
  
  // 2. Resolve Native Datacore Page Fields using value() API
  if (typeof entry.value === "function") {
    const nativeVal = entry.value(property);
    if (nativeVal !== undefined) {
      if (nativeVal instanceof Date) return nativeVal.toISOString();
      if (typeof nativeVal === "object" && nativeVal !== null) {
        if (nativeVal.value !== undefined) return nativeVal.value;
        if (nativeVal.raw !== undefined) return nativeVal.raw;
        if (Array.isArray(nativeVal)) return nativeVal.join(", ");
        if (typeof nativeVal.toISO === "function") return nativeVal.toISO();
      }
      return nativeVal;
    }
  }

  // 3. Manual Fallback for Raw JSON Objects
  let value = entry[property];
  if (value === undefined && entry.$frontmatter) {
    value = entry.$frontmatter[property];
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null) {
    if (value.value !== undefined) return value.value;
    if (value.raw !== undefined) return value.raw;
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value.toISO === "function") return value.toISO();
    return JSON.stringify(value);
  }
  return value;
}

return { isValidEntry, extractValue, getProperty };
