let userData;
let uname;
let dname;
let lastUser;
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
        let client = null;
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
            client = new EventSource(`/events/get?id=${data.id}`);
            client.addEventListener("message", function (event) {
              let message = JSON.parse(event.data);
              if (
                message.type == "messageCreate" &&
                message.url == window.location.href
              ) {
                let msgId = message.id;
                resetTimer();
                messageData = JSON.parse(message.data);
                console.log(messageData);
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

                const replyDiv = document.createElement("div");
                replyDiv.classList.add("reply");
                replyDiv.innerHTML = "Reply";
                replyDiv.onclick = function () {
                  reply(msgId);
                };

                const copyDiv = document.createElement("div");
                copyDiv.classList.add("copy");
                copyDiv.innerHTML = "Copy";
                copyDiv.onclick = function () {
                  copy(removeReply(messageData.content));
                };

                const bottomDiv = document.createElement("div");
                bottomDiv.appendChild(bottomSpan);
                bottomDiv.appendChild(replyDiv);
                bottomDiv.appendChild(copyDiv);
                msgDiv.appendChild(bottomDiv);
                messages.appendChild(msgDiv);

                resetTimer();

                aud = "/media/audio/meow.mp3";
                if (userData.settings.notifSounds != false) {
                  var audio = new Audio(aud);
                  audio.loop = false;
                  audio.play();
                }
                messages.scrollTop = messages.scrollHeight;
              }
            });
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

        allEmojis = [];

        fetch("/api/emojis")
          .then((res) => res.json())
          .then((emojis) => {
            emojis.forEach((emoji) => {
              allEmojis.push(emoji);
            });
          });
      }
    } else {
      goto("/pages/user?r=" + window.location.href);
    }
  });

let msgTimeout = setTimeout(() => {
  lastUser = null;
  console.log("Resetted");
}, 60000);

function highlight(id) {
  let doc = document.getElementById(`msg-${id}`);
  doc.style.background = "var(--sp)";
  setTimeout(() => {
    doc.style.background = "";
  }, 1000);
}

let emojiOpened = false;
function emoji() {
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
      }, 75);
    }, 125);
  }
}

function emojiClick(name) {
  document.getElementById("msginp").value += ":" + name + ":";
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
    }),
    url: window.location.href.split("#")[0],
  };
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

function clean(msg) {
  const emojiRegex = /:.*?:/g;
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const headerRegex = /^(#{1,6})\s+(.*)$/gm;
  const replyRegex = /\{.*?\}/g;
  const italicsRegex = /\*(.*?)\*/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const strikethroughRegex = /~~(.*?)~~/g;
  const underlineRegex = /_(.*?)_/g;
  const id = Math.floor(Math.random() * 100000000);
  msg = msg.replace(/</g, "&lt;");
  msg = msg.replace(headerRegex, function (match, p1, p2) {
    let level = p1.length;
    let tag = `<h${level}>${p2}</h${level}>`;
    return tag;
  });
  msg = msg.replace(emojiRegex, function (name) {
    const emoji = allEmojis.find((emoji) => emoji.name == name.slice(1, -1));
    if (emoji) {
      return `<img class="emoji" src="${emoji.url}" alt="${emoji.name}">`;
    }
    return name;
  });
  msg = msg.replace(linkRegex, `<a href="$1" target="_blank">$1</a>`);
  msg = msg.replace(boldRegex, "<b>$1</b>");
  msg = msg.replace(italicsRegex, "<i>$1</i>");
  msg = msg.replace(strikethroughRegex, "<del>$1</del>");
  msg = msg.replace(underlineRegex, "<u>$1</u>");
  msg = msg.replace(replyRegex, function (match) {
    let msgId = match.replace("{", "").replace("}", "");
    let doc = document.getElementById(msgId);
    if (!doc) {
      return match;
    } else {
      let txt = doc.innerHTML;
      lastUser = null;
      return `<a href="#${msgId}" onclick="highlight('${msgId}')" class="replyBlock"><reply>Replying to ${removeReply(
        txt,
      )}</reply></a>`;
    }
  });
  msg = msg.replace("\\", "<span class='none'>\\</span>");
  return msg;
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
  document.getElementById("msginp").value = "{" + msg + "} ";
  document.getElementById("msginp").focus();
}

function copy(txt) {
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
