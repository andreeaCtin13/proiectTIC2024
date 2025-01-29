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

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      // Actualizare status secție
      transaction.update(sectionRef, { status: "taken" });

      // Obiect cu toate detaliile utilizatorului
      const observer = {
        userId,
        name: userDoc.data().name || "N/A",
        email: userDoc.data().email || "N/A",
        role: userDoc.data().role || "N/A",
        phone: userDoc.data().phone || "N/A",
      };

      // Obiect cu toate detaliile secției
      const sectionObserved = {
        sectionId,
        number: sectionDoc.data().number || "N/A",
        location: sectionDoc.data().location || "N/A",
        county: sectionDoc.data().county || "N/A",
        address: sectionDoc.data().address || "N/A",
      };

      // Salvăm în `observing_history`
      const observingHistoryRef = db.collection("observing_history").doc();
      transaction.set(observingHistoryRef, {
        observer, // Obiect cu datele utilizatorului
        sectionObserved, // Obiect cu datele secției
        checkInTime: new Date().toISOString(),
      });

      // Salvăm și în documentul utilizatorului ultima secție observată
      transaction.update(userRef, {
        observe: true,
        sectionObserved, // Obiect complet al secției observate
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

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      // Căutăm intrarea de observare în istoricul observațiilor
      const observingHistoryRef = db
        .collection("observing_history")
        .where("observer.userId", "==", userId)
        .where("sectionObserved.sectionId", "==", sectionId);

      const historySnapshot = await observingHistoryRef.get();

      if (historySnapshot.empty) {
        throw new Error(
          "No check-in record found for this section and observer."
        );
      }

      const currentTime = new Date().toISOString();

      // Adăugăm `checkoutTime` la toate înregistrările relevante
      historySnapshot.forEach((doc) => {
        transaction.update(doc.ref, { checkoutTime: currentTime });
      });

      // Resetăm secția ca fiind disponibilă
      transaction.update(sectionRef, { status: "available" });

      // Eliminăm secția observată din datele utilizatorului
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
