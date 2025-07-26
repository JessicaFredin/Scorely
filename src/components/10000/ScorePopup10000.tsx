import { useState } from "react";

type Props = {
    playerName: string;
    onSubmit: (score: number) => void;
    onClose: () => void;
};

export default function ScorePopup10000({
    playerName,
    onSubmit,
    onClose,
}: Props) {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = () => {
        const parsed = parseInt(inputValue);
        if (!isNaN(parsed)) {
            onSubmit(parsed);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md space-y-4 w-[90%] max-w-sm">
                <h2 className="text-lg font-bold">Poäng till {playerName}</h2>
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="border rounded px-3 py-2 w-full text-center"
                    placeholder="Skriv t.ex. 160"
                />
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Lägg till
                </button>
                <button
                    onClick={onClose}
                    className="text-sm text-gray-600 underline w-full"
                >
                    Avbryt
                </button>
            </div>
        </div>
    );
}
