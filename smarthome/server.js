const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { SerialPort } = require('serialport');
const path = require('path');

const app = express();
const PORT = 3000;

// Update this to COM5
const arduino = new SerialPort({ path: 'COM5', baudRate: 9600 }, (err) => {
    if (err) console.log('🔴 Serial Error: ', err.message);
    else console.log('🟢 Arduino connected on COM5');
});

// SQLite Setup
const db = new sqlite3.Database('./smarthome.db');
db.run(`CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, device TEXT, action TEXT, value INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);

app.use(express.static('public'));

app.get('/control', (req, res) => {
    const { device, action, value } = req.query;
    arduino.write(`${device}:${value}\n`);
    db.run(`INSERT INTO logs (device, action, value) VALUES (?, ?, ?)`, [device, action, value]);
    res.json({ status: "success" });
});

app.get('/history', (req, res) => {
    db.all("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 5", [], (err, rows) => res.json(rows));
});

app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));