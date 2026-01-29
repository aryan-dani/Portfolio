import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout/Layout";
import { ToastProvider } from "./context/ToastContext";

// ScrollProgress removed per user request
import BackToTop from "./components/BackToTop/BackToTop";
import PageLoader from "./components/PageLoader/PageLoader";

// Lazy load all page components for code splitting
const Home = lazy(() => import("./pages/Home/Home"));
const Experience = lazy(() => import("./pages/Experience/Experience"));
const Projects = lazy(() => import("./pages/Projects/Projects"));
const Certifications = lazy(() => import("./pages/Certifications/Certifications"));
const Skills = lazy(() => import("./pages/Skills/Skills"));
const About = lazy(() => import("./pages/About/About"));
const Copyright = lazy(() => import("./pages/Copyright/Copyright"));

// Get base path from Vite config
const basename = import.meta.env.BASE_URL;

// Minimal loading fallback
function PageFallback() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#272727"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "3px solid rgba(240, 248, 255, 0.1)",
        borderTopColor: "aliceblue",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<PageFallback />}>
              <Home />
            </Suspense>
          } />
          <Route path="experience" element={
            <Suspense fallback={<PageFallback />}>
              <Experience />
            </Suspense>
          } />
          <Route path="projects" element={
            <Suspense fallback={<PageFallback />}>
              <Projects />
            </Suspense>
          } />
          <Route path="certifications" element={
            <Suspense fallback={<PageFallback />}>
              <Certifications />
            </Suspense>
          } />
          <Route path="skills" element={
            <Suspense fallback={<PageFallback />}>
              <Skills />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<PageFallback />}>
              <About />
            </Suspense>
          } />
          <Route path="copyright" element={
            <Suspense fallback={<PageFallback />}>
              <Copyright />
            </Suspense>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ToastProvider>
      <PageLoader />
      <Router
        basename={basename}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >


        <BackToTop />
        <AnimatedRoutes />
        <Analytics />
      </Router>
    </ToastProvider>
  );
}

export default App;
