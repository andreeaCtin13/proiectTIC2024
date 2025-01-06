const db = require("../db_config/dbInit");
const admin = require("firebase-admin");
const Timestamp = admin.firestore.Timestamp;

const getStatistics = async (req, res) => {
  try {
    const totalObservationsSnap = await db
      .collection("observing_history")
      .get();
    const totalObservations = totalObservationsSnap.size;

    const observations = await db.collection("observing_history").get();
    let totalDuration = 0;
    observations.forEach((doc) => {
      const checkInTime = doc.data().checkInTime;
      const checkOutTime = doc.data().checkoutTime;

      if (checkInTime && checkOutTime) {
        const checkInTimeMillis = new Date(checkInTime).getTime();
        const checkOutTimeMillis = new Date(checkOutTime).getTime();

        totalDuration += checkOutTimeMillis - checkInTimeMillis;
      }
    });

    const averageDuration = observations.size
      ? parseFloat((totalDuration / observations.size / 60000).toFixed(2))
      : 0;

    const sectionsSnapshot = await db.collection("sections").get();
    const sections = {};
    sectionsSnapshot.forEach((doc) => {
      const data = doc.data();
      const sectionId = doc.id;

      sections[sectionId] = {
        id: sectionId,
        ...data,
      };
    });

    const sectionCounts = {};
    observations.forEach((doc) => {
      const sectionId = doc.data().sectionId;
      if (sectionCounts[sectionId]) {
        sectionCounts[sectionId]++;
      } else {
        sectionCounts[sectionId] = 1;
      }
    });

    const sectionStats = Object.entries(sectionCounts).map(
      ([sectionId, count]) => {
        const sectionDetails = sections[sectionId] || {};
        return {
          sectionId,
          count,
          ...sectionDetails,
        };
      }
    );

    const mostObservedSectionId = Object.keys(sectionCounts).reduce((a, b) =>
      sectionCounts[a] > sectionCounts[b] ? a : b
    );
    const mostObservedSection = sections[mostObservedSectionId];

    res.json({
      totalObservations,
      averageDuration,
      mostObservedSection,
      sectionStats,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getStatistics,
};
