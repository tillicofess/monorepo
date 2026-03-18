import fs from "node:fs";

import { u } from "unist-builder";
import { visit } from "unist-util-visit";

import { Index } from "@/__registry__/index";
import type { UnistNode, UnistTree } from "@/types/unist";

export function rehypeComponent() {
	// Thanks @shadcn/ui
	return async (tree: UnistTree) => {
		visit(tree, (node: UnistNode) => {
			if (node.name === "ComponentPreview") {
				const name = getNodeAttributeByName(node, "name")?.value as string;

				if (!name) {
					return null;
				}

				try {
					const component = Index[name];

					const src = component.files[0]?.path;

					// Read the source file.
					const filePath = src;
					let source = fs.readFileSync(filePath, "utf8");

					source = source.replaceAll("export default", "export");

					const codeMeta = getNodeAttributeByName(node, "data-code-meta");

					// Add code as children so that rehype can take over at build time.
					node.children?.push(
						u("element", {
							tagName: "pre",
							properties: {},
							children: [
								u("element", {
									tagName: "code",
									properties: {
										className: ["language-tsx"],
									},
									data: {
										meta: ["showLineNumbers"]
											.concat(codeMeta ? [codeMeta.value as string] : [])
											.join(" "),
									},
									children: [
										{
											type: "text",
											value: source,
										},
									],
								}),
							],
						}),
					);
				} catch (error) {
					console.error(error);
				}
			}
		});
	};
}

function getNodeAttributeByName(node: UnistNode, name: string) {
	return node.attributes?.find((attribute) => attribute.name === name);
}
