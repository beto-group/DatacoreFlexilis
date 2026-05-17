// Datacore Flexilis - Application Core
// Version: 4.0.0-MODULAR

async function AppModule({ folderPath, dc }) {
  const { useState, useMemo, useEffect, useRef } = dc;

  // Import Subcomponents, Helpers & Styles relative to folderPath
  const { getStyles } = await dc.require(folderPath + "/src/utils/styles.js");
  const { initialSettings } = await dc.require(folderPath + "/src/utils/settings.js");
  const { getProperty } = await dc.require(folderPath + "/src/utils/helper.js");

  const EditingPanelModule = await dc.require(folderPath + "/src/components/EditingPanel.jsx");
  const { EditColumnBlock, AddColumn, PaginationSettings } = await EditingPanelModule({ folderPath, dc });

  const DataTableModule = await dc.require(folderPath + "/src/components/DataTable.jsx");
  const { DataTable } = await DataTableModule({ folderPath, dc });

  const PaginationModule = await dc.require(folderPath + "/src/components/Pagination.jsx");
  const Pagination = await PaginationModule({ folderPath, dc });

  const styles = getStyles();

  /**
   * Helper: Update YAML frontmatter in markdown content.
   */
  function updateFrontmatter(content, property, newValue) {
    var yamlRegex = /^---\n([\s\S]*?)\n---\n?/;
    var match = content.match(yamlRegex);
    if (match) {
      var yamlContent = match[1];
      var propertyRegex = new RegExp("^" + property + ":\\s*(.*)$", "m");
      if (propertyRegex.test(yamlContent)) {
        yamlContent = yamlContent.replace(propertyRegex, property + ": " + newValue);
      } else {
        yamlContent += "\n" + property + ": " + newValue;
      }
      var updatedContent = content.replace(yamlRegex, "---\n" + yamlContent + "\n---\n");
      return updatedContent;
    } else {
      var updatedContent = "---\n" + property + ": " + newValue + "\n---\n" + content;
      return updatedContent;
    }
  }

  /**
   * DisplaySettingsEditor Component
   */
  function DisplaySettingsEditor({
    truncateText,
    setTruncateText,
    baseline,
    cellHeightOffset,
    setCellHeightOffset,
  }) {
    const handleHeightChange = (e) => {
      const newOffset = parseInt(e.target.value, 10);
      setCellHeightOffset(isNaN(newOffset) ? 0 : newOffset);
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "10px 0",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "bold" }}>Truncate Text:</label>
          <dc.Checkbox
            checked={truncateText}
            onChange={(e) => setTruncateText(e.target.checked)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "bold" }}>Height:</label>
          <dc.Textbox
            type="number"
            value={cellHeightOffset}
            onChange={handleHeightChange}
            style={{
              width: "60px",
              padding: "8px",
              border: "1px solid var(--background-modifier-border)",
            }}
            placeholder="0"
          />
          <span style={{ fontSize: "14px" }}>
            Final Height: {baseline + cellHeightOffset}px
          </span>
        </div>
      </div>
    );
  }

  const AppCore = ({ initialSettingsOverride = {} }) => {
    const app = dc.app;

    // Merge initial settings with overrides
    const mergedSettings = useMemo(() => ({
      ...initialSettings,
      ...initialSettingsOverride,
      pagination: { ...initialSettings.pagination, ...(initialSettingsOverride.pagination || {}) },
      placeholders: { ...initialSettings.placeholders, ...(initialSettingsOverride.placeholders || {}) },
      display: { ...initialSettings.display, ...(initialSettingsOverride.display || {}) },
      dynamicColumnProperties: initialSettingsOverride.dynamicColumnProperties
        ? { ...initialSettingsOverride.dynamicColumnProperties }
        : { ...initialSettings.dynamicColumnProperties },
      vaultName: initialSettingsOverride.vaultName || initialSettings.vaultName,
      groupByColumns: initialSettingsOverride.groupByColumns
        ? [...initialSettingsOverride.groupByColumns]
        : [...initialSettings.groupByColumns],
      viewHeight: initialSettings.viewHeight,
    }), [initialSettingsOverride]);

    // State initialization
    const [refreshKey, setRefreshKey] = useState(0);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());
    const [refresh, setRefresh] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const [queryPath, setQueryPath] = useState(mergedSettings.queryPath);
    const [isEditing, setIsEditing] = useState(false);
    const [editedHeaders, setEditedHeaders] = useState({});
    const [editedFields, setEditedFields] = useState({});
    const [newHeaderLabel, setNewHeaderLabel] = useState("");
    const [newFieldLabel, setNewFieldLabel] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInput, setPageInput] = useState("");
    const [isPaginationEnabled, setIsPaginationEnabled] = useState(mergedSettings.pagination.isEnabled);
    const [itemsPerPage, setItemsPerPage] = useState(mergedSettings.pagination.itemsPerPage);
    const [groupByColumns, setGroupByColumns] = useState(mergedSettings.groupByColumns);
    const [dynamicColumnProperties, setDynamicColumnProperties] = useState(mergedSettings.dynamicColumnProperties);
    const [columnsToShow, setColumnsToShow] = useState(Object.keys(mergedSettings.dynamicColumnProperties));
    const [truncateText, setTruncateText] = useState(mergedSettings.display.truncateText);
    const [truncationLength, setTruncationLength] = useState(mergedSettings.display.truncationLength);
    const [displaySettings, setDisplaySettings] = useState({
      ...mergedSettings.display,
      truncateText,
      truncationLength,
    });
    const [nameFilter, setNameFilter] = useState(mergedSettings.initialNameFilter || "");

    const HEADER_MARGIN_TOP = -10;

    const hasMounted = useRef(false);
    useEffect(() => {
      hasMounted.current = true;
    }, []);

    // Reset pagination page index when disabled
    useEffect(() => {
      if (!isPaginationEnabled) setCurrentPage(1);
    }, [isPaginationEnabled]);

    useEffect(() => {
      if (!hasMounted.current) return;
      setDisplaySettings(prev => ({
        ...prev,
        truncateText,
        truncationLength,
      }));
    }, [truncateText, truncationLength]);

    // Sync state in real time when mergedSettings (or YAML frontmatter) changes
    useEffect(() => {
      if (!hasMounted.current) return;
      setQueryPath(mergedSettings.queryPath);
      setIsPaginationEnabled(mergedSettings.pagination.isEnabled);
      setItemsPerPage(mergedSettings.pagination.itemsPerPage);
      setGroupByColumns(mergedSettings.groupByColumns);
      setDynamicColumnProperties(mergedSettings.dynamicColumnProperties);
      setColumnsToShow(Object.keys(mergedSettings.dynamicColumnProperties));
      setTruncateText(mergedSettings.display.truncateText);
      setTruncationLength(mergedSettings.display.truncationLength);
      setNameFilter(mergedSettings.initialNameFilter || "");
      
      const newHeight = mergedSettings.display.cellHeight
        ? parseInt(mergedSettings.display.cellHeight, 10)
        : baselineCellHeight;
      setCellHeightOffset(newHeight - baselineCellHeight);
    }, [mergedSettings]);

    // Auto-refresh when files are created, deleted, or renamed in the vault
    useEffect(() => {
      if (!app || !app.vault) return;
      
      let debounceTimeout = null;
      const handleVaultChange = (file) => {
        // If a markdown file is created or renamed, programmatically force Datacore to index it immediately!
        if (file && file.extension === "md") {
          const datacorePlugin = app.plugins?.plugins?.["datacore"];
          if (datacorePlugin && datacorePlugin.core && typeof datacorePlugin.core.reload === "function") {
            datacorePlugin.core.reload(file).catch(err => {
              console.warn("Failed to force reload file in Datacore:", err);
            });
          }
        }

        // Debounce slightly to allow Datacore's indexer a brief moment to process the file change
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          setRefreshKey(prev => prev + 1);
          setLastRefreshed(new Date());
        }, 300); // 300ms is the perfect sweet spot for Datacore indexer catch-up
      };

      app.vault.on("create", handleVaultChange);
      app.vault.on("delete", handleVaultChange);
      app.vault.on("rename", handleVaultChange);

      return () => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        app.vault.off("create", handleVaultChange);
        app.vault.off("delete", handleVaultChange);
        app.vault.off("rename", handleVaultChange);
      };
    }, [app]);

    const handleManualReload = async () => {
      if (isReloading) return;
      setIsReloading(true);
      try {
        const datacorePlugin = app?.plugins?.plugins?.["datacore"];
        if (datacorePlugin && datacorePlugin.core && typeof datacorePlugin.core.reload === "function") {
          const files = app.vault.getFiles().filter(file => 
            file.path.startsWith(queryPath) && 
            file.extension === "md"
          );
          await Promise.all(files.map(file => datacorePlugin.core.reload(file).catch(err => {
            console.warn(`Failed to reload ${file.path}:`, err);
          })));
        }
      } catch (e) {
        console.error("Manual reload failed:", e);
      } finally {
        setIsReloading(false);
        setRefreshKey(prev => prev + 1);
        setLastRefreshed(new Date());
      }
    };

    // Baseline height math
    const hasDateComponent = columnsToShow.some(col => {
      const prop = dynamicColumnProperties[col];
      return (
        prop === "ctime.obsidian" ||
        prop === "mtime.obsidian" ||
        col.toLowerCase().includes("date") ||
        col === "gals"
      );
    });
    const baselineCellHeight = hasDateComponent ? 133 : 55;

    const initialCellHeight = mergedSettings.display.cellHeight
      ? parseInt(mergedSettings.display.cellHeight, 10)
      : baselineCellHeight;
    const [cellHeightOffset, setCellHeightOffset] = useState(initialCellHeight - baselineCellHeight);
    const cellHeight = baselineCellHeight + cellHeightOffset;

    const currentDisplaySettings = { ...displaySettings, cellHeight };

    useEffect(() => {
      if (!hasMounted.current) return;
      setColumnsToShow(prev => {
        const newKeys = Object.keys(dynamicColumnProperties);
        const ordered = prev.filter(key => newKeys.includes(key));
        newKeys.forEach(key => { if (!ordered.includes(key)) ordered.push(key); });
        return ordered;
      });
    }, [dynamicColumnProperties]);

    // Query vault
    const qdata = dc.useQuery(`@page and path("${queryPath}")`, [queryPath, refresh, refreshKey]);

    // Name filtering
    const filteredData = useMemo(() => {
      if (!qdata) return [];
      if (!nameFilter.trim()) return qdata;
      const filterLower = nameFilter.toLowerCase();
      return qdata.filter((entry) => {
        const title = getProperty(entry, "name.obsidian") || "";
        return title.toLowerCase().includes(filterLower);
      });
    }, [qdata, nameFilter]);

    /**********************
     * GROUPING LOGIC
     **********************/
    const groupedData = useMemo(() => {
      const validData = filteredData.filter(entry => !entry.type && entry.$path);
      if (groupByColumns.length === 0) {
        return validData;
      }
      function buildGroupTree(data, groups, level = 0, groupingContext = null) {
        if (groups.length === 0) {
          if (
            groupingContext &&
            (groupingContext.prop === "ctime.obsidian" || groupingContext.prop === "mtime.obsidian")
          ) {
            data.sort((a, b) => {
              const tA = new Date(getProperty(a, groupingContext.prop)).getTime();
              const tB = new Date(getProperty(b, groupingContext.prop)).getTime();
              return groupingContext.order === "desc" ? tB - tA : tA - tB;
            });
          }
          return data;
        }
        const { column, order = "asc" } = groups[0];
        const prop = dynamicColumnProperties[column];
        const groupMap = {};
        const getDayKey = (rawValue) => {
          if (!rawValue || typeof rawValue !== "string") return null;
          const d = new Date(rawValue);
          if (isNaN(d.getTime())) return rawValue;
          const year = d.getFullYear();
          const month = (d.getMonth() + 1).toString().padStart(2, "0");
          const day = d.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        data.forEach((entry) => {
          let rawValue;
          if (entry.$frontmatter && Array.isArray(entry.$frontmatter[prop])) {
            rawValue = entry.$frontmatter[prop];
          } else {
            rawValue = getProperty(entry, prop);
          }
          if (Array.isArray(rawValue)) {
            rawValue.forEach(item => {
              let key = item;
              if (!key || key === "No Data" || key === "Unnamed") key = "Uncategorized";
              if (!groupMap[key]) groupMap[key] = [];
              groupMap[key].push(entry);
            });
          } else if (["tags", "ingredients", "diet"].includes(prop)) {
            let values = typeof rawValue === "string"
              ? rawValue.split(",").map(v => v.trim()).filter(v => v)
              : [rawValue];
            values.forEach(tag => {
              let key = tag;
              if (!key || key === "No Data" || key === "Unnamed") key = "Uncategorized";
              if (!groupMap[key]) groupMap[key] = [];
              groupMap[key].push(entry);
            });
          } else {
            let key =
              prop === "ctime.obsidian" || prop === "mtime.obsidian"
                ? getDayKey(rawValue)
                : rawValue;
            if (!key || key === "No Data" || key === "Unnamed") key = "Uncategorized";
            if (!groupMap[key]) groupMap[key] = [];
            groupMap[key].push(entry);
          }
        });

        let sortedKeys;
        if (prop === "ctime.obsidian" || prop === "mtime.obsidian") {
          const keys = Object.keys(groupMap).filter(k => k !== "Uncategorized");
          const keysWithSortValue = keys.map((k) => {
            const timestamps = groupMap[k].map(entry => {
              const fullValue = getProperty(entry, prop);
              const t = new Date(fullValue).getTime();
              return isNaN(t) ? 0 : t;
            });
            return { key: k, sortValue: Math.min(...timestamps) };
          });
          keysWithSortValue.sort((a, b) => a.sortValue - b.sortValue);
          sortedKeys = keysWithSortValue.map(item => item.key);
          if (order === "desc") {
            sortedKeys.reverse();
            if (groupMap["Uncategorized"]) sortedKeys.unshift("Uncategorized");
          } else {
            if (groupMap["Uncategorized"]) sortedKeys.push("Uncategorized");
          }
        } else {
          sortedKeys = Object.keys(groupMap)
            .filter(k => k !== "Uncategorized")
            .sort((a, b) => (order === "asc" ? a.localeCompare(b) : b.localeCompare(a)));
          if (order === "desc" && groupMap["Uncategorized"]) {
            sortedKeys.unshift("Uncategorized");
          } else if (order === "asc" && groupMap["Uncategorized"]) {
            sortedKeys.push("Uncategorized");
          }
        }

        return sortedKeys.map(k => ({
          header: { type: "group", level, key: k },
          children: buildGroupTree(
            groupMap[k],
            groups.slice(1),
            level + 1,
            groups.slice(1).length === 0 ? { prop, order } : null
          ),
        }));
      }

      let headerIdCounter = 0;
      function flattenGroupTree(tree, ancestors = []) {
        let result = [];
        tree.forEach(node => {
          const headerNode = { ...node.header, isHeader: true, ancestors, id: headerIdCounter++ };
          result.push(headerNode);
          if (Array.isArray(node.children)) {
            if (node.children.length > 0 && node.children[0] && node.children[0].header) {
              result = result.concat(flattenGroupTree(node.children, [...ancestors, headerNode]));
            } else {
              node.children.forEach(dataEntry => {
                result.push({ ...dataEntry, ancestors: [...ancestors, headerNode] });
              });
            }
          }
        });
        return result;
      }

      const tree = buildGroupTree(validData, groupByColumns);
      const flat = flattenGroupTree(tree);
      if (groupByColumns.length > 0) {
        const topGroup = groupByColumns[0];
        if (
          (topGroup.column === "ctime.obsidian" || topGroup.column === "mtime.obsidian") &&
          topGroup.order === "desc"
        ) {
          return flat.reverse();
        }
      }
      return flat;
    }, [filteredData, groupByColumns, dynamicColumnProperties]);

    /**********************
     * PAGINATION LOGIC
     **********************/
    const paginatedData = useMemo(() => {
      if (!isPaginationEnabled) return groupedData;
      const rawIndices = [];
      groupedData.forEach((item, index) => {
        if (!item.isHeader) rawIndices.push(index);
      });
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedRawIndices = rawIndices.slice(start, end);

      const headerIdsToInclude = new Set();
      paginatedRawIndices.forEach(i => {
        const rawItem = groupedData[i];
        if (rawItem.ancestors && Array.isArray(rawItem.ancestors)) {
          rawItem.ancestors.forEach(ancestor => headerIdsToInclude.add(ancestor.id));
        }
      });
      const headerIndices = {};
      groupedData.forEach((item, index) => {
        if (item.isHeader && item.id !== undefined) headerIndices[item.id] = index;
      });
      const headerIndicesToInclude = new Set();
      headerIdsToInclude.forEach(id => {
        if (headerIndices[id] !== undefined) headerIndicesToInclude.add(headerIndices[id]);
      });
      const indicesToInclude = new Set([...paginatedRawIndices, ...headerIndicesToInclude]);
      return groupedData.filter((item, index) => indicesToInclude.has(index));
    }, [groupedData, currentPage, itemsPerPage, isPaginationEnabled]);

    const totalPages = useMemo(() => {
      if (!isPaginationEnabled) return 1;
      const rawCount = groupedData.filter(item => !item.isHeader).length;
      return Math.ceil(rawCount / itemsPerPage);
    }, [groupedData, itemsPerPage, isPaginationEnabled]);

    const handlePageChange = (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
        setPageInput("");
      } else {
        alert("Invalid page number.");
      }
    };

    /**********************
     * COLUMN EDITING HANDLERS
     **********************/
    const addNewColumn = () => {
      if (!newHeaderLabel || !newFieldLabel) {
        alert("Provide both header and data field.");
        return;
      }
      if (columnsToShow.includes(newHeaderLabel)) {
        alert("Header exists. Choose a different name.");
        return;
      }
      const updated = { ...dynamicColumnProperties, [newHeaderLabel]: newFieldLabel };
      setDynamicColumnProperties(updated);
      setColumnsToShow([...columnsToShow, newHeaderLabel]);
      setNewHeaderLabel("");
      setNewFieldLabel("");
    };

    const updateColumn = (columnId, newHeader, newField) => {
      if (newHeader !== columnId && columnsToShow.includes(newHeader)) {
        alert(`Header "${newHeader}" exists.`);
        setEditedHeaders({ ...editedHeaders, [columnId]: columnId });
        return;
      }
      setDynamicColumnProperties(prev => {
        const newProps = {};
        columnsToShow.forEach(col => {
          newProps[col === columnId ? newHeader : col] = col === columnId ? newField : prev[col];
        });
        return newProps;
      });
      setGroupByColumns(prev =>
        prev.map(group => group.column === columnId ? { ...group, column: newHeader } : group)
      );
      setColumnsToShow(prev => prev.map(col => col === columnId ? newHeader : col));
      setEditedHeaders(prev => { const copy = { ...prev }; delete copy[columnId]; return copy; });
      setEditedFields(prev => { const copy = { ...prev }; delete copy[columnId]; return copy; });
    };

    const removeColumn = (columnId) => {
      if (!confirm(`Remove column "${columnId}"?`)) return;
      const updated = { ...dynamicColumnProperties };
      delete updated[columnId];
      setDynamicColumnProperties(updated);
      setColumnsToShow(columnsToShow.filter(col => col !== columnId));
      setGroupByColumns(prev => prev.filter(group => group.column !== columnId));
      setEditedHeaders(prev => { const copy = { ...prev }; delete copy[columnId]; return copy; });
      setEditedFields(prev => { const copy = { ...prev }; delete copy[columnId]; return copy; });
    };

    /**********************
     * FILE UPDATE & DELETE HANDLERS
     **********************/
    const onUpdateEntry = (entry, property, newValue) => {
      if (!app || !app.vault) return;
      const file = app.vault.getAbstractFileByPath(entry.$path);
      if (file && (typeof TFile === "undefined" || file instanceof TFile)) {
        app.vault.read(file)
          .then(content => {
            const updatedContent = updateFrontmatter(content, property, newValue);
            return app.vault.modify(file, updatedContent);
          })
          .then(() => {
            setRefresh(prev => !prev);
            setLastRefreshed(new Date());
          })
          .catch(error => {
            console.error(`Error updating "${entry.$path}":`, error);
            alert(`Error: ${error.message}`);
          });
      }
    };

    const onDeleteEntry = (entry) => {
      if (!mergedSettings.vaultName) {
        alert("Vault name not specified.");
        return;
      }
      const file = app.vault.getAbstractFileByPath(entry.$path);
      if (!file) {
        alert(`File "${entry.$path}" not found.`);
        return;
      }
      const fileName = entry.$name || (entry.$path ? entry.$path.split("/").pop() : "this file");
      if (confirm(`Delete "${fileName}"?`)) {
        app.vault.trash(file)
          .then(() => {
            alert(`"${fileName}" trashed.`);
            setRefresh(prev => !prev);
          })
          .catch(error => {
            alert(`Delete failed: ${error.message}`);
            console.error(`Error deleting "${entry.$path}":`, error);
          });
      }
    };

    const totalEntries = groupedData.filter(item => !item.isHeader).length;

    return (
      <div style={{ ...styles.mainContainer, fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        {/* HEADER AREA */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>{mergedSettings.placeholders.headerTitle}</h1>
          <dc.Group style={styles.controlGroup}>
            <dc.Textbox
              type="search"
              placeholder={mergedSettings.placeholders.nameFilter}
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.textbox}
            />
            <dc.Textbox
              value={queryPath}
              placeholder={mergedSettings.placeholders.queryPath}
              onChange={(e) => {
                setQueryPath(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.textbox}
            />
            <dc.Button 
              onClick={handleManualReload} 
              style={{
                ...styles.button,
                backgroundColor: isReloading ? "var(--interactive-accent)" : "var(--interactive-normal)",
                color: isReloading ? "var(--text-on-accent)" : "var(--text-normal)",
                border: isReloading ? "none" : "1px solid var(--background-modifier-border)",
                cursor: isReloading ? "not-allowed" : "pointer"
              }}
              disabled={isReloading}
              title="Manual Reindex & Sync Folder"
            >
              <dc.Icon 
                icon="refresh-cw" 
                style={{ 
                  width: "16px", 
                  height: "16px",
                  animation: isReloading ? "spin 1s linear infinite" : "none"
                }} 
              />
            </dc.Button>
            <dc.Button 
              onClick={() => setIsEditing(!isEditing)} 
              style={{
                ...styles.button,
                backgroundColor: isEditing ? "var(--interactive-accent)" : "var(--interactive-normal)",
                color: isEditing ? "var(--text-on-accent)" : "var(--text-normal)",
                border: isEditing ? "none" : "1px solid var(--background-modifier-border)"
              }}
              title="Toggle settings panel"
            >
              <dc.Icon icon="settings" style={{ width: "16px", height: "16px" }} />
            </dc.Button>
          </dc.Group>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>

        {/* EDITING PANEL */}
        {isEditing && (
          <div style={{ padding: "16px", backgroundColor: "var(--background-secondary)", borderRadius: "12px", border: "1px solid var(--background-modifier-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <dc.Group style={styles.controlGroup}>
              <PaginationSettings
                isEnabled={isPaginationEnabled}
                setIsEnabled={setIsPaginationEnabled}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
              />
              <DisplaySettingsEditor
                truncateText={truncateText}
                setTruncateText={setTruncateText}
                baseline={baselineCellHeight}
                cellHeightOffset={cellHeightOffset}
                setCellHeightOffset={setCellHeightOffset}
              />
            </dc.Group>
            <div style={styles.editingContainer}>
              {columnsToShow.map((col, idx) => (
                <EditColumnBlock
                  key={col}
                  columnId={col}
                  index={idx}
                  columnsToShow={columnsToShow}
                  setColumnsToShow={setColumnsToShow}
                  editedHeaders={editedHeaders}
                  setEditedHeaders={setEditedHeaders}
                  editedFields={editedFields}
                  setEditedFields={setEditedFields}
                  updateColumn={updateColumn}
                  removeColumn={removeColumn}
                  dynamicColumnProperties={dynamicColumnProperties}
                  groupByColumns={groupByColumns}
                  setGroupByColumns={setGroupByColumns}
                />
              ))}
              <AddColumn
                newHeaderLabel={newHeaderLabel}
                setNewHeaderLabel={setNewHeaderLabel}
                newFieldLabel={newFieldLabel}
                setNewFieldLabel={setNewFieldLabel}
                addNewColumn={addNewColumn}
              />
            </div>
          </div>
        )}

        {/* DATA TABLE & PAGINATION CONTAINER */}
        <div style={styles.tableAndPaginationContainer}>
          <div style={{ flex: 1, position: "relative", overflowY: "auto" }}>
            <DataTable
              key={`datatable-${currentPage}`}
              columnsToShow={columnsToShow}
              dynamicColumnProperties={dynamicColumnProperties}
              data={paginatedData}
              groupByColumns={groupByColumns}
              onUpdateEntry={onUpdateEntry}
              onDeleteEntry={onDeleteEntry}
              displaySettings={{
                ...currentDisplaySettings,
                pagination: { isEnabled: isPaginationEnabled }
              }}
              app={app}
            />
          </div>

          {/* INTEGRATED BOTTOM PAGINATION BAR */}
          {isPaginationEnabled && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageInput={pageInput}
              setPageInput={setPageInput}
              totalEntries={totalEntries}
            />
          )}
        </div>
      </div>
    );
  };

  return { AppCore };
}

return AppModule;
