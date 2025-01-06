const db = require("../db_config/dbInit");

const getAllElections = async (req, res) => {
  try {
    const electionsSnapshot = await db.collection("elections").get();
    const elections = electionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(elections);
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const addElection = async (req, res) => {
  const { isValid, observingStartDate, observingEndDate, name } = req.body;

  if (!name || !observingStartDate || !observingEndDate) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newElectionRef = await db.collection("elections").add({
      isValid: isValid || false,
      observingStartDate,
      observingEndDate,
      name,
    });

    const newElection = {
      id: newElectionRef.id,
      isValid,
      observingStartDate,
      observingEndDate,
      name,
    };

    res.status(201).json(newElection);
  } catch (error) {
    console.error("Error adding election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteElection = async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection("elections").doc(id).delete();
    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateElection = async (req, res) => {
  const { id } = req.params;
  const { isValid, observingStartDate, observingEndDate, name } = req.body;

  try {
    const electionRef = db.collection("elections").doc(id);
    await electionRef.update({
      isValid,
      observingStartDate,
      observingEndDate,
      name,
    });

    const updatedElection = (await electionRef.get()).data();
    res.status(200).json({ id, ...updatedElection });
  } catch (error) {
    console.error("Error updating election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllElections,
  addElection,
  deleteElection,
  updateElection,
};
