const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const db = require("../config/database")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

router.post(("/"), [
    check("email", "Email is not valid").isEmail(),
    check("password", "You must Enter Your password").not().isEmpty(),
    check("password", "Your password is too large").isLength({ max: 50 })


], async (req, res) => {
    try {
        const errs = validationResult(req)
        if (!errs.isEmpty()) {
            return res.status(400).json({ errors: errs.array() })
        }
        const { email, password } = req.body
        const [rows] = await db.query("select id,password from users where email = ?", [email])
        if (rows.length == 0) {
            return res.status(400).json({ errors: [{ msg: "Invalide Credentials" }] })
        }
        const isloged=await bcrypt.compare(password,rows[0].password)
        if(!isloged){
            return res.status(400).json({ errors: [{ msg: "Invalide Credentials" }] })
        }

        const id = rows[0].id;
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