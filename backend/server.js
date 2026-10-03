const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
});

app.get("/table", async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM shop`);
        const shop = rows.map(row => ({
            ...row,
            models: typeof row.models === "string" ? JSON.parse(row.models) : row.models
        }));
        res.json(shop);
    } catch (err) {
        console.error(err);
        res.json({ error: "Failed to fetch shop data" });
    }
});
app.post("/new", async (req, res) => {
    const { id, prod, comp, quantity, price, models } = req.body;
    if (!prod || !comp || quantity == null || price == null || !models) {
        res.json({ error: "Missing required fields" });
        return;
    }
    try {
        await db.query(
            `INSERT INTO shop (id, prod, comp, quantity, price, models) VALUES (${id}, '${prod}', '${comp}', ${quantity}, ${price}, '${JSON.stringify(models)}')`
        );
        res.json({ id, prod, comp, quantity, price, models });
    } catch (err) {
        console.error(err);
        res.json({ error: "Failed to insert data" });
    }
});

app.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { prod, comp, quantity, price, models } = req.body;
    try {
        const [result] = await db.query(
            `UPDATE shop SET prod = '${prod}', comp = '${comp}', quantity = ${quantity}, price = ${price}, models = '${JSON.stringify(models)}' WHERE id = ${id}`
        );
        if (result.affectedRows === 0) {
            res.json({ error: "Item not found" });
            return;
        }
        res.json({ id, prod, comp, quantity, price, models });
    } catch (err) {
        console.error(err);
        res.json({ error: "Failed to update data" });
    }
});

app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query(
            `DELETE FROM shop WHERE id = ${id}`
        );
        if (result.affectedRows === 0) {
            res.json({ error: "Item not found" });
            return;
        }
        res.json({ id });
    } catch (err) {
        console.error(err);
        res.json({ error: "Failed to delete data" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));