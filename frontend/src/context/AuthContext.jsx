import { createContext , useState , useEffect } from "react";
import BackEndUrl from "../utilites/config";
import { toast } from "sonner";


const AuthContext = createContext();

const AuthProvider = ({ children })=>{
    const[user , setUser] = useState(null); 
    // here we created a gloabal user so that we can acess it across all the components and only if it is inside the authprovider in appjs
    
    ///saves the logged info and saves it  it localstorage and setUser
    const fetchuser = async ()=>{
        try{
            const response = await fetch(`${BackEndUrl}/auth/check-logged`,{
                method : "GET",
                credentials : 'include',
            });
            // console.log("this is response :" , response);
            if(response.ok){
                const userinfo = await response.json();
                setUser(userinfo.data); // sets global user
                localStorage.setItem('user' , JSON.stringify(userinfo.data)); // saves to local

            }
            else if(response.status == 401){
                console.log("user not logged");
            }
            else{
                toast.error(response.status);
            }
        }catch(error){
            toast.error("error fteching login");
        }
    }
    

        
    


    //stays logged in even after pages reload
    useEffect(() => {
        const usersaved = localStorage.getItem('user');
            // console.log(usersaved);
            if(usersaved){
                try{
                    const userinfo = JSON.parse(usersaved);
                    setUser(userinfo);
                    console.log("this is user info :" , userinfo);
                }catch(error){
                    console.log("failed to use user from local stargae");
                }
            }
            else{
                // toast.success("fetching user info...");
                fetchuser();
            }
    }, []);



    return(
        <AuthContext.Provider value={{user , setUser }}>
            {children}
        </AuthContext.Provider>
    )
}



export { AuthContext  , AuthProvider };
