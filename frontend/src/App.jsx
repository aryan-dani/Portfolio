import { lazy, Suspense, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariants } from "./utils/motionVariants";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout/Layout";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SmoothScrollProvider } from "./context/SmoothScrollContext";
import { SoundProvider } from "./context/SoundContext";

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

function PageTransition({ children, isFirstRender }) {
  return (
    <motion.div
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



function AnimatedRoutes() {
  const location = useLocation();
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (window.__portfolioLenis) {
        window.__portfolioLenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    });
  }, [location.pathname]);

  const isFirstRender = isFirstRenderRef.current;

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {routeConfig.map(({ index, path, component: Component }) => (
            <Route
              key={path ?? "/"}
              index={index}
              path={path}
              element={
                <Suspense fallback={<PageFallback />}>
                  <PageTransition isFirstRender={isFirstRender}>
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
      <SmoothScrollProvider>
        <SoundProvider>
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
        </SoundProvider>
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}

export default App;
