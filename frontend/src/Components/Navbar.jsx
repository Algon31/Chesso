import { useLocation } from "react-router-dom";
import React from "react";

export default function Navbar() {
  const location = useLocation();

  return (
    <div className="fixed top-5 left-0 w-full z-50 flex justify-center bg-transparent">
      <div
        className="h-14 w-1/2 bg-[#B75A48] shadow-md text-center rounded-2xl flex justify-center overflow-hidden"
      >
        <ol className="flex justify-center items-center w-full">
          <li
            className={`px-10 p-2 rounded-2xl ${
              location.pathname === "/" ? "bg-[#843E34]" : ""
            }`}
          >
            <a href="/">Home</a>
          </li>
          <li
            className={`px-10 p-2 rounded-2xl ${
              location.pathname === "/Dashboard" ? "bg-[#843E34]" : ""
            }`}
          >
            <a href="/Dashboard">Dashboard</a>
          </li>
          <li
            className={`px-10 p-2 rounded-2xl ${
              location.pathname === "/facts" ? "bg-[#843E34]" : ""
            }`}
          >
            <a href="/facts">Facts</a>
          </li>
        </ol>
      </div>
    </div>
  );
}
