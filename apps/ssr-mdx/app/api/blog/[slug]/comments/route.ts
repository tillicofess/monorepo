import { NextResponse } from "next/server";
import type { CommentCreateInput } from "@/features/blog/types/comment";
import { addComment, getComments } from "@/lib/comments";

interface RouteContext {
	params: Promise<{ slug: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
	const { slug } = await params;
	const comments = await getComments(slug);

	return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: RouteContext) {
	const { slug } = await params;
	const body = (await request.json()) as Partial<CommentCreateInput>;

	if (!body.content?.trim()) {
		return NextResponse.json(
			{ error: "Comment content is required" },
			{ status: 400 },
		);
	}

	const commentInput: CommentCreateInput = {
		slug,
		author: body.author?.trim() || "lain",
		content: body.content.trim(),
	};

	if (body.email?.trim()) {
		commentInput.email = body.email.trim();
	}

	if (body.parentId !== undefined) {
		commentInput.parentId = body.parentId;
	}

	const comment = await addComment(commentInput);

	return NextResponse.json({ comment }, { status: 201 });
}
