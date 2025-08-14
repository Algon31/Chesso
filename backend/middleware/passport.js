import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import BackEndUrl from "../utilites/config.js";
import User from "../models/UserModels.js";
import bcrypt from "bcrypt";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${BackEndUrl}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Defensive checks for Google profile data
                if (!profile || !profile.emails || !profile.emails[0]?.value) {
                    return done(new Error("Google profile is missing email"), false);
                }

                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    const password = await bcrypt.hash(profile.id, 5); // keep your cost factor
                    user = new User({
                        Name: profile.displayName || "",
                        email: profile.emails[0].value,
                        googleid: profile.id,
                        ProfilePicture: profile.photos?.[0]?.value || "",
                        emailVerified: true,
                        password,
                    });
                    await user.save();
                }

                // // Ensure generateAccessToken exists before calling
                // if (typeof user.generateAccessToken !== "function") {
                //     return done(new Error("User model missing generateAccessToken method"), false);
                // }

                const jwtToken = user.generateAccessToken();
                return done(null, jwtToken, user);
            } catch (error) {
                console.error("Error in GoogleStrategy:", error);
                return done(error, false);
            }
        }
    )
);
