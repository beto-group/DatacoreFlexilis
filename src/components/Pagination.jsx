// Pagination rendering logic for Datacore Flexilis
// Version: 4.1.0-PREMIUM

async function PaginationModule({ folderPath, dc }) {
  const { useState, useEffect, useMemo, useRef } = dc;

  // Import Styles
  const { getStyles } = await dc.require(folderPath + "/src/utils/styles.js");
  const styles = getStyles();

  /**
   * Pagination Component
   */
  function Pagination({ currentPage, totalPages, onPageChange, pageInput, setPageInput, totalEntries }) {
    return (
      <div style={styles.pagination}>
        {totalPages > 1 ? (
          <>
            <dc.Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.button,
                backgroundColor: currentPage === 1 ? "var(--interactive-normal)" : "var(--interactive-accent)",
                opacity: currentPage === 1 ? 0.6 : 1,
              }}
            >
              <dc.Icon icon="chevron-left" style={{ width: "16px", height: "16px" }} />
              <span>Previous</span>
            </dc.Button>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </span>
              <dc.Textbox
                type="number"
                value={pageInput}
                placeholder="Jump to..."
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const pageNum = parseInt(pageInput, 10);
                    if (!isNaN(pageNum)) onPageChange(pageNum);
                  }
                }}
                style={styles.paginationTextbox}
              />
              <dc.Button
                onClick={() => onPageChange(parseInt(pageInput, 10))}
                style={{
                  ...styles.button,
                  padding: "6px 12px",
                  borderRadius: "6px",
                }}
              >
                <dc.Icon icon="corner-down-left" style={{ width: "14px", height: "14px" }} />
                <span>Go</span>
              </dc.Button>
            </div>

            <dc.Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.button,
                backgroundColor: currentPage === totalPages ? "var(--interactive-normal)" : "var(--interactive-accent)",
                opacity: currentPage === totalPages ? 0.6 : 1,
              }}
            >
              <span>Next</span>
              <dc.Icon icon="chevron-right" style={{ width: "16px", height: "16px" }} />
            </dc.Button>
          </>
        ) : (
          <span style={styles.paginationText}>Total Entries: {totalEntries}</span>
        )}
      </div>
    );
  }

  return Pagination;
}

return PaginationModule;
