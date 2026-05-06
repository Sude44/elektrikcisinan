const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new Database("database.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS mesajlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad TEXT NOT NULL,
    telefon TEXT NOT NULL,
    mesaj TEXT NOT NULL,
    tarih TEXT NOT NULL
  )
`).run();

app.post("/mesaj-gonder", (req, res) => {
  const { ad, telefon, mesaj } = req.body;
  const tarih = new Date().toLocaleString("tr-TR");

  if (!ad || !telefon || !mesaj) {
    return res.status(400).json({ hata: "Tüm alanlar zorunludur." });
  }

  try {
    db.prepare(
      "INSERT INTO mesajlar (ad, telefon, mesaj, tarih) VALUES (?, ?, ?, ?)"
    ).run(ad, telefon, mesaj, tarih);

    res.json({ mesaj: "Mesaj başarıyla kaydedildi." });
  } catch (err) {
    res.status(500).json({ hata: "Veritabanı hatası." });
  }
});

app.get("/mesajlar", (req, res) => {
  try {
    const mesajlar = db
      .prepare("SELECT * FROM mesajlar ORDER BY id DESC")
      .all();

    res.json(mesajlar);
  } catch (err) {
    res.status(500).json({ hata: "Mesajlar alınamadı." });
  }
});

app.delete("/mesaj-sil/:id", (req, res) => {
  const id = req.params.id;

  try {
    db.prepare("DELETE FROM mesajlar WHERE id = ?").run(id);
    res.json({ mesaj: "Mesaj silindi." });
  } catch (err) {
    res.status(500).json({ hata: "Mesaj silinemedi." });
  }
});

app.listen(PORT, () => {
  console.log(`Site çalışıyor. Port: ${PORT}`);
});