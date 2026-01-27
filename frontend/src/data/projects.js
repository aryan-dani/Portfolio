export const projects = [
  {
    id: 1,
    title: "Real Time Threat Detection System",
    category: "ai-ml",
    year: "2024 - 2025",
    description: `The Capstone Project I'm developing in my College focuses on Real-Time threat detection using YOLO v11 and EfficientNetV2. This deep learning project aims to identify potential security risks through video analysis and identify threats in X-ray scans, with a specific focus on detecting weapons. Currently in development, this system will integrate with existing security infrastructure to provide automated alerts and monitoring capabilities.`,
    image: "/Images/Projects/Threat_Detection_System.jpg",
    tags: ["Python", "Yolo v11", "Deep Learning", "EfficientNetV2", "Angular"],
    links: {
      preview: "https://aryan-dani.github.io/Threat_Detection_System/",
      github: "https://github.com/aryan-dani/Threat_Detection_System",
    },
  },
  {
    id: 2,
    title: "Automated Dicom Slice Analyzer",
    category: "ai-ml",
    year: "2025",
    description: `Upon experimenting various CNN models like InceptionResnetV2 and Vision Transformers, optimizing them to identify anomalies in Dicom Slices and then deploying a Vision Language Model to describe what the anomaly is and in which slice it is presented. This project aims to assist radiologists in identifying and diagnosing anomalies more efficiently.`,
    image: "/Images/Projects/Dicom_Slice.jpg",
    tags: ["CNN's", "Vision Language Models", "Vision Transformers"],
    links: {
      github: "https://github.com/aryan-dani/Dicom-Classifier",
    },
  },
  {
    id: 3,
    title: "API Demonstration Application",
    category: "web-dev",
    year: "2025",
    description: `Sometimes projects aren't just about showing off skills—they're about satisfying pure curiosity! I used this project as a hands-on experiment to finally understand client-side APIs. I built simple projects that call three different API endpoints, which helped me see how requests, responses, and asynchronous flows all come together in real time.`,
    image: "/Images/Projects/API_Demonstration.jpg",
    tags: ["Axios", "Javascript", "API Development", "Github Copilot"],
    links: {
      preview: "https://aryan-dani.github.io/API_Demonstration/",
      github: "https://github.com/aryan-dani/API_Demonstration",
    },
  },
  {
    id: 4,
    title: "Speech-to-Text Web Application",
    category: "web-dev",
    year: "2024",
    description: `A real-time speech-to-text web application that leverages the browser's native Web Speech API to convert spoken words into text. This project features voice command controls, real-time transcription, text editing capabilities, and export functionality.`,
    image: "/Images/Projects/Speech_To_Text.jpg",
    tags: [
      "JavaScript",
      "Web Speech API",
      "HTML5",
      "CSS3",
      "Speech Recognition",
    ],
    links: {
      github: "https://github.com/aryan-dani/Speech_To_Text",
    },
  },
  {
    id: 5,
    title: "Capstone Data Science",
    category: "ai-ml",
    year: "2025",
    description: `This capstone project showcases my ability to address real-world challenges through data-driven solutions. Using Python and essential libraries like NumPy, Pandas, and Scikit-learn, I analyzed a complex dataset to uncover actionable insights and develop predictive models.`,
    image: "/Images/Projects/Data_Sceince_Capstone.jpg",
    tags: [
      "Exploratory Data Analysis (EDA)",
      "Machine Learning",
      "Data Visualization",
    ],
    links: {
      github: "https://github.com/aryan-dani/Capstone_ds",
    },
  },
];

export const projectCategories = [
  { id: "all", label: "All" },
  { id: "web-dev", label: "Web Dev" },
  { id: "ai-ml", label: "AI & ML" },
];
