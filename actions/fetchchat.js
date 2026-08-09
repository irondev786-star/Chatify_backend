const db = require("../config/database");

module.exports = async (req, res, chatId) => {

    const [rows] = await db.query(
        `SELECT
            c.id,
            c.group_chat,
            c.chat_name,
            m.id AS message_id,
            m.sender_id,
            m.content,
            m.sent_at,
            cm.user_id
        FROM chats c
        LEFT JOIN messages m
            ON c.id = m.chat_id
        Left Join chat_members cm
            on cm.chat_id=c.id
        WHERE c.id = ?`,
        [chatId]
    );

    if (rows.length === 0) {
        return res.status(404).json({
            errors: [{ msg: "Chat not found" }]
        });
    }

    const chat = {
        id: rows[0].id,
        group_chat: rows[0].group_chat,
        chat_name: rows[0].chat_name,
        messages: [],
        users: []
    };

    const messageSet = new Set();
    const userSet = new Set();

    for (const row of rows) {

        if (row.user_id != null && !userSet.has(row.user_id)) {
            userSet.add(row.user_id);
            chat.users.push(row.user_id);
        }

        if (row.message_id != null && !messageSet.has(row.message_id)) {
            messageSet.add(row.message_id);

            chat.messages.push({
                id: row.message_id,
                sender_id: row.sender_id,
                content: row.content,
                sent_at: row.sent_at
            });
        }
    }

    res.json(chat);

    
};