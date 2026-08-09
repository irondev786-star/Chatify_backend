const express=require("express")
const router=express.Router()
const protect=require("../middleweres/protected")
const db=require("../config/database")
const CreateChat=require("../actions/createchat")
const fetchChat =require("../actions/fetchchat")


router.post("/single/:id",protect,async (req,res)=>{
    const receiverId=req.user.id 
    const senderId=Number(req.params.id)
    if(receiverId==senderId){
        return res.status(400).json({errors:[{msg:"You cant add you in a chat"}]})
    }
    
    const [available]=await db.query("SELECT m1.chat_id FROM chat_members m1 JOIN chat_members m2 ON m1.chat_id = m2.chat_id WHERE m1.user_id = ? AND m2.user_id = ?;",[receiverId,senderId])
    
   
    if(available.length===0){
        
        return CreateChat(req,res,receiverId,senderId)
    }
    else{
         const chat_id=available[0].chat_id
        return fetchChat(req,res,chat_id)
    }
   

 
})


module.exports=router