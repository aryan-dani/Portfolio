import { useState, memo } from "react";
import { NavLink } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const navItems = [
  { path: "/projects", label: "Projects" },
  { path: "/experience", label: "Experience" },
  { path: "/certifications", label: "Certifications" },
  { path: "/skills", label: "Skills" },
  { path: "/about", label: "About" },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <nav className="sticky top-0 w-full border-b-4 border-black z-50 bg-white shadow-[0_8px_0_0_#000000]">
        <div className="flex justify-between items-center px-4 md:px-8 h-20 w-full">
          <NavLink
            to="/"
            className="text-2xl font-black tracking-tighter text-black border-4 border-black px-4 py-2 bg-[#F0FF00] shadow-[4px_4px_0_0_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000000] transition-all"
          >
            ARYAN DANI
          </NavLink>

          <div className="hidden md:flex gap-6 lg:gap-8 items-center font-headline-md uppercase tracking-tighter font-bold text-sm lg:text-base">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-black font-bold opacity-90 hover:opacity-100 hover:bg-primary-container transition-all duration-100 px-3 py-1 border-4 ${
                    isActive
                      ? "bg-primary-container border-black shadow-[2px_2px_0_0_#000000]"
                      : "border-transparent hover:border-black"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:block">
            <NavLink
              to="/contact"
              className="font-headline-md text-base uppercase tracking-widest font-black text-black bg-[#F0FF00] border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-100 flex items-center justify-center"
            >
              Work with me
            </NavLink>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-black p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white top-20 flex flex-col items-center pt-8 border-t-4 border-black font-headline-md uppercase font-bold text-xl gap-6">
          <NavLink
            to="/"
            onClick={toggleMenu}
            className={({ isActive }) =>
              `w-full text-center py-4 border-4 ${isActive ? "bg-primary-container border-black shadow-[4px_4px_0_0_#000000]" : "border-transparent hover:border-black hover:bg-primary-container"}`
            }
          >
            Home
          </NavLink>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={toggleMenu}
              className={({ isActive }) =>
                `w-full text-center py-4 border-4 transition-all ${
                  isActive
                    ? "bg-primary-container border-black shadow-[4px_4px_0_0_#000000]"
                    : "border-transparent hover:border-black hover:bg-primary-container"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="w-full px-8 mt-4">
            <NavLink
              to="/contact"
              onClick={toggleMenu}
              className="w-full flex justify-center items-center font-headline-md text-lg uppercase tracking-widest font-black text-black bg-[#F0FF00] border-4 border-black px-4 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Work with me
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(Header);
