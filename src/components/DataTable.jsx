// Main DataTable rendering engine for Datacore Flexilis
// Version: 4.1.0-PREMIUM

async function DataTableModule({ folderPath, dc }) {
  const { useState, useEffect, useMemo, useRef } = dc;

  // Import Cells dynamically
  const CellsModule = await dc.require(folderPath + "/src/components/Cells.jsx");
  const { TableCell, ActionCell } = await CellsModule({ folderPath, dc });

  // Import Styles dynamically
  const { getStyles } = await dc.require(folderPath + "/src/utils/styles.js");
  const styles = getStyles();

  /* ===========================
     Heuristics & Calculations
     =========================== */

  // Computes each column's type.
  function calculateColumnTypes(columnsToShow, dynamicColumnProperties) {
    const types = {};
    for (const col of columnsToShow) {
      const prop = dynamicColumnProperties[col];
      if (typeof prop === "string") {
        if (prop.endsWith(".obsidian")) {
          types[col] =
            prop === "ctime.obsidian" || prop === "mtime.obsidian"
              ? { type: "datetime", editable: false }
              : { type: "text", editable: false };
        } else {
          const lower = prop.toLowerCase();
          if (lower.includes("date")) types[col] = { type: "date", editable: true };
          else if (lower.includes("checkbox") || lower.includes("task"))
            types[col] = { type: "checkbox", editable: true };
          else if (lower.includes("number"))
            types[col] = { type: "number", editable: true };
          else types[col] = { type: "text", editable: true };
        }
      } else {
        types[col] = { type: "text", editable: true };
      }
    }
    return types;
  }

  // Returns a fixed width for a given column.
  function getColumnWidth(col, dynamicColumnProperties, columnTypes) {
    let defn = dynamicColumnProperties[col];
    if (typeof defn === "object" && defn !== null && defn.width) {
      return defn.width;
    }
    if (defn === "name.obsidian") return 220;
    const fieldType = columnTypes[col]?.type || "text";
    if (fieldType === "date" || fieldType === "datetime") return 240;
    return 150;
  }

  /* ===========================
     NonVirtualizedTable Component
     (for paginated mode)
     =========================== */
  function NonVirtualizedTable({
    columnsToShow,
    dynamicColumnProperties,
    data,
    onUpdateEntry,
    onDeleteEntry,
    displaySettings,
    app,
    columnTypes,
    headerWidths,
    actionsWidth,
    totalWidth,
    getStickyStyles,
  }) {
    function renderRow(row, idx) {
      if (row.isHeader) {
        return (
          <tr key={`group-${idx}`} style={{ backgroundColor: "var(--background-secondary-alt)" }}>
            <td
              colSpan={columnsToShow.length + 1}
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--background-modifier-border)",
                fontWeight: "bold",
                color: "var(--text-accent)",
                position: "relative",
              }}
            >
              <div style={{ position: "sticky", left: "18px", display: "inline-block" }}>
                {row.key}
              </div>
            </td>
          </tr>
        );
      }
      return (
        <tr key={`row-${row.$path || idx}`} className="datacore-table-row" style={{ display: "table-row" }}>
          {columnsToShow.map((col, i) => {
            return (
              <td
                key={col}
                style={{
                  ...styles.tableCell,
                  ...getStickyStyles(col, i, false),
                }}
              >
                <TableCell
                  entry={row}
                  columnId={col}
                  dynamicColumnProperties={dynamicColumnProperties}
                  onUpdateEntry={onUpdateEntry}
                  displaySettings={displaySettings}
                  app={app}
                  columnTypes={columnTypes}
                />
              </td>
            );
          })}
          <td
            style={{
              ...styles.tableCell,
              justifyContent: "center",
            }}
          >
            <ActionCell entry={row} onDeleteEntry={onDeleteEntry} displaySettings={displaySettings} />
          </td>
        </tr>
      );
    }

    return (
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", minWidth: totalWidth }}>
          <colgroup>
            {columnsToShow.map((col, i) => (
              <col key={col} style={{ width: headerWidths[i] }} />
            ))}
            <col style={{ width: actionsWidth }} />
          </colgroup>
          <thead
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10000,
              backgroundColor: "var(--background-secondary)",
            }}
          >
            <tr>
              {columnsToShow.map((col, i) => (
                <th
                  key={col}
                  style={{
                    ...styles.tableHeaderCell,
                    position: "sticky",
                    top: 0,
                    zIndex: 10000,
                    ...getStickyStyles(col, i, true),
                  }}
                >
                  {col}
                </th>
              ))}
              <th
                style={{
                  ...styles.tableHeaderCell,
                  position: "sticky",
                  top: 0,
                  zIndex: 10000,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? data.map(renderRow) : (
              <tr>
                <td colSpan={columnsToShow.length + 1} style={styles.noData}>
                  No data to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  /* ===========================
     VirtualizedTable Component
     (for non-pagination mode)
     =========================== */
  function VirtualRow({
    row,
    globalIndex,
    columnsToShow,
    headerWidths,
    actionsWidth,
    onUpdateEntry,
    onDeleteEntry,
    displaySettings,
    app,
    dynamicColumnProperties,
    columnTypes,
    updateRowHeight,
    getStickyStyles,
  }) {
    const rowRef = useRef(null);
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        updateRowHeight(globalIndex, height);
      }
    }, [globalIndex, updateRowHeight, row]);

    if (row.isHeader) {
      return (
        <tr ref={rowRef} key={`group-${globalIndex}`} style={{ backgroundColor: "var(--background-secondary-alt)" }}>
          <td
            colSpan={columnsToShow.length + 1}
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--background-modifier-border)",
              fontWeight: "bold",
              color: "var(--text-accent)",
              position: "relative",
            }}
          >
            <div style={{ position: "sticky", left: "18px", display: "inline-block" }}>
              {row.key}
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr ref={rowRef} key={`row-${row.$path || globalIndex}`} style={{ display: "table-row" }}>
        {columnsToShow.map((col, i) => {
          return (
            <td
              key={col}
              style={{
                ...styles.tableCell,
                ...getStickyStyles(col, i, false),
              }}
            >
              <TableCell
                entry={row}
                columnId={col}
                dynamicColumnProperties={dynamicColumnProperties}
                onUpdateEntry={onUpdateEntry}
                displaySettings={displaySettings}
                app={app}
                columnTypes={columnTypes}
              />
            </td>
          );
        })}
        <td
          style={{
            ...styles.tableCell,
            justifyContent: "center",
          }}
        >
          <ActionCell
            entry={row}
            onDeleteEntry={onDeleteEntry}
            displaySettings={displaySettings}
          />
        </td>
      </tr>
    );
  }

  function VirtualizedTable({
    columnsToShow,
    dynamicColumnProperties,
    data,
    onUpdateEntry,
    onDeleteEntry,
    displaySettings,
    app,
    columnTypes,
    headerWidths,
    actionsWidth,
    totalWidth,
    getStickyStyles,
  }) {
    const defaultRowHeight = 50;
    const [rowHeights, setRowHeights] = useState({});
    const containerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const scrollAnimationFrame = useRef(null);

    const cumulativeHeightsRef = useRef([]);
    useEffect(() => {
      let total = 0;
      const cum = data.map((_, i) => {
        const h = rowHeights[i] ?? defaultRowHeight;
        total += h;
        return total;
      });
      cumulativeHeightsRef.current = cum;
    }, [data, rowHeights, defaultRowHeight]);

    useEffect(() => {
      function measureContainer() {
        if (containerRef.current) {
          setContainerHeight(containerRef.current.clientHeight);
        }
      }
      measureContainer();
      window.addEventListener("resize", measureContainer);
      return () => window.removeEventListener("resize", measureContainer);
    }, []);

    const handleScroll = (e) => {
      const newScrollTop = e.target.scrollTop;
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
      }
      scrollAnimationFrame.current = requestAnimationFrame(() => {
        setScrollTop(newScrollTop);
      });
    };

    const binarySearch = (arr, value) => {
      let low = 0, high = arr.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] < value) low = mid + 1;
        else high = mid - 1;
      }
      return low;
    };

    const cumulativeHeights = cumulativeHeightsRef.current;
    const startIndex = useMemo(() => {
      let low = 0, high = cumulativeHeights.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (cumulativeHeights[mid] < scrollTop) low = mid + 1;
        else high = mid - 1;
      }
      return low;
    }, [cumulativeHeights, scrollTop]);

    const endIndex = useMemo(() => {
      const scrollBottom = scrollTop + containerHeight;
      let low = 0, high = cumulativeHeights.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (cumulativeHeights[mid] < scrollBottom) low = mid + 1;
        else high = mid - 1;
      }
      return Math.min(data.length, low + 1);
    }, [cumulativeHeights, scrollTop, containerHeight, data.length]);

    const overscanCount = 10;
    const startIndexOverscan = Math.max(0, startIndex - overscanCount);
    const endIndexOverscan = Math.min(data.length, endIndex + overscanCount);
    const visibleRows = data.slice(startIndexOverscan, endIndexOverscan);

    const totalContentHeight = cumulativeHeights[cumulativeHeights.length - 1] || 0;
    const topSpacerHeight = startIndexOverscan > 0 ? cumulativeHeights[startIndexOverscan - 1] : 0;
    const bottomSpacerHeight = totalContentHeight - (endIndexOverscan > 0 ? cumulativeHeights[endIndexOverscan - 1] : 0);

    const updateRowHeight = (index, height) => {
      setRowHeights((prev) => {
        if (prev[index] === height) return prev;
        return { ...prev, [index]: height };
      });
    };

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ position: "relative", width: "100%", height: "100%", overflow: "auto" }}
      >
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", minWidth: totalWidth }}>
          <colgroup>
            {columnsToShow.map((col, i) => (
              <col key={col} style={{ width: headerWidths[i] }} />
            ))}
            <col style={{ width: actionsWidth }} />
          </colgroup>
          <thead
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10000,
              backgroundColor: "var(--background-secondary)",
            }}
          >
            <tr>
              {columnsToShow.map((col, i) => (
                <th
                  key={col}
                  style={{
                    ...styles.tableHeaderCell,
                    position: "sticky",
                    top: 0,
                    zIndex: 10000,
                    ...getStickyStyles(col, i, true),
                  }}
                >
                  {col}
                </th>
              ))}
              <th
                style={{
                  ...styles.tableHeaderCell,
                  position: "sticky",
                  top: 0,
                  zIndex: 10000,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: topSpacerHeight }}>
              <td colSpan={columnsToShow.length + 1} style={{ padding: 0, margin: 0 }} />
            </tr>
            {visibleRows.length > 0 ? visibleRows.map((row, localIndex) => (
              <VirtualRow
                key={startIndexOverscan + localIndex}
                row={row}
                globalIndex={startIndexOverscan + localIndex}
                columnsToShow={columnsToShow}
                headerWidths={headerWidths}
                actionsWidth={actionsWidth}
                onUpdateEntry={onUpdateEntry}
                onDeleteEntry={onDeleteEntry}
                displaySettings={displaySettings}
                app={app}
                dynamicColumnProperties={dynamicColumnProperties}
                columnTypes={columnTypes}
                updateRowHeight={updateRowHeight}
                getStickyStyles={getStickyStyles}
              />
            )) : (
              <tr>
                <td colSpan={columnsToShow.length + 1} style={styles.noData}>
                  No data to display.
                </td>
              </tr>
            )}
            <tr style={{ height: bottomSpacerHeight }}>
              <td colSpan={columnsToShow.length + 1} style={{ padding: 0, margin: 0 }} />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  /* ===========================
     Main DataTable Component
     =========================== */
  function DataTable(props) {
    const {
      columnsToShow,
      dynamicColumnProperties,
      data,
      onUpdateEntry,
      onDeleteEntry,
      displaySettings,
      app,
    } = props;

    const isPaginationEnabled = displaySettings?.pagination?.isEnabled === true;
    const virtualizationEnabled = !isPaginationEnabled;

    const columnTypes = useMemo(
      () => calculateColumnTypes(columnsToShow, dynamicColumnProperties),
      [columnsToShow, dynamicColumnProperties]
    );
    const headerWidths = columnsToShow.map((col) =>
      getColumnWidth(col, dynamicColumnProperties, columnTypes)
    );
    const actionsWidth = 150;
    const totalWidth = headerWidths.reduce((sum, w) => sum + w, 0) + actionsWidth;

    const stickyColumns = useMemo(() => {
      const raw = displaySettings?.stickyColumns || [];
      return Array.isArray(raw) ? raw : [raw];
    }, [displaySettings]);

    const isSticky = (col) => stickyColumns.includes(col);

    const leftOffsets = useMemo(() => {
      const offsets = [];
      let currentLeft = 0;
      columnsToShow.forEach((col, i) => {
        offsets[i] = currentLeft;
        if (isSticky(col)) {
          currentLeft += headerWidths[i];
        }
      });
      return offsets;
    }, [columnsToShow, stickyColumns, headerWidths]);

    const getStickyStyles = useMemo(() => {
      return (col, i, isHeader = false) => {
        if (!isSticky(col)) return {};
        const isLastSticky = stickyColumns[stickyColumns.length - 1] === col;
        return {
          position: "sticky",
          left: `${leftOffsets[i]}px`,
          top: isHeader ? 0 : undefined,
          zIndex: isHeader ? 10005 : 105,
          backgroundColor: isHeader ? "var(--background-secondary)" : "var(--background-primary)",
          boxShadow: isLastSticky ? "2px 0 4px rgba(0, 0, 0, 0.15)" : "none",
          borderRight: isLastSticky ? "1px solid var(--background-modifier-border)" : "none",
        };
      };
    }, [leftOffsets, stickyColumns]);

    return virtualizationEnabled ? (
      <VirtualizedTable
        columnsToShow={columnsToShow}
        dynamicColumnProperties={dynamicColumnProperties}
        data={data}
        onUpdateEntry={onUpdateEntry}
        onDeleteEntry={onDeleteEntry}
        displaySettings={displaySettings}
        app={app}
        columnTypes={columnTypes}
        headerWidths={headerWidths}
        actionsWidth={actionsWidth}
        totalWidth={totalWidth}
        getStickyStyles={getStickyStyles}
      />
    ) : (
      <NonVirtualizedTable
        columnsToShow={columnsToShow}
        dynamicColumnProperties={dynamicColumnProperties}
        data={data}
        onUpdateEntry={onUpdateEntry}
        onDeleteEntry={onDeleteEntry}
        displaySettings={displaySettings}
        app={app}
        columnTypes={columnTypes}
        headerWidths={headerWidths}
        actionsWidth={actionsWidth}
        totalWidth={totalWidth}
        getStickyStyles={getStickyStyles}
      />
    );
  }

  return { calculateColumnTypes, getColumnWidth, NonVirtualizedTable, VirtualRow, VirtualizedTable, DataTable };
}

return DataTableModule;
