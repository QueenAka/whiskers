const fetchMeta = require("url-metadata");
const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const TENOR = "AIzaSyDtGZn8kVMJwn07uU8BKDEwieHLSKbIRFE";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/media/uploads"));
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now().toString()}.${ext}`);
  },
});
const uploadsDir = path.join(__dirname, "public/media/uploads");
let chats = [];

// functions
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

function sendToClients(msg, url) {
  const clientsToSend = clients.filter((client) => {
    return client.url === url;
  });
  clientsToSend.forEach((client) => {
    client.res.write("data: " + msg);
  });
}

function loadEmojis() {
  const files = fs.readdirSync(
    path.join(__dirname, "public/media/image/emojis"),
  );
  emojisList = files.map((file) => {
    return {
      name: file.split(".")[0].toLowerCase().split("_")[1],
      url: `/media/image/emojis/${file}`,
      fileType: "image/" + file.split(".")[1],
    };
  });
  emojisList.sort(function (a, b) {
    return (
      a.url.split("media/image/emojis/")[1].split("_")[0] -
      b.url.split("media/image/emojis/")[1].split("_")[0]
    );
  });
}

async function checkMedia(url) {
  const imgs = ["jpeg", "jpg", "png", "gif", "webp", "svg", "jpg", "jfif"];
  const vids = ["mp4", "webm", "mov", "avi", "mkv", "wmv"];
  const auds = ["mp3", "wav", "ogg", "flac", "m4a", "aac"];
  if (imgs.some((ext) => url.toLowerCase().endsWith(`.${ext}`))) {
    return "image";
  } else if (vids.some((ext) => url.toLowerCase().endsWith(`.${ext}`))) {
    return "video";
  } else if (auds.some((ext) => url.toLowerCase().endsWith(`.${ext}`))) {
    return "audio";
  } else {
    return "website";
  }
}

async function tenorSearch(q, next) {
  return new Promise((resolve) => {
    fetch(
      `https://tenor.googleapis.com/v2/search?q=${q}&key=${TENOR}&limit=20&pos=${next || 0}`,
    )
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      });
  });
}

async function imgurSearch(q, next = 1) {
  const response = await fetch(
    `https://api.imgur.com/3/gallery/search/top/all/${next}?q=${q}&type=image`,
    {
      headers: {
        Authorization: "Client-ID a529bfe7af5d8be",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();

  const filteredImages = data.data.filter((item) => !item.is_album);

  return {
    images: filteredImages,
    next: next + 1,
  };
}

// Middleware
let clients = [];
let emojisList = [];

app.use(cors());
app.use(express.json());
app.use(
  express.static(path.join(__dirname, "public"), { extensions: ["html"] }),
);

// Events, Inaccessible via 3rd party apps
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
    if (!client.author.joinMessages) return;
    sendToClients(
      `${JSON.stringify({
        type: "messageCreate",
        url: client.url,
        data: JSON.stringify({
          content: `**${client.author.displayName}** has joined the chat!`,
          author: {
            username: "[SERVER]",
            displayName: null,
          },
        }),
        id: Date.now().toString(),
      })}\n\n`,
      client.url,
    );
  }

  req.on("close", () => {
    const clientUrl = client.url;
    const clientAuthor = client.author.displayName;
    const joinMessages = client.author.joinMessages;
    clients = clients.filter((c) => c.id !== id);
    res.end();
    if (!joinMessages) return;
    sendToClients(
      `${JSON.stringify({
        type: "messageCreate",
        url: clientUrl,
        data: JSON.stringify({
          content: `**${clientAuthor}** has left the chat.`,
          author: {
            username: "[SERVER]",
            displayName: null,
          },
        }),
        id: Date.now().toString(),
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
      id: Date.now().toString(),
    };
    sendToClients(JSON.stringify(newJson) + "\n\n", url);
  } else if (type == "messageDelete") {
    let newJson = {
      type: "messageDelete",
      url: url,
      data: data,
    };
    sendToClients(JSON.stringify(newJson) + "\n\n", url);
  } else if (type == "messageEdit") {
    let newJson = {
      type: "messageEdit",
      url: url,
      data: data,
    };
    sendToClients(JSON.stringify(newJson) + "\n\n", url);
  } else {
    res.status(400).json({ error: "Invalid type" });
  }
});

// Chats
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

app.get("/api/chats", async (req, res) => {
  const chats = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/chats.json"), "utf-8"),
  );
  let publicChats = [];
  Object.values(chats).forEach((chat) => {
    if (chat.visibility.type === "public") {
      publicChats.push(chat);
    }
  });

  res.json(publicChats);
});

app.get("/api/chats/:chatId", async (req, res) => {
  let chatId = req.params.chatId;
  let data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/chats.json"), "utf-8"),
  );
  if (!data[chatId]) return res.status(404).json({ error: "Chat not found" });
  res.json(data[chatId]);
});

app.get("/chats/:chatId", async (req, res) => {
  let chatId = req.params.chatId;
  if (!chatId) return res.redirect("/");
  let chats = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/chats.json")),
  );
  const chat = chats.find((c) => c.id === chatId);
  if (!chat)
    return res
      .status(404)
      .sendFile(path.join(__dirname, "private/html/404.html"));
  if (chat.visibility.type == "private")
    return res.status(403).redirect(`/chats/auth/${chatId}`);
  res.sendFile(path.join(__dirname, "private/html/chat.html"));
});

// Misc
app.get("/api/emojis", async (req, res) => {
  loadEmojis();
  res.json(emojisList);
});

app.get("/api/updates", async (req, res) => {
  const updates = JSON.parse(
    fs.readFileSync(path.join(__dirname, "private/data/updates.json"), "utf-8"),
  );
  res.json(updates.reverse());
});

app.post("/api/meta", async (req, res) => {
  let url = req.body.url;
  if (!url) return res.status(400).json({ error: "No URL provided" });
  const media = await checkMedia(url);
  if (media != "website") {
    res.json({ media: media, url: url });
    return;
  }
  try {
    let data = await fetchMeta(url);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch meta data for this site." });
    console.log(error);
  }
});

app.get("/api/tenor", async (req, res) => {
  let q = req.query.q;
  if (!q) return res.status(400).json({ error: "No query provided" });
  let next = req.query.next || 0;
  let data = await tenorSearch(q, next);
  res.json(data);
});

app.get("/api/imgur", async (req, res) => {
  let q = req.query.q;
  let next = req.query.next || 1;
  if (!q) return res.status(400).json({ error: "No query provided" });
  let data = await imgurSearch(q, next);
  res.json(data);
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  res.json({ url: req.file.filename });

  setTimeout(() => {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).send("Failed to delete file.");
      }
    });
  }, 60000);
});

// Server config

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "private/html/404.html"));
});

app.listen(443, () => {
  console.log("Server started on port 443");
});
