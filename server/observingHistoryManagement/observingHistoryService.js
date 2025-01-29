const { FieldValue } = require("firebase-admin/firestore");
const db = require("../db_config/dbInit");

const getStatistics = async (req, res) => {
  try {
    const totalObservationsSnap = await db
      .collection("observing_history")
      .get();
    const totalObservations = totalObservationsSnap.size;

    let totalDuration = 0;
    let sectionCounts = {};
    let sections = {};

    const observations = await db.collection("observing_history").get();

    observations.forEach((doc) => {
      const data = doc.data();
      const { checkInTime, checkoutTime, sectionObserved } = data;

      // Calculăm durata observației
      if (checkInTime && checkoutTime) {
        totalDuration +=
          new Date(checkoutTime).getTime() - new Date(checkInTime).getTime();
      }

      if (sectionObserved && sectionObserved.sectionId) {
        const sectionId = sectionObserved.sectionId;
        sectionCounts[sectionId] = (sectionCounts[sectionId] || 0) + 1;

        if (!sections[sectionId]) {
          sections[sectionId] = { ...sectionObserved };
        }
      }
    });

    const averageDuration = totalObservations
      ? parseFloat((totalDuration / totalObservations / 60000).toFixed(2))
      : 0;

    const sectionStats = Object.entries(sectionCounts).map(
      ([sectionId, count]) => ({
        sectionId,
        number: sections[sectionId]?.number || "N/A",
        location: sections[sectionId]?.location || "N/A",
        county: sections[sectionId]?.county || "N/A",
        address: sections[sectionId]?.address || "N/A",
        count,
      })
    );

    const mostObservedSectionId = Object.keys(sectionCounts).reduce(
      (a, b) => (sectionCounts[a] > sectionCounts[b] ? a : b),
      null
    );
    const mostObservedSection = sections[mostObservedSectionId] || {};

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
