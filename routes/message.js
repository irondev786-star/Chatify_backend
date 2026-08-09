const express=require("express")
const router=express.Router()
const protect=require("../middleweres/protected")
const db=require("../config/database")

router.post("/:id",protect,async (req,res)=>{
    const sender_id=req.user.id;
    const chat_id=req.params.id;
    const content=req.body.content
    const [response]=await db.query("insert into messages(content,chat_id,sender_id) VALUES(?,?,?)",[content,chat_id,sender_id])
    res.json(response[0])


})

module.exports=router