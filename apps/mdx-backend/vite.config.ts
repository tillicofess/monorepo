import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// 远程 API 目标
const UMAMI_WEBSITE = "https://umami.ticscreek.top";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "dev.ticscreek.top",
		port: 5173,

		https: {
			key: path.resolve(__dirname, "dev.ticscreek.top-key.pem"),
			cert: path.resolve(__dirname, "dev.ticscreek.top.pem"),
		},

		proxy: {
			"/umami": {
				target: UMAMI_WEBSITE,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/umami/, ""),
			},
		},
	},
	build: {
		rollupOptions: {
			input: {
				main: "index.html",
			},
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;

					if (id.includes("/react/") || id.includes("/react-dom/"))
						return "react-vendor";
					if (id.includes("antd")) return "antd";
					if (id.includes("echarts")) return "echarts";
					if (id.includes("@dnd-kit")) return "dnd";
					if (id.includes("react-intl") || id.includes("@formatjs"))
						return "intl";
					if (id.includes("@casl")) return "casl";
					if (
						id.includes("axios") ||
						id.includes("date-fns") ||
						id.includes("swr") ||
						id.includes("zustand")
					) {
						return "utils";
					}
				},

				entryFileNames: "entry/[name]-[hash].js",
				chunkFileNames: "chunks/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash].[ext]",
			},
		},
	},
});
