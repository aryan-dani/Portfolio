import { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Layout = memo(function Layout() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-black">
      <Header />
      <main className="grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-section-gap flex flex-col gap-16 md:gap-section-gap relative z-10 mt-8 md:mt-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
});

export default Layout;
