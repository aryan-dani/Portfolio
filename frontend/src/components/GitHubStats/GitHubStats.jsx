import { memo } from "react";
import { motion } from "framer-motion";

const GITHUB_USERNAME = "aryan-dani";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const GitHubStats = memo(function GitHubStats() {
  const statsUrl = `https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&count_private=true&hide_border=true&bg_color=ffffff&title_color=000000&text_color=1a1c1c&icon_color=5d6300&ring_color=f0ff00`;
  const langsUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&hide_border=true&bg_color=ffffff&title_color=000000&text_color=1a1c1c&langs_count=8`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${GITHUB_USERNAME}&hide_border=true&background=ffffff&ring=f0ff00&fire=000000&currStreakNum=000000&sideNums=000000&currStreakLabel=5d6300&sideLabels=5d6300&dates=78795f`;
  const trophiesUrl = `https://github-profile-trophy.vercel.app/?username=${GITHUB_USERNAME}&theme=flat&no-bg=true&no-frame=true&column=4&margin-w=8&margin-h=8`;
  
  // Custom contribution graph URLs
  const activityGraphUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${GITHUB_USERNAME}&bg_color=0d1117&color=999999&line=999999&point=cccccc&hide_border=false&area=true&area_color=161b22`;
  const contributionGridUrl = `https://ghchart.rshah.org/5d6300/${GITHUB_USERNAME}`;

  return (
    <motion.section
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.h2
        className="font-headline-md text-3xl md:text-4xl uppercase border-b-4 border-black pb-4"
        variants={itemVariants}
      >
        GitHub Activity
      </motion.h2>

      {/* Stats + Languages row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
          variants={itemVariants}
        >
          <div className="bg-black text-white px-4 py-2 font-label-bold text-sm uppercase flex items-center justify-between">
            <span>Stats Overview</span>
            <span className="text-primary-container text-xs">@{GITHUB_USERNAME}</span>
          </div>
          <div className="p-4 flex justify-center items-center min-h-[200px]">
            <img
              src={statsUrl}
              alt="GitHub Stats"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
          variants={itemVariants}
        >
          <div className="bg-black text-white px-4 py-2 font-label-bold text-sm uppercase flex items-center justify-between">
            <span>Top Languages</span>
            <span className="text-primary-container text-xs">By Repo</span>
          </div>
          <div className="p-4 flex justify-center items-center min-h-[200px]">
            <img
              src={langsUrl}
              alt="Top Languages"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>

      {/* Contribution Calendar Grid */}
      <motion.div
        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
        variants={itemVariants}
      >
        <div className="bg-primary-container px-4 py-2 font-label-bold text-sm uppercase border-b-4 border-black flex items-center justify-between">
          <span>📅 Contributions Calendar</span>
          <span className="text-xs">Commit History</span>
        </div>
        <div className="p-6 flex justify-center overflow-x-auto">
          <img
            src={contributionGridUrl}
            alt="Contributions Calendar"
            className="min-w-[650px] max-w-full h-auto"
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* Activity Graph Line Chart */}
      <motion.div
        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
        variants={itemVariants}
      >
        <div className="bg-black text-white px-4 py-2 font-label-bold text-sm uppercase flex items-center justify-between">
          <span>📈 Contribution Trend Graph</span>
          <span className="text-primary-container text-xs">Activity Pulse</span>
        </div>
        <div className="p-4 flex justify-center bg-[#0d1117]">
          <img
            src={activityGraphUrl}
            alt="Contribution Trend Graph"
            className="w-full max-w-3xl h-auto"
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
        variants={itemVariants}
      >
        <div className="bg-primary-container px-4 py-2 font-label-bold text-sm uppercase border-b-4 border-black flex items-center justify-between">
          <span>🔥 Contribution Streak</span>
          <span className="text-xs">Consistency is key</span>
        </div>
        <div className="p-4 flex justify-center">
          <img
            src={streakUrl}
            alt="GitHub Streak"
            className="w-full max-w-2xl h-auto"
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* Trophies */}
      <motion.div
        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
        variants={itemVariants}
      >
        <div className="bg-black text-white px-4 py-2 font-label-bold text-sm uppercase flex items-center justify-between">
          <span>🏆 Trophies</span>
          <span className="text-primary-container text-xs">Achievements Unlocked</span>
        </div>
        <div className="p-4 flex justify-center">
          <img
            src={trophiesUrl}
            alt="GitHub Trophies"
            className="w-full max-w-3xl h-auto"
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* GitHub Profile Link */}
      <motion.a
        href={`https://github.com/${GITHUB_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white border-4 border-black px-6 py-4 font-label-bold text-lg uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(240,255,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full md:w-fit"
        variants={itemVariants}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        View Full GitHub Profile
      </motion.a>
    </motion.section>
  );
});

export default GitHubStats;
