import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion, MotionConfig, LazyMotion, domAnimation } from "framer-motion";
import { pageVariants } from "./utils/motionVariants";
import { scrollToTopImmediate } from "./utils/smoothScroll";
import { SITE_ROUTES, PAGE_IMPORTS } from "./config/routes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Layout from "./components/Layout/Layout";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SmoothScrollProvider } from "./context/SmoothScrollContext";
import { SoundProvider } from "./context/SoundContext";
import { AchievementProvider } from "./context/AchievementContext";
import { SiteIdleProvider } from "./context/SiteIdleContext";
import { useMotionPolicy } from "./hooks/useMotionPolicy";
import { composeProviders } from "./utils/composeProviders";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

import BackToTop from "./components/BackToTop/BackToTop";
import SiteBrowser from "./components/SiteBrowser/SiteBrowser";
import NoiseOverlay from "./components/NoiseOverlay/NoiseOverlay";
import GroundedIntro from "./components/Intro/GroundedIntro";
import CustomCursor from "./components/CustomCursor/CustomCursor";
import HackModeListener from "./components/HackModeListener/HackModeListener";
import { readStorage } from "./utils/storage";

const lazyPages = Object.fromEntries(
  SITE_ROUTES.filter((route) => PAGE_IMPORTS[route.id]).map((route) => [
    route.id,
    lazy(PAGE_IMPORTS[route.id]),
  ]),
);

const routeConfig = SITE_ROUTES.map((route) => ({
  index: route.segment === null,
  path: route.segment ?? undefined,
  component: lazyPages[route.id],
  redirectOnly: !PAGE_IMPORTS[route.id],
}));

const ChatWidget = lazy(() => import("./components/ChatWidget/ChatWidget"));
const EasterEggs = lazy(() => import("./components/EasterEggs/EasterEggs"));
const DevTools = lazy(() => import("./components/DevTools/DevTools"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const WorkCaseStudy = lazy(() => import("./pages/Work/WorkCaseStudy"));
const Guide = lazy(() => import("./pages/Guides/Guide"));
const ServiceLanding = lazy(() => import("./pages/Services/ServiceLanding"));

const basename = import.meta.env.BASE_URL;

function useIdleMount(timeout = 1800) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;
    const mount = () => setMounted(true);

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(mount, { timeout });
    } else {
      timeoutId = window.setTimeout(mount, timeout);
    }

    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [timeout]);

  return mounted;
}

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

function PageTransition({ children, isFirstRender, skipMotion }) {
  if (skipMotion) {
    return <div className="w-full flex flex-col grow">{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial={isFirstRender ? false : "initial"}
      animate="animate"
      exit="exit"
      className="w-full flex flex-col grow"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const motionPolicy = useMotionPolicy();
  const skipMotion = motionPolicy !== "full";
  const isFirstRenderRef = useRef(true);

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

  const isFirstRender = isFirstRenderRef.current;

  return (
    <AnimatePresence initial={false}>
      <Routes location={location} key={location.pathname}>
        {routeConfig.map(({ index, path, component: Component, redirectOnly }) =>
          redirectOnly || path === "contact" ? (
            <Route
              key={path ?? "contact"}
              path={path ?? "contact"}
              element={<Navigate to="/services#inquiry" replace />}
            />
          ) : (
            <Route
              key={path ?? "/"}
              index={index}
              path={path}
              element={
                <ErrorBoundary>
                  <Suspense fallback={<PageFallback />}>
                    <PageTransition isFirstRender={isFirstRender} skipMotion={skipMotion}>
                      <Component />
                    </PageTransition>
                  </Suspense>
                </ErrorBoundary>
              }
            />
          ),
        )}
        <Route
          path="work/:slug"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <PageTransition isFirstRender={isFirstRender} skipMotion={skipMotion}>
                  <WorkCaseStudy />
                </PageTransition>
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="guides/:slug"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <PageTransition isFirstRender={isFirstRender} skipMotion={skipMotion}>
                  <Guide />
                </PageTransition>
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="services/:slug"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <PageTransition isFirstRender={isFirstRender} skipMotion={skipMotion}>
                  <ServiceLanding />
                </PageTransition>
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="*"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <PageTransition isFirstRender={isFirstRender} skipMotion={skipMotion}>
                  <NotFound />
                </PageTransition>
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function CustomCursorGate() {
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const onChange = (event) => setEnabled(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (!enabled) return null;
  return <CustomCursor />;
}

function introQueryValue() {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get("intro");
  } catch {
    return null;
  }
}

function isHomePathname() {
  if (typeof window === "undefined") return false;
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return path === "/" || path === basename || path === "";
}

function chooseIntro() {
  if (typeof window === "undefined") return "skip";
  const q = introQueryValue();
  // Film is opt-in only (?intro=1). Native Grounded intro is the default.
  if (q === "1") return "film";

  if (!isHomePathname()) return "skip";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "skip";
  // Force replay with ?intro=v2; otherwise once per browser.
  if (q !== "v2" && readStorage("portfolio_visited")) return "skip";
  return "grounded";
}

/**
 * Default: GroundedIntro on first home visit.
 * Film: ?intro=1 only (lazy-loaded so normal visits never pay for the video).
 */
function BootIntro() {
  const [kind] = useState(() => {
    const chosen = chooseIntro();
    if (chosen === "grounded") {
      document.documentElement.classList.add("intro-v2-playing");
    } else if (chosen === "skip") {
      document.documentElement.classList.add("intro-mark-ready");
    }
    return chosen;
  });
  const [Film, setFilm] = useState(null);

  useEffect(() => {
    if (kind === "skip") {
      window.dispatchEvent(new CustomEvent("portfolio-intro-complete"));
    }
  }, [kind]);

  useEffect(() => {
    if (kind !== "film") return undefined;
    let cancelled = false;
    import("./components/PageLoader/PageLoader").then((mod) => {
      if (!cancelled) setFilm(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (kind === "grounded") {
    return <GroundedIntro />;
  }
  if (kind === "film") {
    return Film ? <Film /> : null;
  }
  return null;
}

// Outer providers — no router dependency (safe to wrap Router itself)
const OuterProviders = composeProviders(ThemeProvider, SmoothScrollProvider, SoundProvider, ToastProvider);

function App() {
  const mountNonCriticalEnhancements = useIdleMount();

  return (
    // MotionConfig with reducedMotion="user" respects OS prefers-reduced-motion.
    // LazyMotion + domAnimation loads a smaller feature set async (~15KB gzip savings).
    // Follow-up: migrate motion → m and enable `strict` for stronger tree-shaking.
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <OuterProviders>
          <NoiseOverlay />
          <CustomCursorGate />
          <BootIntro />
          <Router
            basename={basename}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AchievementProvider>
              <SiteIdleProvider>
                <HackModeListener />
                <Suspense fallback={null}>
                  {mountNonCriticalEnhancements && (
                    <>
                      <EasterEggs />
                      <DevTools />
                    </>
                  )}
                  <ChatWidget />
                </Suspense>
                <BackToTop />
                <SiteBrowser />
                <Layout>
                  <AnimatedRoutes />
                </Layout>
                {import.meta.env.PROD && (
                  <>
                    <Analytics />
                    <SpeedInsights />
                  </>
                )}
              </SiteIdleProvider>
            </AchievementProvider>
          </Router>
        </OuterProviders>
      </LazyMotion>
    </MotionConfig>
  );
}

export default App;
