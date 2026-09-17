const questions = [
  {
    title: "What is your name?",
    subtitle: "My name is ...",
    children: [
      {
        placeholder: "Enter your first name",
        required: true,
        type: "input",
        apiField: "firstName",
        answer: "",
      },
      {
        placeholder: "Enter your last name",
        required: false,
        type: "input",
        apiField: "lastName",
        answer: "",
      },
    ],
  },
  {
    title: "What is your contact number?",
    subtitle:
      'Please enter your 11-digit mobile phone,<br/>without "+63" country code.',
    children: [
      {
        placeholder: "Enter your phone number",
        required: true,
        type: "input",
        apiField: "phone",
        answer: "",
      },
    ],
  },
  {
    title: "When is your date of birth?",
    subtitle: "",
    children: [
      {
        placeholder: "Select date",
        required: true,
        type: "date",
        apiField: "dateOfBirth",
        answer: "",
      },
    ],
  },
  {
    title: "What is your gender?",
    subtitle: "",
    children: [
      {
        placeholder: "",
        required: false,
        type: "gender",
        apiField: "gender",
        answers: [
          {
            title: "Male",
            enum: "MALE",
            selectedAnswer: false,
          },
          {
            title: "Female",
            enum: "FEMALE",
            selectedAnswer: false,
          },
          {
            title: "Prefer not to say",
            enum: 1,
            selectedAnswer: false,
          },
        ],
      },
    ],
  },
  // {
  // 	title: "What year you were born",
  // 	subtitle: "I was born in",
  // 	type: "date",
  // 	apiField: "dateOfBirth",
  // 	answer: "",
  // },
  // {
  // 	title: "How do you identify?",
  // 	subtitle: "At times, we'll provide gender specific recommendation",
  // 	type: "single-ans",
  // 	apiField: "gender",
  // 	answers: [
  // 		{
  // 			title: "Man",
  // 			enum: "MALE",
  // 			selectedAnswer: false,
  // 		},
  // 		{
  // 			title: "Woman",
  // 			enum: "FEMALE",
  // 			selectedAnswer: false,
  // 		},
  // 	],
  // },
];

export default questions;
