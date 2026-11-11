/**
 * Centralized SEO configuration for every route.
 * Each page gets a unique title, description, keywords, canonical URL,
 * and structured data to maximize search visibility.
 */

import { CASE_STUDIES } from "../data/caseStudies.js";
import {
  SERVICES_FAQ,
  SERVICES_GUIDES,
  SERVICES_KEYWORDS,
  SERVICES_PACKAGES,
  WEB_FAQ,
  WEB_PACKAGES,
  formatInr,
  formatUsd,
} from "../data/services.js";

const SITE_URL = "https://www.aryandani.com";
const SITE_NAME = "Aryan Dani Portfolio";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;
const TWITTER_HANDLE = "@Killfall15";
const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const DEFAULT_IMAGE_ALT = "Aryan Dani freelance AI engineer and full-stack developer in Pune";

const WORK_PATHS = CASE_STUDIES.map((study) => `/work/${study.slug}`);
const GUIDE_PATHS = SERVICES_GUIDES.map((guide) => `/guides/${guide.slug}`);
const SERVICES_KEYWORD_LIST = [
  ...SERVICES_KEYWORDS.primary,
  ...SERVICES_KEYWORDS.secondary,
];
const MERGED_SERVICES_FAQ = [...SERVICES_FAQ, ...WEB_FAQ];

export function routeOgImage(path) {
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
  return `${SITE_URL}/og-${slug}.svg`;
}

export const SEO_ROUTE_ORDER = [
  "/",
  "/projects",
  "/services",
  ...WORK_PATHS,
  ...GUIDE_PATHS,
  "/experience",
  "/research",
  "/certifications",
  "/skills",
  "/about",
  "/playground",
  "/achievements",
  "/guestbook",
  "/copyright",
];

export const SEO_ROUTE_META = {
  "/": { label: "Home", priority: "1.0", changefreq: "weekly" },
  "/projects": { label: "Projects", priority: "0.9", changefreq: "weekly" },
  "/services": { label: "Services", priority: "0.9", changefreq: "weekly" },
  ...Object.fromEntries(
    CASE_STUDIES.map((study) => [
      `/work/${study.slug}`,
      { label: study.title, priority: "0.8", changefreq: "monthly" },
    ]),
  ),
  ...Object.fromEntries(
    SERVICES_GUIDES.map((guide) => [
      `/guides/${guide.slug}`,
      { label: guide.title, priority: "0.7", changefreq: "monthly" },
    ]),
  ),
  "/experience": { label: "Experience", priority: "0.8", changefreq: "monthly" },
  "/research": { label: "Research", priority: "0.8", changefreq: "monthly" },
  "/certifications": { label: "Certifications", priority: "0.5", changefreq: "monthly" },
  "/skills": { label: "Skills", priority: "0.8", changefreq: "monthly" },
  "/about": { label: "About", priority: "0.8", changefreq: "monthly" },
  "/contact": { label: "Contact", priority: "0.8", changefreq: "yearly" },
  "/playground": { label: "CLI Playground", priority: "0.5", changefreq: "yearly" },
  "/achievements": { label: "Achievements", priority: "0.5", changefreq: "monthly" },
  "/guestbook": { label: "Guestbook", priority: "0.5", changefreq: "weekly" },
  "/copyright": { label: "Copyright", priority: "0.5", changefreq: "yearly" },
};

/** Shared Person schema reference (defined once in index.html) */
const PERSON_REF = { "@id": `${SITE_URL}/#person` };
const WEBSITE_REF = { "@id": `${SITE_URL}/#website` };

/**
 * Build a BreadcrumbList JSON-LD for a given page.
 * Every page gets Home → Current Page.
 */
function buildBreadcrumbs(pageName, pagePath) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ];

  if (pagePath !== "/") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: pageName,
      item: `${SITE_URL}${pagePath}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/**
 * Build a WebPage JSON-LD for a given page.
 */
function buildWebPage(name, description, path) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    isPartOf: WEBSITE_REF,
    about: PERSON_REF,
    inLanguage: "en-US",
  };
}

function softwareApplicationFromProject(project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/projects#${project.id}`,
    name: project.title,
    description: project.description,
    applicationCategory: project.category === "ai-ml" ? "AIApplication" : "WebApplication",
    operatingSystem: "Web",
    url: project.links?.preview || `${SITE_URL}/projects?highlight=${project.id}`,
    codeRepository: project.links?.github,
    creator: PERSON_REF,
    author: PERSON_REF,
    dateCreated: project.year,
    keywords: project.tags?.join(", "),
    image: project.image ? `${SITE_URL}${project.image}` : DEFAULT_IMAGE,
  };
}

export function buildBaseSchemas() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Aryan Dani",
      alternateName: "Aryan Hardik Dani",
      givenName: "Aryan",
      familyName: "Dani",
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/Images/About/pic_1.jpg`,
      jobTitle: "Freelance AI Engineer & Full-Stack Developer",
      description:
        "Freelance AI engineer and full-stack developer in Pune, India. Builds custom AI agents, RAG pipelines, Next.js and React apps, and high-conversion business websites for startups and local businesses worldwide.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pune",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "MIT World Peace University",
        alternateName: "MIT-WPU",
        url: "https://mitwpu.edu.in/",
      },
      worksFor: {
        "@type": "Organization",
        name: "ProvaanTech",
        url: "https://provaantech.com/",
      },
      affiliation: {
        "@type": "Organization",
        name: "Google Student Ambassador Program",
      },
      knowsAbout: [
        "Artificial Intelligence",
        "Machine Learning",
        "Computer Vision",
        "Generative AI",
        "Large Language Models",
        "Retrieval-Augmented Generation",
        "Vector Databases",
        "Full Stack Development",
        "React",
        "Next.js",
        "Vite",
        "React Router",
        "Tailwind CSS",
        "Framer Motion",
        "Python",
        "FastAPI",
        "LangGraph",
        "Human-in-the-loop AI",
        "Document intelligence",
        "AI MVP development",
        "YOLOv11",
        "Threat Detection",
        ...SERVICES_KEYWORD_LIST,
      ],
      sameAs: [
        "https://www.linkedin.com/in/aryandani/",
        "https://github.com/aryan-dani",
        "https://orcid.org/0009-0005-7427-0809",
        "https://x.com/Killfall15",
        "https://www.instagram.com/aryandani_06/",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description:
        "Freelance AI engineering and full-stack web development by Aryan Dani in Pune.",
      publisher: PERSON_REF,
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/projects?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      name: "Aryan Dani — Freelance AI Engineer & Full-Stack Dev",
      isPartOf: WEBSITE_REF,
      about: PERSON_REF,
      mainEntity: PERSON_REF,
      inLanguage: "en-US",
    },
  ];
}

/**
 * SEO configuration per route.
 */
export const SEO_CONFIG = {
  "/": {
    title: "Aryan Dani — Freelance AI Engineer & Full-Stack Dev",
    description:
      "Hire Aryan Dani for custom AI agents, RAG pipelines, and high-performance Next.js & React web applications. View live case studies and book a discovery call.",
    keywords:
      "Aryan Dani, Freelance AI Engineer India, Hire Full-Stack React Next.js Developer, Custom LLM RAG Consultant, Web Redesign Freelancer Pune",
    canonical: `${SITE_URL}/`,
    robots: DEFAULT_ROBOTS,
    imageAlt: DEFAULT_IMAGE_ALT,
    priority: SEO_ROUTE_META["/"].priority,
    changefreq: SEO_ROUTE_META["/"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Home", "/"),
        buildWebPage(
          "Aryan Dani — Freelance AI Engineer & Full-Stack Dev",
          "Hire Aryan Dani for custom AI agents, RAG pipelines, and high-performance Next.js and React web applications.",
          "/"
        ),
      ];

      // ItemList for featured projects (if provided)
      if (extraData?.projects) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Featured Projects by Aryan Dani",
          itemListOrder: "https://schema.org/ItemListUnordered",
          numberOfItems: extraData.projects.length,
          itemListElement: extraData.projects.slice(0, 6).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: `${SITE_URL}/projects?highlight=${p.id}`,
          })),
        });
      }

      return schemas;
    },
  },

  "/projects": {
    title: "Projects - Aryan Dani | AI & Web Development Portfolio",
    description:
      "Explore Aryan Dani's portfolio of AI and web development projects including Computer Vision systems, LLM-powered applications, and full-stack apps with React, Vite, FastAPI, and more.",
    keywords:
      "AI portfolio, Machine Learning portfolio, Computer Vision projects, web development projects, React projects, Python projects, Generative AI portfolio",
    canonical: `${SITE_URL}/projects`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani AI, machine learning, and full-stack development projects",
    priority: SEO_ROUTE_META["/projects"].priority,
    changefreq: SEO_ROUTE_META["/projects"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Projects", "/projects"),
        buildWebPage(
          "Projects - Aryan Dani | AI & Web Development Portfolio",
          "Explore Aryan Dani's portfolio of AI and web development projects.",
          "/projects"
        ),
      ];

      if (extraData?.projects) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/projects#collectionpage`,
          name: "Projects by Aryan Dani",
          url: `${SITE_URL}/projects`,
          description: "A collection of AI, Machine Learning, and Web Development projects.",
          about: PERSON_REF,
          mainEntity: {
            "@type": "ItemList",
            name: "All Projects",
            numberOfItems: extraData.projects.length,
            itemListElement: extraData.projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.title,
              description: p.description,
              url: p.links?.preview || p.links?.github || `${SITE_URL}/projects?highlight=${p.id}`,
            })),
          },
        });
        schemas.push(...extraData.projects.slice(0, 8).map(softwareApplicationFromProject));
      }

      return schemas;
    },
  },

  "/experience": {
    title: "Experience - Aryan Dani | AI Engineer & Web Developer",
    description:
      "Professional experience of Aryan Dani as an AI Engineer. Includes an AI/ML internship at ProvaanTech, work at Artem HealthTech, and the MIT-WPU AI capstone.",
    keywords:
      "Aryan Dani experience, AI Engineer Pune, MIT WPU AI student, web developer experience, machine learning engineer",
    canonical: `${SITE_URL}/experience`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani professional AI engineer and web developer experience",
    priority: SEO_ROUTE_META["/experience"].priority,
    changefreq: SEO_ROUTE_META["/experience"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Experience", "/experience"),
        buildWebPage(
          "Experience - Aryan Dani | AI Engineer & Web Developer",
          "Professional experience of Aryan Dani as an AI Engineer and Full Stack Developer.",
          "/experience"
        ),
      ];

      if (extraData?.experiences) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Aryan Dani Professional Experience",
          description: "Timeline of professional roles and achievements",
          numberOfItems: extraData.experiences.length,
          itemListElement: extraData.experiences.map((exp, i) => {
            const periodParts = exp.period.split(" - ");
            return {
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "OrganizationRole",
                roleName: exp.position,
                startDate: periodParts[0] || "",
                endDate: periodParts[1] || "",
                worksFor: {
                  "@type": "Organization",
                  name: exp.company,
                  url: exp.companyUrl,
                  location: exp.location || ""
                }
              }
            };
          })
        });
      }

      return schemas;
    },
  },

  "/research": {
    title: "Research - Aryan Dani | Papers & Technical Write-ups",
    description:
      "Research by Aryan Dani — computer vision and AI papers including Real-Time Multi-Modal Threat Detection with YOLOv11 and EfficientNetV2. Browse abstracts, metrics, and full PDFs.",
    keywords:
      "Aryan Dani research, YOLOv11 threat detection, EfficientNetV2 X-ray, MIT WPU capstone, computer vision papers, AI research Pune",
    canonical: `${SITE_URL}/research`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani research papers and technical write-ups",
    priority: SEO_ROUTE_META["/research"].priority,
    changefreq: SEO_ROUTE_META["/research"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const papers = extraData?.papers || [];
      const schemas = [
        buildBreadcrumbs("Research", "/research"),
        buildWebPage(
          "Research - Aryan Dani | Papers & Technical Write-ups",
          "Browse research papers and technical write-ups by Aryan Dani, including computer vision and threat detection work.",
          "/research"
        ),
      ];

      if (papers.length) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Research papers by Aryan Dani",
          numberOfItems: papers.length,
          itemListElement: papers.map((paper, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "ScholarlyArticle",
              "@id": `${SITE_URL}/research?highlight=${encodeURIComponent(paper.id)}`,
              headline: paper.subtitle ? `${paper.title}: ${paper.subtitle}` : paper.title,
              name: paper.title,
              description: paper.summary || paper.abstract,
              author: (paper.authors || []).map((a) => ({
                "@type": "Person",
                name: a.name,
                email: a.email,
              })),
              creator: PERSON_REF,
              url: `${SITE_URL}/research?highlight=${encodeURIComponent(paper.id)}`,
              encoding: paper.pdfUrl
                ? {
                    "@type": "MediaObject",
                    contentUrl: `${SITE_URL}${paper.pdfUrl}`,
                    encodingFormat: "application/pdf",
                  }
                : undefined,
              keywords: Array.isArray(paper.keywords) ? paper.keywords.join(", ") : paper.keywords,
              datePublished: paper.year,
              publisher: {
                "@type": "CollegeOrUniversity",
                name: "MIT World Peace University",
                alternateName: "MIT-WPU",
              },
            },
          })),
        });
      }

      return schemas;
    },
  },

  "/certifications": {
    title: "Certifications - Aryan Dani | AI & Cloud Credentials",
    description:
      "Industry certifications earned by Aryan Dani across AI, cloud, and web, including NPTEL Elite, FutureSkills Prime Gold, Google Cloud, and IBM. On this site.",
    keywords:
      "Aryan Dani certifications, AI certifications, cloud certifications, Google certifications, developer credentials",
    canonical: `${SITE_URL}/certifications`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani AI cloud web development and data science certifications",
    priority: SEO_ROUTE_META["/certifications"].priority,
    changefreq: SEO_ROUTE_META["/certifications"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Certifications", "/certifications"),
        buildWebPage(
          "Certifications - Aryan Dani | AI & Cloud Credentials",
          "Industry-recognized certifications earned by Aryan Dani.",
          "/certifications"
        ),
      ];

      if (extraData?.certifications) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Aryan Dani Technical Certifications",
          description: "List of technical certifications and professional credentials",
          numberOfItems: extraData.certifications.length,
          itemListElement: extraData.certifications.map((cert, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "EducationalOccupationalCredential",
              name: cert.title,
              credentialCategory: cert.tag || "Certification",
              recognizedBy: {
                "@type": "Organization",
                name: cert.issuer,
                logo: cert.issuerLogo
              },
              url: cert.link !== "#" ? cert.link : `${SITE_URL}/certifications`
            }
          }))
        });
      }

      return schemas;
    },
  },

  "/skills": {
    title: "Skills & Tools - Aryan Dani | Tech Stack & Expertise",
    description:
      "Complete technical skill set of Aryan Dani including Python, React, Vite, FastAPI, LangGraph, TensorFlow, PyTorch, Computer Vision, Generative AI, LLMs, RAG, Docker, and 30+ technologies.",
    keywords:
      "Python developer, React developer, Vite, FastAPI, Generative AI, LLMs, RAG, Vector Database, Computer Vision, Full Stack Developer",
    canonical: `${SITE_URL}/skills`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani technical skills in AI machine learning web development and Python",
    priority: SEO_ROUTE_META["/skills"].priority,
    changefreq: SEO_ROUTE_META["/skills"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Skills & Tools", "/skills"),
      buildWebPage(
        "Skills & Tools - Aryan Dani | Tech Stack & Expertise",
        "Complete technical skill set of Aryan Dani including Python, React, Vite, FastAPI, LangGraph, and 30+ technologies.",
        "/skills"
      ),
    ],
  },

  "/about": {
    title: "About Aryan Dani - AI Engineer, Full Stack Developer, Pune",
    description:
      "Learn about Aryan Dani - an AI Engineer and Full Stack Developer from Pune, India. MIT-WPU student specializing in Machine Learning, Computer Vision, Generative AI, and modern web development.",
    keywords:
      "Aryan Dani, Aryan Dani developer, Aryan Dani AI, AI Engineer Pune, MIT WPU AI student, Full Stack Developer India",
    canonical: `${SITE_URL}/about`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "About Aryan Dani AI Engineer Full Stack Developer from Pune and MIT-WPU",
    priority: SEO_ROUTE_META["/about"].priority,
    changefreq: SEO_ROUTE_META["/about"].changefreq,
    ogType: "profile",
    schemas: () => [
      buildBreadcrumbs("About", "/about"),
      buildWebPage(
        "About Aryan Dani - AI Engineer, Full Stack Developer, Pune",
        "Learn about Aryan Dani - an AI Engineer and Full Stack Developer from Pune, India.",
        "/about"
      ),
    ],
  },

  "/services": {
    title: "Websites & AI Tools | Aryan Dani, Pune",
    description:
      "Hire Aryan Dani in Pune for business websites and AI tools. Packages from INR 8,000. Live proof, fixed quotes, India and worldwide.",
    keywords: SERVICES_KEYWORD_LIST.join(", "),
    canonical: `${SITE_URL}/services`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Hire Aryan Dani for websites in Pune and AI product development",
    priority: SEO_ROUTE_META["/services"].priority,
    changefreq: SEO_ROUTE_META["/services"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const faqItems = extraData?.faqItems || MERGED_SERVICES_FAQ;
      return [
        buildBreadcrumbs("Services", "/services"),
        buildWebPage(
          "Websites & AI Tools | Aryan Dani, Pune",
          "Hire Aryan Dani in Pune for business websites and AI tools. Packages from INR 8,000.",
          "/services",
        ),
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${SITE_URL}/services#localbusiness`,
          name: "Aryan Dani Web and AI Services",
          url: `${SITE_URL}/services`,
          image: routeOgImage("/services"),
          description:
            "Websites, web apps, and AI tools for clients in Pune, across India, and worldwide.",
          email: "daniaryan212@gmail.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Pune",
            addressRegion: "Maharashtra",
            addressCountry: "IN",
          },
          areaServed: [
            { "@type": "City", name: "Pune" },
            { "@type": "Country", name: "India" },
            { "@type": "Place", name: "Worldwide" },
          ],
          priceRange: "₹₹-$$$",
          provider: PERSON_REF,
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "daniaryan212@gmail.com",
            availableLanguage: ["English", "Hindi"],
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": `${SITE_URL}/services#service`,
          name: "Aryan Dani Web and AI Engineering Services",
          url: `${SITE_URL}/services`,
          image: routeOgImage("/services"),
          description:
            "Custom AI agents and RAG pipelines, full-stack Next.js and React apps, computer vision systems, and high-conversion business website redesigns.",
          provider: PERSON_REF,
          areaServed: [
            { "@type": "City", name: "Pune" },
            { "@type": "Country", name: "India" },
            { "@type": "Place", name: "Worldwide" },
          ],
          knowsAbout: SERVICES_KEYWORD_LIST,
          email: "daniaryan212@gmail.com",
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "daniaryan212@gmail.com",
            availableLanguage: ["English", "Hindi"],
          },
        },
        ...SERVICES_PACKAGES.map((pack) => ({
          "@context": "https://schema.org",
          "@type": "Service",
          name: pack.name,
          description: pack.forWho,
          provider: PERSON_REF,
          areaServed: [
            { "@type": "Country", name: "India" },
            { "@type": "Place", name: "Worldwide" },
          ],
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            description: pack.priceLabel,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/services#packages-heading`,
          },
        })),
        ...WEB_PACKAGES.map((pack) => ({
          "@context": "https://schema.org",
          "@type": "Service",
          name: pack.name,
          description: pack.forWho,
          provider: PERSON_REF,
          areaServed: [
            { "@type": "Country", name: "India" },
            { "@type": "Place", name: "Worldwide" },
          ],
          offers: {
            "@type": "Offer",
            price: pack.priceInr,
            priceCurrency: "INR",
            description: `${pack.priceKind === "from" ? "From" : "Starting at"} ${formatInr(pack.priceInr)}${pack.priceSuffix || ""} · ${pack.priceKind === "from" ? "From" : "Starting at"} ${formatUsd(pack.priceUsd)}${pack.priceSuffix || ""}`,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/services#web-packages-heading`,
          },
        })),
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        },
      ];
    },
  },

  ...Object.fromEntries(
    SERVICES_GUIDES.map((guide) => {
      const path = `/guides/${guide.slug}`;
      const title = `${guide.title} | Aryan Dani`.slice(0, 60);
      const description = guide.description.slice(0, 155);
      return [
        path,
        {
          title,
          description,
          keywords: `${guide.title}, website India, Aryan Dani, Pune web developer`,
          canonical: `${SITE_URL}${path}`,
          robots: DEFAULT_ROBOTS,
          imageAlt: guide.title,
          priority: SEO_ROUTE_META[path].priority,
          changefreq: SEO_ROUTE_META[path].changefreq,
          ogType: "article",
          schemas: () => [
            buildBreadcrumbs(guide.title, path),
            buildWebPage(title, description, path),
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: guide.title,
              description: guide.description,
              author: PERSON_REF,
              url: `${SITE_URL}${path}`,
            },
          ],
        },
      ];
    }),
  ),

  ...Object.fromEntries(
    CASE_STUDIES.map((study) => {
      const path = `/work/${study.slug}`;
      const title = `${study.title} Case Study | Aryan Dani`;
      const description = study.oneLiner.slice(0, 155);
      return [
        path,
        {
          title: title.slice(0, 60),
          description,
          keywords: `${study.title}, ${study.stack.join(", ")}, Aryan Dani case study`,
          canonical: `${SITE_URL}${path}`,
          robots: DEFAULT_ROBOTS,
          imageAlt: `${study.title} case study by Aryan Dani`,
          priority: SEO_ROUTE_META[path].priority,
          changefreq: SEO_ROUTE_META[path].changefreq,
          ogType: "article",
          schemas: () => [
            buildBreadcrumbs(study.title, path),
            buildWebPage(title, description, path),
            {
              "@context": "https://schema.org",
              "@type": "TechArticle",
              headline: study.title,
              description: study.oneLiner,
              author: PERSON_REF,
              url: `${SITE_URL}${path}`,
              keywords: study.stack.join(", "),
            },
          ],
        },
      ];
    }),
  ),

  "/contact": {
    title: "Contact Aryan Dani - Hire an AI Engineer & Web Developer",
    description:
      "Get in touch with Aryan Dani for freelance projects, job opportunities, collaborations, or open source contributions. AI Engineer and Full Stack Developer available for hire.",
    keywords:
      "hire Aryan Dani, contact developer, freelance AI engineer, hire web developer, collaboration",
    canonical: `${SITE_URL}/contact`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Contact Aryan Dani for AI engineering web development and collaboration",
    priority: SEO_ROUTE_META["/contact"].priority,
    changefreq: SEO_ROUTE_META["/contact"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Contact", "/contact"),
        buildWebPage(
          "Contact Aryan Dani - Hire an AI Engineer & Web Developer",
          "Get in touch with Aryan Dani for freelance projects, collaborations, or job opportunities.",
          "/contact"
        ),
      ];

      // FAQ structured data from the contact page
      if (extraData?.faqItems) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: extraData.faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        });
      }

      return schemas;
    },
  },

  "/playground": {
    title: "CLI Playground - Aryan Dani Portfolio | Interactive Terminal",
    description:
      "Explore Aryan Dani's portfolio through an interactive command-line interface. Query projects, list skills, navigate pages, and discover features using terminal commands.",
    keywords:
      "interactive portfolio, CLI portfolio, developer terminal, Aryan Dani playground",
    canonical: `${SITE_URL}/playground`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Interactive CLI playground for Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/playground"].priority,
    changefreq: SEO_ROUTE_META["/playground"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("CLI Playground", "/playground"),
      buildWebPage(
        "CLI Playground - Aryan Dani Portfolio | Interactive Terminal",
        "Explore Aryan Dani's portfolio through an interactive command-line interface.",
        "/playground"
      ),
    ],
  },

  "/achievements": {
    title: "Achievements - Aryan Dani Portfolio | Trophy Wall",
    description:
      "Aryan Dani portfolio trophy wall. Unlock achievements by running CLI commands, finding easter eggs, and discovering hidden modes throughout this site.",
    keywords: "portfolio achievements, gamified portfolio, Aryan Dani",
    canonical: `${SITE_URL}/achievements`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Achievement trophy wall on Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/achievements"].priority,
    changefreq: SEO_ROUTE_META["/achievements"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Achievements", "/achievements"),
      buildWebPage("Achievements - Aryan Dani Portfolio", "Gamified trophy wall.", "/achievements"),
    ],
  },

  "/guestbook": {
    title: "Guestbook - Aryan Dani Portfolio | Sign The Wall",
    description:
      "Leave a public note on Aryan Dani's portfolio guestbook wall. Share a hello, project feedback, or a short reaction with other visitors who stop by today.",
    keywords: "portfolio guestbook, Aryan Dani",
    canonical: `${SITE_URL}/guestbook`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Guestbook wall on Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/guestbook"].priority,
    changefreq: SEO_ROUTE_META["/guestbook"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Guestbook", "/guestbook"),
      buildWebPage("Guestbook - Aryan Dani Portfolio", "Sign the wall.", "/guestbook"),
    ],
  },

  "/copyright": {
    title: "Copyright & License - Aryan Dani Portfolio",
    description:
      "MIT License and copyright terms for Aryan Dani's portfolio website source code. See what you can reuse, share, and modify in this open-source project.",
    keywords: "Aryan Dani copyright, MIT License, portfolio license",
    canonical: `${SITE_URL}/copyright`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Copyright and license information for Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/copyright"].priority,
    changefreq: SEO_ROUTE_META["/copyright"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Copyright", "/copyright"),
      buildWebPage(
        "Copyright & License - Aryan Dani Portfolio",
        "MIT License and copyright information for Aryan Dani's portfolio website.",
        "/copyright"
      ),
    ],
  },
  "/404": {
    title: "Page Not Found - Aryan Dani Portfolio",
    description:
      "The requested page could not be found. Return to Aryan Dani's AI Engineer and Full Stack Developer portfolio to explore projects, skills, experience, and contact details.",
    keywords: "Aryan Dani portfolio 404",
    canonical: `${SITE_URL}/404`,
    robots: "noindex, follow",
    imageAlt: DEFAULT_IMAGE_ALT,
    ogType: "website",
    schemas: () => [
      buildWebPage(
        "Page Not Found - Aryan Dani Portfolio",
        "The requested page could not be found.",
        "/404"
      ),
    ],
  },
};

/** Shared constants exported for use by the SEO hook */
export { SITE_URL, SITE_NAME, DEFAULT_IMAGE, TWITTER_HANDLE, DEFAULT_ROBOTS, DEFAULT_IMAGE_ALT };
