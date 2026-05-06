const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS mesajlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad TEXT NOT NULL,
    telefon TEXT NOT NULL,
    mesaj TEXT NOT NULL,
    tarih TEXT NOT NULL
  )
`);

app.post("/mesaj-gonder", (req, res) => {
  const { ad, telefon, mesaj } = req.body;
  const tarih = new Date().toLocaleString("tr-TR");

  if (!ad || !telefon || !mesaj) {
    return res.status(400).json({ hata: "Tüm alanlar zorunludur." });
  }

  db.run(
    "INSERT INTO mesajlar (ad, telefon, mesaj, tarih) VALUES (?, ?, ?, ?)",
    [ad, telefon, mesaj, tarih],
    function (err) {
      if (err) {
        return res.status(500).json({ hata: "Veritabanı hatası." });
      }

      res.json({ mesaj: "Mesaj başarıyla kaydedildi." });
    }
  );
});

app.get("/mesajlar", (req, res) => {
  db.all("SELECT * FROM mesajlar ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ hata: "Mesajlar alınamadı." });
    }

    res.json(rows);
  });
});

app.delete("/mesaj-sil/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM mesajlar WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ hata: "Mesaj silinemedi." });
    }

    res.json({ mesaj: "Mesaj silindi." });
  });
});

app.listen(PORT, () => {
  console.log(`Site çalışıyor: http://localhost:${PORT}`);
});