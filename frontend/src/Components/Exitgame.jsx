import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Exitgame() {
  const navigate = useNavigate();
  const HandleExit = () => {
    toast.error("Exiting ");
    navigate("/Dashboard");
  };
  return (
    <>
      <div
        onClick={HandleExit}
        className="fixed top-5 right-5 bg-[#B75A48] rounded-sm w-12 h-12 flex justify-center items-center"
      >
        
        <div className="w-8 h-8 bg-white rounded-b-xs flex justify-center items-center">
X
        </div>
      </div>
    </>
  );
}
