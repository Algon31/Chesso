import { useContext } from 'react';
import BackEndUrl from '../utilites/config'
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext';





export const userAuth = () =>{
    const navigate = useNavigate();
    const {setUser} = useContext(AuthContext);
    

    // for registering new person
    const handleRegister = async (userdata) =>{
        try{
            const response = await fetch(`${BackEndUrl}/auth/register`,{ // calls the regiter from server
                method : "POST", // tell them to create and return 
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(userdata),
                credentials : "include",
            });
            const data = await response.json();
            
            // alert them about loggin in

            if(response.ok){
                toast.success("Account Created Successfully");
                navigate("/signin");
            }
            else{
                if(data.message === "user already exists" || response.status === 409){
                    toast.info("User Already Exists");
                    navigate("/signin");
                }
                else{
                    toast.error(data.message || "Registration failed");
                }
            }
        }
        catch(error){
            toast.error(error.message);
        }
    }
    // for handling existing person
    const handleSignin = async (userdata) =>{
        try{
            toast.success("Logging You In... ");
            const response =  await fetch(`${BackEndUrl}/auth/signin` , {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                credentials : "include",
                body : JSON.stringify(userdata),
                
            });
            console.log(response);
            const data = await response.json();
            // toast.success("data fetched : ", data);

            if(response.ok){
                setUser(data.user._id); // setting the user id
                navigate("/Dashboard");
            }
            else{
                toast.error("Could Not Fetch User !!");
            }
        }
        catch(error){
            console.log(error);
        }
    }
    return {handleRegister , handleSignin };
};

