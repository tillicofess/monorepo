import {
	CodeOutlined,
	CustomerServiceOutlined,
	FileExcelOutlined,
	FileOutlined,
	FilePdfOutlined,
	FilePptOutlined,
	FileTextOutlined,
	FileWordOutlined,
	FileZipOutlined,
	PictureOutlined,
	VideoCameraOutlined,
} from "@ant-design/icons";

/**
 * 根据文件类型获取对应的图标
 * @param fileType - 文件扩展名 (不含点，如 'jpg', 'png', 'mp4')
 * @returns React 节点 (Icon 组件)
 *
 * @example
 * getFileIcon('jpg') // => <PictureOutlined style={{ color: "#52c41a" }} />
 * getFileIcon('mp4') // => <VideoCameraOutlined style={{ color: "#722ed1" }} />
 * getFileIcon(null)  // => <FileOutlined />
 */
export const getFileIcon = (fileType: string | null | undefined) => {
	if (!fileType) return <FileOutlined />;

	const type = fileType.toLowerCase();

	const iconMap: Record<string, React.ReactNode> = {
		// 图片文件 - 绿色
		jpg: <PictureOutlined style={{ color: "#52c41a" }} />,
		jpeg: <PictureOutlined style={{ color: "#52c41a" }} />,
		png: <PictureOutlined style={{ color: "#52c41a" }} />,
		gif: <PictureOutlined style={{ color: "#52c41a" }} />,
		bmp: <PictureOutlined style={{ color: "#52c41a" }} />,
		webp: <PictureOutlined style={{ color: "#52c41a" }} />,
		svg: <PictureOutlined style={{ color: "#52c41a" }} />,
		// 视频文件 - 紫色
		mp4: <VideoCameraOutlined style={{ color: "#722ed1" }} />,
		avi: <VideoCameraOutlined style={{ color: "#722ed1" }} />,
		mov: <VideoCameraOutlined style={{ color: "#722ed1" }} />,
		wmv: <VideoCameraOutlined style={{ color: "#722ed1" }} />,
		// 音频文件 - 粉色
		mp3: <CustomerServiceOutlined style={{ color: "#eb2f96" }} />,
		wav: <CustomerServiceOutlined style={{ color: "#eb2f96" }} />,
		flac: <CustomerServiceOutlined style={{ color: "#eb2f96" }} />,
		// PDF - 红色
		pdf: <FilePdfOutlined style={{ color: "#ff4d4f" }} />,
		// Word - 蓝色
		doc: <FileWordOutlined style={{ color: "#1677ff" }} />,
		docx: <FileWordOutlined style={{ color: "#1677ff" }} />,
		// Excel - 绿色
		xls: <FileExcelOutlined style={{ color: "#52c41a" }} />,
		xlsx: <FileExcelOutlined style={{ color: "#52c41a" }} />,
		// PPT - 橙色
		ppt: <FilePptOutlined style={{ color: "#fa8c16" }} />,
		pptx: <FilePptOutlined style={{ color: "#fa8c16" }} />,
		// 压缩包 - 橙色
		zip: <FileZipOutlined style={{ color: "#fa8c16" }} />,
		rar: <FileZipOutlined style={{ color: "#fa8c16" }} />,
		"7z": <FileZipOutlined style={{ color: "#fa8c16" }} />,
		// 代码文件 - 各自颜色
		js: <CodeOutlined style={{ color: "#f0c20a" }} />,
		ts: <CodeOutlined style={{ color: "#3178c6" }} />,
		jsx: <CodeOutlined style={{ color: "#61dafb" }} />,
		tsx: <CodeOutlined style={{ color: "#61dafb" }} />,
		css: <CodeOutlined style={{ color: "#264de4" }} />,
		html: <CodeOutlined style={{ color: "#e34c26" }} />,
		json: <CodeOutlined style={{ color: "#f0c20a" }} />,
		// 文本文件 - 灰色
		md: <FileTextOutlined style={{ color: "#8c8c8c" }} />,
		txt: <FileTextOutlined style={{ color: "#8c8c8c" }} />,
	};

	return iconMap[type] || <FileOutlined />;
};

/**
 * 从文件名中提取文件扩展名
 * @param fileName - 完整文件名
 * @returns 小写扩展名 (不含点)，无扩展名返回 undefined
 *
 * @example
 * getFileExtension('photo.jpg')    // => 'jpg'
 * getFileExtension('archive.zip')  // => 'zip'
 * getFileExtension('noextension')  // => undefined
 * getFileExtension('file.')        // => undefined
 */
export const getFileExtension = (fileName: string): string | undefined => {
	const lastDot = fileName.lastIndexOf(".");
	if (lastDot === -1 || lastDot === fileName.length - 1) {
		return undefined;
	}
	return fileName.substring(lastDot + 1).toLowerCase();
};
