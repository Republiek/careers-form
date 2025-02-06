require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());

app.get("/api/careers", async (req, res) => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Images!A2:C?key=${process.env.API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/questions", async (req, res) => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Careers?key=${process.env.API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user", async (req, res) => {
  try {
    const email = req.query.email;

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Entries?key=${process.env.API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    const entry = data.values.find((entry) => entry[1] === email);

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/write", async (req, res) => {
  try {
    const payload = req.body;
    const scriptID = process.env.SCRIPT_ID;

    await fetch(`https://script.google.com/macros/s/${scriptID}/exec`, {
      method: "POST",
      redirect: "follow",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        values: payload.data,
      }),
    });

    res.status(200).json({ success: "true" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      event: req.body,
    });
  }
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
