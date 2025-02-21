const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "file_management_system",
  password: "",
  connectTimeout: 60000
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// REST API endpoints

// Configure multer (file storage in 'uploads' folder)
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Upload a file
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { filename, path, mimetype, size } = req.file;
    await pool.query(
      "INSERT INTO files (file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?)",
      [filename, path, mimetype, size]
    );
    res.json({ message: "File uploaded successfully", filename });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Error uploading file" });
  }
});

// Get all files (using async/await)
app.get('/files', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM files');
    if (results.length === 0) {
      return res.json({ message: "No files found", files: [] });
    }
    res.json({ files: results });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: "Database error" });
  }
});



// Delete a file
app.delete("/files/:id", async (req, res) => {
  const fileId = req.params.id;
  try {
    const [file] = await pool.query("SELECT file_path FROM files WHERE id = ?", [fileId]);
    if (file.length) {
      try {
        fs.unlinkSync(file[0].file_path);
      } catch (fsErr) {
        console.error("Error deleting file from filesystem:", fsErr);
        return res.status(500).json({ error: "Error deleting file from filesystem" });
      }
      await pool.query("DELETE FROM files WHERE id = ?", [fileId]);
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (err) {
    console.error("Error during delete operation:", err);
    res.status(500).json({ error: "An error occurred while deleting the file" });
  }
});
