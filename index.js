const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
let clients = [];
let emojisList = [];

function loadEmojis() {
  const files = fs.readdirSync(
    path.join(__dirname, "public/media/image/emojis"),
  );
  emojisList = files.map((file) => {
    return {
      name: file.split(".")[0].toLowerCase(),
      url: `/media/image/emojis/${file}`,
      fileType: "image/" + file.split(".")[1],
    };
  });
  emojisList.sort((a, b) => {
    return parseInt(a.name) - parseInt(b.name);
  });
}

app.use(cors());
app.use(express.json());
app.use(
  express.static(path.join(__dirname, "public"), { extensions: ["html"] }),
);

function sendToClients(msg, url) {
  const clientsToSend = clients.filter((client) => {
    return client.url === url;
  });
  clientsToSend.forEach((client) => {
    client.res.write("data: " + msg);
  });
}

app.get("/events/get", (req, res) => {
  let id = req.query.id;
  let client = clients.find((c) => c.id === id);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  if (!client.res) {
    let cIndex = clients.findIndex((c) => c.id === id);
    clients[cIndex].res = res;
    sendToClients(
      `${JSON.stringify({
        type: "messageCreate",
        url: client.url,
        data: JSON.stringify({
          content: `**${client.author}** has joined the chat!`,
          author: "[SERVER]",
        }),
      })}\n\n`,
      client.url,
    );
  }

  req.on("close", () => {
    const clientUrl = client.url;
    const clientAuthor = client.author;
    clients = clients.filter((c) => c.id !== id);
    res.end();
    sendToClients(
      `${JSON.stringify({
        type: "messageCreate",
        url: clientUrl,
        msg: `**${clientAuthor}** has left the chat.`,
      })}\n\n`,
      clientUrl,
    );
  });
});

app.post("/events/post", (req, res) => {
  const { type, url, data } = req.body;
  if (type === "chatJoin") {
    let clientId = Date.now().toString();
    clients.push({
      id: clientId,
      url: url,
      author: data,
      res: null,
    });
    res.json({ id: clientId });
  } else if (type == "messageCreate") {
    let newJson = {
      type: "messageCreate",
      url: url,
      data: data,
    };
    sendToClients(JSON.stringify(newJson) + "\n\n", url);
  } else {
    res.status(400).json({ error: "Invalid type" });
  }
});

app.get("/api/emojis", async (req, res) => {
  loadEmojis();
  res.json(emojisList);
});

app.post("/api/signup", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let data = JSON.parse(
      fs.readFileSync(path.join(__dirname, "private/data/users.json")),
    );
    if (data[username])
      return res
        .status(403)
        .json({ error: "User with this username already exists." });
    data[username] = {
      displayName: username,
      password,
      settings: {
        nameColor: "#f1f1f1",
        notifSounds: true,
        notifSound: "meow.mp3",
      },
      ownedChats: [],
      bannedChats: [],
    };

    fs.writeFileSync(
      path.join(__dirname, "private/data/users.json"),
      JSON.stringify(data),
    );
    res.json({
      success: true,
      user: data[username],
      name: username,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during signup." });
    console.log(error);
  }
});

app.post("/api/new", async (req, res) => {
  let author = req.body.username;
  let name = req.body.chatName;

  const allChats = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/chats.json")),
  );

  let chatId = Math.floor(Math.random() * 100000000000000);
  allChats[chatId] = {
    author: author,
    name: name,
  };
  fs.writeFileSync(
    path.join(__dirname, "private/data/chats.json"),
    JSON.stringify(allChats),
  );
  res.json({
    res: "Success",
    chatId: chatId,
  });
});

app.get("/api/chats/:chatId", async (req, res) => {
  let chatId = req.params.chatId;
  let data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/chats.json")),
  );
  if (!data[chatId]) return res.status(404).json({ error: "Chat not found" });
  res.json(data[chatId]);
});

app.get("/chats/:chatId", async (req, res) => {
  let chatId = req.params.chatId;
  if (!chatId) return res.redirect("/");
  let chat = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/chats.json")),
  )[chatId];
  if (!chat) return res.status(404).redirect("/404");
  if (chat.visibiility == "private") {
    res.status(403).redirect(`/chats/auth/${chatId}`);
  } else {
    res.sendFile(path.join(__dirname, "private/html/chat.html"));
  }
});

app.post("/api/update", async (req, res) => {
  let username = req.body.username;
  let json = req.body.json;

  let data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/users.json")),
  );

  if (!data[username])
    return res.status(403).json({ error: "User not found." });
  data[username] = json;
  fs.writeFileSync(
    path.join(__dirname, "data/users.json"),
    JSON.stringify(data),
  );
  res.json({ res: "Success" });
});

app.post("/api/settings", async (req, res) => {
  let username = req.body.username;
  let data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/users.json")),
  );
  if (!data[username])
    return res.status(403).json({ error: "User not found." });
  res.status(200).json({ res: "Success", json: data[username] });
});

app.post("/api/login", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let data = JSON.parse(
      fs.readFileSync(path.join(__dirname, "private/data/users.json")),
    );
    let user = data[username];

    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.password !== password)
      return res.status(403).json({ error: "Incorrect username or password." });

    res.json({ success: true, user, name: username });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during login." });
    console.log(error);
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "private/html/404.html"));
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
