const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS - allow all origins for debugging
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MEAN Stack application." });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", status: "ok" });
});

// Check what routes file exists and require it
try {
  require("./app/routes/tutorial.routes")(app);
  console.log("Loaded tutorial.routes");
} catch (err) {
  console.log("tutorial.routes not found, trying turorial.routes");
  try {
    require("./app/routes/turorial.routes")(app);
    console.log("Loaded turorial.routes");
  } catch (err2) {
    console.log("No routes file found, creating basic routes");
    
    // Create basic routes if none exist
    const Tutorial = require("./app/models/tutorial.model");
    
    // Get all tutorials
    app.get("/api/tutorials", async (req, res) => {
      try {
        const tutorials = await Tutorial.find();
        res.json(tutorials);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    
    // Create tutorial
    app.post("/api/tutorials", async (req, res) => {
      try {
        const tutorial = new Tutorial(req.body);
        await tutorial.save();
        res.status(201).json(tutorial);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }
}

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
