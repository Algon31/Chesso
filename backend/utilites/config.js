
const LBackEndUrl = "http://localhost:3000";
const PBackEndUrl = "https://chesso-ejb0.onrender.com";

const BackEndUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === "production" ? PBackEndUrl : LBackEndUrl);


export default BackEndUrl;