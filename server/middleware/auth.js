require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
  const token =
    req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

  console.log("Authorization Header:", req.headers.authorization);
  console.log("Auth Cookie:", req.cookies.auth_token);
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;
