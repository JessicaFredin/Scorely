type WinnerPopupProps = {
	message: string;
};

export default function WinnerPopup({ message }: WinnerPopupProps) {
	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
			<div className=" animate-glow text-3xl font-extrabold text-center px-6 py-4 rounded-lg bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 text-black shadow-xl transform rotate-1 ">
				{message}
			</div>
		</div>
	);
	// animate-pulse
}


