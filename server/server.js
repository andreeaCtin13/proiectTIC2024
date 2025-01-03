const express = require("express");
const httpLogger = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logSlowRequests = require("./middleware/logSlowRequests");
const app = express();
const { faker } = require("@faker-js/faker");
const port = 3000;
const userRouter = require("./userManagement/userRouter");
const sectionsRouter = require("./sectionsManagement/sectionsRouter");
const electionsRouter = require("./electionsManagement/electionsRouter");

const router = express.Router();
const db = require("./db_config/dbInit");

const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(httpLogger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logSlowRequests(100));
app.use(cookieParser());

app.use(userRouter);
app.use(sectionsRouter);
app.use(electionsRouter);

const generateSections = async (count = 50) => {
  try {
    const sectionsRef = db.collection("sections");

    for (let i = 0; i < count; i++) {
      let section = {
        address: faker.location.streetAddress(),
        county: faker.location.state(),
        location: faker.location.city(),
        number: faker.number.int({ min: 1, max: 1000 }),
      };
      await sectionsRef.add(section);
    }
    return { success: true };
  } catch (error) {
    console.error("Error generating sections:", error);
    return { success: false };
  }
};

const generateElections = async (count = 3) => {
  try {
    const electionsRef = db.collection("elections");

    for (let i = 0; i < count; i++) {
      let election = {
        active: faker.datatype.boolean(),
        date: faker.date.future(),
        name: faker.company.name() + " Election",
      };
      await electionsRef.add(election);
    }
    return { success: true };
  } catch (error) {
    console.error("Error generating elections:", error);
    return { success: false };
  }
};

router.get("/generateData", async (req, res) => {
  try {
    const sectionsResult = await generateSections(50);
    const electionsResult = await generateElections(3);

    if (sectionsResult.success && electionsResult.success) {
      res.status(201).json({ message: "Data generated successfully" });
    } else {
      res.status(500).json({ message: "Failed to generate some data" });
    }
  } catch (error) {
    console.error("Error in /generateData:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.use(router);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
