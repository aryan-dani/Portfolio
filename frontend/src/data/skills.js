export const skills = {
  webdev: [
    {
      name: "HTML5",
      icon: "FaHtml5",
      level: 95,
      description:
        "Expert level proficiency in semantic HTML5, accessibility standards, and modern markup practices.",
      projects: ["Portfolio Site", "Expense Tracker"],
    },
    {
      name: "CSS3",
      icon: "FaCss3Alt",
      level: 90,
      description:
        "Advanced CSS animations, layouts, and responsive design. Proficient with CSS Grid and Flexbox.",
      projects: ["Portfolio Site", "Expense Tracker"],
    },
    {
      name: "SASS/SCSS",
      icon: "FaSass",
      level: 85,
      description:
        "Creating modular, maintainable CSS with variables, mixins, nesting, and inheritance.",
      projects: ["Portfolio Site"],
    },
    {
      name: "JavaScript",
      icon: "FaJs",
      level: 66,
      description:
        "Strong understanding of ES6+ features, DOM manipulation, async programming with Promises.",
      projects: ["Portfolio Site", "Expense Tracker", "API Project"],
    },
    {
      name: "React",
      icon: "FaReact",
      level: 40,
      description:
        "Experience with React hooks, context API, and state management. Familiar with Next.js framework.",
      projects: ["MedGrid HMIS"],
    },
    {
      name: "Angular",
      icon: "FaAngular",
      level: 45,
      description:
        "Building dynamic SPAs with Angular, including components, services, and routing.",
      projects: ["Threat Detection Frontend"],
    },
    {
      name: "Node.js",
      icon: "FaNodeJs",
      level: 70,
      description:
        "Building RESTful APIs, handling file operations, and database integration with Express.js.",
      projects: ["API Project"],
    },
    {
      name: "TypeScript",
      icon: "SiTypescript",
      level: 60,
      description:
        "Developing type-safe JavaScript applications with interfaces, generics, and advanced type features.",
      projects: ["Portfolio Site"],
    },
    {
      name: "Express.js",
      icon: "SiExpress",
      level: 75,
      description:
        "Building RESTful APIs and server-side applications with Express.js middleware and routing.",
      projects: ["API Project"],
    },
    {
      name: "MongoDB",
      icon: "SiMongodb",
      level: 72,
      description:
        "Working with NoSQL databases, document models, and MongoDB Atlas cloud hosting.",
      projects: ["API Project"],
    },
    {
      name: "REST APIs",
      icon: "FaServer",
      level: 80,
      description:
        "Designing and implementing RESTful APIs with proper status codes and response formats.",
      projects: ["API Project"],
    },
  ],
  machinelearning: [
    {
      name: "TensorFlow",
      icon: "SiTensorflow",
      level: 60,
      description:
        "Working knowledge of TensorFlow for building and deploying basic ML models.",
      projects: ["DICOM Slice Viewer", "Data Science Capstone"],
    },
    {
      name: "PyTorch",
      icon: "SiPytorch",
      level: 55,
      description:
        "Building and training basic neural network models with PyTorch.",
      projects: ["Deep Learning Project"],
    },
    {
      name: "Data Analysis",
      icon: "FaChartLine",
      level: 40,
      description:
        "Working with datasets, basic statistical analysis, and data visualization.",
      projects: ["Data Science Capstone"],
    },
    {
      name: "NLP",
      icon: "FaComments",
      level: 50,
      description:
        "Text preprocessing, sentiment analysis, and basic language models.",
      projects: ["NLP Project"],
    },
    {
      name: "Deep Learning",
      icon: "FaBrain",
      level: 30,
      description:
        "Working with neural network architectures and optimization techniques.",
      projects: ["Threat Detection System"],
    },
    {
      name: "Scikit-Learn",
      icon: "SiScikitlearn",
      level: 40,
      description:
        "Implementation of traditional ML algorithms and evaluation metrics.",
      projects: ["Data Science Capstone"],
    },
    {
      name: "ML Deployment",
      icon: "FaCloud",
      level: 55,
      description:
        "Deploying machine learning models to production environments.",
      projects: ["Threat Detection System"],
    },
  ],
};

export const skillCategories = [
  { id: "all", label: "All" },
  { id: "webdev", label: "Web Development" },
  { id: "machinelearning", label: "AI & ML" },
];
