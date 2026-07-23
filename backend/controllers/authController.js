const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
exports.register = async (req, res) => {

    const { name, email, password, confirmPassword } = req.body;

    // Check if all fields are provided
if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // Check password length
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        });
    }
if (password !== confirmPassword) {
    return res.status(400).json({
        success: false,
        message: "Passwords do not match"
    });
}
// Hash the password
const hashedPassword = await bcrypt.hash(password, 10);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            name,
            email,
            password: hashedPassword
        }
    });
};

exports.login = (req, res) => {

    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: "Invalid email format"
    });
}

   const token = jwt.sign(
    { email: email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);
res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
        email
    },
    token: token
});
};