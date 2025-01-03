const db = require("../db_config/dbInit");

const observeSection = async (req, res) => {
  const { sectionId } = req.params;
  const { userId } = req.body;

  if (!sectionId || !userId) {
    return res.status(400).send("Section ID and User ID are required");
  }

  try {
    await db.runTransaction(async (transaction) => {
      const sectionRef = db.collection("sections").doc(sectionId);
      const sectionDoc = await transaction.get(sectionRef);

      if (!sectionDoc.exists) {
        throw new Error("Section not found");
      }

      if (sectionDoc.data().status === "taken") {
        throw new Error("Section is already taken");
      }

      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      transaction.update(sectionRef, { status: "taken" });

      const sectionData = sectionDoc.data();
      const sectionObserved = {
        id: sectionId,
        address: sectionData.address,
        county: sectionData.county,
        location: sectionData.location,
        number: sectionData.number,
      };

      transaction.update(userRef, {
        observe: true,
        sectionObserved,
      });
    });

    res.status(200).send("Section observed and user updated successfully");
  } catch (error) {
    console.error("Error observing section:", error);
    res.status(500).send(error.message || "Internal Server Error");
  }
};

module.exports = {
  observeSection,
};
