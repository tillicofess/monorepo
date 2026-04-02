"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitorTestPage() {
	const imgRef = useRef<HTMLImageElement>(null);

	const handleJsError = () => {
		throw new Error("Boom! Something went wrong");
	};

	const handlePromiseReject = () => {
		Promise.reject(new Error("Oops! Promise got rejected"));
	};

	const handleAsyncError = () => {
		setTimeout(() => {
			throw new Error("Kaboom! Async error here");
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
			<h1 className="text-3xl font-bold mb-8">🎯 Monitor SDK Debug Station</h1>

			<div className="space-y-6">
				<Card className="border-red-500/50">
					<CardHeader>
						<CardTitle className="text-red-600">💥 JS Runtime Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Throw a synchronous error caught by window.onerror
						</p>
						<Button onClick={handleJsError} variant="destructive">
							💣 Boom
						</Button>
					</CardContent>
				</Card>

				<Card className="border-orange-500/50">
					<CardHeader>
						<CardTitle className="text-orange-600">
							⚠️ Promise Rejection
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Unhandled promise rejection caught by unhandledrejection
						</p>
						<Button onClick={handlePromiseReject} variant="destructive">
							🚫 Reject
						</Button>
					</CardContent>
				</Card>

				<Card className="border-yellow-500/50">
					<CardHeader>
						<CardTitle className="text-yellow-600">⏰ Async Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Error inside setTimeout caught by window.onerror
						</p>
						<Button onClick={handleAsyncError} variant="destructive">
							⏳ Delayed Boom
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>📡 Fetch Failure</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Fetch request failure (needs manual catch)
						</p>
						<Button onClick={handleFetchError} variant="outline">
							📤 Send Bad Request
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>🖼️ Resource Load Failure</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Image load failure caught at event capture phase
						</p>
						<Button onClick={handleResourceError} variant="outline">
							🔄 Reload Bad Image
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
