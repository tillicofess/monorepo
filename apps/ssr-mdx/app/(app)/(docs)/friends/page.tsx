import { Friends } from "@/features/friends/friends";

export default function FriendsPage() {
	return (
		<div>
			<div className="screen-line-after px-4">
				<h1 className="text-3xl font-semibold tracking-tight">Friends</h1>
			</div>

			<Friends />

			<div className="h-4" />
		</div>
	);
}
