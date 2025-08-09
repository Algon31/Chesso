import { useState } from 'react';
import {userAuth} from "../../Auth/userAuth";
import { toast } from 'sonner';
import BackEndUrl from '../../utilites/config';
import SocketStatus from '../../Components/SocketChecker';


export default function Signin() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {handleSignin} = userAuth();

  const HandleGoogleIn = async (e) =>{
    toast.success("Redirecting to google ...");
    try{
      window.location.href = `${BackEndUrl}/auth/google`;
    }
    catch(error){
      toast.error(error);
    }
  };

  const HandleSignin = async (e)=>{
    try{
      if (!email || !password){
        toast.error("Fill the details");
        return;
      }
      const userinfo = { email , password };
      await handleSignin(userinfo);
    }
    catch (error){
      toast.error(error);
    }
  }




  return (
    <div className="bg-[#B75A48] flex justify-center items-center h-screen ">
      <div className='w-1/2'>
      {/* images */}
      </div>
      <div className='w-1/2 bg-[#E8ECD6] h-screen flex felx-row justify-center items-center'>
        <div className='w-3/4 h-3/4  flex flex-col justify-center items-center '>
        <div className='h-1/4 w-full flex flex-col justify-end items-center text-5xl text-[#B75A48] font-bold'>
          Welcome Back !
        </div>
        <div className='w-full h-3/4 flex flex-col justify-center items-center'>
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
                className="w-3/5 h-12 p-2 rounded text-[#B75A48]  m-2 border-2 border-[#B75A48]"
              />
              <button
              onClick={HandleSignin}
              className='w-3/5 h-12 p-2 bg-[#B75A48] text-[#E8ECD6] mt-4 rounded-sm hover:cursor-pointer'
              >
                Sign in
              </button>
              <button
              onClick={HandleGoogleIn}
              className='w-3/5 h-12 p-2 mt-4 rounded-sm border-2 border-[#B75A48]  text-[#B75A48] font-bold hover:cursor-pointer'
              >
                Google
              </button>
              <p
              className='mt-3 text-[#B75A48]'
              >Don't Have An Account? 
              <a href='/signup' className='underline font-semibold'>
              Sign up
              </a>
              </p>
        </div>
        </div>
      </div>

    </div>

  );
}
