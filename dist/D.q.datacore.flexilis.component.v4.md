# ViewComponent

```jsx
const _app = dc.app || app;
const thisFilePath = dc.resolvePath("dist/D.q.datacore.flexilis.component.v4.md");
const componentRootPath = thisFilePath.substring(0, thisFilePath.lastIndexOf('/dist'));

const { View, DisplaySettingsEditor } = await dc.require(componentRootPath + "/src/DatacoreFlexilis.component.jsx");
return { View, DisplaySettingsEditor };
```

# Components

```jsx
const thisFilePath = dc.resolvePath("dist/D.q.datacore.flexilis.component.v4.md");
const componentRootPath = thisFilePath.substring(0, thisFilePath.lastIndexOf('/dist'));

const EditColumnBlock = await dc.require(componentRootPath + "/src/components/EditingPanel.jsx");
const DataTable = await dc.require(componentRootPath + "/src/components/DataTable.jsx");
const Pagination = await dc.require(componentRootPath + "/src/components/Pagination.jsx");
const Cells = await dc.require(componentRootPath + "/src/components/Cells.jsx");

return {
  ...EditColumnBlock,
  ...DataTable,
  ...Pagination,
  ...Cells
};
```

# InitialSettings

```jsx
const thisFilePath = dc.resolvePath("dist/D.q.datacore.flexilis.component.v4.md");
const componentRootPath = thisFilePath.substring(0, thisFilePath.lastIndexOf('/dist'));

const { initialSettings } = await dc.require(componentRootPath + "/src/utils/settings.js");
return { initialSettings };
```

# HelperFunctions

```jsx
const thisFilePath = dc.resolvePath("dist/D.q.datacore.flexilis.component.v4.md");
const componentRootPath = thisFilePath.substring(0, thisFilePath.lastIndexOf('/dist'));

const helper = await dc.require(componentRootPath + "/src/utils/helper.js");
return helper;
```

# ViewerStyles

```jsx
const thisFilePath = dc.resolvePath("dist/D.q.datacore.flexilis.component.v4.md");
const componentRootPath = thisFilePath.substring(0, thisFilePath.lastIndexOf('/dist'));

const styles = await dc.require(componentRootPath + "/src/utils/styles.js");
return styles;
```
