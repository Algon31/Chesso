
import {userAuth} from '../Auth/userAuth'
import { toast } from "sonner";


export default function LogoutButton() {

  const {Logout} = userAuth();

    const handleLogOut =()=>{
        toast.success("logging you out")
        Logout();
    };

  return (
    <>
    <div 
    onClick={handleLogOut}
    className='fixed top-5 right-5 bg-[#B75A48] rounded-sm w-12 h-12'>
    
    </div>
    </>
  )
}
