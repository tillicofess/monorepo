const fs = require("fs");
const path = require("path");

// 1. 定义源路径和目标路径
const SRC_CHUNKS = path.join(process.cwd(), ".next/static/chunks");
const BACKEND_SOURCEMAPS = path.join(process.cwd(), "../backend/sourcemaps");
const MANIFEST_PATH = path.join(process.cwd(), ".next/sourcemap-manifest.json");

function syncSourceMaps() {
	console.log("📦 开始迁移 SourceMaps 到后端...");

	if (!fs.existsSync(BACKEND_SOURCEMAPS)) {
		fs.mkdirSync(BACKEND_SOURCEMAPS, { recursive: true });
	}

	const manifest = {};
	const files = fs.readdirSync(SRC_CHUNKS);

	files.forEach((file) => {
		const srcPath = path.join(SRC_CHUNKS, file);

		// 提取映射关系
		if (file.endsWith(".js")) {
			const content = fs.readFileSync(srcPath, "utf8");
			const match = content.match(/\/\/# sourceMappingURL=(.+)$/m);
			if (match) {
				manifest[file] = match[1].trim();
			}
		}

		// 迁移 .map 文件
		if (file.endsWith(".map")) {
			const destPath = path.join(BACKEND_SOURCEMAPS, file);
			fs.renameSync(srcPath, destPath); // 移动文件（自动清理源目录）
			console.log(`移动: ${file}`);
		}
	});

	// 保存清单，方便 backend 读取
	fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
	console.log("✅ 迁移完成，后端现在可以直接读取 sourcemaps 文件夹。");
}

syncSourceMaps();
