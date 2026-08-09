const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const db = require("../config/database")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

router.post(("/"), [
    check("first_name", "You Must Enter your first name").not().isEmpty(),
    check("first_name", "Your First Name is too large chose a nick name").isLength({ max: 50 }),
    check("last_name", "You Must Enter Your last name").not().isEmpty(),
    check("last_name", "Your Last name is too large chose a nick name").isLength({ max: 50 }),
    check("email", "Email is not valid").isEmail(),
    check("password", "You must Enter Your password").not().isEmpty(),
    check("password", "Your password is too large").isLength({ max: 50 })


], async (req, res) => {
    try {
        const errs = validationResult(req)
        if (!errs.isEmpty()) {
            return res.status(400).json({ errors: errs.array() })
        }
        const { first_name, last_name, email, password } = req.body
        const [rows] = await db.query("select email from users where email = ?", [email])
        if (rows.length > 0) {
            return res.status(400).json({ errors: [{ msg: "Email already exists try another one" }] })
        }
        const [name] = await db.query("select first_name from users where first_name = ?", [first_name])
        if (name.length > 0) {
            return res.status(400).json({ errors: [{ msg: "First name already exists try another one" }] })
        }
        const salt = await bcrypt.genSalt(Number(process.env.rounds))
        const hash = await bcrypt.hash(password, salt)
        const [response] = await db.query(
            "INSERT INTO users(first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
            [first_name, last_name, email, hash]
        );

        const id = response.insertId;
        const payload = {
            id: id
        }
        jwt.sign(
            payload,
            process.env.secret,
            { expiresIn: "10d" },
            (err, token) => {
                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: "Failed to generate token",
                    });
                }

                res.cookie("token", token, {
                    httpOnly: true,
                    secure: false,      // Set to true in production with HTTPS
                    sameSite: "lax",    // Use "none" with secure: true for cross-site
                    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
                });

                return res.json({
                    success: true,
                    token, // Optional if you're using cookies only
                });
            }
        );
    } catch (err) {
           return res.status(500).json({
                        success: false,
                        message: "Server is not responding properly",
                    });
    }


})



module.exports = router