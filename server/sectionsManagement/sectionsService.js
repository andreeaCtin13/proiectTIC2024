const express = require("express");
const xlsx = require("xlsx");
const db = require("../db_config/dbInit");
const fs = require("fs");

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

    let snapshot = await query.get();

    let filteredSections = snapshot.docs.filter((doc) => {
      const data = doc.data();

      if (data.status === "taken") return false;

      if (!search || searchField === "None") return true;

      const fieldValue = data[searchField];

      if (searchField === "number") {
        const searchStr = search.toString();
        const fieldStr = fieldValue.toString();
        return fieldStr.includes(searchStr);
      }

      return (
        fieldValue &&
        fieldValue.toString().toLowerCase().includes(search.toLowerCase())
      );
    });

    const total = filteredSections.length;

    const startIndex = (page - 1) * itemsPerPageNum;
    const endIndex = startIndex + itemsPerPageNum;
    const paginatedSections = filteredSections.slice(startIndex, endIndex);

    const sections = paginatedSections.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const resultPrefix = "Filtered Sections: ";

    res.json({
      message: "Filtered Sections: ",
      items: sections,
      total,
    });
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
      address: address.toLowerCase(),
      county: county.toLowerCase(),
      location: location.toLowerCase(),
      number: parseFloat(number),
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
      address: row["ADRESA"].toLowerCase(),
      county: row["JUDET"].toLowerCase(),
      location: row["SEDIU SECTIE"].toLowerCase(),
      number: parseFloat(row["NR. SECTIE VOTARE"]),
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
const uploadInjusticeReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (req.file.mimetype !== "application/pdf") {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const targetPath = `uploads/reports/${Date.now()}_${req.file.originalname}`;
    fs.renameSync(req.file.path, targetPath);

    res.status(200).json({
      message: "File uploaded successfully.",
      filePath: targetPath,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

module.exports = {
  getAllSections,
  addSections,
  insertBulkSections,
  uploadInjusticeReport,
};
