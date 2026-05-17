// Cell renderers for Datacore Flexilis
// Version: 4.1.0-PREMIUM

async function CellsModule({ folderPath, dc }) {
  const { useState, useEffect, useMemo, useRef } = dc;

  // Import Styles & Helpers
  const { getStyles } = await dc.require(folderPath + "/src/utils/styles.js");
  const { getProperty: helperGetProperty } = await dc.require(folderPath + "/src/utils/helper.js");
  const styles = getStyles();

  /**
   * DraggableLink Component
   */
  function DraggableLink({ entry, title, fullTitle, app, noTruncate }) {
    const handleDragStart = (e) => {
      e.dataTransfer.setData("text/plain", `[[${fullTitle || title}]]`);
      e.dataTransfer.effectAllowed = "copy";
    };

    const handleClick = (e) => {
      e.preventDefault();
      if (app && app.workspace && typeof app.workspace.openLinkText === "function") {
        app.workspace.openLinkText(fullTitle || title, entry.$path, false);
      }
    };

    const handleMouseOver = (e) => {
      if (app && app.workspace && typeof app.workspace.trigger === "function") {
        app.workspace.trigger("hover-link", {
          event: e.nativeEvent || e,
          source: "datacore-flexilis",
          hoverParent: e.currentTarget.parentNode,
          targetEl: e.currentTarget,
          linktext: entry.$path || fullTitle || title,
          sourcePath: entry.$path,
        });
      }
    };

    return (
      <div className="cell-wrapper" style={styles.cellWrapper}>
        <a
          href="#"
          className="internal-link"
          draggable
          onDragStart={handleDragStart}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          data-href={entry.$path || fullTitle || title}
          data-type="file"
          style={{
            ...styles.draggableLink,
            display: "block",
            wordBreak: "break-all",
            ...(noTruncate
              ? {
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "unset",
                }
              : {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }
            ),
          }}
        >
          {title}
        </a>
      </div>
    );
  }

  /**
   * CustomBooleanCell Component
   */
  function CustomBooleanCell({ entry, property, onUpdate }) {
    const initialValue = helperGetProperty(entry, property);
    const [localValue, setLocalValue] = useState(initialValue);

    useEffect(() => {
      setLocalValue(initialValue);
    }, [initialValue]);

    const handleToggle = () => {
      const previousValue = localValue;
      const newValue = !localValue;
      setLocalValue(newValue);
      requestAnimationFrame(() => {
        onUpdate(entry, property, newValue).catch((error) => {
          setLocalValue(previousValue);
          alert("Error updating checkbox: " + error.message);
        });
      });
    };

    const cellStyle = {
      ...styles.customBooleanCell,
      ...(localValue ? styles.customBooleanCellActive : {}),
    };

    return (
      <div style={cellStyle} onMouseDown={handleToggle} title="Click to toggle checkbox">
        {localValue && (
          <dc.Icon icon="check" style={{ width: "14px", height: "14px", color: "var(--text-on-accent)" }} />
        )}
      </div>
    );
  }

  /**
   * EditableCell Component
   */
  function EditableCell({
    entry,
    property,
    onUpdate,
    displaySettings = {
      truncateText: true,
      fixedWidth: "220px",
      cellHeight: "50px",
    },
    forceBoolean = false,
  }) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState("");
    const inputRef = useRef(null);

    let value = helperGetProperty(entry, property);
    const rawText = typeof value === "string" ? value : String(value ?? "");
    const displayText = rawText.trim() === "" ? "\u00A0" : rawText;

    useEffect(() => {
      if (!isEditing) {
        setLocalValue(rawText);
      }
    }, [rawText, isEditing]);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    const handleBlur = () => {
      setIsEditing(false);
      if (localValue !== rawText) {
        onUpdate(entry, property, localValue);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleBlur();
      else if (e.key === "Escape") {
        setLocalValue(rawText);
        setIsEditing(false);
      }
    };

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: displaySettings.fixedWidth || "100%",
            height: displaySettings.cellHeight,
            padding: "8px 12px",
            border: "1px solid var(--background-modifier-border)",
            borderRadius: "6px",
            backgroundColor: "var(--background-secondary)",
            color: "var(--text-normal)",
            fontSize: "14px",
            boxSizing: "border-box"
          }}
        />
      );
    }

    if (!displaySettings.truncateText) {
      return (
        <div
          style={{
            width: displaySettings.fixedWidth || "100%",
            minHeight: displaySettings.cellHeight,
            whiteSpace: "pre-wrap",
            cursor: "text",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => setIsEditing(true)}
        >
          {displayText}
        </div>
      );
    }

    return (
      <div
        style={{
          position: "relative",
          width: displaySettings.fixedWidth || "100%",
          height: displaySettings.cellHeight,
          cursor: "text",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => setIsEditing(true)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            whiteSpace: "nowrap",
            height: "100%",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          {displayText}
        </div>
      </div>
    );
  }

  /**
   * ScrollableCell Component
   */
  function ScrollableCell({ children }) {
    return (
      <div
        className="scrollable-cell"
        style={{
          width: "100%",
          whiteSpace: "nowrap",
          overflowX: "auto",
          position: "relative",
        }}
      >
        {children}
      </div>
    );
  }

  /**
   * TagListCell Component
   */
  function TagListCell({ entry, property, onUpdateEntry, displaySettings, app }) {
    const rawValue = helperGetProperty(entry, property);
    let initialArray = [];
    if (Array.isArray(rawValue)) {
      initialArray = rawValue;
    } else if (typeof rawValue === "string") {
      initialArray = rawValue.split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      initialArray = [];
    }

    const [items, setItems] = useState(initialArray);
    const [newItem, setNewItem] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const inputRef = useRef(null);
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    function localUpdateEntry(entry, property, newValue) {
      if (!app || !app.vault) return;
      const file = app.vault.getAbstractFileByPath(entry.$path);
      if (file && (typeof TFile === "undefined" || file instanceof TFile)) {
        app.vault
          .read(file)
          .then((content) => {
            const updatedContent = customUpdateFrontmatter(content, property, newValue);
            return app.vault.modify(file, updatedContent);
          })
          .catch((error) => {
            console.error(`Error updating "${entry.$path}":`, error);
            alert("Error updating file: " + error.message);
          });
      }
    }

    function customUpdateFrontmatter(content, property, newValue) {
      const yamlRegex = /^---\n([\s\S]*?)\n---\n?/;
      const match = content.match(yamlRegex);
      if (match) {
        let yamlContent = match[1];
        const propertyRegex = new RegExp("^" + property + ":((?:\\n[ \\t]+-.*)+|\\s*.*)$", "m");
        if (propertyRegex.test(yamlContent)) {
          yamlContent = yamlContent.replace(propertyRegex, property + ":" + newValue);
        } else {
          yamlContent += "\n" + property + ":" + newValue;
        }
        return content.replace(yamlRegex, "---\n" + yamlContent + "\n---\n");
      } else {
        return "---\n" + property + ":" + newValue + "\n---\n" + content;
      }
    }

    function toYamlList(arr) {
      if (!arr || arr.length === 0) {
        return " []";
      }
      return "\n" + arr.map(item => `  - ${item}`).join("\n");
    }

    const updateFrontmatterArray = (updatedArray) => {
      const yamlValue = toYamlList(updatedArray);
      localUpdateEntry(entry, property, yamlValue);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const trimmed = newItem.trim();
        if (!trimmed) return;
        if (items.includes(trimmed)) {
          alert(`"${trimmed}" already exists in this list.`);
          return;
        }
        const updated = [...items, trimmed];
        setItems(updated);
        setNewItem("");
        updateFrontmatterArray(updated);
      }
    };

    const handleRemoveItem = (removed) => {
      const updated = items.filter((tag) => tag !== removed);
      setItems(updated);
      updateFrontmatterArray(updated);
    };

    const handleContainerClick = () => {
      if (!isEditing) {
        setIsEditing(true);
      }
    };

    const handleBlur = (e) => {
      setTimeout(() => {
        if (!e.currentTarget.contains(document.activeElement)) {
          setIsEditing(false);
          setNewItem("");
        }
      }, 100);
    };

    const renderChips = () =>
      items.map((tag) => (
        <div
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "var(--background-secondary)",
            color: "var(--text-normal)",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "13px",
            border: "1px solid var(--background-modifier-border)",
            marginRight: "4px",
          }}
        >
          <span>{tag}</span>
          <button
              onClick={(ev) => {
                  ev.stopPropagation();
                  handleRemoveItem(tag);
              }}
              style={{
                  marginLeft: "6px",
                  background: "none",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  appearance: "none",
                  cursor: "pointer",
                  color: "var(--text-faint)",
                  fontWeight: "bold",
                  fontSize: "12px",
                  lineHeight: 1,
                  padding: 0,
              }}
              title="Remove tag"
              >
              x
          </button>
        </div>
      ));

    const isTruncated = displaySettings.truncateText === true;

    const outerContainerStyle = {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "6px 8px",
      backgroundColor: "var(--background-primary)",
      cursor: "pointer",
      width: "100%",
      boxSizing: "border-box",
      overflowX: isTruncated ? "auto" : "visible",
      overflowY: isTruncated ? "hidden" : "visible",
      height:
        isTruncated && displaySettings.cellHeight
          ? displaySettings.cellHeight + "px"
          : "auto",
    };

    const wrapperStyle = {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: isTruncated ? "nowrap" : "wrap",
      whiteSpace: isTruncated ? "nowrap" : "normal",
    };

    return (
      <div
        style={outerContainerStyle}
        onClick={handleContainerClick}
        onBlur={handleBlur}
      >
        <div style={wrapperStyle}>
          {renderChips()}
          {isEditing && (
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setIsEditing(false);
                setNewItem("");
              }}
              placeholder="Add tag..."
              style={{
                border: "1px solid var(--background-modifier-border)",
                borderRadius: "4px",
                outline: "none",
                backgroundColor: "var(--background-primary)",
                color: "var(--text-normal)",
                fontSize: "12px",
                padding: "2px 6px",
                minWidth: "80px",
              }}
              onClick={(ev) => ev.stopPropagation()}
            />
          )}
        </div>
      </div>
    );
  }

  /**
   * DefaultTextCell Component
   */
  function DefaultTextCell({ entry, property, onUpdateEntry, displaySettings }) {
    const fullText = (val) => {
      if (val === null || val === undefined) return "";
      if (Array.isArray(val)) return val.join(", ");
      if (typeof val === "object") return val.value || val.raw || "";
      return String(val);
    };
    const rawValue = helperGetProperty(entry, property);
    const text = fullText(rawValue);
    if (property.endsWith(".obsidian")) {
      return displaySettings.truncateText ? (
        <ScrollableCell>{text}</ScrollableCell>
      ) : (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word", overflow: "visible" }}>
          {text}
        </div>
      );
    }
    return (
      <EditableCell
        entry={entry}
        property={property}
        onUpdate={onUpdateEntry}
        displaySettings={displaySettings}
      />
    );
  }

  /**
   * UnifiedDateCell
   */
  function UnifiedDateCell({ value, onChange, editable, style = {}, forceTime = false }) {
    const getStringValue = (val) => {
      if (typeof val === "string") return val;
      if (val && typeof val.toISO === "function") return val.toISO();
      return String(val);
    };
    const stringValue = getStringValue(value);

    const parseDateTime = (val) => {
      if (!val || typeof val !== "string" || !val.trim() || val.includes("Invalid")) {
        return { datePart: "", timePart: "", hasTime: false };
      }
      if (val.includes("T")) {
        const [datePart, timePart = ""] = val.split("T");
        return { datePart, timePart, hasTime: true };
      }
      return { datePart: val, timePart: "", hasTime: false };
    };

    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const isValidTime = (tStr) => /^\d{2}:\d{2}$/.test(tStr);

    const initial = parseDateTime(stringValue);
    const normalizedTime =
      initial.timePart && initial.timePart.length >= 5
        ? initial.timePart.substring(0, 5)
        : initial.timePart;

    const [localDate, setLocalDate] = useState(initial.datePart ? formatDate(initial.datePart) : "");
    const [localTime, setLocalTime] = useState(isValidTime(normalizedTime) ? normalizedTime : "");
    const [includeTime, setIncludeTime] = useState(forceTime ? true : false);

    const dateInputRef = useRef(null);
    const timeInputRef = useRef(null);

    const buildDateTimeString = (d, t, includeT) => {
      if (!d) return "";
      return includeT && t ? `${d}T${t}` : d;
    };

    if (!editable) {
      let displayVal = "";
      if (stringValue) {
        const parsed = new Date(stringValue);
        if (!isNaN(parsed.getTime())) {
          displayVal = includeTime
            ? parsed.toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: false,
              })
            : parsed.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
        } else {
          displayVal = stringValue;
        }
      }
      return (
        <div
          style={{
            ...style,
            padding: "8px 10px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "transparent",
            width: "100%",
            boxSizing: "border-box",
            color: "var(--text-normal)",
          }}
          title={displayVal}
        >
          {displayVal}
        </div>
      );
    }

    const handleDateChange = (e) => {
      const newDate = e.target.value;
      setLocalDate(newDate);
      onChange(buildDateTimeString(newDate, localTime, includeTime));
    };

    const handleTimeChange = (e) => {
      const newTime = e.target.value;
      setLocalTime(newTime);
      onChange(buildDateTimeString(localDate, newTime, includeTime));
    };

    const handleIncludeTimeChange = () => {
      const newIncludeTime = !includeTime;
      setIncludeTime(newIncludeTime);
      onChange(buildDateTimeString(localDate, localTime, newIncludeTime));
    };

    return (
      <div style={{ position: "relative", width: "100%", ...style }}>
        <style>{`
          .unified-date-input,
          .unified-time-input {
            background-image: none !important;
          }
          .unified-date-input::-webkit-calendar-picker-indicator,
          .unified-time-input::-webkit-calendar-picker-indicator {
            display: none !important;
          }
          .unified-date-input::-moz-calendar-picker-indicator,
          .unified-time-input::-moz-calendar-picker-indicator {
            display: none !important;
          }
        `}</style>

        <div style={{ position: "relative", width: "100%", marginBottom: "6px" }}>
          <input
            ref={dateInputRef}
            type="date"
            value={localDate}
            onChange={handleDateChange}
            className="unified-date-input"
            style={{
              padding: "8px 36px 8px 10px",
              border: "1px solid var(--background-modifier-border)",
              borderRadius: "6px",
              backgroundColor: "var(--background-secondary)",
              color: "var(--text-normal)",
              width: "100%",
              boxSizing: "border-box",
            }}
            placeholder="YYYY-MM-DD"
          />
          <div
            onClick={() => {
              if (dateInputRef.current?.showPicker) {
                dateInputRef.current.showPicker();
              } else {
                dateInputRef.current.focus();
              }
            }}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center"
            }}
          >
            <dc.Icon icon="calendar" style={{ width: "14px", height: "14px" }} />
          </div>
        </div>

        {includeTime && (
          <div style={{ position: "relative", width: "100%", marginBottom: "6px" }}>
            <input
              ref={timeInputRef}
              type="time"
              value={localTime}
              onChange={handleTimeChange}
              className="unified-time-input"
              style={{
                padding: "8px 36px 8px 10px",
                border: "1px solid var(--background-modifier-border)",
                borderRadius: "6px",
                backgroundColor: "var(--background-secondary)",
                color: "var(--text-normal)",
                width: "100%",
                boxSizing: "border-box",
              }}
              placeholder="--:--"
            />
            <div
              onClick={() => {
                if (timeInputRef.current?.showPicker) {
                  timeInputRef.current.showPicker();
                } else {
                  timeInputRef.current.focus();
                }
              }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center"
              }}
            >
              <dc.Icon icon="clock" style={{ width: "14px", height: "14px" }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-normal)",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={includeTime}
              onChange={handleIncludeTimeChange}
              style={{ width: "16px", height: "16px" }}
            />
            Include Time
          </label>
        </div>
      </div>
    );
  }

  /**
   * TableCell Component
   */
  function TableCell({ 
    entry, 
    columnId, 
    dynamicColumnProperties, 
    onUpdateEntry, 
    displaySettings, 
    app = {}, 
    columnTypes 
  }) {
    const property = dynamicColumnProperties[columnId];

    if (property === "name.obsidian") {
      const text = helperGetProperty(entry, property) || "";
      const cellStyle = {
        padding: "10px",
        backgroundColor: "var(--background-primary)",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
        whiteSpace: "normal",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: "break-all",
      };

      return (
        <div style={cellStyle}>
          <DraggableLink
            entry={entry}
            title={text}
            fullTitle={entry.$name || text}
            app={app}
            noTruncate={true}
          />
        </div>
      );
    }

    const cellStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      backgroundColor: "var(--background-primary)",
      boxSizing: "border-box",
      width: "100%",
      maxWidth: "100%",
      whiteSpace: "normal",
      overflow: "visible",
      wordBreak: "break-word",
    };

    const fieldInfo = (columnTypes && columnTypes[columnId])
      ? columnTypes[columnId]
      : { type: "text", editable: true };
    let fieldType = fieldInfo.type;
    const editable = fieldInfo.editable;

    if (app.metadataTypeManager && app.metadataTypeManager.properties) {
      let metaKey = property;
      if (property.endsWith(".obsidian")) {
        metaKey = property.replace(".obsidian", "");
      }
      const metaProp = app.metadataTypeManager.properties[metaKey];
      if (metaProp && metaProp.type === "checkbox") {
        fieldType = "checkbox";
      }
    }

    if (fieldType === "date" || fieldType === "datetime") {
      return (
        <div style={cellStyle}>
          <UnifiedDateCell
            value={helperGetProperty(entry, property)}
            onChange={(newVal) => onUpdateEntry(entry, property, newVal)}
            editable={editable}
            style={{ width: "100%" }}
            forceTime={fieldType === "datetime"}
          />
        </div>
      );
    }

    if (fieldType === "checkbox") {
      let rawValue = helperGetProperty(entry, property);
      let checkboxState = "undefined";
      if (typeof rawValue === "boolean") {
        checkboxState = rawValue ? "checked" : "unchecked";
      } else if (typeof rawValue === "string") {
        const lower = rawValue.trim().toLowerCase();
        if (lower === "true") checkboxState = "checked";
        else if (lower === "false") checkboxState = "unchecked";
        else checkboxState = "undefined";
      }
      return (
        <div style={cellStyle}>
          {checkboxState === "checked" && (
            <div
              onClick={() => onUpdateEntry(entry, property, false)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                backgroundColor: "var(--interactive-accent)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              title="Click to mark incomplete"
            >
              <dc.Icon icon="check" style={{ width: "14px", height: "14px", color: "var(--text-on-accent)" }} />
            </div>
          )}
          {checkboxState === "unchecked" && (
            <div
              onClick={() => onUpdateEntry(entry, property, true)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                border: "2px solid var(--background-modifier-border)",
                cursor: "pointer",
                backgroundColor: "transparent",
                transition: "border-color 0.15s, background-color 0.15s",
              }}
              title="Click to mark complete"
            />
          )}
          {checkboxState === "undefined" && (
            <div
              onClick={() => onUpdateEntry(entry, property, true)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                border: "2px dashed var(--background-modifier-border)",
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
              title="Click to mark complete"
            />
          )}
        </div>
      );
    }

    if (fieldType === "number") {
      return (
        <div style={cellStyle}>
          <input
            type="number"
            value={helperGetProperty(entry, property) != null ? helperGetProperty(entry, property) : ""}
            onChange={(e) =>
              onUpdateEntry(entry, property, e.target.value === "" ? null : Number(e.target.value))
            }
            style={{ 
              width: "100%", 
              padding: "8px", 
              border: "1px solid var(--background-modifier-border)",
              borderRadius: "6px",
              backgroundColor: "var(--background-secondary)",
              color: "var(--text-normal)",
              boxSizing: "border-box"
            }}
          />
        </div>
      );
    }

    const tagListProperties = ["tags", "ingredients", "diet"];
    if (tagListProperties.includes(property.toLowerCase())) {
      return (
        <div style={cellStyle}>
          <TagListCell
            entry={entry}
            property={property}
            onUpdateEntry={onUpdateEntry}
            displaySettings={displaySettings}
            app={app}
          />
        </div>
      );
    }

    if (editable) {
      return (
        <div style={cellStyle}>
          <DefaultTextCell
            entry={entry}
            property={property}
            onUpdateEntry={onUpdateEntry}
            displaySettings={displaySettings}
          />
        </div>
      );
    } else {
      return (
        <div style={cellStyle}>
          <DefaultTextCell
            entry={entry}
            property={property}
            onUpdateEntry={() => {}}
            displaySettings={displaySettings}
          />
        </div>
      );
    }
  }

  /**
   * ActionCell Component
   */
  function ActionCell({ entry, onDeleteEntry, displaySettings }) {
    const cellStyle = {
      padding: "10px",
      backgroundColor: "var(--background-primary)",
      boxSizing: "border-box",
      flex: "0 0 150px",
      width: "150px",
      minWidth: "150px",
      height: displaySettings.truncateText ? displaySettings.cellHeight : "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };
    return (
      <div style={cellStyle}>
        <dc.Button
          onClick={() => onDeleteEntry(entry)}
          style={{
            backgroundColor: "rgba(224, 86, 86, 0.1)",
            color: "var(--text-error)",
            border: "none",
            padding: "8px",
            cursor: "pointer",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.15s, color 0.15s",
          }}
          title="Delete file"
        >
          <dc.Icon icon="trash-2" style={{ width: "16px", height: "16px" }} />
        </dc.Button>
      </div>
    );
  }

  return { DraggableLink, CustomBooleanCell, EditableCell, ScrollableCell, TagListCell, DefaultTextCell, UnifiedDateCell, TableCell, ActionCell };
}

return CellsModule;
