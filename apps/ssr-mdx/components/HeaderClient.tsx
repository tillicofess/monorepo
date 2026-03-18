"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function HeaderClient() {
	const pathname = usePathname();

	const isHome = pathname === "/";
	const isBlog = pathname === "/blog" || pathname?.startsWith("/blog/");
	const isFriends =
		pathname === "/friends" || pathname?.startsWith("/friends/");

	return (
		<nav className="hidden items-center gap-6 text-sm md:flex">
			<Link
				href="/"
				className={cn(
					"transition-colors hover:text-foreground font-medium",
					isHome ? "text-foreground" : "text-foreground/60",
				)}
			>
				Home
			</Link>
			<Link
				href="/blog"
				className={cn(
					"transition-colors hover:text-foreground font-medium",
					isBlog ? "text-foreground" : "text-foreground/60",
				)}
			>
				Blog
			</Link>
			<Link
				href="/friends"
				className={cn(
					"transition-colors hover:text-foreground font-medium",
					isFriends ? "text-foreground" : "text-foreground/60",
				)}
			>
				Friends
			</Link>
		</nav>
	);
}
