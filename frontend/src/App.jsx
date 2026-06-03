import { lazy, Suspense, useRef, useEffect } from "react";
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
const Certifications = lazy(() => import("./pages/Certifications/Certifications"));
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

// Route configuration — eliminates 9x repeated Suspense+PageTransition wrappers
const routeConfig = [
  { index: true,  path: undefined,        component: Home },
  { path: "experience",                   component: Experience },
  { path: "projects",                     component: Projects },
  { path: "certifications",               component: Certifications },
  { path: "skills",                       component: Skills },
  { path: "about",                        component: About },
  { path: "contact",                      component: Contact },
  { path: "playground",                   component: Playground },
  { path: "copyright",                    component: Copyright },
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Page transition component with directional slide & fade
const pageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? "20px" : "-20px",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transitionEnd: { transform: "none" },
    transition: { type: "spring", stiffness: 260, damping: 30 },
  },
  exit: (direction) => ({
    x: direction > 0 ? "-20px" : "20px",
    opacity: 0,
    transition: { duration: 0.22, ease: "easeIn" },
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

// Monochrome wipe overlay that sweeps across screen on route change
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
          duration: 0.42,
          times: [0, 0.42, 1],
          ease: [0.76, 0, 0.24, 1],
        }}
        className="fixed inset-0 z-99999 pointer-events-none border-x-4 border-[var(--color-outline)]"
        style={{
          background: "var(--color-on-background)",
          opacity: 0.92,
        }}
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
          {routeConfig.map(({ index, path, component: Component }) => (
            <Route
              key={path ?? "/"}
              index={index}
              path={path}
              element={
                <Suspense fallback={<PageFallback />}>
                  <PageTransition direction={direction} isFirstRender={isFirstRender}>
                    <Component />
                  </PageTransition>
                </Suspense>
              }
            />
          ))}
        </Routes>
      </AnimatePresence>
    </>
  );
}

const preloadAllPages = () => {
  const pages = [
    () => import("./pages/Home/Home"),
    () => import("./pages/Experience/Experience"),
    () => import("./pages/Projects/Projects"),
    () => import("./pages/Certifications/Certifications"),
    () => import("./pages/Skills/Skills"),
    () => import("./pages/About/About"),
    () => import("./pages/Contact/Contact"),
    () => import("./pages/Copyright/Copyright"),
    () => import("./pages/Playground/Playground"),
  ];
  
  pages.forEach((p) => {
    try {
      p();
    } catch (e) {
      console.warn("Failed to preload page", e);
    }
  });
};

function App() {
  useEffect(() => {
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));
    const handle = idleCallback(() => {
      preloadAllPages();
    });
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, []);

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
