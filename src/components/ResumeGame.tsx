// // import { useParams, useNavigate } from "react-router-dom";
// // import { ProtocolService } from "../services/ProtocolService";
// // import DiscgolfTable from "./tables/DiscGolfTable";
// // import ChicagoTable from "./tables/ChicagoTable";
// // import TrebellerTable from "./tables/TrebellerTable";
// // import type { Player } from "../types/player";

// // // Shared props type for all tables
// // export type ResumeGameProps = {
// // 	players?: Player[];
// // 	scores?: number[][];
// // 	resumeMode?: boolean;
// // };

// // export default function ResumeGame() {
// // 	const { game, id } = useParams();
// // 	const navigate = useNavigate();
// // 	const protocol = ProtocolService.getById(id || "");

// // 	if (!protocol) {
// // 		return <p className="p-4">Protokoll hittades inte.</p>;
// // 	}

// // 	const props: ResumeGameProps = {
// // 		players: protocol.players,
// // 		scores: protocol.scores,
// // 		resumeMode: true,
// // 	};

// // 	switch (game) {
// // 		case "discgolf":
// // 			return <DiscgolfTable {...props} />;
// // 		case "chicago":
// // 			return <ChicagoTable {...props} />;
// // 		case "trebeller":
// // 			return <TrebellerTable {...props} />;
// // 		default:
// // 			navigate("/");
// // 			return null;
// // 	}
// // }



// import React from "react";
// import { useParams } from "react-router-dom";
// import { ProtocolService } from "../services/ProtocolService";
// import DiscGolfTable from "./tables/DiscGolfTable";
// import ChicagoTable from "./tables/ChicagoTable";
// import TrebellerTable from "./tables/TrebellerTable";

// export default function ResumeProtocol() {
// 	const { id } = useParams<{ id: string }>();
// 	const protocol = ProtocolService.getById(id || "");

// 	if (!protocol) {
// 		return (
// 			<div className="p-4 text-center">
// 				Protokollet kunde inte hittas.
// 			</div>
// 		);
// 	}

// 	const props = {
// 		players: protocol.players,
// 		scores: protocol.scores,
// 		resumeMode: true,
// 	};

// 	switch (protocol.gameType) {
// 		// case "chicago":
// 		// 	return <ChicagoTable {...props} />;
// 		// case "trebeller":
// 		// 	return <TrebellerTable {...props} />;
// 		case "discGolf":
// 			return <DiscGolfTable {...props} />;
// 		default:
// 			return <div>Okänt speltyp</div>;
// 	}
// }




import { useParams } from "react-router-dom";
import { ProtocolService } from "../services/ProtocolService";
import DiscGolfTable from "./tables/DiscGolfTable";
// import ChicagoTable from "./tables/ChicagoTable";
// import TrebellerTable from "./tables/TrebellerTable";

export default function ResumeProtocol() {
	const { id } = useParams<{ id: string }>();
	const protocol = ProtocolService.getById(id || "");

	if (!protocol) {
		return (
			<div className="p-4 text-center">
				Protokollet kunde inte hittas.
			</div>
		);
	}

	const props = {
		players: protocol.players,
		scores: protocol.scores,
		resumeMode: true,
	};

	switch (protocol.gameType) {
		case "discGolf":
			return <DiscGolfTable {...props} />;
		// case "chicago":
		// 	return <ChicagoTable {...props} />;
		// case "trebeller":
		// 	return <TrebellerTable {...props} />;
		default:
			return <div className="p-4 text-center">Okänd speltyp.</div>;
	}
}
  