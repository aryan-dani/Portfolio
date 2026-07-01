import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariants } from "./utils/motionVariants";
import { scrollToTopImmediate } from "./utils/smoothScroll";
import { SITE_ROUTES, routeOrder, PAGE_IMPORTS } from "./config/routes";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout/Layout";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SmoothScrollProvider } from "./context/SmoothScrollContext";
import { SoundProvider } from "./context/SoundContext";

import BackToTop from "./components/BackToTop/BackToTop";
import NoiseOverlay from "./components/NoiseOverlay/NoiseOverlay";
import PageLoader from "./components/PageLoader/PageLoader";

const lazyPages = Object.fromEntries(
  SITE_ROUTES.map((route) => [route.id, lazy(PAGE_IMPORTS[route.id])]),
);

const routeConfig = SITE_ROUTES.map((route) => ({
  index: route.segment === null,
  path: route.segment ?? undefined,
  component: lazyPages[route.id],
}));

const CustomCursor = lazy(() => import("./components/CustomCursor/CustomCursor"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const basename = import.meta.env.BASE_URL;

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

function PageTransition({ children, isFirstRender, direction }) {
  return (
    <>
      {!isFirstRender && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[90] pointer-events-none bg-[var(--color-background)] gpu-layer"
          initial={{ opacity: 0.92 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0.82 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <motion.div
        variants={pageVariants}
        custom={direction}
        initial={isFirstRender ? false : "initial"}
        animate="animate"
        exit="exit"
        className="w-full flex flex-col grow"
      >
        {children}
      </motion.div>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const isFirstRenderRef = useRef(true);
  const [direction, setDirection] = useState(1);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    scrollToTopImmediate();
    requestAnimationFrame(scrollToTopImmediate);
  }, [location.pathname]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    if (previousPath === location.pathname) return;

    const fromIndex = routeOrder.indexOf(previousPath);
    const toIndex = routeOrder.indexOf(location.pathname);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      setDirection(toIndex > fromIndex ? 1 : -1);
    } else {
      setDirection(1);
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  const isFirstRender = isFirstRenderRef.current;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routeConfig.map(({ index, path, component: Component }) => (
          <Route
            key={path ?? "/"}
            index={index}
            path={path}
            element={
              <Suspense fallback={<PageFallback />}>
                <PageTransition isFirstRender={isFirstRender} direction={direction}>
                  <Component />
                </PageTransition>
              </Suspense>
            }
          />
        ))}
        <Route
          path="*"
          element={
            <Suspense fallback={<PageFallback />}>
              <PageTransition isFirstRender={isFirstRender} direction={direction}>
                <NotFound />
              </PageTransition>
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function DeferredCustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 1200));
    const handle = idle(() => setEnabled(true));

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, []);

  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <CustomCursor />
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SmoothScrollProvider>
        <SoundProvider>
          <ToastProvider>
            <NoiseOverlay />
            <DeferredCustomCursor />
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
