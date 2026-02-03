import { memo } from "react";
import { Link } from "react-router-dom";

import { motion } from "framer-motion";
import {
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaGithub,
  FaArrowRight,
} from "react-icons/fa";
import { socialLinks, aboutInfo } from "../../data/experience";
import { getAssetPath } from "../../utils/paths";
import TypeWriter from "../../components/TypeWriter/TypeWriter";
import "./Home.scss";

const iconMap = {
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaGithub,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const roles = [
  "Web Developer",
  "AI Engineer",
  "Tech Enthusiast",
  "Problem Solver",
];

const Home = memo(function Home() {
  return (
    <motion.section
      className="home"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="home__container">
        <motion.div className="home__content" variants={itemVariants}>
          <motion.h1 className="home__name" variants={itemVariants}>
            {aboutInfo.name.split(" ")[0]}
            <span className="home__name--last">
              {" "}
              {aboutInfo.name.split(" ")[1]}
            </span>
          </motion.h1>

          <motion.h2 className="home__title" variants={itemVariants}>
            <TypeWriter
              texts={roles}
              speed={80}
              deleteSpeed={40}
              pauseTime={2500}
            />
          </motion.h2>

          <motion.p className="home__intro intro-text" variants={itemVariants}>
            I'm a passionate Web Developer and AI Engineer, dedicated to
            crafting seamless, high-performance web solutions. Discover my
            projects, skills, and certifications below.
          </motion.p>

          <motion.div className="home__socials" variants={itemVariants}>
            {socialLinks.map((link, index) => {
              const IconComponent = iconMap[link.icon];
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home__social-link"
                  title={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 1 + index * 0.15,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent />
                  <span>{link.name}</span>
                </motion.a>
              );
            })}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link to="/projects" className="home__cta">
              <span>View My Work</span>
              <FaArrowRight />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="home__image-wrapper" variants={imageVariants}>
          <div className="home__image-container">
            <img
              src={getAssetPath("Images/Home_Page.jpg")}
              alt="Aryan Dani"
              className="home__image"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
            <div className="home__image-glow" />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
});

export default Home;
