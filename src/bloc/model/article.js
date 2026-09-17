export class Article {
	constructor(data) {
		this.id = data.id;
		this.title = data.name;
		this.name = data.name;
		this.subtitle = data.description;
		this.description = data.description;
		this.tags = data.tags;
		this.readingPoints = data.readingPoints;
		this.completionPoints = data.completionPoints;
		this.images = data.images;
		this.status = data.state;
		this.articleDetail = data.article;
		this.links = data.links;
		this.liked = data.liked;
		this.externalLink = data.externalLink;
	}
}
