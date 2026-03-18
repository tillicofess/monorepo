import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Friend } from "../portfolio/types/friends";

interface FriendItemProps {
	friend: Friend;
}

export function FriendItem({ friend }: FriendItemProps) {
	return (
		<a
			href={friend.url}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"flex items-center gap-4 p-4 pr-2",
				"transition-[background-color] ease-out hover:bg-accent-muted",
				"max-sm:screen-line-before max-sm:screen-line-after",
				"sm:max-md:nth-[2n+1]:screen-line-before sm:max-md:nth-[2n+1]:screen-line-after",
				"md:nth-[3n+1]:screen-line-before md:nth-[3n+1]:screen-line-after",
			)}
		>
			<Image
				className="rounded-2xl"
				src={friend.avatar}
				alt={friend.name}
				width={64}
				height={64}
			/>
			<span className="font-medium">{friend.name}</span>
		</a>
	);
}
