import { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import FloatingDock from "../FloatingDock/FloatingDock";
import CommandPalette from "../CommandPalette/CommandPalette";

const Layout = memo(function Layout({ children }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md selection:bg-primary-container selection:text-black">
      <Header />
      {/* Added bottom padding (pb-24) to ensure content isn't hidden behind the floating dock on small screens */}
      <main className="grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-10 pb-24 md:pb-28 flex flex-col gap-12 md:gap-section-gap relative z-10 mt-6 md:mt-0">
        {children || <Outlet />}
      </main>
      <Footer />
      <FloatingDock />
      <CommandPalette />
    </div>
  );
});

export default Layout;
