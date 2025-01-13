const jwt = require("jsonwebtoken");

const authorizeObserver = (req, res, next) => {
  const token =
    req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      return res.status(403).json({ message: "Token verification failed" });
    }

    if (user.role !== "observer") {
      return res
        .status(403)
        .json({ message: "Access denied. Observers only." });
    }

    req.user = user;
    next();
  });
};

module.exports = authorizeObserver;
