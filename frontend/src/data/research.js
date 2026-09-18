/** Research papers — add new entries here; the Research page renders them as a card grid. */
export const researchPapers = [
  {
    id: "threat-detection",
    title: "Real-Time Multi-Modal Threat Detection",
    subtitle:
      "Integrating YOLOv11 and EfficientNetV2 using an Adaptive Frontend Framework",
    summary:
      "Adaptive multi-modal surveillance: YOLOv11 for live weapon detection and EfficientNetV2 for X-ray classification, wrapped in an Angular operator console.",
    category: "Computer Vision",
    venue: "MIT-WPU Polytechnic Capstone",
    year: "2025",
    status: "Published",
    pdfUrl: "/research-paper.pdf",
    pdfFileName: "Final_Research_Paper.pdf",
    projectId: 5,
    projectUrl: "https://aryan-dani.github.io/Threat_Detection_System/",
    githubUrl: "https://github.com/aryan-dani/Threat_Detection_System",
    authors: [
      { name: "Aryan Dani", role: "1st Author", email: "daniaryan212@gmail.com" },
      { name: "Prakhar Jaiswal", role: "2nd Author", email: "jas.prakhar@gmail.com" },
      { name: "M. Sobaan Jagirdar", role: "3rd Author", email: "sobaanjagirdar008@gmail.com" },
      { name: "Swayamprakash Patro", role: "4th Author", email: "swayamprakashpatro@gmail.com" },
      { name: "Jyoti Mante", role: "Faculty Mentor", email: "jyoti.khurpade@mitwpu.edu.in" },
    ],
    affiliation: "Dr. Vishwanath Karad MIT World Peace University, Pune, India",
    keywords: [
      "Threat detection",
      "YOLOv11",
      "EfficientNetV2",
      "Computer vision",
      "Public safety",
      "X-ray classification",
      "Angular",
    ],
    abstract:
      "Current surveillance systems struggle with low threat-detection accuracy, high false-alarm rates, and operator fatigue. We propose an adaptive multi-modal framework that routes each input to the right model — YOLOv11 for real-time weapon detection in video, EfficientNetV2 for X-ray weapon/non-weapon classification — then surfaces alerts through an Angular operator console. Trained on knives, pistols, guns, and X-ray scans (augmented with GAN synthetic data), the system reaches strong real-time detection performance and near-perfect X-ray accuracy while keeping the pipeline computationally practical for security workflows.",
    highlights: [
      {
        label: "YOLOv11 mAP@0.5",
        value: "0.960",
        detail: "Knives 0.960 · Pistols 0.990 · Guns 0.920",
      },
      {
        label: "mAP@0.75",
        value: "0.880",
        detail: "Strong localization under a stricter IoU",
      },
      {
        label: "X-ray accuracy",
        value: "99.44%",
        detail: "EfficientNetV2 · AUC 0.9947 · F1 0.9934",
      },
      {
        label: "GAN lift",
        value: "+0.05 mAP",
        detail: "Synthetic augmentation improved generalization",
      },
    ],
    sections: [
      {
        title: "Problem",
        body: "Manual monitoring does not scale in crowded public spaces. Missed weapons and false alarms both erode trust. The work targets two complementary streams: live optical footage and baggage/security X-ray imagery.",
      },
      {
        title: "Approach",
        body: "An adaptive frontend selects the model by input type. YOLOv11 (C2PSA) handles real-time object detection for knives, pistols, and guns. EfficientNetV2 classifies X-ray scans as weapon vs non-weapon with a light compute budget. An Angular app draws bounding boxes, exposes confidence thresholds and zoom, and logs audit trails for PDF/CSV export.",
      },
      {
        title: "Results",
        body: "YOLOv11 reports mAP 0.960 at IoU 0.5 and 0.880 at IoU 0.75 across weapon classes. EfficientNetV2 reaches 99.44% accuracy (99.0% weapon / 99.4% non-weapon scans) with a low false-positive rate — suitable for high-throughput screening contexts.",
      },
      {
        title: "Impact",
        body: "Designed for airports, government buildings, and dense public venues: faster throughput, fewer human screening errors, and a reporting layer for compliance. Future work includes richer weapon taxonomies, multi-view 3D X-ray, and federated learning across scanners.",
      },
    ],
  },
];

/** @deprecated Prefer researchPapers — kept for any one-off imports. */
export const researchPaper = researchPapers[0];

export function getResearchPaperById(id) {
  return researchPapers.find((paper) => paper.id === id) || null;
}
