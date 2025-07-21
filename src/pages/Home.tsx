import { games } from "../data/games";
import type { Game } from "../types/game";
import { useState } from "react";
import GameList from "../components/GameList";
import Button from "../components/Button";

export default function Home() {
	const [selectedCategory, setSelectedCategory] = useState<
		null | Game["category"]
	>(null);

	const filteredGames = selectedCategory
		? games.filter((game) => game.category === selectedCategory)
		: [];

	return (
		<section className="w-full px-4 py-16 sm:py-20 md:py-24">
			<div className="max-w-screen-md mx-auto text-center">
				<img
					src="./logo.png"
					alt="Scorely Logo"
					className="mx-auto w-64 sm:w-72 md:w-96 mb-4"
				/>

				<div className="flex flex-wrap justify-center">
					{/* <Button text="Kortspel" color="primary" />
					<Button text="Minigolf" color="secondary" />
					<Button text="Sällskapsspel" color="danger" /> */}

					<Button
						text="Kortspel"
						color="primary"
						onClick={() => setSelectedCategory("kortspel")}
					/>
					<Button
						text="Golf"
						color="secondary"
						onClick={() => setSelectedCategory("fritidsspel")}
					/>
					<Button
						text="Tärningsspel"
						color="danger"
						onClick={() => setSelectedCategory("tärningsspel")}
					/>
				</div>
			

				{selectedCategory && <GameList games={filteredGames} category={selectedCategory} />}
			</div>
		</section>
	);
}
