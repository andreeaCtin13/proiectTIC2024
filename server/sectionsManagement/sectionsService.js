const db = require("../db_config/dbInit");

const getAllSections = async (req, res) => {
  try {
    const { page = 1, itemsPerPage = 10, search = "" } = req.query;
    const sectionsRef = db.collection("sections");

    let query = sectionsRef.orderBy("address");

    if (search) {
      query = query
        .where("address", ">=", search)
        .where("address", "<=", search + "\uf8ff");
    }

    const snapshot = await query.get();
    const total = snapshot.docs.length;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + parseInt(itemsPerPage);

    const sections = snapshot.docs.slice(startIndex, endIndex).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ items: sections, total });
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
};

const addSections = async (req, res) => {
  try {
    const { address, county, location, number } = req.body;

    if (!address || !county || !location || !number) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const sectionsRef = db.collection("sections");
    const newSection = {
      address,
      county,
      location,
      number,
    };

    const docRef = await sectionsRef.add(newSection);

    res.status(201).json({ id: docRef.id, ...newSection });
  } catch (error) {
    console.error("Error adding section:", error);
    res.status(500).json({ error: "Failed to add section" });
  }
};

module.exports = {
  getAllSections,
  addSections,
};
