import { Trophy, Star, Sparkles } from "lucide-react";

export default function TrophyIcon() {
	return (
		<div className="relative animate-float">
			<div className="relative">
				<Trophy
					className="h-24 w-24 text-[#1FA971]"
					strokeWidth={1.5}
				/>
				<Star
					className="absolute -right-2 -top-2 h-6 w-6 text-[#FFBF1A] animate-pulse"
					fill="#FFBF1A"
				/>
				<Sparkles className="absolute -bottom-1 -left-3 h-5 w-5 text-[#E23670]" />
			</div>
		</div>
	);
}
