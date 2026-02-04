import { lazy, Suspense, memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Layout.scss";

// Lazy load ParticlesBackground for faster initial render
const ParticlesBackground = lazy(
  () => import("../ParticlesBackground/ParticlesBackground"),
);

const Layout = memo(function Layout() {
  return (
    <div className="layout">
      <Suspense fallback={null}>
        <ParticlesBackground />
      </Suspense>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
});

export default Layout;
