const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// Create database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mydb',
    port: Number(process.env.DB_PORT) || 3306,
    ssl: false,
    waitForConnections: true,
    connectionLimit: 10
});

// GET all items
app.get("/table", async (req, res) => {
    try {
        const [shop] = await db.query(`SELECT * FROM shop`);
        res.json(shop);
    } catch (err) {
        console.error("GET /table error:", err);
        res.status(500).json({ error: "Failed to fetch shop data" });
    }
});

// POST new item (Parameterized to prevent SQL Injection)
app.post("/new", async (req, res) => {
    const { id, prod, comp, quantity, price, models } = req.body;

    if (!prod || !comp || quantity == null || price == null || !models) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const modelsJson = typeof models === 'string' ? models : JSON.stringify(models);

        await db.query(
            `INSERT INTO shop (id, prod, comp, quantity, price, models) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, prod, comp, quantity, price, modelsJson]
        );

        res.json({ id, prod, comp, quantity, price, models });
    } catch (err) {
        console.error("POST /new error:", err);
        res.status(500).json({ error: "Failed to insert data" });
    }
});

// PUT update item
app.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { prod, comp, quantity, price, models } = req.body;

    try {
        const modelsJson = typeof models === 'string' ? models : JSON.stringify(models);

        const [result] = await db.query(
            `UPDATE shop SET prod = ?, comp = ?, quantity = ?, price = ?, models = ? WHERE id = ?`,
            [prod, comp, quantity, price, modelsJson, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json({ id, prod, comp, quantity, price, models });
    } catch (err) {
        console.error("PUT /update error:", err);
        res.status(500).json({ error: "Failed to update data" });
    }
});

// DELETE item
app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(`DELETE FROM shop WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json({ id });
    } catch (err) {
        console.error("DELETE /delete error:", err);
        res.status(500).json({ error: "Failed to delete data" });
    }
});

app.listen(3000, () => {
    console.log("Running on http://localhost:3000");
});