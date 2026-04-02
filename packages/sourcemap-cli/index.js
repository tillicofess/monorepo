import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const MONITOR_API = "https://api.ticscreek.top/errorLogs/sourcemap/upload";

const getInjectionCode = (debugId) => {
	return `;!function(){try{var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{};e._monitorDebugIds=e._monitorDebugIds||{};e._monitorDebugIds[(new e.Error).stack]="${debugId}"}catch(e){}}();\n`;
};

const generateDebugId = (content) => {
	return createHash("md5").update(content).digest("hex");
};

async function processSourceMaps() {
	const targetDir = path.resolve(
		process.argv[2] || "./apps/ssr-mdx/.next/static",
	);

	// 2. 严格从 github.sha 获取 (GitHub Actions 默认环境变量)
	const releaseId = process.env.GITHUB_SHA || `dev-${Date.now()}`;

	const uploadId = randomUUID().substring(0, 8);

	// 存储任务：mapPath -> [debugIds...]
	const mapTasks = new Map();

	// 递归扫描函数
	const scan = (dir) => {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const fullPath = path.join(dir, file);
			if (fs.statSync(fullPath).isDirectory()) {
				scan(fullPath);
				continue;
			}

			if (file.endsWith(".js")) {
				const jsContent = fs.readFileSync(fullPath, "utf8");
				const mapMatch = jsContent.match(/\/\/# sourceMappingURL=(.+)$/m);

				if (mapMatch?.[1]) {
					const mapFileName = mapMatch[1].trim();
					const mapPath = path.join(dir, mapFileName);

					if (fs.existsSync(mapPath)) {
						const debugId = generateDebugId(jsContent);
						// 1. 注入 JS 头部
						fs.writeFileSync(
							fullPath,
							getInjectionCode(debugId) +
								jsContent +
								`\n//# debugId=${debugId}`,
						);

						// 2. 登记任务
						if (!mapTasks.has(mapPath)) {
							mapTasks.set(mapPath, { fileName: mapFileName, debugIds: [] });
						}
						mapTasks.get(mapPath).debugIds.push(debugId);
					}
				}
			}
		}
	};
	scan(targetDir);
	for (const [mapPath, info] of mapTasks.entries()) {
		const { fileName, debugIds } = info;

		// 使用原生 fs.promises.readFile 将文件读成 Buffer，然后转为原生 Blob
		// 这是 Node.js 原生 fetch 上传文件所需的标准方式
		const fileBuffer = await fs.promises.readFile(mapPath);
		const fileBlob = new Blob([fileBuffer], { type: "application/json" });

		for (const debugId of debugIds) {
			// 1. 替换为原生的 FormData
			const form = new FormData();
			form.append("debugId", debugId);
			form.append("releaseId", releaseId);
			form.append("uploadId", uploadId);
			form.append("fileName", fileName);
			form.append("map", fileBlob, fileName); // 挂载 Blob 文件，并指定文件名

			try {
				// 1. 使用原生 fetch 发起请求
				const response = await fetch(MONITOR_API, {
					method: "POST",
					body: form,
					// 注意：这里绝对 *不要* 手动设置 headers！
					// 原生 fetch 配合 FormData 会自动生成带有正确 boundary 的 Content-Type
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`HTTP ${response.status} - ${errorText}`);
				}
			} catch (err) {
				console.error(`❌ Failed: ${fileName}`, err.message);
			}
		}

		// 只有在所有关联该 Map 的 DebugID 都处理完后，才删除
		if (fs.existsSync(mapPath)) {
			fs.unlinkSync(mapPath);
		}
	}
}

processSourceMaps().catch(console.error);
