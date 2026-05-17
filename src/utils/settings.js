// Settings for Datacore Flexilis
// Version: 4.0.0-UTILITY

const initialSettings = {
  queryPath: "PROJECTS/COOKBOOK/KNOWLEDGE/RECIPES/ALL",
  initialNameFilter: "",
  dynamicColumnProperties: {
    Dish: "name.obsidian",
    Source: "source",
    Genre: "genre",
    Tags: "tags",
    Ingredients: "ingredients",
    "Creation Date": "ctime.obsidian",
  },
  groupByColumns: [],
  pagination: {
    isEnabled: true,
    itemsPerPage: 10,
  },
  display: {
    truncateText: true,
    truncationLength: 20,
  },
  placeholders: {
    nameFilter: "Search notes...",
    queryPath: "Enter path...",
    headerTitle: "Recipe Viewer",
    newHeaderLabel: "New Header Label",
    newDataField: "New Data Field",
  },
};

return { initialSettings };
