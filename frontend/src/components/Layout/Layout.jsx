import { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Layout = memo(function Layout() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-black">
      <Header />
      <main className="grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-10 flex flex-col gap-12 md:gap-section-gap relative z-10 mt-6 md:mt-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
});

export default Layout;
