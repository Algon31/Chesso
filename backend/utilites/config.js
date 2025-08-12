
const Check = "production"

const PBackEndUrl = "http://localhost:3000";
const LBackEndUrl = "https://chesso-ejb0.onrender.com";

const BackEndUrl = Check === "production" ? PBackEndUrl : LBackEndUrl


export default BackEndUrl;