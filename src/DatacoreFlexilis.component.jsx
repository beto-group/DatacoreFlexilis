// Datacore Flexilis - Host & Leaf Adapter Shell
// Version: 4.0.0-ADAPTER

async function View({ folderPath, dc }) {
  const adapter = dc.app.vault.adapter;

  // 1. SAFE AGENT (Persistent CLI/MCP Command Polling)
  const Agent = {
    timer: null,
    start: (onReload) => {
      if (Agent.timer) clearInterval(Agent.timer);
      const cmdFile = folderPath + '/data/mcp_commands.json';

      Agent.timer = setInterval(async () => {
        try {
          if (!(await adapter.exists(cmdFile))) return;
          const content = await adapter.read(cmdFile);
          let cmd; try { cmd = JSON.parse(content); } catch (e) { return; }

          if (cmd && cmd.executed === false) {
            const SAFE_ACTIONS = ['reload', 'open_settings', 'screenshot'];
            if (SAFE_ACTIONS.includes(cmd.action)) {
              cmd.executed = true;
              cmd.result = "ExecutedAt: " + new Date().toISOString();
              await adapter.write(cmdFile, JSON.stringify(cmd, null, 2));

              if (cmd.action === 'reload') onReload();
              else if (cmd.action === 'open_settings') dc.app.setting.open();
            }
          }
        } catch (e) { }
      }, 1000);
      return () => clearInterval(Agent.timer);
    }
  };

  // Load App Component
  const AppModule = await dc.require(folderPath + '/src/App.jsx');
  const { AppCore } = await AppModule({ folderPath, dc });

  // 2. CONSOLIDATED CORE COMPONENT (Ghost-Snap Protocol)
  const DashboardCore = ({ initialSettingsOverride = {}, currentFilePath = "" }) => {
    const [appState, setAppState] = dc.useState({ status: 'BOOTING', key: 0 });
    const [isHijacked, setIsHijacked] = dc.useState(false);
    const containerRef = dc.useRef(null);

    // A. Agent Life-Cycle
    dc.useEffect(() => {
      return Agent.start(() => {
        if (dc.app.workspace.activeLeaf?.rebuildView) dc.app.workspace.activeLeaf.rebuildView();
        else setAppState(s => ({ ...s, key: s.key + 1 }));
      });
    }, []);

    // B. Impeccable Status (Chrome Suppression)
    const styleId = dc.useRef('chrome-suppress-' + Math.random().toString(36).substr(2, 5)).current;
    dc.useEffect(() => {
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          .status-bar, .view-footer, .inline-title { display: none !important; }
          .workspace-leaf-content { padding: 0 !important; margin: 0 !important; border-radius: 0 !important; }
          .flexilis-ghost-container { background: var(--background-primary); color: var(--text-normal); }
        `;
        document.head.appendChild(styleEl);
      }
      return () => {
        const s = document.getElementById(styleId); 
        if (s) s.remove();
      };
    }, []);

    // C. Live YAML Metadata Listener
    const [liveSettings, setLiveSettings] = dc.useState(initialSettingsOverride);

    dc.useEffect(() => {
      const handleMetadataChange = (file) => {
        const targetPath = currentFilePath || dc.app.workspace.getActiveFile()?.path || "";
        if (file && file.path === targetPath) {
          const cache = dc.app.metadataCache.getCache(targetPath);
          const fm = cache?.frontmatter || {};
          
          const dynamicColumnProperties = {};
          if (fm?.columns && Array.isArray(fm.columns)) {
            fm.columns.forEach(item => {
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
            Object.assign(dynamicColumnProperties, {
              Notes: "name.obsidian",
              Source: "source",
              Tags: "tags",
              "Modified Date": "mtime.obsidian"
            });
          }

          const groupByColumns = [];
          if (fm?.groupBy) {
            groupByColumns.push({
              column: fm.groupBy,
              order: fm?.groupOrder || "desc"
            });
          }

          const stickyColumns = [];
          if (fm?.stickyColumns) {
            if (Array.isArray(fm.stickyColumns)) {
              stickyColumns.push(...fm.stickyColumns);
            } else if (typeof fm.stickyColumns === 'string') {
              stickyColumns.push(fm.stickyColumns);
            }
          }

          const newSettings = {
            queryPath: fm?.queryPath || "",
            initialNameFilter: fm?.initialNameFilter || "",
            dynamicColumnProperties,
            groupByColumns,
            pagination: {
              isEnabled: fm?.paginationEnabled ?? false,
              itemsPerPage: Number(fm?.paginationLimit || 8)
            },
            display: {
              truncateText: fm?.truncateText ?? true,
              cellHeight: String(fm?.cellHeight || "88"),
              stickyColumns
            },
            placeholders: {
              nameFilter: fm?.placeholderSearch || "Search notes...",
              queryPath: fm?.placeholderQuery || "Enter path...",
              headerTitle: fm?.placeholderHeader || "Notes Viewer"
            }
          };

          setLiveSettings(newSettings);
        }
      };

      dc.app.metadataCache.on("changed", handleMetadataChange);
      return () => {
        dc.app.metadataCache.off("changed", handleMetadataChange);
      };
    }, [initialSettingsOverride, currentFilePath]);

    // D. Ghost-Snap Engine (SKILL Validated FullTab Standard)
    const originalParentRef = dc.useRef(null);
    const placeholderRef = dc.useRef(null);

    dc.useEffect(() => {
      const settleTimeout = setTimeout(() => {
        const container = containerRef.current;
        if (!container || isHijacked) return;

        // 1. Resolve Local Leaf
        let leaf = container.closest('.workspace-leaf');
        if (!leaf) leaf = document.querySelector('.workspace-leaf.mod-active');
        if (!leaf) return;

        const wrapper = leaf.querySelector('.view-content');
        if (!wrapper) return;

        const currentParent = container.parentNode;
        if (!currentParent || currentParent === wrapper) return;

        // 2. Placeholder for Restoration
        originalParentRef.current = currentParent;
        const placeholder = document.createElement('div');
        placeholder.className = 'flexilis-mode-placeholder';
        placeholder.style.display = 'none';
        if (container.nextSibling) currentParent.insertBefore(placeholder, container.nextSibling);
        else currentParent.appendChild(placeholder);
        placeholderRef.current = placeholder;

        // 3. Stacking Context (Anti-Bleed Protocol)
        const computed = window.getComputedStyle(wrapper).position;
        if (computed === 'static') wrapper.style.position = "relative";
        wrapper.style.overflow = "hidden"; // Prevent scrollbar double-up

        // 4. Reparent & Style
        currentParent.removeChild(container);
        wrapper.appendChild(container);

        Object.assign(container.style, {
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%",
          zIndex: "9998",
          margin: "0",
          padding: "0",
          background: "var(--background-primary)",
          overflow: "auto",
          display: "block",
          visibility: 'visible'
        });

        setIsHijacked(true);
        window.dispatchEvent(new Event('resize'));
      }, 300);

      return () => {
        clearTimeout(settleTimeout);
        if (isHijacked && containerRef.current && originalParentRef.current) {
          try {
            const placeholder = placeholderRef.current;
            if (placeholder?.parentNode) {
              placeholder.parentNode.replaceChild(containerRef.current, placeholder);
            }
            Object.assign(containerRef.current.style, {
              position: "", top: "", left: "", width: "", height: "", 
              zIndex: "", margin: "", padding: "", background: "", 
              overflow: "", display: "block"
            });
          } catch (e) { console.error("[Flexilis] FullTab Cleanup failed:", e); }
        }
      };
    }, []);

    return (
      <div 
        ref={containerRef} 
        key={appState.key} 
        className="flexilis-ghost-container"
        style={{ 
          width: '100%', 
          height: '100%', 
          visibility: isHijacked ? 'visible' : 'hidden' 
        }}
      >
        <AppCore dc={dc} initialSettingsOverride={liveSettings} />
      </div>
    );
  };

  // Return the component function for cleaner Datacore lifecycle management
  return DashboardCore;
}

return { View };
