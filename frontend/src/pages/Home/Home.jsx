import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { aboutInfo } from "../../data/experience";
import { getAssetPath } from "../../utils/paths";
import TypeWriter from "../../components/TypeWriter/TypeWriter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, rotate: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 2,
    transition: { duration: 0.5, ease: "backOut" },
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
      className="flex flex-col lg:flex-row gap-gutter items-center justify-between min-h-[calc(100vh-200px)] lg:min-h-[716px] w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex-1 flex flex-col gap-6 lg:gap-8 max-w-3xl w-full z-10">
        <motion.h1
          className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-on-background uppercase wrap-break-word leading-none bg-white neo-border p-3 md:p-4 neo-shadow inline-block w-fit"
          variants={itemVariants}
        >
          {aboutInfo.name}
        </motion.h1>

        <motion.h2
          className="font-headline-md text-xl md:text-2xl lg:text-headline-md text-on-surface-variant bg-primary-container neo-border p-2 w-fit neo-shadow uppercase"
          variants={itemVariants}
        >
          <TypeWriter
            texts={roles}
            speed={80}
            deleteSpeed={40}
            pauseTime={2500}
          />
        </motion.h2>

        <motion.p
          className="font-body-lg text-base md:text-lg lg:text-body-lg text-on-background bg-white neo-border p-4 neo-shadow max-w-2xl"
          variants={itemVariants}
        >
          I'm a passionate Web Developer and AI Engineer, dedicated to crafting
          seamless, high-performance web solutions. Discover my projects,
          skills, and certifications below.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 mt-4 lg:mt-8"
          variants={itemVariants}
        >
          <Link
            to="/projects"
            className="bg-primary-container text-black neo-border px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase neo-shadow transition-all neo-shadow-hover neo-shadow-active inline-block"
          >
            View My Work
          </Link>
          <Link
            to="/about"
            className="bg-white text-black neo-border px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase neo-shadow transition-all neo-shadow-hover neo-shadow-active inline-block"
          >
            More About Me
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="flex-1 w-full flex justify-center lg:justify-end mt-12 lg:mt-0"
        variants={imageVariants}
      >
        <div className="relative w-full max-w-sm md:max-w-md aspect-square border-4 border-black bg-white p-2 md:p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300">
          <img
            src={getAssetPath("Images/Home_Page.jpg")}
            alt={aboutInfo.name}
            className="w-full h-full object-cover neo-border grayscale hover:grayscale-0 transition-all duration-300"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </div>
      </motion.div>
    </motion.section>
  );
});

export default Home;
