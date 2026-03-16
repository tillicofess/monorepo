import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// 1. 抽取一个辅助函数来减少重复代码
const lazyLoad = (importFn: any, role: string) => async () => {
	const mod = await importFn();
	const Component = mod.default;

	// 返回经过权限包装的组件
	return {
		Component: role
			? () => (
					<ProtectedRoute requiredRoles={[role]}>
						<Component />
					</ProtectedRoute>
				)
			: Component,
	};
};

export const router = createBrowserRouter([
	{
		path: "/",
		Component: AppLayout,
		children: [
			{
				index: true,
				// 首页也建议按需，除非它非常小
				lazy: async () => ({
					Component: (await import("@/views/Home")).default,
				}),
			},
			{
				path: "fileManagement",
				lazy: async () => ({
					Component: (await import("@/views/File")).default,
				}),
			},
			{
				path: "errorLog",
				lazy: lazyLoad(() => import("@/views/ErrorLog"), "user:default"),
			},
			{
				path: "performanceLog",
				lazy: lazyLoad(() => import("@/views/PerformanceLog"), "user:default"),
			},
		],
	},
]);
