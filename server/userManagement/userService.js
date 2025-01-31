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

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const userDocSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userDocSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No account found for this email" });
    }

    let user = null;
    userDocSnapshot.forEach((doc) => {
      user = { id: doc.id, ...doc.data() };
    });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });

  res
    .status(200)
    .json({ message: "Logged out successfully. Clear session storage." });
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

  if (!userId || !elections || !Array.isArray(elections)) {
    return res.status(400).send("User ID and elections array are required");
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    const electionsData = await Promise.all(
      elections.map(async (electionId) => {
        const electionRef = db.collection("elections").doc(electionId);
        const electionDoc = await electionRef.get();

        if (electionDoc.exists) {
          return { id: electionId, ...electionDoc.data() };
        } else {
          return null;
        }
      })
    );

    const validElections = electionsData.filter((e) => e !== null);

    await userRef.update({
      electionsAssociated: validElections,
    });

    res.status(200).send("Selections updated successfully");
  } catch (error) {
    console.error("Error saving selections:", error);
    res.status(500).send(error.message || "Internal Server Error");
  }
};

const getUserSelections = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send("User ID is required");
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    const userData = userDoc.data();
    const electionsAssociated = userData.electionsAssociated || [];

    res.status(200).json({ electionsAssociated });
  } catch (error) {
    console.error("Error fetching user selections:", error);
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

const getUserElections = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send("User ID is required");
  }

  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    const userData = userDoc.data();
    const electionsAssociated = userData.electionsAssociated || [];
    console.log("electionsAssociated:", electionsAssociated);

    const currentDate = new Date();
    const validElections = electionsAssociated.filter((election) => {
      const startDate = new Date(election.observingStartDate);
      return election.isValid && startDate <= currentDate;
    });

    console.log("valid elections:", validElections);
    res.status(200).json(validElections);
  } catch (error) {
    console.error("Error fetching user elections:", error);
    res.status(500).send("Internal Server Error");
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
  getUserSelections,
  getUserElections,
};
