import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PageLoader.scss";

function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure minimum display time for the loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="page-loader__content">
            <motion.div
              className="page-loader__logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="page-loader__initials">AD</span>
            </motion.div>
            <motion.div
              className="page-loader__bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            <motion.p
              className="page-loader__text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Loading experience...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageLoader;
