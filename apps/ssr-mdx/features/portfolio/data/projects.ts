import type { Project } from "../types/projects";

export const PROJECTS: Project[] = [
	{
		id: "monitor",
		title: "@monorepo/monitor",
		period: {
			start: "06.2025",
		},
		link: "https://www.npmjs.com/package/@monorepo/monitor",
		skills: [
			"TypeScript",
			"Rollup",
			"Performance Observer API",
			"Error Tracking",
			"Behavior Tracking",
		],
		description:
			"A lightweight front-end monitor SDK for error, behavior and performance tracking. Supports CLS, FID, FCP, LCP, and waterfall analysis.",
	},
	{
		id: "mdxbackend",
		title: "backend.ticscreek.top",
		period: {
			start: "10.2025",
		},
		link: "https://backend.ticscreek.top",
		skills: [
			"React 19",
			"Vite 7",
			"TypeScript",
			"Ant Design v5",
			"React Router v7",
			"ECharts",
			"Keycloak",
			"CASL",
		],
		description:
			"A backend management system for personal blog, featuring file management, error log tracking, performance monitoring, and article management with role-based access control.",
	},
	{
		id: "ticscreektop",
		title: "ticscreek.top",
		period: {
			start: "08.2025",
		},
		link: "https://github.com/tillicofess/monorepo",
		skills: [
			"OpenCode",
			"Next.js 16",
			"Tailwind CSS v4",
			"Radix UI",
			"Motion",
			"shadcn/ui",
		],
		description:
			"A blog site containing my personal projects and experiences, which is based on chanhdai.com, thanking him for his open source.",
		logo: "/logo.svg",
	},
];
