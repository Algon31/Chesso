import { useContext } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import Socket from "../utilites/Socket";

export default function Exitgame() {
  const { gameID } = useParams();
  const { user } = useContext(AuthContext);

  const confirmExit = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Are you sure you want to resign?</p>
          <div className="flex gap-2">
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => {
                toast.dismiss(t);
                toast.warning("You Resigned!");
                Socket.emit("Resign", { gameID, playerID: user });
              }}
            >
              Yes
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => toast.dismiss(t)}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // stays until click
      }
    );
  };

  return (
    <div
      onClick={confirmExit}
      className="fixed top-5 right-5 bg-[#B75A48] rounded-sm w-12 h-12 flex justify-center items-center cursor-pointer"
    >
      <div className="w-8 h-8 bg-white font-bold rounded-b-xs flex justify-center items-center">
        X
      </div>
    </div>
  );
}
