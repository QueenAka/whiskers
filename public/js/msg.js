let userData;
let uname;
let dname;
let lastUser;
let clientId;
let msgTimeout = setTimeout(() => {
  lastUser = null;
}, 60000);
let commandsOpened = false;
let emojiOpened = false;
let loadingMessages = [];

fetch("/api/settings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: accountName,
  }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.error) {
      localStorage.removeItem("account");
      goto("/pages/user?r=" + window.location.href);
      return;
    }
    if (data.res == "Success") {
      userData = data.json;
      if (userData != null) {
        lastUser = null;
        uname = accountName;
        dname = userData.settings.displayName;

        fetch("/events/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "chatJoin",
            url: window.location.href,
            data: {
              username: uname,
              displayName: dname,
            },
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            clientId = data.id;
            startEventFlow();
          });
      }
    } else {
      goto("/pages/user?r=" + window.location.href);
    }
  });

document.getElementById("msginp").addEventListener("keydown", (e) => {
  function addSymbol(s) {
    l = s.split("").length;
    e.preventDefault();
    let selStart = e.target.selectionStart;
    let selEnd = e.target.selectionEnd;
    let text = e.target.value;
    e.target.value =
      text.substring(0, selStart) +
      s +
      text.substring(selStart, selEnd) +
      s +
      text.substring(selEnd);
    e.target.selectionEnd = selEnd + l;
    e.target.selectionStart = selStart + l;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    send();
  } else if (e.key === "b" && e.ctrlKey) {
    addSymbol("**");
  } else if (e.key === "i" && e.ctrlKey) {
    addSymbol("*");
  } else if (e.key === "u" && e.ctrlKey) {
    addSymbol("_");
  } else if (e.key === "s" && e.ctrlKey) {
    addSymbol("~~");
  } else if (e.key === "e" && e.ctrlKey) {
    addSymbol(":");
  }
});

function highlight(id) {
  document.getElementById("msginp").focus();
  let doc = document.getElementById(`msg-${id}`);
  doc.style.background = "var(--sp)";
  setTimeout(() => {
    doc.style.background = "";
  }, 1000);
}

async function emoji() {
  return new Promise(async (resolve) => {
    document.getElementById("msginp").focus();
    if (commandsOpened) {
      await commandList();
    }
    if (emojiOpened == false) {
      emojiOpened = true;
      let chooser = document.createElement("div");
      chooser.classList = "emoji-chooser";
      let list = "";
      allEmojis.forEach((emoji) => {
        list += `<img src='${emoji.url}'  class='list-item' onclick='emojiClick("${emoji.name}")'>`;
      });
      chooser.innerHTML = list;
      chooser.id = "emojiChooser";
      let nav = document.getElementById("bottom-nav");
      document.body.appendChild(chooser);
      setTimeout(() => {
        nav.classList.add("nav-emoji-picker");
        resolve();
      }, 50);
    } else {
      emojiOpened = false;
      let chooser = document.getElementById("emojiChooser");
      let nav = document.getElementById("bottom-nav");
      chooser.style.animation = "swipedown 0.4s ease-out";
      setTimeout(() => {
        nav.classList.remove("nav-emoji-picker");
        setTimeout(() => {
          chooser.remove();
          resolve();
        }, 75);
      }, 125);
    }
  });
}

async function commandList() {
  document.getElementById("msginp").focus();
  return new Promise(async (resolve) => {
    if (emojiOpened) {
      await emoji();
    }
    if (commandsOpened == false) {
      fetch("/api/commands")
        .then((res) => res.json())
        .then((data) => {
          commandsOpened = true;
          let chooser = document.createElement("div");
          chooser.classList = "emoji-chooser";
          chooser.id = "commandChooser";
          let list = "";
          const cats = Object.keys(data);
          cats.forEach((cat) => {
            list += `<h3>${cat}</h3>`;
            data[cat].forEach((cmd) => {
              list += `<div class='list-item-card' onclick='commandClick("${cmd.usage}")'><b>${cmd.id}</b><p>${cmd.description}</p></div>`;
            });
          });
          chooser.innerHTML = list;
          let nav = document.getElementById("bottom-nav");
          document.body.appendChild(chooser);
          setTimeout(() => {
            nav.classList.add("nav-emoji-picker");
            resolve();
          }, 50);
        });
    } else {
      commandsOpened = false;
      let chooser = document.getElementById("commandChooser");
      let nav = document.getElementById("bottom-nav");
      chooser.style.animation = "swipedown 0.4s ease-out";
      setTimeout(() => {
        nav.classList.remove("nav-emoji-picker");
        setTimeout(() => {
          chooser.remove();
          resolve();
        }, 75);
      }, 125);
    }
  });
}

function emojiClick(name) {
  document.getElementById("msginp").focus();
  document.getElementById("msginp").value += ":" + name + ":";
}

function commandClick(usage) {
  document.getElementById("msginp").focus();
  document.getElementById("msginp").value += "/" + usage;
}

function removeReply(msg) {
  const replyRegex = /\{\d+\}/g;
  msg = msg.replace(replyRegex, "").trim();
  return msg;
}

function notif(txt) {
  const notif = document.createElement("div");
  notif.classList = "notif";
  notif.innerHTML = txt;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = 0;
    setTimeout(() => {
      notif.remove();
    }, 125);
  }, 1500);
}

function send() {
  document.getElementById("msginp").focus();
  const msg = document.getElementById("msginp").value;
  if (msg.trim().length < 1) return;
  if (msg.trim().length > 2000) return notif("Message too long!");
  document.getElementById("msginp").value = "";
  let json = {
    type: "messageCreate",
    data: JSON.stringify({
      content: msg,
      author: {
        username: uname,
        displayName: dname,
      },
      tempId: new Date().getTime(),
    }),
    url: window.location.href.split("#")[0],
  };
  buildMessage(json, "temp");
  fetch("/events/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });
}

function resetTimer() {
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(() => {
    lastUser = null;
  }, 60000);
}

function formateDate(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  const hour = d.getHours();
  let min = d.getMinutes();
  if (min < 10) {
    min = "0" + min;
  }
  return `${month}/${day}/${year} ${hour % 12 || 12}:${min}`;
}

function reply(msg) {
  document.getElementById("msginp").focus();
  document.getElementById("msginp").value = "{" + msg + "} ";
}

function copy(txt) {
  document.getElementById("msginp").focus();
  navigator.clipboard.writeText(txt);
  notif("Copied text!");
}

function notif(txt) {
  const notif = document.createElement("div");
  notif.classList = "notif";
  notif.innerHTML = txt;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = 0;
    setTimeout(() => {
      notif.remove();
    }, 125);
  }, 1500);
}

async function startEventFlow() {
  return new Promise((resolve) => {
    let offline, online;
    const controller = new AbortController();
    const signal = controller.signal;

    const client = new EventSource(`/events/get?id=${clientId}`, { signal });

    client.onerror = () => {
      offline == true;
      resolve(false);
    };

    client.onopen = () => {
      online == true;
      client.addEventListener("message", messageReceiver);
      client.addEventListener("error", errorHandler);
      resolve(true);
    };

    setTimeout(() => {
      if (!online || !offline) {
        controller.abort();
        resolve(false);
      }
    }, 500);
  });
}

function messageReceiver(event) {
  let message = JSON.parse(event.data);
  if (message.type == "messageCreate" && message.url == window.location.href) {
    buildMessage(message, "message");
  }
}

async function errorHandler(event) {
  const online = await startEventFlow();
  if (!online) {
    const offlineDiv = document.createElement("div");
    offlineDiv.id = "offlinePage";
    offlineDiv.classList.add("offline");
    offlineDiv.innerHTML =
      "<center><div class='offline-logo'></div><h3>You are offline! Please connect to the internet and to continue!</h3><button onclick='window.location.reload()'>Reload Page</button></center>";
    document.body.appendChild(offlineDiv);
  }
}

function buildMessage(message, type) {
  if (type == "message") {
    let msgId = message.id;
    messageData = JSON.parse(message.data);
    if (loadingMessages.includes(messageData.tempId)) {
      document.getElementById(`temp-${messageData.tempId}`).remove();
      loadingMessages.splice(loadingMessages.indexOf(messageData.tempId), 1);
    }
    let username = messageData.author.username;
    if (username == "[SERVER]") username = message.id;
    let displayName = messageData.author.displayName;
    let appendUser = username != lastUser;
    lastUser = username;
    if (displayName == null) {
      displayName = clean(messageData.content);
      messageData.content = "";
    }
    const messages = document.getElementById("log");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("msgr");
    msgDiv.id = `msg-${msgId}`;

    const topDiv = document.createElement("div");
    topDiv.classList.add("top");

    const authorSpan = document.createElement("b");
    authorSpan.id = msgId;
    authorSpan.innerHTML = displayName;

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("lt");
    dateSpan.innerHTML = ` ${formateDate(new Date())}`;

    topDiv.appendChild(authorSpan);
    topDiv.appendChild(dateSpan);
    topDiv.innerHTML += "<br>";

    if (appendUser) msgDiv.appendChild(topDiv);

    const bottomSpan = document.createElement("span");
    bottomSpan.classList.add("messageContent");
    bottomSpan.innerHTML = clean(messageData.content);

    const bottomDiv = document.createElement("div");
    bottomDiv.appendChild(bottomSpan);
    msgDiv.appendChild(bottomDiv);
    messages.appendChild(msgDiv);

    resetTimer();

    aud = "/media/audio/meow.mp3";
    if (username != uname) {
      var audio = new Audio(aud);
      audio.loop = false;
      audio.play();
    }
    messages.scrollTop = messages.scrollHeight;
  } else if (type == "temp") {
    let messageData = JSON.parse(message.data);
    let msgId = messageData.tempId;
    loadingMessages.push(msgId);
    let username = messageData.author.username;
    let displayName = messageData.author.displayName;
    let appendUser = username != lastUser;
    const messages = document.getElementById("log");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("msgr");
    msgDiv.classList.add("temp");
    msgDiv.id = `temp-${msgId}`;

    const topDiv = document.createElement("div");
    topDiv.classList.add("top");

    const authorSpan = document.createElement("b");
    authorSpan.id = msgId;
    authorSpan.innerHTML = displayName;

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("lt");
    dateSpan.innerHTML = ` ${formateDate(new Date())}`;

    topDiv.appendChild(authorSpan);
    topDiv.appendChild(dateSpan);
    topDiv.innerHTML += "<br>";

    if (appendUser) msgDiv.appendChild(topDiv);

    const bottomSpan = document.createElement("span");
    bottomSpan.classList.add("messageContent");
    bottomSpan.innerHTML = clean(messageData.content);

    const bottomDiv = document.createElement("div");
    bottomDiv.appendChild(bottomSpan);
    msgDiv.appendChild(bottomDiv);
    messages.appendChild(msgDiv);

    messages.scrollTop = messages.scrollHeight;
  }
}
