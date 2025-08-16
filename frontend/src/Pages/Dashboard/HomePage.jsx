import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import { AuthContext } from "../../context/AuthContext";
import LogoutButton from "../../Components/LogoutButton";

const imgurl = "/assets/Imgs/chess3.jpg"; // Make sure this path is correct

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePlayGame = () => {
    navigate("/Dashboard");
  };

  return (
    <>
    <div className="hidden md:block">

      <Navbar />
      <LogoutButton />
    </div>

      <div className="w-full h-screen flex flex-col justify-center items-center bg-[#E8ECD6]">
        {/* Hero Section */}
        <div className="relative h-100 w-70 md:h-1/2 md:w-2/3 flex justify-center items-center text-white text-5xl font-bold rounded-xl overflow-hidden group">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-500 ease-in-out group-hover:scale-105"
            style={{ backgroundImage: `url(${imgurl})` }}
          ></div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-50"></div>

          {/* Text */}
          <span className="relative z-10 text-center">
            Welcome To the Game!
          </span>
        </div>

        {/* Play Button */}
        <button
          className="mt-10 bg-[#B75A48] text-white  w-[200px] h-12 rounded-md hover:bg-[#814c42] transition-colors cursor-pointer"
          onClick={handlePlayGame}
        >
          Play Game
        </button>
      </div>
    </>
  );
}
