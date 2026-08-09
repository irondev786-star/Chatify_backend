const db=require("../config/database")
module.exports=async (req,res,userId)=>{
    console.log(userId)
    const [rows] = await db.query(
    `SELECT
    u.id AS current_user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.created_at,
    u.profile_pic,

    c.id AS chat_id,
    c.group_chat,
    c.chat_name,
    c.latest_message_id,

    cm2.user_id AS member_id,

    c.created_at AS chat_created_at

FROM users u

LEFT JOIN chat_members cm1
    ON u.id = cm1.user_id

LEFT JOIN chats c
    ON cm1.chat_id = c.id

LEFT JOIN chat_members cm2
    ON c.id = cm2.chat_id

WHERE u.id = ?;`,
    [userId]
);
    const profile = {
    current_user_id:rows[0].current_user_id,
    first_name: rows[0].first_name,
    last_name: rows[0].last_name,
    email: rows[0].email,
    created_at: rows[0].created_at,
    profile_pic: rows[0].profile_pic,
    chats: []
};

const chatMap = {};

for (const row of rows) {

    if (row.chat_id == null) continue;

    if (!chatMap[row.chat_id]) {
        chatMap[row.chat_id] = {
            id: row.chat_id,
            group_chat: row.group_chat,
            chat_name: row.chat_name,
            latest_message_id: row.latest_message_id,
            created_at: row.chat_created_at,
            members: []
        };

        profile.chats.push(chatMap[row.chat_id]);
    }

    chatMap[row.chat_id].members.push(row.member_id);
}

res.json(profile);
}