import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-[#E8ECD6]">
      <h1 className="text-6xl font-bold text-[#B75A48] mb-4">404</h1>
      <p className="text-2xl text-black mb-8">Oops! Page Not Found</p>
      <p className="text-2xl text-black mb-8">Page Under construction</p>
      <button
        onClick={handleGoHome}
        className="bg-[#B75A48] text-white px-6 py-3 rounded-md hover:bg-[#843E34] transition-colors"
      >
        Go Home
      </button>
    </div>
  );
}
