const db = require("../db_config/dbInit");

const getStatistics = async (req, res) => {
  try {
    // Fetch total observations
    const totalObservationsSnap = await db
      .collection("observing_history")
      .get();
    const totalObservations = totalObservationsSnap.size;

    const observations = await db.collection("observing_history").get();
    let totalDuration = 0;
    observations.forEach((doc) => {
      const checkInTime = doc.data().checkInTime;
      const checkOutTime = doc.data().checkOutTime;
      if (checkInTime && checkOutTime) {
        totalDuration += checkOutTime - checkInTime;
      }
    });
    const averageDuration = observations.size
      ? totalDuration / observations.size / 60000
      : 0;

    const sectionsSnapshot = await db.collection("sections").get();
    const sections = {};
    sectionsSnapshot.forEach((doc) => {
      const data = doc.data();
      const sectionId = doc.id; // Extragem ID-ul generat automat
      console.log("SECTION DATA", { sectionId, ...data });

      sections[sectionId] = {
        id: sectionId, // Include ID-ul explicit
        ...data,
      };
    });

    // Log sections data to check
    console.log("Sections data:", sections);

    // Calculate count of observations per section
    const sectionCounts = {};
    observations.forEach((doc) => {
      const sectionId = doc.data().sectionId; // Asumăm că `sectionId` există în observing_history
      if (sectionCounts[sectionId]) {
        sectionCounts[sectionId]++;
      } else {
        sectionCounts[sectionId] = 1;
      }
    });

    // Format section data to include section details
    const sectionStats = Object.entries(sectionCounts).map(
      ([sectionId, count]) => {
        console.log("SECTION ID", sectionId);

        const sectionDetails = sections[sectionId] || {}; // Default to empty object if no section found
        return {
          sectionId,
          count,
          ...sectionDetails, // Add section details here (number, location, county, address)
        };
      }
    );

    // Log sectionStats to verify structure
    console.log("Section Stats:", sectionStats);

    // Find the most observed section
    const mostObservedSectionId = Object.keys(sectionCounts).reduce((a, b) =>
      sectionCounts[a] > sectionCounts[b] ? a : b
    );
    const mostObservedSection = sections[mostObservedSectionId];

    // Send the statistics as the response
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
