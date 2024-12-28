const express = require("express");
const xlsx = require("xlsx");
const db = require("../db_config/dbInit");

const getAllSections = async (req, res) => {
  try {
    const {
      page = 1,
      itemsPerPage = 10,
      search = "",
      searchField = "address",
    } = req.query;

    const sectionsRef = db.collection("sections");
    const itemsPerPageNum = parseInt(itemsPerPage);

    let query = sectionsRef;

    if (search && searchField !== "None") {
      if (searchField === "number") {
        const searchNumber = parseFloat(search);

        if (!isNaN(searchNumber)) {
          query = query
            .where(searchField, ">=", searchNumber)
            .where(searchField, "<=", searchNumber);
        } else {
          return res.status(400).json({ error: "Invalid number search value" });
        }
      } else {
        query = query
          .where(searchField, ">=", search.toLowerCase())
          .where(searchField, "<=", search.toLowerCase() + "\uf8ff");
      }
    }

    // Obținem totalul înainte de paginare
    const snapshot = await query.get();
    const total = snapshot.docs.length;

    // Aplicați paginarea
    const sections = [];
    let lastDoc = null;

    if (page > 1) {
      const skipDocs = (page - 1) * itemsPerPageNum;
      const skippedDocs = await query.limit(skipDocs).get();
      lastDoc = skippedDocs.docs[skippedDocs.docs.length - 1];
    }

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const paginatedSnapshot = await query.limit(itemsPerPageNum).get();

    paginatedSnapshot.forEach((doc) => {
      sections.push({ id: doc.id, ...doc.data() });
    });

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

const insertBulkSections = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const sections = data.map((row) => ({
      address: row["ADRESA"],
      county: row["JUDET"],
      location: row["SEDIU SECTIE"],
      number: row["NR. SECTIE VOTARE"],
    }));

    const sectionsRef = db.collection("sections");
    const chunkSize = 500;

    for (let i = 0; i < sections.length; i += chunkSize) {
      const batch = db.batch();
      const chunk = sections.slice(i, i + chunkSize);

      chunk.forEach((section) => {
        const docRef = sectionsRef.doc();
        batch.set(docRef, section);
      });

      await batch.commit();
    }

    res.status(201).json({
      message: "Sections imported successfully",
      count: sections.length,
    });
  } catch (error) {
    console.error("Error uploading sections:", error);
    res.status(500).json({ error: "Failed to upload sections" });
  }
};

module.exports = {
  getAllSections,
  addSections,
  insertBulkSections,
};
