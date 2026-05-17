---
queryPath: _RESOURCES
initialNameFilter: ""
columns:
  - Notes = name.obsidian
  - Source = source
  - Tags = tags
  - Genre = rating
  - Date = date
  - Modified Date = mtime.obsidian
  - Creation Date = ctime.obsidian
groupBy: Modified Date
groupOrder: desc
paginationEnabled: true
paginationLimit: 8
truncateText: true
cellHeight: 88
placeholderSearch: Search notes...
placeholderQuery: Enter path...
placeholderHeader: Notes Viewer
stickyColumns:
  - Notes
---

# DATACORE FLEXILIS

```datacorejsx
const activeFileObj = (dc.app || app).vault.getAbstractFileByPath(dc.path);
const frontmatter = activeFileObj ? (dc.app || app).metadataCache.getFileCache(activeFileObj)?.frontmatter : {};

// 1. DYNAMIC COLUMNS PARSER: Parse native YAML list columns (supports '=', '->', and legacy ':')
const dynamicColumnProperties = {};
if (frontmatter?.columns && Array.isArray(frontmatter.columns)) {
  frontmatter.columns.forEach(item => {
    if (typeof item === 'string') {
      let label = "";
      let val = "";
      const eqIndex = item.indexOf('=');
      if (eqIndex !== -1) {
        label = item.substring(0, eqIndex).trim();
        val = item.substring(eqIndex + 1).trim();
      } else {
        const arrowIndex = item.indexOf('->');
        if (arrowIndex !== -1) {
          label = item.substring(0, arrowIndex).trim();
          val = item.substring(arrowIndex + 2).trim();
        } else {
          const colonIndex = item.indexOf(':');
          if (colonIndex !== -1) {
            label = item.substring(0, colonIndex).trim();
            val = item.substring(colonIndex + 1).trim();
          }
        }
      }
      if (label && val) {
        dynamicColumnProperties[label] = val;
      }
    }
  });
} else {
  // Default standard fallback columns
  Object.assign(dynamicColumnProperties, {
    Notes: "name.obsidian",
    Source: "source",
    Tags: "tags",
    "Modified Date": "mtime.obsidian"
  });
}

// 2. GROUPING PARSER
const groupByColumns = [];
if (frontmatter?.groupBy) {
  groupByColumns.push({
    column: frontmatter.groupBy,
    order: frontmatter?.groupOrder || "desc"
  });
}

// 3. STICKY COLUMNS PARSER
const stickyColumns = [];
if (frontmatter?.stickyColumns) {
  if (Array.isArray(frontmatter.stickyColumns)) {
    stickyColumns.push(...frontmatter.stickyColumns);
  } else if (typeof frontmatter.stickyColumns === 'string') {
    stickyColumns.push(frontmatter.stickyColumns);
  }
}

// 4. COMPOSE CONFIG STRUCTURE FOR REACT ENGINE
const initialSettingsOverride = {
  queryPath: frontmatter?.queryPath || "",
  initialNameFilter: frontmatter?.initialNameFilter || "",
  dynamicColumnProperties,
  groupByColumns,
  pagination: {
    isEnabled: frontmatter?.paginationEnabled ?? false,
    itemsPerPage: Number(frontmatter?.paginationLimit || 8)
  },
  display: {
    truncateText: frontmatter?.truncateText ?? true,
    cellHeight: String(frontmatter?.cellHeight || "88"),
    stickyColumns
  },
  placeholders: {
    nameFilter: frontmatter?.placeholderSearch || "Search notes...",
    queryPath: frontmatter?.placeholderQuery || "Enter path...",
    headerTitle: frontmatter?.placeholderHeader || "Notes Viewer"
  }
};

const activeFilePath = activeFileObj?.path || "";
let folderPath = activeFilePath.substring(0, activeFilePath.lastIndexOf('/'));
if (folderPath.endsWith('/dist')) folderPath = folderPath.substring(0, folderPath.length - 5);

const { View } = await dc.require(folderPath + '/src/DatacoreFlexilis.component.jsx');
const result = await View({ folderPath, dc });

if (typeof result === 'function') {
    const Dashboard = result;
    return <Dashboard folderPath={folderPath} dc={dc} initialSettingsOverride={initialSettingsOverride} currentFilePath={activeFilePath} />;
}
return result;
```
