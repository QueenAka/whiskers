const urlObj = new URL(window.location.href);
urlObj.search = "";
urlObj.hash = "";
const url = urlObj.toString();
const inputData = {};
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
console.clear();
console.log(url);
let consoleBigRed = "color:red; font-size:40px;";
console.log("%cSTOP!!", consoleBigRed);
console.log(
  "If you do not know what you are doing, you could be in danger of losing your account!\nDo not run code here unless you know EXACTLY what you are doing.\nLove from the Whiskers Team <3",
);

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
            url: url,
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
  let doc = document.getElementById(`msg-${id}`);
  doc.scrollIntoView({ behavior: "smooth", block: "center" });
  doc.style.background = "var(--background)";
  setTimeout(() => {
    doc.style.background = "";
  }, 1000);
}

async function emojiList() {
  return new Promise(async (resolve) => {
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
  return new Promise(async (resolve) => {
    if (emojiOpened) {
      await emojiList();
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
  document.getElementById("msginp").value += ":" + name + ":";
}

function commandClick(usage) {
  document.getElementById("msginp").value += "/" + usage;
}

function removeReply(msg) {
  const replyRegex = /\{\d+\}/g;
  msg = msg.replace(replyRegex, "").trim();
  return msg;
}

function send() {
  document.getElementById("msginp").focus();
  const msg = document.getElementById("msginp").value;
  if (msg.trim().length < 1) return;
  if (msg.trim().length > 2000) return popup("Message too long!");
  document.getElementById("msginp").value = "";
  let json;
  if (inputData.type == "reply") {
    json = {
      type: "messageCreate",
      data: JSON.stringify({
        content: `{${inputData.id}}${msg}`,
        author: {
          username: uname,
          displayName: dname,
        },
        tempId: new Date().getTime(),
      }),
      url: url,
    };
    removeInputType();
  } else if (inputData.type == "edit") {
    json = {
      type: "messageEdit",
      data: JSON.stringify({
        content: msg,
        id: inputData.id,
      }),
      url: url,
    };
    removeInputType();
  } else {
    json = {
      type: "messageCreate",
      data: JSON.stringify({
        content: msg,
        author: {
          username: uname,
          displayName: dname,
        },
        tempId: new Date().getTime(),
      }),
      url: url,
    };
  }
  if (!inputData.type == "edit") buildMessage(json, "temp");
  sendToClients(json);
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
  if (message.type == "messageCreate") {
    buildMessage(message, "message");
  } else if (message.type == "messageDelete") {
    const id = message.data.id;
    const msg = document.getElementById(`msg-${id}`);
    msg.remove();
  } else if (message.type == "messageEdit") {
    const data = JSON.parse(message.data);
    const id = data.id;
    const content = document.getElementById(`content-${id}`);
    content.innerHTML = clean(data.content) + " <h6 class='lt'>(edited)</h6>";
  }
}

async function errorHandler() {
  const online = await startEventFlow();
  if (!online) {
    const offlineDiv = document.createElement("div");
    offlineDiv.id = "offlinePage";
    offlineDiv.classList.add("offline");
    offlineDiv.innerHTML =
      "<center><div class='offline-logo'></div><h3>You are offline! Please connect to the internet and reload to continue!</h3><button onclick='window.location.reload()'>Reload Page</button></center>";
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
    bottomSpan.id = `content-${msgId}`;
    bottomSpan.innerHTML = clean(messageData.content);

    const bottomDiv = document.createElement("div");
    bottomDiv.appendChild(bottomSpan);
    msgDiv.appendChild(bottomDiv);
    messages.appendChild(msgDiv);
    let longPress = false;
    async function rcmenu(e) {
      const prevMenu = document.getElementById("rclickMenu");
      if (prevMenu) prevMenu.remove();
      const menu = document.createElement("div");
      menu.classList.add("rclick");
      menu.id = "rclickMenu";

      const copyMsg = document.createElement("div");
      copyMsg.classList.add("item");
      copyMsg.innerHTML = "Copy Text <img src='/media/image/icons/copy.png' />";
      copyMsg.onclick = () => {
        copyText(messageData.content);
        if (document.querySelector("html.mobile")) {
          menu.style.bottom = "-100%";
        } else {
          menu.style.opacity = 0;
        }
        setTimeout(() => {
          menu.remove();
        }, 100);
      };
      menu.appendChild(copyMsg);

      const replyMsg = document.createElement("div");
      replyMsg.classList.add("item");
      replyMsg.innerHTML = "Reply <img src='/media/image/icons/reply.png' />";
      replyMsg.onclick = () => {
        replyMessage(msgId, displayName);
        if (document.querySelector("html.mobile")) {
          menu.style.bottom = "-100%";
        } else {
          menu.style.opacity = 0;
        }
        setTimeout(() => {
          menu.remove();
        }, 100);
      };
      menu.appendChild(replyMsg);

      if (username == uname) {
        const editMsg = document.createElement("div");
        editMsg.classList.add("item");
        editMsg.innerHTML = "Edit <img src='/media/image/icons/edit.png' />";
        editMsg.onclick = () => {
          editMessage(msgId, messageData.content);
          if (document.querySelector("html.mobile")) {
            menu.style.bottom = "-100%";
          } else {
            menu.style.opacity = 0;
          }
          setTimeout(() => {
            menu.remove();
          }, 100);
        };
        menu.appendChild(editMsg);

        const deleteMsg = document.createElement("div");
        deleteMsg.classList.add("item");
        deleteMsg.innerHTML =
          "Delete <img src='/media/image/icons/delete.png' />";
        deleteMsg.onclick = () => {
          deleteMessage(msgId);
          if (document.querySelector("html.mobile")) {
            menu.style.bottom = "-100%";
          } else {
            menu.style.opacity = 0;
          }
          setTimeout(() => {
            menu.remove();
          }, 100);
        };
        menu.appendChild(deleteMsg);
      }

      const copyId = document.createElement("div");
      copyId.classList.add("item");
      copyId.innerHTML = "Copy ID <img src='/media/image/icons/id.png' />";
      copyId.onclick = () => {
        copyText(msgId);
        if (document.querySelector("html.mobile")) {
          menu.style.bottom = "-100%";
        } else {
          menu.style.opacity = 0;
        }
        setTimeout(() => {
          menu.remove();
        }, 100);
      };
      menu.appendChild(copyId);

      if (!document.querySelector("html.mobile")) {
        menu.style.left = e.clientX + "px";
        menu.style.top = e.clientY + "px";
      }
      document.body.appendChild(menu);
      while (
        await new Promise((resolve) => setTimeout(() => resolve(longPress)))
      ) {}
      document.addEventListener("click", (e) => {
        if (document.querySelector("html.mobile")) {
          menu.style.bottom = "-100%";
        } else {
          menu.style.opacity = 0;
        }
        setTimeout(() => {
          menu.remove();
        }, 100);
        document.removeEventListener(e.type, arguments.callee);
      });
    }
    msgDiv.addEventListener("contextmenu", (e) => {
      longPress = false;
      e.preventDefault();
      rcmenu(e);
    });

    msgDiv.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const pressTimer = setTimeout(() => {
        longPress = true;
        rcmenu(e);
      }, 500);
      document.addEventListener("mouseup", (e) => {
        clearTimeout(pressTimer);
        document.removeEventListener(e.type, arguments.callee);
        if (longPress) {
          longPress = false;
        }
      });
    });

    msgDiv.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const pressTimer = setTimeout(() => {
        longPress = true;
        rcmenu(e);
      }, 500);
      document.addEventListener("touchend", (e) => {
        clearTimeout(pressTimer);
        document.removeEventListener(e.type, arguments.callee);
        if (longPress) {
          longPress = false;
        }
      });
    });

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

function sendToClients(json) {
  return fetch("/events/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });
}

function replyMessage(id, auth) {
  document.getElementById("msginp").value = "";
  document.getElementById("msginp").focus();
  inputData.type = "reply";
  inputData.id = id;
  const inputType = document.createElement("div");
  const prevType = document.getElementById("inputType");
  if (prevType) prevType.remove();
  inputType.id = "inputType";
  inputType.classList.add("input-type");
  if (!prevType) inputType.style.opacity = 0;
  inputType.innerHTML = `Replying to <span onclick="highlight(${id})">${auth}</span> <img src='/media/image/icons/cancel.png' onclick='removeInputType()' />`;
  document.body.appendChild(inputType);
  setTimeout(() => {
    inputType.style.opacity = 1;
  }, 100);
}

function copyText(txt) {
  navigator.clipboard.writeText(txt);
  popup("Copied text!");
}

function deleteMessage(id) {
  sendToClients({
    type: "messageDelete",
    data: {
      id: id,
    },
    url: url,
  });
}

function editMessage(id, content) {
  const msgInput = document.getElementById("msginp");
  const prevType = document.getElementById("inputType");
  if (prevType) prevType.remove();
  msgInput.value = content;
  msgInput.focus();
  inputData.type = "edit";
  inputData.id = id;
  const inputType = document.createElement("div");
  inputType.id = "inputType";
  inputType.classList.add("input-type");
  if (!prevType) inputType.style.opacity = 0;
  inputType.innerHTML = `Editing <span onclick="highlight(${id})">Message</span> <img src='/media/image/icons/cancel.png' onclick='removeInputType()' />`;
  document.body.appendChild(inputType);
  setTimeout(() => {
    inputType.style.opacity = 1;
  }, 100);
}

function removeInputType() {
  const inputType = document.querySelector(".input-type");
  if (inputType) {
    inputType.style.opacity = 0;
    setTimeout(() => {
      inputType.remove();
    }, 100);
  }
  inputData.type = "message";
  inputData.id = null;
  document.getElementById("msginp").value = "";
}
