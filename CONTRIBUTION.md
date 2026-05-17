# 🤝 Contributing to Flexilis: Engineering & Architectural Standards

Welcome to the **Flexilis Ecosystem** contributor guide. Flexilis represents a class-leading, high-performance database grid framework designed to work natively and independently inside Obsidian. 

To maintain the architectural integrity, blazing performance, and premium aesthetics of this ecosystem, all contributions must strictly adhere to the following standards.

---

## 1. Core Architectural Pillars

### ⚡ Blazing Performance: Zero-Lag In-Memory Caching
We do not perform full-vault directory scans or heavy markdown parsing loops inside active render cycles. 
*   **The Cache Rule**: Always utilize the global `obsidianFlexilisCache` Map.
*   **Incremental Mutation**: Real-time vault events (`changed`, `resolve`, `create`, `delete`, `rename`) must update the in-memory Map **in-place for the mutated file only (`O(1)`)**. 
*   **Memory Queries**: Pull data strictly by filtering Map entries in memory. Keep horizontal and vertical grid actions to `<1ms` computation overhead.

### 🧩 Sterile Zero-Dependency Architecture
Flexilis runs as a zero-plugin standalone layout. 
*   Do **not** import or depend on heavy third-party npm packages.
*   Rely strictly on native React/Preact hooks and Obsidian Core API adapters.

### 🛡️ Sandboxed Styling (Anti-Bleed Protocol)
Flexilis runs nested within active Obsidian workspace panels. 
*   Ensure all CSS layout changes are strictly scoped within component style declarations.
*   Never bleed general tags or global styles into the native Obsidian workspace.
*   Keep styling premium: use vibrant glassmorphic gradients, CSS variables, and cohesive border/shadow spacing that matches modern Dark/Light modes seamlessly.

---

## 2. Development Workflow

### A. Local Compiling & Rebuilding
Flexilis utilizes a persistent background agent to poll for developer commands. To trigger a fast rebuild:
1.  Make your modifications in the `src/` directory.
2.  Write the `reload` instruction to `data/mcp_commands.json`:
    ```json
    {
      "action": "reload",
      "executed": false
    }
    ```
3.  The compilation listener will pick it up and refresh your active view within Obsidian in a split-second.

### B. Legacy Sorting Compatibility
To keep database columns transparently sorting across different versions, always represent timestamps in **seconds** (divide milliseconds by 1000, i.e., `file.stat.ctime / 1000`) before binding files to data cells.

---
*Thank you for helping us build the ultimate high-performance database workspace!*
*Beto Group LLC | Institutional Engineering Division*
