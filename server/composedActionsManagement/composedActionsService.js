const db = require("../db_config/dbInit");
const { FieldValue } = require("firebase-admin/firestore");

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

      if (!userDoc.exists || !userDoc.data().email) {
        throw new Error("User not found or user does not have an email");
      }

      transaction.update(sectionRef, { status: "taken" });

      const userEmail = userDoc.data().email;
      const checkInTime = new Date().toISOString();

      const observingHistoryRef = db.collection("observing_history").doc();
      await transaction.set(observingHistoryRef, {
        sectionId,
        checkInTime,
        observerEmail: userEmail,
      });

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

const releaseSection = async (req, res) => {
  const { sectionId, userId } = req.body;

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

      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists || !userDoc.data().email) {
        throw new Error("User not found or user does not have an email");
      }

      const observingHistoryRef = db
        .collection("observing_history")
        .where("sectionId", "==", sectionId)
        .where("observerEmail", "==", userDoc.data().email);
      const historySnapshot = await observingHistoryRef.get();

      if (historySnapshot.empty) {
        throw new Error(
          "No check-in record found for this section and observer."
        );
      }

      let checkInTime;
      let checkoutTime;

      historySnapshot.forEach((doc) => {
        checkInTime = doc.data().checkInTime;
        checkoutTime = doc.data().checkoutTime;
      });

      if (checkoutTime) {
        throw new Error("Section has already been checked out.");
      }

      const currentTime = new Date().toISOString();
      if (!checkInTime) {
        throw new Error("Cannot checkout before check-in.");
      }

      historySnapshot.forEach((doc) => {
        transaction.update(doc.ref, { checkoutTime: currentTime });
      });

      transaction.update(sectionRef, { status: "available" });
      transaction.update(userRef, {
        observe: false,
        sectionObserved: FieldValue.delete(),
      });
    });

    res.status(200).send("Section released and user updated successfully");
  } catch (error) {
    console.error("Error releasing section:", error);
    res.status(500).send(error.message || "Internal Server Error");
  }
};

module.exports = {
  observeSection,
  releaseSection,
};
