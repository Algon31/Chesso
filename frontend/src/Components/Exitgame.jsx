import { useContext } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";

export default function Exitgame() {
  const { gameID } = useParams();
  const { user } = useContext(AuthContext);

  const HandleExit = () => {
    Socket.emit("Resign", { gameID, playerID: user });
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
