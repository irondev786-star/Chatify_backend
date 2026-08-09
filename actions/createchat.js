const db=require("../config/database")
const fetchChat=require("./fetchchat")

module.exports = async (req, res, receiverId, senderId) => {
    try {
        const [rows] = await db.query(
            "INSERT INTO chats(group_chat, chat_name) VALUES(?, ?)",
            [false, "peer_to_peer"]
        );

        const chat_id = rows.insertId;

        await db.query(
            "INSERT INTO chat_members(chat_id, user_id) VALUES(?, ?)",
            [chat_id, senderId]
        );

        await db.query(
            "INSERT INTO chat_members(chat_id, user_id) VALUES(?, ?)",
            [chat_id, receiverId]
        );

        return fetchChat(req, res, chat_id);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};