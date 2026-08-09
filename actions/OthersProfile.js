const db=require("../config/database")
module.exports=async (req,res,userId)=>{
    let [firstName]=await db.query("select first_name from users where id=?",[userId])
    const name=req.query.search
    if(firstName[0].first_name==name){
        return res.status(400).json({ errors: [{ msg: "You cant search your own username" }] })
    }
    let [rows]=await db.query("select id,first_name,last_name,profile_pic from users where first_name=? ",[name])
    if(rows.length==0){
        return res.status(400).json({ errors: [{ msg: "User Not found" }] })
    }
    res.json(rows[0])
    
    
}