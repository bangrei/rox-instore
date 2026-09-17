class Question {
	constructor(id, title, type, answers, { displayImg } = {}, minChoices = 1, maxChoices = 1) {
		this.id = id;
		this.title = title;
		this.type = type;
		this.answers = answers;
		this.displayImg = displayImg;
		this.minChoices = minChoices;
		this.maxChoices = maxChoices;
	}
}

export default Question;
