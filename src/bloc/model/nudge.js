import { getImage } from "@/connector/imageConnector";
class Nudge {
	constructor(nudge) {
		this.id = nudge.id;
		this.name = nudge.name;
		this.title = nudge.title;
		this.description = nudge.description;
		this.image = nudge.images?.length ? getImage(nudge.images[0]) : "";
		this.backgroundId = nudge.backgroundId;
		this.type = nudge.type;

		// nudge state => 'AWARDED' is considered as status 'NOT_READ'
		// nudge state => other than 'AWARDED' is considered as status 'READ'
		// nudge states => AWARDED, READ, ANSWERED, CLAIMED, SHARED
		this.status = (nudge.state == "AWARDED" || nudge.state == null) ? "NOT_READ" : "READ";
		this.state = nudge.state;

		this.completionPoints = nudge.completionPoints;
		this.readingPoints = nudge.readingPoints;
		this.tags = nudge.tags;
		this.links = nudge.links;
		this.questionnaire = nudge.questionnaire;
	}
}

export default Nudge;
