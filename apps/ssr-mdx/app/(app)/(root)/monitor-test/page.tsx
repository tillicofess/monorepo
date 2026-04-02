"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitorTestPage() {
	const imgRef = useRef<HTMLImageElement>(null);

	const handleJsError = () => {
		throw new Error("Critical: Division by zero detected");
	};

	const handlePromiseReject = () => {
		Promise.reject(new Error("Unhandled: Network timeout at step 3"));
	};

	const handleAsyncError = () => {
		setTimeout(() => {
			throw new Error("Exception: Null pointer in production");
		}, 100);
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
			<h1 className="text-4xl font-bold mb-8 text-center">
				<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
					Monitor Debug Console
				</span>
			</h1>

			<div className="grid gap-6">
				<Card className="bg-red-50 dark:bg-red-950/20 border-red-300">
					<CardHeader>
						<CardTitle className="text-red-600 flex items-center gap-2">
							<span className="text-2xl">🔥</span> Critical JS Error
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Synchronous error captured by global error handler
						</p>
						<Button
							onClick={handleJsError}
							variant="destructive"
							className="w-full"
						>
							Trigger Fatal Error
						</Button>
					</CardContent>
				</Card>

				<Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-300">
					<CardHeader>
						<CardTitle className="text-orange-600 flex items-center gap-2">
							<span className="text-2xl">⚡</span> Promise Exception
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Unhandled rejection in promise chain
						</p>
						<Button
							onClick={handlePromiseReject}
							variant="destructive"
							className="w-full"
						>
							Fire Promise Error
						</Button>
					</CardContent>
				</Card>

				<Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300">
					<CardHeader>
						<CardTitle className="text-yellow-600 flex items-center gap-2">
							<span className="text-2xl">⏱️</span> Delayed Exception
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Async error thrown after 100ms delay
						</p>
						<Button
							onClick={handleAsyncError}
							variant="destructive"
							className="w-full"
						>
							Fire Async Error
						</Button>
					</CardContent>
				</Card>

				<Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-300">
					<CardHeader>
						<CardTitle className="text-blue-600 flex items-center gap-2">
							<span className="text-2xl">🌐</span> HTTP Error
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Failed network request with no error boundary
						</p>
						<Button
							onClick={handleFetchError}
							variant="secondary"
							className="w-full"
						>
							Execute Failed Request
						</Button>
					</CardContent>
				</Card>

				<Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-300">
					<CardHeader>
						<CardTitle className="text-purple-600 flex items-center gap-2">
							<span className="text-2xl">🖼️</span> Asset Error
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Broken resource load captured at capture phase
						</p>
						<Button
							onClick={handleResourceError}
							variant="secondary"
							className="w-full"
						>
							Load Missing Asset
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
