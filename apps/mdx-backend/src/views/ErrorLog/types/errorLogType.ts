export interface ErrorType {
	message: string;
	fileName?: string;
	line?: number;
	column?: number;
	category?: string;
	debug_id?: string;
}

export interface DataType {
	key: string;
	app_name: string;
	error: ErrorType;
	time: string;
	actions: any[];
	version: string;
	count: number;
}

export interface SourceCodeModalData {
	result: {
		source: string;
		line: number;
		column: number;
		name: string;
	};
	codeSnippet: {
		line: number;
		content: string;
		isErrorLine: boolean;
	}[];
}

export interface SourceCodeModalProps {
	open: boolean;
	onCancel: () => void;
	data: SourceCodeModalData | null;
}

export interface UserActionLogModalProps {
	open: boolean;
	onCancel: () => void;
	actions: any[] | null;
}

export interface ErrorLogTableProps {
	data: DataType[];
	loading: boolean;
	onViewSourceCode: (completeError: {
		message: string;
		fileName?: string;
		line?: number;
		column?: number;
		appName: string;
		version: string;
	}) => void;
	onViewActions: (actions: any[]) => void;
}
