import { useState } from "react";
import { userAuth } from "../../Auth/userAuth";
import { toast } from "react-toastify";
import BackEndUrl from "../../utilites/config";
import chessvideo from "/assets/videos/chess.mp4";
import SampleVideo from "../../Components/SampleVideo";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [password, setPassword] = useState("");
  const { handleRegister } = userAuth();

  const Handlesignup = async (e) => {
    try {
      if (!Name || !email || !password) {
        toast.error("Fill the details", {
          className: "!bg-[#B75A48] !text-black !border-2xl border-[#E8ECD6]",
        });
        return;
      }
      const userdata = { Name, email, password };
      await handleRegister(userdata);
    } catch (error) {
      toast.error(error);
    }
  };

  const HandleGoogleIn = async (e) => {
    toast.success("Redirecting to google ...");
    try {
      window.location.href = `${BackEndUrl}/auth/google`;
    } catch (error) {
      toast.error(error);
    }
  };
  const string = "Every grandmaster starts with a single move. Begin your journey!"

  return (
    <div className="bg-[#B75A48] flex justify-center items-center h-screen ">
      <SampleVideo texty={string}/>
      <div className="w-1/2 bg-[#E8ECD6] h-screen flex felx-row justify-center items-center">
        <div className="w-3/4 h-3/4  flex flex-col justify-center items-center ">
          <div className="h-1/4 w-full flex flex-col justify-end items-center text-5xl text-[#B75A48] text-shadow-slate-900 font-bold">
            Welcome Aboard !
          </div>
          <div className="w-full h-3/4 flex flex-col justify-center items-center">
            <input
              type="text"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-3/5 h-12 p-2 rounded  text-[#B75A48]  m-2 mt-0 border-2 border-[#B75A48]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              className="w-3/5 h-12 p-2 rounded  text-[#B75A48]  m-2 border-2 border-[#B75A48]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-3/5 h-12 p-2 rounded text-s text-[#B75A48] font-bold m-2 border-2 border-[#B75A48]"
            />
            <button
              onClick={Handlesignup}
              className="w-3/5 h-12 p-2 bg-[#B75A48] text-[#E8ECD6] mt-4 rounded-sm hover:cursor-pointer"
            >
              Sign up
            </button>
            <button
              onClick={HandleGoogleIn}
              className="w-3/5 h-12 p-2 mt-4 rounded-sm border-2 border-[#B75A48]  text-[#B75A48] font-bold hover:cursor-pointer"
            >
              Google
            </button>
            <p className="mt-3 text-[#B75A48]">
              Already Have An Account?
              <a href="/signin" className="underline font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// <div className="w-10/12 max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl text-white">

//   {/* Left Panel */}
//   <div className="w-1/3 bg-gradient-to-b from-gray-700 to-gray-800 p-6 flex flex-col justify-center items-center">
//     <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
//     <p className="text-sm text-gray-300">Lets play Chess Together</p>
//   </div>

//   {/* Right Panel */}
//   <div className="w-2/3 bg-gray-800 p-10 flex flex-col justify-between">

//     {/* Header */}
//     <div className="text-center text-2xl font-bold text-yellow-300 mb-6">
//       New User? No Worries
//     </div>

//     {/* Footer */}
//     <div className="text-center mt-6">
//       <button className="bg-yellow-400 text-gray-800 px-6 py-2 rounded hover:bg-yellow-300 transition"
//       onClick={Handlesignup}
//       >
//         Sign Up
//       </button>
//     </div>
//     <div className='text-center'>
//       <a href='/signin'>already have an account?</a>
//     </div>
//   </div>
// </div>
