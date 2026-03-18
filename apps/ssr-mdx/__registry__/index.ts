import React from "react";

export const Index: Record<string, any> = {
	"dino-jump-loading": {
		name: "dino-jump-loading",
		description: "A fun dinosaur jump loading animation using GSAP",
		type: "registry:example",
		files: [
			{
				path: "registry/examples/dino-jump-loading.tsx",
				type: "registry:example",
			},
		],
		component: React.lazy(
			() => import("@/registry/examples/dino-jump-loading"),
		),
	},
};
