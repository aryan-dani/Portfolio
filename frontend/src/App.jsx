import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Experience from "./pages/Experience/Experience";
import Projects from "./pages/Projects/Projects";
import Certifications from "./pages/Certifications/Certifications";
import Skills from "./pages/Skills/Skills";
import About from "./pages/About/About";
import Copyright from "./pages/Copyright/Copyright";
import { ToastProvider } from "./context/ToastContext";
import CustomCursor from "./components/CustomCursor/CustomCursor";

// Get base path from Vite config
const basename = import.meta.env.BASE_URL;

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="experience" element={<Experience />} />
          <Route path="projects" element={<Projects />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="skills" element={<Skills />} />
          <Route path="about" element={<About />} />
          <Route path="copyright" element={<Copyright />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router
        basename={basename}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <CustomCursor />
        <AnimatedRoutes />
      </Router>
    </ToastProvider>
  );
}

export default App;
