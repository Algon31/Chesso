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
                body : JSON.stringify(userdata)
            });
            const data = await response.json();
            
            // alert them about loggin in

            if(response.ok){
                toast.success("Account Created Successfully");
                navigate("/Signin");
            }
            else{
                if(response == "user already exists"){
                    toast.success("User Already Exist");
                    navigate("/Signin");
                }
                else{
                    toast.error(data.message , "error");
                }
            }
        }
        catch(error){
            toString.error(error);
        }
    }
    // for handling existing person
    const handleSignin = async (userdata) =>{
        try{
            toast.success("logging you in.. ");
            const response =  await fetch(`${BackEndUrl}/auth/signin` , {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                credentials : "include",
                body : JSON.stringify(userdata),
                
            });
            console.log(response);
            // toast.success("fetching data ... ");
            const data = await response.json();

            if(response.ok){
                // console.log(data.user);
                setUser(data.user); // setting the user
                navigate("/Dashboard");
            }
            else{
                toast.error("could not fetch" , data.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }
    const Logout = () =>{
        setUser(null);
        localStorage.removeItem('user');
        navigate('/signin');
    }
    return {handleRegister , handleSignin , Logout};
};

