
const Check = "production"

const LBackEndUrl = "http://localhost:3000";
const PBackEndUrl = "https://chesso-ejb0.onrender.com";

const BackEndUrl = Check === "production" ? PBackEndUrl : LBackEndUrl


export default BackEndUrl;