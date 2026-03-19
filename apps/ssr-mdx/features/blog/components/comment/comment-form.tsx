"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment } from "@/features/blog/types/comment";

interface Props {
	slug: string;
	onCommentCreated?: (comment: Comment) => void;
}

export function CommentForm({ slug, onCommentCreated }: Props) {
	const { login, isAuthenticated, userProfile } = useAuth();
	const [content, setContent] = useState("");
	const [pending, setPending] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		setPending(true);
		try {
			const response = await fetch(`/api/blog/${slug}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					slug,
					content,
					author: userProfile?.username || "lain",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to post comment");
			}

			const data = (await response.json()) as { comment: Comment };
			setContent("");
			onCommentCreated?.(data.comment);
		} catch (error) {
			console.error("Failed to post comment", error);
		} finally {
			setPending(false);
		}
	};

	return (
		<div>
			{isAuthenticated ? (
				<form onSubmit={handleSubmit} className="space-y-4">
					<Textarea
						maxLength={3000}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Write your comment here..."
						className="min-h-25 resize-none"
					/>
					<Button type="submit" disabled={pending}>
						{pending ? "Posting..." : "Post Comment"}
					</Button>
				</form>
			) : (
				<div className="rounded-xl border bg-muted/50 p-6 text-center">
					<p className="mb-3 text-sm text-muted-foreground">
						Please log in to leave a comment.
					</p>
					<Button onClick={login} variant="outline">
						Log In with SSO
					</Button>
				</div>
			)}
		</div>
	);
}
