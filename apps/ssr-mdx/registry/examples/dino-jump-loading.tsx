"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function DinoJumpLoading() {
	const ballRef = useRef<HTMLDivElement>(null);
	const cloudsRef = useRef<HTMLDivElement>(null);
	const groundRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				repeat: -1,
			});

			tl.to(ballRef.current, {
				y: -60,
				duration: 0.5,
				ease: "power2.out",
			}).to(ballRef.current, {
				y: 0,
				duration: 0.7,
				ease: "bounce.out",
			});

			gsap.to(ballRef.current, {
				rotation: -360,
				duration: 1,
				repeat: -1,
				ease: "none",
			});

			gsap.to(cloudsRef.current, {
				x: "-50%",
				duration: 20,
				repeat: -1,
				ease: "none",
			});

			gsap.to(groundRef.current, {
				backgroundPositionX: "-=32px",
				duration: 2,
				repeat: -1,
				ease: "none",
			});
		});

		return () => ctx.revert();
	}, []);

	return (
		<div className="relative w-40 h-24 overflow-hidden bg-white border-2 border-black">
			<div
				ref={cloudsRef}
				className="absolute top-2 left-0 flex gap-16 whitespace-nowrap"
			>
				<span className="text-2xl">☁️</span>
				<span className="text-2xl">☁️</span>
				<span className="text-2xl">☁️</span>
				<span className="text-2xl">☁️</span>
			</div>

			<div
				ref={ballRef}
				className="absolute left-1/2 top-10 w-6 h-6 -translate-x-1/2 rounded-full border-2 border-black"
				style={{
					background:
						"repeating-linear-gradient(45deg, white, white 2px, black 2px, black 4px)",
				}}
			/>

			<div className="absolute bottom-0 w-full h-4 bg-black" />
			<div
				ref={groundRef}
				className="absolute bottom-4 left-0 w-[200%] h-2 bg-black"
				style={{
					backgroundImage: "linear-gradient(90deg, white 4px, transparent 4px)",
					backgroundSize: "8px 100%",
				}}
			/>
		</div>
	);
}
