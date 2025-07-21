import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSession } from "../context/GameSessionContext";
import Button from "../components/Button";
import { ArrowLeft } from "lucide-react";

export default function SelectPlayers() {
	const { session, setSession } = useGameSession();
	const navigate = useNavigate();

	const game = session?.game;
	const min = game?.minPlayers ?? 2;
	const max = game?.maxPlayers ?? 6;

	const [count, setCount] = useState<number>(min);
	const [names, setNames] = useState<string[]>(Array(min).fill(""));
	const [error, setError] = useState<string>("");

	useEffect(() => {
		setNames((prev) => {
			const updated = [...prev];
			while (updated.length < count) updated.push("");
			while (updated.length > count) updated.pop();
			return updated;
		});
	}, [count]);

	if (!game) {
		return <p className="text-center mt-10">Inget spel valt.</p>;
	}

	const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		const value = Number(raw.replace(/^0+/, "") || "0");

		if (value < min || value > max) {
			setError(`Antal spelare måste vara mellan ${min} och ${max}.`);
		} else {
			setError("");
		}

		setCount(value);
	};

	const handleNameChange = (i: number, value: string) => {
		const updated = [...names];
		updated[i] = value;
		setNames(updated);
	};

	const handleContinue = () => {
		if (count < min || count > max) {
			alert(`Antal spelare måste vara mellan ${min} och ${max}.`);
			return;
		}

		const trimmed = names.map((n) => n.trim()).filter(Boolean);
		if (trimmed.length !== count) {
			alert("Fyll i namn för alla spelare.");
			return;
		}

		// const playerObjects = trimmed.map((name) => ({ name })); 
		const playerObjects = trimmed.map((name) => ({
			name,
			scores: [],
		}));
		
		setSession({ ...session, players: playerObjects });

	

		const gameId = session?.game?.id;
		if (gameId === "chicago") {
			navigate("/game/chicago");
		} else if (gameId === "500") {
			navigate("/game/500");
		} else if (gameId === "plump") {
			navigate("/game/plump");
		} else if (gameId === "jazz") {
			navigate("/game/jazz");
		} else if (gameId === "trebeller") {
			navigate("/game/trebeller");
		} else if (gameId === "discgolf") {
			navigate("/game/discgolf");
		} else {
			alert("Spelet stöds inte än.");
		}
	};

	return (
		<section className="w-full max-w-md mx-auto px-4 py-12">
			<div className="flex items-center gap-4 mb-6">
				<button
					onClick={() => navigate(-1)}
					aria-label="Tillbaka"
					className="text-gray-600 hover:text-black"
				>
					<ArrowLeft size={28} />
				</button>
				<h1 className="text-xl font-bold">{game.name}</h1>
			</div>

			<h2 className="text-2xl font-bold mb-6 text-center">
				Välj antal spelare
			</h2>

			<div className="mb-4 text-center">
				<input
					type="number"
					className="border px-3 py-2 rounded w-24 text-center"
					min={min}
					max={max}
					value={count === 0 ? "" : count}
					onChange={handleCountChange}
				/>
				<p className="text-sm text-gray-600 mt-1">
					{min}–{max} spelare
				</p>
				{error && <p className="text-red-600 text-sm mt-1">{error}</p>}
			</div>

			<div className="space-y-4 mb-6">
				{names.map((name, i) => (
					<input
						key={i}
						type="text"
						value={name}
						onChange={(e) => handleNameChange(i, e.target.value)}
						placeholder={`Spelare ${i + 1}`}
						className="w-full border px-3 py-2 rounded"
					/>
				))}
			</div>

			<Button text="Fortsätt" color="primary" onClick={handleContinue} />
		</section>
	);
}
