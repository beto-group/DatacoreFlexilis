// Editing panels and controls for Datacore Flexilis
// Version: 4.1.0-PREMIUM

async function EditingPanelModule({ folderPath, dc }) {
  const { useState, useEffect, useMemo, useRef } = dc;

  // Import Styles
  const { getStyles } = await dc.require(folderPath + "/src/utils/styles.js");
  const styles = getStyles();

  /**
   * EditableHeader Component
   */
  function EditableHeader({ columnId, editedHeaders, setEditedHeaders }) {
    const [isEditing, setIsEditing] = useState(false);
    const [headerValue, setHeaderValue] = useState(editedHeaders[columnId] || columnId);
    
    const handleBlur = () => {
      const trimmed = headerValue.trim();
      if (!trimmed) {
        alert("Header cannot be empty.");
        setHeaderValue(editedHeaders[columnId] || columnId);
      } else {
        setIsEditing(false);
        setEditedHeaders({ ...editedHeaders, [columnId]: trimmed });
      }
    };
    
    return isEditing ? (
      <dc.Textbox
        value={headerValue}
        onChange={(e) => setHeaderValue(e.target.value)}
        onBlur={handleBlur}
        autoFocus
        style={styles.headerTextbox}
      />
    ) : (
      <div 
        onClick={() => setIsEditing(true)} 
        style={{ 
          fontWeight: "700", 
          cursor: "pointer", 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "6px",
          color: "var(--text-normal)",
          fontSize: "14px",
        }}
      >
        <span>{headerValue}</span>
        <dc.Icon icon="pencil" style={{ width: "12px", height: "12px", opacity: 0.5 }} />
      </div>
    );
  }

  /**
   * EditColumnBlock Component
   */
  function EditColumnBlock({
    columnId,
    index,
    columnsToShow,
    setColumnsToShow,
    editedHeaders,
    setEditedHeaders,
    editedFields,
    setEditedFields,
    updateColumn,
    removeColumn,
    dynamicColumnProperties,
    groupByColumns,
    setGroupByColumns,
  }) {
    const isGrouped = groupByColumns.some(group => group.column === columnId);
    const groupIndex = groupByColumns.findIndex(group => group.column === columnId);
    const sortOrder = isGrouped ? groupByColumns[groupIndex].order : "asc";
    
    const handleDragStart = (e) => {
      e.dataTransfer.setData("dragIndex", index);
    };
    
    const handleDrop = (e) => {
      const dragIndex = parseInt(e.dataTransfer.getData("dragIndex"), 10);
      if (!isNaN(dragIndex)) {
        const newColumns = [...columnsToShow];
        const dragged = newColumns.splice(dragIndex, 1)[0];
        newColumns.splice(index, 0, dragged);
        setColumnsToShow(newColumns);
      }
    };
    
    const toggleSortOrder = () => {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setGroupByColumns(groupByColumns.map(group =>
        group.column === columnId ? { ...group, order: newOrder } : group
      ));
    };
    
    const handleDataFieldChange = (e) => {
      setEditedFields({ ...editedFields, [columnId]: e.target.value });
    };
    
    const handleDataFieldUpdate = () => {
      updateColumn(columnId, editedHeaders[columnId] || columnId, editedFields[columnId] || dynamicColumnProperties[columnId]);
    };
    
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={styles.editBlock}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--background-modifier-border)", paddingBottom: "8px", marginBottom: "4px" }}>
          <EditableHeader columnId={columnId} editedHeaders={editedHeaders} setEditedHeaders={setEditedHeaders} />
          <div style={{ cursor: "grab", color: "var(--text-faint)" }} title="Drag to reorder column">
            <dc.Icon icon="grip-vertical" style={{ width: "16px", height: "16px" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <dc.Textbox
            value={editedFields[columnId] || dynamicColumnProperties[columnId]}
            onChange={handleDataFieldChange}
            onBlur={handleDataFieldUpdate}
            style={styles.dataFieldTextbox}
            placeholder="Data Field..."
          />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={handleDataFieldUpdate} style={styles.inlineButton}>
            <dc.Icon icon="refresh-cw" style={{ width: "12px", height: "12px" }} />
            <span>Update</span>
          </button>
          <button onClick={() => removeColumn(columnId)} style={{ ...styles.inlineButton, color: "var(--text-error)" }}>
            <dc.Icon icon="trash" style={{ width: "12px", height: "12px" }} />
            <span>Remove</span>
          </button>
          <button
            onClick={() => {
              if (isGrouped) {
                setGroupByColumns(groupByColumns.filter(group => group.column !== columnId));
              } else {
                setGroupByColumns([...groupByColumns, { column: columnId, order: "asc" }]);
              }
            }}
            style={{
              ...styles.inlineButton,
              backgroundColor: isGrouped ? "var(--interactive-accent)" : "var(--interactive-normal)",
              color: isGrouped ? "var(--text-on-accent)" : "var(--text-normal)",
              border: isGrouped ? "1px solid var(--interactive-accent)" : "1px solid var(--background-modifier-border)"
            }}
          >
            <dc.Icon icon="layers" style={{ width: "12px", height: "12px" }} />
            <span>{isGrouped ? "Ungroup" : "Group By"}</span>
          </button>
        </div>
        {isGrouped && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--background-primary)", padding: "6px 8px", borderRadius: "6px", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>Order: {groupIndex + 1}</span>
            <button
              onClick={() => {
                setGroupByColumns(prev => {
                  const idx = prev.findIndex(g => g.column === columnId);
                  if (idx > 0) {
                    const newGroup = [...prev];
                    [newGroup[idx - 1], newGroup[idx]] = [newGroup[idx], newGroup[idx - 1]];
                    return newGroup;
                  }
                  return prev;
                });
              }}
              disabled={groupIndex === 0}
              style={{ ...styles.buttonSmall, padding: "2px 4px" }}
              title="Move up grouping hierarchy"
            >
              <dc.Icon icon="chevron-up" style={{ width: "12px", height: "12px" }} />
            </button>
            <button
              onClick={() => {
                setGroupByColumns(prev => {
                  const idx = prev.findIndex(g => g.column === columnId);
                  if (idx < prev.length - 1) {
                    const newGroup = [...prev];
                    [newGroup[idx], newGroup[idx + 1]] = [newGroup[idx + 1], newGroup[idx]];
                    return newGroup;
                  }
                  return prev;
                });
              }}
              disabled={groupIndex === groupByColumns.length - 1}
              style={{ ...styles.buttonSmall, padding: "2px 4px" }}
              title="Move down grouping hierarchy"
            >
              <dc.Icon icon="chevron-down" style={{ width: "12px", height: "12px" }} />
            </button>
            <button 
              onClick={toggleSortOrder} 
              style={{ ...styles.buttonSmall, padding: "2px 6px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              title="Toggle sort direction"
            >
              <dc.Icon icon={sortOrder === "asc" ? "arrow-up-narrow-wide" : "arrow-down-wide-narrow"} style={{ width: "12px", height: "12px" }} />
              <span>{sortOrder === "asc" ? "Asc" : "Desc"}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  /**
   * AddColumn Component
   */
  function AddColumn({ newHeaderLabel, setNewHeaderLabel, newFieldLabel, setNewFieldLabel, addNewColumn }) {
    return (
      <div style={{
        backgroundColor: "var(--background-secondary)",
        borderRadius: "10px",
        border: "1px solid var(--background-modifier-border)",
        padding: "16px",
        minWidth: "260px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
      }}>
        <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-normal)", display: "flex", alignItems: "center", gap: "6px" }}>
          <dc.Icon icon="plus-circle" style={{ width: "16px", height: "16px", color: "var(--interactive-accent)" }} />
          <span>Add New Column</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <dc.Textbox
            value={newHeaderLabel}
            onChange={(e) => setNewHeaderLabel(e.target.value)}
            placeholder="Header Label (e.g. Diet)"
            style={{ padding: "8px 10px", border: "1px solid var(--background-modifier-border)", borderRadius: "6px", backgroundColor: "var(--background-primary)", color: "var(--text-normal)", width: "100%", fontSize: "13px" }}
          />
          <dc.Textbox
            value={newFieldLabel}
            onChange={(e) => setNewFieldLabel(e.target.value)}
            placeholder="Data Field (e.g. diet)"
            style={{ padding: "8px 10px", border: "1px solid var(--background-modifier-border)", borderRadius: "6px", backgroundColor: "var(--background-primary)", color: "var(--text-normal)", width: "100%", fontSize: "13px" }}
          />
          <button
            onClick={addNewColumn}
            style={{
              padding: "10px 16px",
              backgroundColor: "var(--interactive-accent)",
              color: "var(--text-on-accent)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <dc.Icon icon="plus" style={{ width: "16px", height: "16px" }} />
            <span>Add Column</span>
          </button>
        </div>
      </div>
    );
  }

  /**
   * PaginationSettings Component
   */
  function PaginationSettings({ isEnabled, setIsEnabled, itemsPerPage, setItemsPerPage }) {
    return (
      <div style={styles.paginationSettingsContainer}>
        <div style={styles.paginationMain}>
          <div style={styles.paginationLeft}>
            <dc.Icon icon="book-open" style={{ width: "16px", height: "16px", color: "var(--text-muted)" }} />
            <label style={{ ...styles.paginationTitle, fontSize: "14px", color: "var(--text-normal)" }}>Enable Pagination</label>
            <dc.Checkbox
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              style={{ marginLeft: "6px" }}
            />
          </div>
          {isEnabled && (
            <div style={styles.paginationRight}>
              <label style={{ ...styles.paginationLabel, color: "var(--text-muted)" }}>Rows per page:</label>
              <dc.Textbox
                type="number"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                style={{ ...styles.paginationTextbox, width: "70px", padding: "6px" }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return { EditableHeader, EditColumnBlock, AddColumn, PaginationSettings };
}

return EditingPanelModule;
