const db = require("../db_config/dbInit");

const getAllElections = (req, res) => {
  res.send("you want to get all sections");
};
const addElections = async (req, res) => {
  //   const { email, password } = req.body;

  //   const newUser = {
  //     email: email,
  //     password: password,
  //   };

  //   try {
  //     const addedUser = await db.collection("users").add(newUser);

  //     const userDoc = await addedUser.get();
  //     const userData = userDoc.data();

  //     console.log("New user ID:", addedUser.id);
  //     console.log("New user data:", userData);

  res.status(201).json({
    message: "hahah",
  });
  //   } catch (error) {
  //     res.status(500).send(JSON.stringify(error));
  //   }
};
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   const userToAuthenticate = {
//     email: email,
//     password: password,
//   };

//   let auth = false;

//   const querySnapshot = await db
//     .collection("users")
//     .where("email", "==", userToAuthenticate.email)
//     .limit(1)
//     .get();

//   querySnapshot.forEach((element) => {
//     console.log("A user matching the email address has been found.");
//     const userData = element.data();

//     if (userData.password === userToAuthenticate.password) auth = true;
//   });

//   if (auth) {
//     res.status(200).send("sampleToken");
//   } else {
//     res.status(401).send("Unauthorized");
//   }
// };

// const checkEmailNotInUse = async (email) => {
//   try {
//     const usersRef = db.collection("users");
//     const querySnapshot = await usersRef
//       .where("email", "==", email)
//       .limit(1)
//       .get();

//     if (!querySnapshot.empty) {
//       return Promise.reject("E-mail already in use");
//       // Email exists in the collection
//     }

//     return true;
//   } catch (error) {
//     console.error("Error checking email:", error);
//     throw error; // or handle it as you see fit
//   }
// };

module.exports = {
  getAllElections,
  addElections,
};
