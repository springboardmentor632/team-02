const express = require("express");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
dotenv.config();



const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("PolicyGPT Backend is Running 🚀");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});