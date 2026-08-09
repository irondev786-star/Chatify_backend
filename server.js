const express = require("express");
require("dotenv").config();

const app = express();
const http = require("http");
const server = http.createServer(app);

const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});

io.on("connection", (socket) => {

    console.log("NEW DEVICE CONNECTED:", socket.id);

    socket.on("con", (user_id) => {
        socket.join(user_id)
    });
    socket.on("msg",(msg_data)=>{
        console.log(msg_data)
        io.to(msg_data.send_to).emit("msg",{"Chat_id":msg_data.Chat_id,"msg":msg_data.Msg})
    })
    socket.on("disconnect", () => {
        console.log("DEVICE DISCONNECTED:", socket.id);
    });

});

app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

app.use("/SignUp", require("./routes/SignUp"));
app.use("/LogIn", require("./routes/login"));
app.use("/Profile", require("./routes/profile"));
app.use("/Chats", require("./routes/chats"));
app.use("/message", require("./routes/message"));

app.post("/LogOut", (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
    });

    res.status(200).json({
        msg: "Logged out successfully"
    });

});

server.listen(5000, () => {
    console.log("Congratulations your server is live");
});