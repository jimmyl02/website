// Keep native table semantics while giving wide tables their own scroll area.
export default function rehypeTables() {
  return (tree) => {
    function wrapTables(node) {
      if (!node.children) return;

      node.children = node.children.map((child) => {
        wrapTables(child);
        if (child.type !== "element" || child.tagName !== "table") return child;

        return {
          type: "element",
          tagName: "div",
          properties: {
            className: ["table-scroll"],
            tabIndex: 0,
            role: "region",
            ariaLabel: "Scrollable table",
          },
          children: [child],
        };
      });
    }

    wrapTables(tree);
  };
}
