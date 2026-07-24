import { visit } from "unist-util-visit";

export function rehypeWrapTables() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "table" && parent && index !== null) {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrap"] },
          children: [node],
        };
      }
    });
  };
}
