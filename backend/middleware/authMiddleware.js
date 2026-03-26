import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json("No token");

  jwt.verify(token, "SECRET_KEY", (err, decoded) => {
    if (err) return res.status(401).json("Invalid token");

    req.user = decoded;
    next();
  });
};