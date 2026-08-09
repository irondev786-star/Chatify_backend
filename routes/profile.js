const express = require("express")
const router = express.Router()
const protected = require("../middleweres/protected")
const OurProfile = require("../actions/OursProfile")
const OtherProfile = require("../actions/OthersProfile")
const db = require("../config/database")


router.get("/", protected, (req, res) => {
    const userId = req.user.id
    if (Object.keys(req.query).length === 0) {
        OurProfile(req, res, userId)
    } else {
        OtherProfile(req, res, userId)
    }
})
router.get("/:id", protected, async (req, res) => {
    const [rows] = await db.query("select id,first_name,profile_pic from users where id=?", [req.params.id])

    res.json(rows[0])
})
router.put("/", protected, async (req, res) => {
    const userId = req.user.id
    const url = req.body.pic_url
    try {
        await db.query(
            "UPDATE users SET profile_pic = ? WHERE id = ?",
            [url, userId]

        )
        res.json({
            msg: "Dp is updated"
        })

    } catch (err) {
        res.status(500).json({
            msg: "Cannot set your pic"
        })
    }
})
module.exports = router