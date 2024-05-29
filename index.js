const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Picrypt = require(path.join(__dirname, "private/data/picrypt.js"));
const pi = new Picrypt();
let clients = [];
let emojisList = [];

function loadEmojis() {
  const files = fs.readdirSync(path.join(__dirname, "public/emojis"));
  emojisList = files.map((file) => {
    return {
      name: file.split(".")[0].toLowerCase(),
      url: `/emojis/${file}`,
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

function sendToClients(msg) {
  clients.forEach((client) => {
    console.log("Sending to client " + client.id);
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
    );
  }

  req.on("close", () => {
    clients = clients.filter((c) => c.id !== id);
    sendToClients(
      `${JSON.stringify({
        type: "messageCreate",
        url: client.url,
        msg: `**${client.author}** has left the chat.`,
      })}\n\n`,
    );
    res.end();
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
    console.log("New client created");
  } else if (type === "messageCreate") {
    let newJson = {
      type: "messageCreate",
      url: url,
      data: data,
    };
    sendToClients(JSON.stringify(newJson) + "\n\n");
  } else {
    res.status(400).json({ error: "Invalid type" });
  }
});

app.get("/api/emojis", async (req, res) => {
  await loadEmojis();
  res.json(emojisList);
});

app.post("/api/signup", async (req, res) => {
  try {
    let username = req.body.username;
    let password = pi.encrypt(req.body.password);
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

app.get("/chats/:chatId", async (req, res) => {
  let chatId = req.params.chatId;
  if (!chatId) return res.redirect("/404");
  let chat = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/chats.json")),
  )[chatId];
  if (!chat) return res.status(404).redirect("/404");
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Whiskers | ${chat.name}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/emojis/1.png" />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body>
        <nav>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            class="user"
            viewBox="0 0 16 16"
            onclick="goto('/pages/user')"
          >
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
            <path
              fill-rule="evenodd"
              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
            ></path>
          </svg>
          <a id="home" href="/">
            <div class="logo"></div>
            Whiskers
          </a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            class="settings"
            viewBox="0 0 16 16"
            onclick="goto('/pages/settings')"
          >
            <path
              d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"
            ></path>
          </svg>
        </nav>
        <div id="log"></div>
        <div class="bottom-nav" id="bottom-nav">
        <img onclick="img()" class="icon" src="/media/img.png">
          <input placeholder="Send a message..." id="msginp" type="text" />
          <img onclick="emoji()" class="icon" src="/media/emoji.png">
          <img onclick="send()" id="msgsend" src="/media/send.png" class="icon">
        </div>
<input type="file" id="imageGetter" accept="*" />
        <script src="/js/msg.js"></script>
        <script src="/js/all.js"></script>
      </body>
    </html>
  `);
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
    let password = pi.encrypt(req.body.password);
    let data = JSON.parse(
      fs.readFileSync(path.join(__dirname, "private/data/users.json")),
    );
    let user = data[username];

    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.password !== password)
      return res.status(403).json({ error: "Incorrect password." });

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
