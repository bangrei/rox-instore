import { getImage } from "@/connector/imageConnector";
class Surprise {
	constructor(surprise) {
		this.id = surprise.id;
		this.title = surprise.title;
		this.name = surprise.name;
		this.image = surprise.images.length ? getImage(surprise.images[0]) : "";
		this.description = surprise.description;
		this.status = surprise.state;
		this.tags = surprise.tags;
		this.links = surprise.links;
		this.type = surprise.type;
		this.detail = surprise.surprise;
	}

	setStatus(status) {
		this.status = status;
	}
}

export default Surprise;
