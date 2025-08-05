// import { useParams } from "react-router-dom";
// import { ProtocolService } from "../services/ProtocolService";
// import DiscGolfTable from "./tables/DiscGolfTable";

// export default function ResumeProtocol() {
// 	const { id } = useParams();
// 	const protocol = ProtocolService.getById(Number(id));

// 	if (!protocol) {
// 		return (
// 			<p className="text-center mt-10">Protokollet kunde inte hittas.</p>
// 		);
// 	}

// 	return (
// 		<DiscGolfTable
// 			players={protocol.players}
// 			scores={protocol.scores}
// 			resumeMode={true}
// 		/>
// 	);
// }




import { useParams } from "react-router-dom";
import { ProtocolService } from "../services/ProtocolService";
import DiscGolfTable from "../components/tables/DiscGolfTable";

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

	return (
		<DiscGolfTable
			players={protocol.players}
			scores={protocol.scores}
			resumeMode={true}
			id={protocol.id}
		/>
	);
}
