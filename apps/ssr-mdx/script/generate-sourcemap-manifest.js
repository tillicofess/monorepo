const fs = require('fs');
const path = require('path');

// 1. 定位到根目录构建产物的 chunks 文件夹
const CHUNKS_DIR = path.join(process.cwd(), '.next/static/chunks');
const MANIFEST_PATH = path.join(process.cwd(), '.next/sourcemap-manifest.json');

function generateSimpleManifest() {
  console.log('🔍 正在扫描 chunks 目录...');

  if (!fs.existsSync(CHUNKS_DIR)) {
    console.error('❌ 错误: 未找到 .next/static/chunks 目录，请先运行 next build');
    return;
  }

  const manifest = {};
  const files = fs.readdirSync(CHUNKS_DIR);

  files.forEach((file) => {
    // 只处理 .js 文件
    if (file.endsWith('.js')) {
      const filePath = path.join(CHUNKS_DIR, file);

      try {
        const stats = fs.statSync(filePath);
        // 读取文件尾部 512 字节提取 mapping 注释
        const bufferSize = Math.min(stats.size, 512);
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(bufferSize);
        fs.readSync(fd, buffer, 0, bufferSize, stats.size - bufferSize);
        fs.closeSync(fd);

        const content = buffer.toString();
        const match = content.match(/\/\/# sourceMappingURL=(.+)$/m);

        if (match) {
          const mapName = match[1].trim();
          // Key 记录为 chunks/文件名，方便匹配浏览器请求
          manifest[file] = mapName;
        }
      } catch (e) {
        console.warn(`无法读取文件 ${file}:`, e.message);
      }
    }
  });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`✅ 清单已生成: ${Object.keys(manifest).length} 个文件`);
  console.log(`📍 保存位置: ${MANIFEST_PATH}`);
}

generateSimpleManifest();
