import { useLocation } from "react-router-dom"

export default function Navbar() {
  
    const Location = useLocation();
    return (
    <>
    <div className='sticky top-5 mx-auto w-1/2 h-14 bg-[#B75A48] shadow-md text-center rounded-2xl flex justify-center'>
            <ol className='flex justify-center items-center content-center text-center'>
                <li className={Location.pathname == '/' ? "px-10 bg-[#843E34] p-2  " : "px-10 p-2"}>
                    <a href='/'>
                        Home
                    </a>
                </li>
                <li className={Location.pathname == '/Dashboard' ? "px-10 bg-[#843E34] p-2  rounded-2xl w-auto" : "px-10 p-2"}>
                    <a href='/Dashboard'>
                        Dashboard
                    </a>
                </li>
                <li className={Location.pathname == '/facts' ? "px-10 bg-[#843E34] p-2 " : "px-10 p-2"}>
                    <a href='/facts'>
                        Facts
                    </a>
                </li>
            </ol>
    </div>
    </>
  )
}
