const accountName = localStorage.getItem("account");
let allEmojis = [];
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
      localStorage.removeItem("name");
      localStorage.removeItem("userData");
      return;
    }
    if (data.res == "Success") {
      userData = data.json;
      if (userData != null) {
        if (window.location.href.includes("/pages/user"))
          goto("/pages/settings");
      } else if (window.location.href.includes("chats")) {
        goto("/pages/user?r=" + window.location.href);
      }
    }
  });

fetch("/api/emojis")
  .then((res) => res.json())
  .then((emojis) => {
    emojis.forEach((emoji) => {
      allEmojis.push(emoji);
    });
  });

function goto(url) {
  window.location.href = url;
}

function popup(txt) {
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

const userAgent = navigator.userAgent;
if (userAgent.includes("WhiskersDesktop")) {
  const dragBar = document.createElement("div");
  dragBar.classList = "drag-bar";
  document.querySelector("html").classList.add("desktopApp");
  document.body.appendChild(dragBar);
}

const mobileRegex =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Nokia|SonyEricsson|SCH-M\d+|Windows CE|SymbianOS|PlayBook|Silk|Kindle|Bolt|Iris|UCWEB|Series40|S40OviBrowser|XBLWP|Dell|LGE|Lenovo|MobiFire|NetFront|LG|NEC-ASPIRE|Alcatel|ZTE|Toshiba|Huawei|Coolpad|LeEco|Vivo|OPPO|OnePlus|Meizu|Google|Pixel|Galaxy|Nexus|ASUS|Panasonic|HTC|Motorola|Razer|Yulong|Umidigi|Flyme|HarmonyOS|Honor|Realme|Vsmart|IQOO|Redmi|Mi|Blu|ZTE|Hisense|Infinix|Tecno|Nubia|Smartisan|Gionee/;
if (mobileRegex.test(userAgent)) {
  document.querySelector("html").classList.add("mobile");
}

function clean(msg) {
  const codeRegex = /`(.*?)`/g;
  const emojiRegex = /:(.*?):/g;
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const headerRegex = /^(#{1,6})\&nbsp\;(.*)$/gm;
  const replyRegex = /\{.*?\}/g;
  const italicsRegex = /\*(.*?)\*/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const strikethroughRegex = /~~(.*?)~~/g;
  const underlineRegex = /_(.*?)_/g;
  msg = msg.replace(/</g, "&lt;");
  msg = msg.replace(headerRegex, function (match, p1, p2) {
    let level = p1.length;
    let tag = `<h${level}>${p2}</h${level}>`;
    return tag;
  });
  msg = msg.replace(emojiRegex, function (name) {
    const emoji = allEmojis.find((emoji) => emoji.name == name.slice(1, -1));
    if (emoji)
      return `<img class="emoji" src="${emoji.url}" alt="${emoji.name}">`;
    return name;
  });
  msg = msg.replace(codeRegex, `<code>$1</code>`);
  msg = msg.replace(linkRegex, `<a href="$1" target="_blank">$1</a>`);
  msg = msg.replace(boldRegex, "<b>$1</b>");
  msg = msg.replace(italicsRegex, "<i>$1</i>");
  msg = msg.replace(strikethroughRegex, "<s>$1</s>");
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
  msg = msg.replace(/\\/g, "<span class='none'>\\</span>");
  msg = msg.replace(/\n/g, "<br>");
  return msg;
}
