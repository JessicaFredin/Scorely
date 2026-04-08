import type { LucideIcon } from "lucide-react";



import type { ReactNode } from "react";

type MenuCardProps = {
	text: string;
	icon: LucideIcon;
	iconBg: string;
	onClick: () => void;
	trailing?: ReactNode;
};

export default function MenuCard({
	text,
	icon: Icon,
	iconBg,
    onClick,
    trailing
}: MenuCardProps) {
	return (
		<button
			onClick={onClick}
			className="w-full rounded-[18px] bg-white/80 px-6 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] transition duration-200 hover:-translate-y-0.5 cursor-pointer"
		>
			<div className="flex items-center gap-5">
				<div
					className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full ${iconBg}`}
				>
					<Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
				</div>

				<span className="text-left text-[1.05rem] font-semibold text-slate-800 md:text-[1.1rem]">
					{text}
				</span>
			</div>
			{trailing}
		</button>
	);
}
