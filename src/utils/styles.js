// Styles for Datacore Flexilis
// Version: 4.1.0-PREMIUM

function getStyles() {
  return {
    // Main container for the entire view (Generous outer layout)
    mainContainer: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: "var(--background-primary)",
      color: "var(--text-normal)",
      height: "100%",
      padding: "24px 24px 0 24px",
      boxSizing: "border-box",
      gap: "20px",
    },
    // Header area (Translucent Bento-style top panel)
    header: {
      padding: "16px 24px",
      backgroundColor: "var(--background-secondary)",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "15px",
    }, 
    headerTitle: {
      margin: 0,
      fontSize: "20px",
      fontWeight: "700",
      letterSpacing: "-0.02em",
      color: "var(--text-normal)",
    },
    // Grouping for input controls (search, query, buttons)
    controlGroup: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    // Standard textbox style for search and query inputs
    textbox: {
      padding: "8px 12px",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "8px",
      backgroundColor: "var(--background-primary)",
      color: "var(--text-normal)",
      fontSize: "14px",
      width: "220px",
      boxSizing: "border-box",
      transition: "border-color 0.2s, box-shadow 0.2s",
      outline: "none",
      "&:focus": {
        borderColor: "var(--interactive-accent)",
        boxShadow: "0 0 0 2px var(--interactive-accent-hover)",
      }
    },
    // Textbox style used in header editing or inline cell editing
    headerTextbox: {
      padding: "6px 10px",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "6px",
      backgroundColor: "var(--background-primary)",
      color: "var(--text-normal)",
      width: "100%",
      boxSizing: "border-box",
      fontSize: "13px",
    },
    // Standard button style
    button: {
      padding: "8px 16px",
      backgroundColor: "var(--interactive-accent)",
      color: "var(--text-on-accent)",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      textAlign: "center",
      fontWeight: "600",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      transition: "background-color 0.15s, transform 0.1s",
    },
    // Container style for editing blocks (e.g., column settings)
    editBlock: {
      padding: "16px",
      border: "1px solid var(--background-modifier-border)",
      marginBottom: "12px",
      backgroundColor: "var(--background-secondary)",
      color: "var(--text-normal)",
      borderRadius: "10px",
      cursor: "grab",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      minWidth: "260px",
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    },
    // Inline button style (used inside editing blocks)
    inlineButton: {
      padding: "6px 10px",
      backgroundColor: "var(--interactive-normal)",
      color: "var(--text-normal)",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "12px",
      flex: "1",
      textAlign: "center",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    },
    // Container for the table; allows scrolling
    tableContainer: {
      flex: 1,
      overflow: "auto",
      position: "relative",
    },
    // Table header styling (sticky header)
    tableHeader: {
      display: "flex",
      backgroundColor: "var(--background-secondary)",
      top: 0,
      flexShrink: 0,
    },
    // Individual header cell style
    tableHeaderCell: {
      padding: "14px 18px",
      fontWeight: "700",
      fontSize: "12px",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "2px solid var(--background-modifier-border)",
      textAlign: "left",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      backgroundColor: "var(--background-secondary)",
    },
    // Style for each row in the table
    tableRow: {
      display: "flex",
      borderBottom: "1px solid var(--background-modifier-border)",
      flexShrink: 0,
      "&:hover": {
        backgroundColor: "var(--background-secondary-alt)",
      }
    },
    // Style for a standard table cell
    tableCell: {
      padding: "12px 16px",
      borderBottom: "1px solid var(--background-modifier-border)",
      verticalAlign: "middle",
      boxSizing: "border-box",
      overflow: "hidden",
    },
    // Wrapper for cell content (used for tooltips, drag interactions, etc.)
    cellWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
    },
    // Style for draggable links (e.g., file links)
    draggableLink: {
      cursor: "pointer",
      textDecoration: "none",
      fontWeight: "500",
      color: "var(--interactive-accent)",
      "&:hover": {
        textDecoration: "underline",
      }
    },
    // Tooltip that appears when hovering truncated text
    cellTooltip: {
      display: "none",
      position: "absolute",
      backgroundColor: "var(--background-secondary)",
      padding: "8px",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      maxWidth: "300px",
      wordBreak: "break-word",
      whiteSpace: "normal",
      top: "100%",
      left: "0",
      zIndex: 1000,
    },
    // Floating-card container that wraps both table and pagination controls
    tableAndPaginationContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "var(--background-primary)",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      margin: "0 0 24px 0",
      position: "relative",
    },
    // Pagination container (Integrated bottom bento-bar)
    pagination: {
      backgroundColor: "var(--background-secondary)",
      borderTop: "1px solid var(--background-modifier-border)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 24px",
      gap: "16px",
      boxSizing: "border-box",
      width: "100%",
    },
    // Textbox style used in pagination controls
    paginationTextbox: {
      width: "80px",
      padding: "6px 10px",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "6px",
      backgroundColor: "var(--background-primary)",
      color: "var(--text-normal)",
      boxSizing: "border-box",
      fontSize: "13px",
      textAlign: "center",
    },
    // Text style for displaying current page/total pages info
    paginationText: {
      fontSize: "13px",
      fontWeight: "500",
      color: "var(--text-muted)",
    },
    // Container for pagination settings (e.g., enable/disable pagination)
    paginationSettingsContainer: {
      padding: "10px 0",
      width: "100%",
      borderTop: "none",
    },
    // Main container inside pagination settings for layout
    paginationMain: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    // Left side of pagination settings (label + checkbox)
    paginationLeft: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    // Right side of pagination settings (items per page input)
    paginationRight: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    // Label style for pagination settings
    paginationTitle: {
      fontWeight: "bold",
    },
    paginationLabel: {
      fontSize: "14px",
    },
    // Container for column editing controls; scrollable if many columns
    editingContainer: {
      display: "flex",
      flexDirection: "row",
      gap: "12px",
      paddingTop: "12px",
      paddingBottom: "12px",
      overflowX: "auto",
      whiteSpace: "nowrap",
    },
    // Textbox for editing data fields within a column block
    dataFieldTextbox: {
      padding: "6px 10px",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "6px",
      backgroundColor: "var(--background-primary)",
      color: "var(--text-normal)",
      width: "100%",
      boxSizing: "border-box",
      fontSize: "13px",
    },
    // Small button style for group order controls, sort toggles, etc.
    buttonSmall: {
      padding: "4px 8px",
      backgroundColor: "var(--interactive-normal)",
      color: "var(--text-normal)",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    },
    // Message styling when no data is available
    noData: {
      padding: "40px",
      textAlign: "center",
      color: "var(--text-muted)",
      fontSize: "14px",
    },
    // Container for data field inputs within editing components
    dataFieldContainer: {
      display: "flex",
      flexDirection: "column",
    },
    unifiedDateInput: {
      padding: "8px 10px",
      border: "1px solid var(--background-modifier-border)",
      borderRadius: "6px",
      backgroundColor: "var(--background-secondary)",
      width: "100%",
      boxSizing: "border-box",
      color: "var(--text-normal)",
      "&::-webkit-calendar-picker-indicator": {
        position: "absolute",
        right: "10px",
        marginRight: "0px",
      },
    },
    // Base style for the CustomBooleanCell container.
    customBooleanCell: {
      display: "flex",
      width: "22px",
      height: "22px",
      border: "1.5px dashed var(--text-muted)",
      borderRadius: "6px",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      backgroundColor: "transparent",
      margin: "0 auto",
      transition: "background-color 0.15s, border-color 0.15s",
    },
    // Additional style applied when the checkbox is active (checked).
    customBooleanCellActive: {
      backgroundColor: "#8a63d2",
      borderStyle: "solid",
      borderColor: "#8a63d2",
    },
    // Style to center content (used for boolean cells and others)
    editableCellCenter: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    // Styles for editable cell container when truncation is enabled.
    editableCellContainerTruncated: {
      position: "relative",
      width: "100%",
      padding: "4px 6px",
      boxSizing: "border-box",
      whiteSpace: "nowrap",
      overflowX: "hidden",
      overflowY: "hidden",
      textOverflow: "ellipsis",
    },
    // Styles for editable cell container when truncation is disabled.
    editableCellContainerExpanded: {
      position: "relative",
      width: "100%",
      padding: "4px 6px",
      boxSizing: "border-box",
      whiteSpace: "pre-wrap",
      overflow: "visible",
      wordBreak: "break-word",
    },
    // Inline text styles for truncated content.
    inlineTextTruncated: {
      display: "inline-block",
      whiteSpace: "nowrap",
      width: "max-content",
    },
    // Inline text styles for expanded content.
    inlineTextExpanded: {
      display: "block",
      whiteSpace: "normal",
      width: "100%",
    },
    // Styles for non‑editable cell when truncation is enabled.
    nonEditableCellTruncated: {
      whiteSpace: "nowrap",
      overflowX: "hidden",
      textOverflow: "ellipsis",
    },
    // Styles for non‑editable cell when truncation is disabled.
    nonEditableCellExpanded: {
      whiteSpace: "normal",
      overflow: "visible",
      wordBreak: "break-word",
    },
  };
}

return { getStyles };
