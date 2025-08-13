import passport from "passport";
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import dotenv from 'dotenv';
// import BackEndUrl from '../utilites/config.js'
import User from "../models/UserModels.js";
import bcrypt from 'bcrypt';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID : process.env.GOOGLE_CLIENT_ID,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET,
            callbackURL : `${process.env.BackEndUrl}/auth/google/callback` // this is called for authentication of google user
        },
        async (accesstoken , refreshToken , profile , done) =>{

            try{
                let user = await User.findOne( {email : profile.emails[0].value});

                if(!user){
                    const password = await bcrypt.hash(profile.id,5); // hashing the password it will again be hased before saving
                    user = new User({
                        Name : profile.displayName, // u can access the info using profile. 
                        email : profile.emails[0].value,
                        googleid : profile.id,
                        ProfilePicture : profile.photos ? profile.photos[0].value : '', // saves none if no profile
                        emailVerified : true,
                        password
                    })
                    // console.log(profile.photos);
                    await user.save();
                }

                // const jwttoken = user.generateAccessToken();

                return done(null , user);
            }catch(error){
                console.log(error);
                return done(error , false);
            }
        }

    )
)
