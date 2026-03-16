import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

// 远程 API 目标
const UMAMI_WEBSITE = "https://umami.ticscreek.top";

export default defineConfig({
	plugins: [react(), visualizer({ open: true }) as PluginOption],
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
		minify: "terser",

		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: ["console.info", "console.warn"],
			},
			format: {
				comments: false, // 移除所有注释
			},
		},
		rollupOptions: {
			input: {
				main: "index.html",
			},
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;

					if (
						id.includes("/react/") ||
						id.includes("/react-dom/") ||
						id.includes("/scheduler/")
					) {
						return "react-vendor";
					}

					if (id.includes("antd") || id.includes("@ant-design")) {
						return "antd-vendor";
					}

					if (id.includes("echarts")) {
						return "echarts-vendor";
					}
				},

				entryFileNames: "entry/[name]-[hash].js",
				chunkFileNames: "chunks/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash].[ext]",
			},
		},
	},
});
