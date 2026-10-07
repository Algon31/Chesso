import { useLocation, Link } from "react-router-dom";
import React from "react";

export default function Navbar() {
  const location = useLocation();

  return (
    <div className="fixed top-4 md:top-5 left-0 w-full z-40 flex justify-center pointer-events-none px-4">
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto h-12 md:h-14 bg-[#B75A48] shadow-lg text-[#E8ECD6] text-center rounded-2xl flex justify-center items-center px-2 md:px-6 border border-[#E8ECD6]/15 backdrop-blur-md"
      >
        <ol className="flex justify-center items-center gap-1 md:gap-3 text-xs md:text-sm font-semibold">
          <li>
            <Link
              to="/"
              className={`px-3 py-1.5 md:px-6 md:py-2 rounded-xl transition-all ${
                location.pathname === "/" ? "bg-[#843E34] text-white shadow-sm" : "hover:bg-[#843E34]/50"
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/Dashboard"
              className={`px-3 py-1.5 md:px-6 md:py-2 rounded-xl transition-all ${
                location.pathname === "/Dashboard" ? "bg-[#843E34] text-white shadow-sm" : "hover:bg-[#843E34]/50"
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/Facts"
              className={`px-3 py-1.5 md:px-6 md:py-2 rounded-xl transition-all ${
                location.pathname === "/Facts" || location.pathname === "/facts"
                  ? "bg-[#843E34] text-white shadow-sm"
                  : "hover:bg-[#843E34]/50"
              }`}
            >
              Facts
            </Link>
          </li>
        </ol>
      </nav>
    </div>
  );
}
