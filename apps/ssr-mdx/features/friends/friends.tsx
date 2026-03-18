import { FRIENDS } from "../portfolio/data/friends";
import { FriendItem } from "./friend-item";

export function Friends() {
	return (
		<div className="relative pt-4">
			<div className="absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2 md:grid-cols-3">
				<div className="border-r border-edge" />
				<div className="border-l border-edge md:border-x" />
				<div className="border-l border-edge max-md:hidden" />
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				{FRIENDS.map((friend) => (
					<FriendItem key={friend.url} friend={friend} />
				))}

				{FRIENDS.length === 0 && (
					<div className="screen-line-before screen-line-after p-4">
						<p className="font-mono text-sm">No friends found.</p>
					</div>
				)}
			</div>
		</div>
	);
}
