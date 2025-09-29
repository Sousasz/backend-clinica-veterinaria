// FileName: MultipleFiles/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const serviceRoutes = require("./routes/services");
const chatRouter = require("./api/chat");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRouter);

app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);

// Opcional: Redirecionar a rota raiz para a página de login
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
