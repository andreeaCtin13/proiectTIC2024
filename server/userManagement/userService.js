const db = require("../db_config/dbInit");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  console.error("SECRET_KEY is missing. Please set it in your .env file.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getAllUsers = (req, res) => {
  res.send("You want to get all users");
};

const registerUser = async (req, res) => {
  let { email, password, role } = req.body;

  if (!role) {
    role = "observer";
  }
  console.log("Received data for registration:", req.body);

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const isEmailUsed = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!isEmailUsed.empty) {
      return res.status(409).send("Email already in use");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      email,
      password: hashedPassword,
      role,
    };

    const addedUser = await db.collection("users").add(newUser);
    const userDoc = await addedUser.get();
    const userData = userDoc.data();

    console.log("New user ID:", addedUser.id);
    console.log("New user data:", userData);

    res.status(201).json({
      id: addedUser.id,
      ...userData,
    });
  } catch (error) {
    console.error("Error while registering user:", error);
    res.status(500).send("Internal Server Error");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", req.body);

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const userDocSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userDocSnapshot.empty) {
      console.log("User not found with email:", email);
      return res.status(404).send("Invalid email or password");
    }

    let user = null;
    userDocSnapshot.forEach((doc) => {
      user = { id: doc.id, ...doc.data() };
    });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for email:", email);
      return res.status(401).send("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("INITIAL VALUE OF THE TOKEN", token);

    console.log("Login successful for user:", email);
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Logged out successfully" });
};

const checkEmailNotInUse = async (email) => {
  try {
    const querySnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};

const saveSelections = async (req, res) => {
  const { userId, elections } = req.body;

  console.log(userId);
  console.log(elections);
  if (!userId || !elections || !Array.isArray(elections)) {
    return res.status(400).send("User ID and elections array are required");
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    await userRef.update({
      electionsAssociated: elections,
    });

    res.status(200).send("Selections updated successfully");
  } catch (error) {
    console.error("Error saving selections:", error);
    res.status(500).send(error.message || "Internal Server Error");
  }
};

const sendMessageToObservers = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send("Mesajul este obligatoriu");
  }

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("role", "==", "observer")
      .get();

    if (usersSnapshot.empty) {
      return res
        .status(404)
        .send("Nu s-au găsit utilizatori cu rolul 'observer'");
    }

    const emails = [];
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      emails.push(user.email);
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails.join(","),
      subject: "Mesaj de la Administrator",
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("Mesajul a fost trimis cu succes");
  } catch (error) {
    console.error("Eroare la trimiterea mesajului:", error);
    res.status(500).send("Eroare internă");
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  logoutUser,
  checkEmailNotInUse,
  saveSelections,
  sendMessageToObservers,
};
