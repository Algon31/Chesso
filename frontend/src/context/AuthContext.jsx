import { createContext , useState , useEffect } from "react";
import BackEndUrl from "../utilites/config";
import { toast } from "sonner";


const AuthContext = createContext();

const AuthProvider = ({ children })=>{
    const[user , setUser] = useState(null); 
    // here we created a gloabal user so that we can acess it across all the components and only if it is inside the authprovider in appjs
    
    useEffect(() => {
    ///saves the logged info and saves it  it localstorage and setUser
    const checkStatus = async ()=>{
        try{
            const response = await fetch(`${BackEndUrl}/auth/check-logged`, {
                method : "GET",
                credentials : "include",
            });
            console.log("response from backend :",response)
            if(response.ok){
                const jsondata = await response.json();
                setUser(jsondata._id);
                console.log("user is being saved");
                localStorage.setItem('userId', jsondata._id); // save to local data
            }
            else{
                console.log("error in respone :" ,  response.message);
            }
        }
        catch(error){
            toast.error(error);
        }
    }
    checkStatus();
    }, []);
    
    useEffect(() => {
        if(user){
            localStorage.setItem('userId' , user._id);
            console.log("user saved to local");
        }
        else{
            const loc = localStorage.getItem('userId')
            if(loc){
                setUser(loc);
            }
        }
    }, [user]);//  sets user or takes from localstorage is user is changed
    
    

        
    





    return(
        <AuthContext.Provider value={{user , setUser }}>
            {children}
        </AuthContext.Provider>
    )
}



export { AuthContext  , AuthProvider };
