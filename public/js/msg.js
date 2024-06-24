const urlObj = new URL(window.location.href);
urlObj.search = "";
urlObj.hash = "";
const url = urlObj.toString();
const inputData = {};
let uname;
let dname;
let lastUser;
let clientId;
let emojiOpened = false;
let loadingMessages = [];
let msgTimeout = setTimeout(() => {
  lastUser = null;
}, 60000);

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
        dname = userData.settings.account.displayName;

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
              joinMessages: s.general.joinMessages,
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
    if (emojiOpened == false) {
      emojiOpened = true;
      let chooser = document.createElement("div");
      chooser.classList = "chooser emoji-list";
      const list = document.createElement("div");
      list.id = "emojiContent";
      allEmojis.forEach((emoji) => {
        list.innerHTML += `<img src='${emoji.url}'  class='list-item' onclick='emojiClick("${emoji.name}")'>`;
      });
      const sideBar = document.createElement("div");
      sideBar.classList = "sidebar";
      sideBar.innerHTML = `
      <img src="/media/image/icons/emoji.png" onclick="loadEmojisBar()" id="emojisIcon" class="on">
      <img src="/media/image/icons/gif.png" onclick="loadGifsBar()" id="gifsIcon">
      <img src="/media/image/icons/image.png" onclick="loadImagesBar()" id="imagesIcon">
      `;
      chooser.appendChild(list);
      chooser.appendChild(sideBar);
      chooser.id = "emojiChooser";
      document.body.appendChild(chooser);
      resolve();
    } else {
      emojiOpened = false;
      let chooser = document.getElementById("emojiChooser");
      chooser.style.animation = "swipedown 0.4s ease-in-out";
      setTimeout(() => {
        chooser.remove();
        resolve();
      }, 300);
    }
  });
}

function loadEmojisBar() {
  if (!emojiOpened) return;
  const emojisIcon = document.getElementById("emojisIcon");
  const gifsIcon = document.getElementById("gifsIcon");
  const imagesIcon = document.getElementById("imagesIcon");
  emojisIcon.classList.add("on");
  gifsIcon.classList.remove("on");
  imagesIcon.classList.remove("on");
  const content = document.getElementById("emojiContent");
  content.innerHTML = "";
  allEmojis.forEach((emoji) => {
    content.innerHTML += `<img src='${emoji.url}'  class='list-item' onclick='emojiClick("${emoji.name}")'>`;
  });
}

function loadGifsBar() {
  if (!emojiOpened) return;
  const emojisIcon = document.getElementById("emojisIcon");
  const gifsIcon = document.getElementById("gifsIcon");
  const imagesIcon = document.getElementById("imagesIcon");
  gifsIcon.classList.add("on");
  emojisIcon.classList.remove("on");
  imagesIcon.classList.remove("on");
  const content = document.getElementById("emojiContent");
  content.innerHTML =
    "<input id='gifSearch'><div id='searchContent' class='img-holder'><p class='lt' style='text-align: center;'>Search for a GIF</p></div>";
  const search = document.getElementById("gifSearch");
  search.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      tenorSearch(search.value, 0);
    }
  });
}

function imgurSearch(q, next) {
  const search = document.getElementById("imageSearch");
  const searchContent = document.getElementById("searchContent");
  if (q.trim() == "") return;
  search.setAttribute("disabled", "");
  searchContent.innerHTML =
    "<p class='lt' style='text-align: center;'>Searching...</p>";
  fetch(`/api/imgur?q=${q}&next=${next}`)
    .then((res) => res.json())
    .then((data) => {
      searchContent.innerHTML = "";
      if (data.images.length == 0)
        searchContent.innerHTML =
          "<p class='lt' style='text-align: center;'>Nothing found</p>";

      data.images.forEach((image) => {
        searchContent.innerHTML += `<img src="${image.link}" onclick="sendTxt('${image.link}')">`;
      });
      if (data.images.length != 0)
        searchContent.innerHTML += `<button onclick="imgurSearch('${q}', ${data.next})">Next Page</button>`;
      search.removeAttribute("disabled");
    });
}

function tenorSearch(q, next) {
  const search = document.getElementById("gifSearch");
  const searchContent = document.getElementById("searchContent");
  if (q.trim() == "") return;
  search.setAttribute("disabled", "");
  searchContent.innerHTML =
    "<p class='lt' style='text-align: center;'>Searching...</p>";
  fetch(`/api/tenor?q=${q}&next=${next}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      searchContent.innerHTML = "";
      if (data.results.length == 0)
        searchContent.innerHTML =
          "<p class='lt' style='text-align: center;'>Nothing found</p>";
      data.results.forEach((gif) => {
        searchContent.innerHTML += `<img src="${gif.media_formats.gif.url}" onclick="sendTxt('${gif.media_formats.gif.url}')">`;
      });
      if (data.results.length != 0)
        searchContent.innerHTML += `<button onclick="tenorSearch('${q}', ${data.next})">Next Page</button>`;
      search.removeAttribute("disabled");
    });
}

function loadImagesBar() {
  if (!emojiOpened) return;
  const emojisIcon = document.getElementById("emojisIcon");
  const gifsIcon = document.getElementById("gifsIcon");
  const imagesIcon = document.getElementById("imagesIcon");
  imagesIcon.classList.add("on");
  emojisIcon.classList.remove("on");
  gifsIcon.classList.remove("on");
  const content = document.getElementById("emojiContent");
  content.innerHTML =
    "<input id='imageSearch'><div id='searchContent' class='img-holder'><p class='lt' style='text-align: center;'>Search for an image</p></div>";
  const search = document.getElementById("imageSearch");
  search.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      imgurSearch(search.value, 1);
    }
  });
}

function emojiClick(name) {
  document.getElementById("msginp").value += ":" + name + ":";
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
        content: `{${inputData.id}} ${msg}`,
        author: {
          username: uname,
          displayName: dname,
          nameColor: s.account.nameColor,
          pfp: s.account.pfp,
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
          nameColor: s.account.nameColor,
          pfp: s.account.pfp,
        },
        tempId: new Date().getTime(),
      }),
      url: url,
    };
  }
  if (inputData.type != "edit") buildMessage(json, "temp");
  sendToClients(json);
}

function sendTxt(txt) {
  const json = {
    type: "messageCreate",
    data: JSON.stringify({
      content: txt,
      author: {
        username: uname,
        displayName: dname,
        nameColor: s.account.nameColor,
        pfp: s.account.pfp,
      },
      tempId: new Date().getTime(),
    }),
    url: url,
  };
  buildMessage(json, "temp");
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
  if (s.advanced.reconnectPopups) popup("Trying to reconnect...");
  if (!online) {
    const offlineDiv = document.createElement("div");
    offlineDiv.id = "offlinePage";
    offlineDiv.classList.add("offline");
    offlineDiv.innerHTML =
      "<center><div class='offline-logo'></div><h3>You are offline! Please connect to the internet and reload to continue!</h3><button onclick='window.location.reload()'>Reload Page</button></center>";
    document.body.appendChild(offlineDiv);
  } else if (s.advanced.reconnectPopups) popup("Reconnected!");
}

async function buildMessage(message, type) {
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
    if (!s.general.showDisplayNames && username != message.id)
      displayName = `@${username}`;
    let nameColor = messageData.author.nameColor;
    if (!s.general.showNameColors) nameColor = "#ffffff";
    const pfp = messageData.author.pfp;
    const dontShowPfp = username == message.id || !s.general.showPfps;
    let appendUser = username != lastUser;
    lastUser = username;
    let messageObject = {};
    messageObject.message = clean(messageData.content);
    messageObject.embeds = [];

    if (s.general.messageEmbeds)
      messageObject = await format(messageData.content, true);

    if (displayName == null) {
      displayName = messageData.content;
      messageObject.message = "";
    }

    const messages = document.getElementById("log");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("msgr");
    if (!dontShowPfp) msgDiv.classList.add("msgr-pfp");
    msgDiv.id = `msg-${msgId}`;

    const topDiv = document.createElement("div");
    topDiv.classList.add("top");

    const pfpDiv = document.createElement("img");
    pfpDiv.classList.add("pfp");
    pfpDiv.src = pfp || "/media/image/icons/profile.png";

    const authorSpan = document.createElement("b");
    authorSpan.id = msgId;
    authorSpan.innerHTML = clean(displayName);
    authorSpan.style.color = nameColor || "white";

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("lt");
    dateSpan.innerHTML = ` ${formateDate(new Date())}`;

    if (!dontShowPfp) topDiv.appendChild(pfpDiv);
    topDiv.appendChild(authorSpan);
    topDiv.appendChild(dateSpan);
    topDiv.innerHTML += "<br>";

    if (appendUser) msgDiv.appendChild(topDiv);

    const bottomSpan = document.createElement("span");
    bottomSpan.classList.add("messageContent");
    bottomSpan.id = `content-${msgId}`;
    let embeds = messageObject.embeds.length > 0;
    let embedDivs = document.createElement("div");
    bottomSpan.innerHTML = messageObject.message;
    if (embeds) {
      messageObject.embeds.forEach(async (embed) => {
        if (embed.media) {
          if (embed.media == "image") {
            let img = document.createElement("img");
            img.src = embed.url;
            img.classList.add("user-img");
            embedDivs.appendChild(img);
          } else if (embed.media == "video" || embed.media == "audio") {
            let doc = document.createElement(embed.media);
            doc.controls = true;
            doc.innerHTML = `<source src="${embed.url}">`;
            doc.classList.add(`user-${embed.media}`);
            embedDivs.appendChild(doc);
          }
        } else {
          const embedDiv = document.createElement("div");
          embedDiv.classList.add("embed");
          embedDiv.onclick = () => {
            window.open(embed.url, "_blank");
          };

          const title = document.createElement("h3");
          title.innerHTML = clean(embed.title);
          embedDiv.appendChild(title);

          const description = document.createElement("p");
          description.innerHTML = clean(embed.description);
          embedDiv.appendChild(description);

          if (embed.image) {
            const image = document.createElement("img");
            image.src = embed.image;
            embedDiv.appendChild(image);
          }

          embedDivs.appendChild(embedDiv);
        }
      });
    }

    const bottomDiv = document.createElement("div");
    bottomDiv.appendChild(bottomSpan);
    msgDiv.appendChild(bottomDiv);
    msgDiv.appendChild(embedDivs);
    if (appendUser) {
      const spacer = document.createElement("div");
      spacer.classList.add("spacer");
      messages.appendChild(spacer);
    }
    messages.appendChild(msgDiv);

    let longPress = false;

    const content = messageData.content;

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
        copyText(content);
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
          editMessage(msgId, "");
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

      if (s.advanced.displayIds) {
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
      }

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

    aud = s.account.messageSound;
    if (username != uname) {
      var audio = new Audio(aud);
      audio.loop = false;
      audio.play();
    }

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
  inputType.innerHTML = ` <img src='/media/image/icons/cancel.png' onclick='removeInputType()' /> Replying to <span onclick="highlight(${id})">${auth}</span>`;
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
  inputType.innerHTML = `<img src='/media/image/icons/cancel.png' onclick='removeInputType()' /> Editing <span onclick="highlight(${id})">Message</span> `;
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

function uploadMedia() {
  const input = document.getElementById("uploadMedia");
  input.click();
  input.onchange = () => {
    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          popup(data.error);
        } else {
          sendTxt(`https://${urlObj.host}/media/uploads/${data.url}`);
        }
      });
  };
}
