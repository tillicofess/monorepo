"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitorTestPage() {
	const imgRef = useRef<HTMLImageElement>(null);

	const handleJsError = () => {
		throw new Error("JS Runtime Error");
	};

	const handlePromiseReject = () => {
		Promise.reject(new Error("Promise Rejection Error"));
	};

	const handleAsyncError = () => {
		setTimeout(() => {
			throw new Error("Async Error (setTimeout)");
		}, 0);
	};

	const handleFetchError = async () => {
		try {
			await fetch("/api/invalid-endpoint-that-does-not-exist");
		} catch (error) {
			console.error("Fetch error:", error);
		}
	};

	const handleResourceError = () => {
		if (imgRef.current) {
			imgRef.current.src = "/invalid-image-that-does-not-exist.png";
		}
	};

	useEffect(() => {
		handleResourceError();
	}, []);

	return (
		<div className="container mx-auto py-12 max-w-2xl">
			<h1 className="text-3xl font-bold mb-8">Monitor SDK 测试页面</h1>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>JS 运行时错误</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							触发同步 JavaScript 错误，会被 window.onerror 捕获
						</p>
						<Button onClick={handleJsError} variant="destructive">
							触发 JS 错误
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Promise 拒绝</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							触发未被捕获的 Promise 拒绝，会被 unhandledrejection 捕获
						</p>
						<Button onClick={handlePromiseReject} variant="destructive">
							触发 Promise 拒绝
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>异步错误</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							触发 setTimeout 中的错误，会被 window.onerror 捕获
						</p>
						<Button onClick={handleAsyncError} variant="destructive">
							触发异步错误
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Fetch 请求失败</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							触发 fetch 请求失败（需要手动捕获）
						</p>
						<Button onClick={handleFetchError} variant="outline">
							触发 Fetch 错误
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>资源加载失败</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							触发图片等资源加载失败，会被事件捕获阶段的 error 监听器捕获
						</p>
						<Button onClick={handleResourceError} variant="outline">
							重新加载无效资源
						</Button>
						<img
							ref={imgRef}
							src="/invalid-image-that-does-not-exist.png"
							alt="invalid"
							className="mt-4 hidden"
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
