"use client";

import { useEffect, useState } from "react";
import type { Comment } from "@/features/blog/types/comment";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";

interface Props {
	slug: string;
}

export function CommentSection({ slug }: Props) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		async function loadComments() {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch(`/api/blog/${slug}/comments`, {
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error("Failed to load comments");
				}

				const data = (await response.json()) as { comments: Comment[] };
				setComments(data.comments);
			} catch (loadError) {
				if (
					loadError instanceof DOMException &&
					loadError.name === "AbortError"
				) {
					return;
				}

				setError("Failed to load comments");
			} finally {
				setLoading(false);
			}
		}

		void loadComments();

		return () => controller.abort();
	}, [slug]);

	const handleCommentCreated = (comment: Comment) => {
		setComments((current) => [comment, ...current]);
	};

	return (
		<section className="space-y-6 px-4 py-6">
			<CommentForm slug={slug} onCommentCreated={handleCommentCreated} />

			<div className="flex items-center gap-2">
				<span className="text-xl font-semibold tracking-tight">
					Comments ({comments.length})
				</span>
			</div>

			{loading ? (
				<p className="text-sm text-muted-foreground">Loading comments...</p>
			) : error ? (
				<p className="text-sm text-destructive">{error}</p>
			) : (
				<CommentList comments={comments} />
			)}
		</section>
	);
}
