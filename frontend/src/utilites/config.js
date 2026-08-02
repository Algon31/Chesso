const LBackEndUrl = "http://localhost:3000";
const PBackEndUrl = "https://chesso-ejb0.onrender.com";

const BackEndUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE === "production" ? PBackEndUrl : LBackEndUrl);
export default BackEndUrl;