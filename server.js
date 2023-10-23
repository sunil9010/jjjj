const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Database configuration
const db = mysql.createConnection({
  host: "book-seat.cx8m6whdtbu5.eu-north-1.rds.amazonaws.com",
  user: "admin",
  password: "sunilkumar",
  database: "bookDB",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection error: " + err.message);
  } else {
    console.log("Connected to the database");
  }
});

// Define API endpoints for CRUD operations
app.get("/api/seats", (req, res) => {
  // Extract query parameters
  const { category, status } = req.query;

  // Build the SQL query dynamically based on the query parameters
  let sql = "SELECT id, seatNumber, status, category FROM seats WHERE 1";

  if (category) {
    sql += ` AND category = ${db.escape(category)}`;
  }

  if (status) {
    sql += ` AND status = ${db.escape(status)}`;
  }

  // Debugging: Print the generated SQL query
  console.log("Generated SQL query:", sql);

  // Execute the SQL query with error handling
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);

      // Return a more detailed error response
      res
        .status(500)
        .json({ error: "Internal server error", details: err.message });
    } else {
      res.json(results);
    }
  });
});

// Assuming you have already configured the database connection (db) as shown in previous examples

// Assuming you have already configured the database connection (db) as shown in previous examples

app.post("/api/seats", (req, res) => {
  const newSeats = req.body;

  newSeats.forEach((seat) => {
    seat.id = uuid.v4();
  });

  // Create a SQL query to insert multiple seats in a single transaction
  const sql = "INSERT INTO seats (SeatNumber, Category, Status, Id) VALUES ?";

  // Extract an array of values for the new seats
  const values = newSeats.map((seat) => [
    seat.seatNumber,
    seat.category,
    seat.status,
    seat.id,
  ]);

  // Execute the query with multiple value sets
  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Database error: " + err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ message: "Seats added" });
    }
  });
});

app.put("/api/seats/conform", (req, res) => {
  // const { seatIds } = req.body;
  const { seatIds, newStatus } = req.body;
  // Check if the selected seats are available in the database
  // You should perform database queries here to validate seat availability.

  // Assuming the seats are available, update their status to "reserved"
  const sql = `UPDATE seats SET Status =${db.escape(
    newStatus
  )} WHERE Id IN (?)`;
  db.query(sql, [seatIds], (err, result) => {
    if (err) {
      console.error("Database error: " + err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ message: `Seats ${newStatus} successfully` });
    }
  });
});

// Implement update and delete routes as needed

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
