import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.jwtToken; // or req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token not found" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
