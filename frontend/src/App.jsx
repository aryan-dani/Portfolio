import { lazy, Suspense, useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout/Layout";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

import BackToTop from "./components/BackToTop/BackToTop";
import PageLoader from "./components/PageLoader/PageLoader";
import CustomCursor from "./components/CustomCursor/CustomCursor";
import NoiseOverlay from "./components/NoiseOverlay/NoiseOverlay";

// Lazy load all page components for code splitting
const Home = lazy(() => import("./pages/Home/Home"));
const Experience = lazy(() => import("./pages/Experience/Experience"));
const Projects = lazy(() => import("./pages/Projects/Projects"));
const Certifications = lazy(
  () => import("./pages/Certifications/Certifications"),
);
const Skills = lazy(() => import("./pages/Skills/Skills"));
const About = lazy(() => import("./pages/About/About"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const Copyright = lazy(() => import("./pages/Copyright/Copyright"));
const Playground = lazy(() => import("./pages/Playground/Playground"));

// Get base path from Vite config
const basename = import.meta.env.BASE_URL;

// Route order for determining navigation direction
const routeOrder = [
  "/",
  "/projects",
  "/experience",
  "/certifications",
  "/skills",
  "/about",
  "/playground",
  "/contact",
  "/copyright",
];

// Minimal loading fallback — theme-aware
function PageFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid var(--color-outline-variant)",
          borderTopColor: "var(--color-primary-container)",
          borderRadius: "0",
          animation: "spin 0.9s linear infinite",
          boxShadow: "4px 4px 0 var(--shadow-color)",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Page transition component with directional slide & fade
const pageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? "40px" : "-40px",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transitionEnd: {
      transform: "none",
    },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? "-40px" : "40px",
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  }),
};

function PageTransition({ children, direction, isFirstRender }) {
  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial={isFirstRender ? { opacity: 1, x: 0 } : "initial"}
      animate={isFirstRender ? { opacity: 1, x: 0 } : "animate"}
      exit="exit"
      className="w-full flex flex-col grow"
    >
      {children}
    </motion.div>
  );
}

// Flash overlay that sweeps across screen on route change
function FlashOverlay({ locationKey, direction }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial={{ x: direction > 0 ? "100%" : "-100%" }}
        animate={{
          x: direction > 0 ? ["100%", "0%", "-100%"] : ["-100%", "0%", "100%"],
        }}
        transition={{
          duration: 0.45,
          times: [0, 0.45, 1],
          ease: [0.76, 0, 0.24, 1],
        }}
        className="fixed inset-0 z-99999 pointer-events-none border-x-8 border-(--color-outline)"
        style={{ background: "var(--color-primary-container)" }}
      />
    </AnimatePresence>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const currentPath = location.pathname;

  const prevPathRef = useRef(currentPath);
  const directionRef = useRef(1);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  if (currentPath !== prevPathRef.current) {
    const prevIdx = routeOrder.indexOf(prevPathRef.current);
    const newIdx = routeOrder.indexOf(currentPath);
    if (prevIdx !== -1 && newIdx !== -1 && prevIdx !== newIdx) {
      directionRef.current = newIdx > prevIdx ? 1 : -1;
    }
    prevPathRef.current = currentPath;
  }

  const direction = directionRef.current;
  const isFirstRender = isFirstRenderRef.current;

  return (
    <>
      {!isFirstRender && (
        <FlashOverlay locationKey={location.pathname} direction={direction} />
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            index
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Home />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="experience"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Experience />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="projects"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Projects />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="certifications"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Certifications />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="skills"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Skills />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="about"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <About />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="contact"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Contact />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="playground"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Playground />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="copyright"
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition
                  direction={direction}
                  isFirstRender={isFirstRender}
                >
                  <Copyright />
                </PageTransition>
              </Suspense>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NoiseOverlay />
        <CustomCursor />
        <PageLoader />
        <Router
          basename={basename}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <BackToTop />
          <Layout>
            <AnimatedRoutes />
          </Layout>
          <Analytics />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
