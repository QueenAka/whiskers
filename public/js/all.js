console.clear();
let consoleBigRed = "color:red; font-size:40px;";
console.log("%cSTOP!!", consoleBigRed);
console.log(
  "If you do not know what you are doing, you could be in danger of losing your account!\nDo not run code here unless you know EXACTLY what you are doing.\nLove from the Whiskers Team <3",
);

const accountName = localStorage.getItem("account");
let allEmojis = [];
let userData;
let s;

if (!accountName) {
  if (window.location.href.includes("/pages/chats"))
    goto(`/pages/user?r=${window.location.href}`);
  if (window.location.href.includes("/pages/settings")) goto("/pages/user");
}

if (accountName) {
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
        if (window.location.href.includes("/pages/chats"))
          goto(`/pages/user?r=${window.location.href}`);
        else if (window.location.href.includes("/pages/settings"))
          goto("/pages/user");
        return;
      } else {
        userData = data.json;
        if (userData != null) {
          if (window.location.href.includes("/pages/user"))
            goto("/pages/settings");
        }
        s = userData.settings;
        document
          .querySelector("html")
          .setAttribute("theme", s.general.appTheme);
        document.querySelector("img.user").src = s.account.pfp;
      }
    });
}

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
  notif.innerHTML = clean(txt);
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

async function format(msg, embeds) {
  if (!msg || msg == "")
    return {
      embeds: [],
      message: "",
    };
  const codeRegex = /`(.*?)`/g;
  const emojiRegex = /:(.*?):/g;
  const linkRegex =
    /\b((http|https|ftp|ws|wss):\/\/[\w\-_]+(\.[\w\-_]+)+[/\w\-\.,@?^=%&:\/~\+]*[\w\-\@?^=%&\/~\+])/g;
  const headerRegex = /^(#{1,6})\s(.*)$/gm;
  const replyRegex = /\{.*?\}/g;
  const italicsRegex = /\*(.*?)\*/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const strikethroughRegex = /~~(.*?)~~/g;
  const underlineRegex = /__(.*?)__/g;
  let builtEmbeds = [];

  msg = msg
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(headerRegex, function (match, p1, p2) {
      let level = p1.length;
      let tag = `<h${level}>${p2}</h${level}>`;
      return tag;
    })
    .replace(emojiRegex, function (name) {
      const emoji = allEmojis.find((emoji) => emoji.name == name.slice(1, -1));
      if (emoji)
        return `<img class="emoji" src="${emoji.url}" alt="${emoji.name}">`;
      return name;
    })
    .replace(codeRegex, `<code>$1</code>`)
    .replace(linkRegex, function (url) {
      const cleanUrl = url.replace(/^([^:]*):/, "$1://");
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    })
    .replace(boldRegex, "<b>$1</b>")
    .replace(italicsRegex, "<i>$1</i>")
    .replace(strikethroughRegex, "<s>$1</s>")
    .replace(underlineRegex, "<u>$1</u>")
    .replace(replyRegex, function (match) {
      let msgId = match.replace("{", "").replace("}", "");
      let doc = document.getElementById(msgId);
      if (!doc) {
        return match;
      } else {
        let txt = doc.innerHTML;
        return `<a href="#" onclick="highlight('${msgId}')" class="replyBlock"><reply>Replying to ${removeReply(
          txt,
        )}</reply></a>`;
      }
    })
    .replace(/\\/g, "<span class='none'>\\</span>")
    .replace(/\n/g, "<br>");

  if (embeds) {
    links = msg.match(linkRegex);
    if (links) {
      for (const link of links) {
        const json = JSON.stringify({
          url: link,
        });
        const meta = await fetch("/api/meta", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: json,
        });
        const data = await meta.json();
        if (data.error) continue;
        if (!data.media) {
          let title = data["og:title"] || data["twitter:title"] || data.title;
          let desc =
            data["og:description"] ||
            data["twitter:description"] ||
            data.description;
          let image =
            data["og:image"] ||
            data["twitter:image"] ||
            data.favicons[0] ||
            data.image ||
            null;
          if (!title && !desc) continue;
          let embedJson = {
            url: data.url,
            title: title,
            description: desc,
            image: image,
          };
          builtEmbeds.push(embedJson);
        } else {
          builtEmbeds.push({
            media: data.media,
            url: data.url,
          });
        }
      }
    }
  }

  const resJson = {
    message: msg,
    embeds: builtEmbeds,
  };
  return resJson;
}

function clean(msg, embeds) {
  const codeRegex = /`(.*?)`/g;
  const emojiRegex = /:(.*?):/g;
  const linkRegex =
    /\b((http|https|ftp|ws|wss):\/\/[\w\-_]+(\.[\w\-_]+)+[/\w\-\.,@?^=%&:\/~\+]*[\w\-\@?^=%&\/~\+])/g;
  const headerRegex = /^(#{1,6})\s(.*)$/gm;
  const italicsRegex = /\*(.*?)\*/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const strikethroughRegex = /~~(.*?)~~/g;
  const underlineRegex = /_(.*?)_/g;
  let builtEmbeds = [];

  msg = msg
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(headerRegex, function (match, p1, p2) {
      let level = p1.length;
      let tag = `<h${level}>${p2}</h${level}>`;
      return tag;
    })
    .replace(emojiRegex, function (name) {
      const emoji = allEmojis.find((emoji) => emoji.name == name.slice(1, -1));
      if (emoji)
        return `<img class="emoji" src="${emoji.url}" alt="${emoji.name}">`;
      return name;
    })
    .replace(codeRegex, `<code>$1</code>`)
    .replace(linkRegex, function (url) {
      const cleanUrl = url.replace(/^([^:]*):/, "$1://");
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    })
    .replace(boldRegex, "<b>$1</b>")
    .replace(italicsRegex, "<i>$1</i>")
    .replace(strikethroughRegex, "<s>$1</s>")
    .replace(underlineRegex, "<u>$1</u>")
    .replace(/\\/g, "<span class='none'>\\</span>")
    .replace(/\n/g, "<br>");

  return msg;
}

function overlay(data) {
  if (!data || !data.type) throw new Error("Overlay type not specified");
  if (!data.title) throw new Error("Overlay title not specified");
  if (data.type == "text") {
    const overlayBg = document.createElement("div");
    overlayBg.classList = "overlay-background";
    overlayBg.style.opacity = 0;
    overlayBg.onclick = (e) => {
      if (e.target != overlayBg) return;
      overlayBg.style.opacity = 0;
      setTimeout(() => {
        overlayBg.remove();
      }, 100);
    };
    function keyDown(e) {
      if (e.key == "Escape") {
        e.preventDefault();
        document.removeEventListener(e, keyDown);
        overlayBg.style.opacity = 0;
        setTimeout(() => {
          overlayBg.remove();
        }, 100);
      }
    }
    document.addEventListener("keydown", keyDown);

    const overlay = document.createElement("div");
    overlay.classList = "overlay";

    const title = document.createElement("h3");
    title.innerHTML = data.title;
    title.classList.add("title");

    const text = document.createElement("p");
    text.innerHTML = data.body;
    title.classList.add("body");

    overlay.appendChild(title);
    overlay.appendChild(text);
    overlayBg.appendChild(overlay);
    document.body.appendChild(overlayBg);
    setTimeout(() => {
      overlayBg.style.opacity = 1;
    }, 100);
  } else if (data.type == "html") {
    const overlayBg = document.createElement("div");
    overlayBg.classList = "overlay-background";
    overlayBg.style.opacity = 0;
    overlayBg.onclick = (e) => {
      if (e.target != overlayBg) return;
      overlayBg.style.opacity = 0;
      setTimeout(() => {
        overlayBg.remove();
      }, 100);
    };
    function keyDown(e) {
      if (e.key == "Escape") {
        e.preventDefault();
        document.removeEventListener(e, keyDown);
        overlayBg.style.opacity = 0;
        setTimeout(() => {
          overlayBg.remove();
        }, 100);
      }
    }
    document.addEventListener("keydown", keyDown);

    const overlay = document.createElement("div");
    overlay.classList = "overlay";

    const title = document.createElement("h3");
    title.innerHTML = data.title;
    title.classList.add("title");

    const text = document.createElement("div");
    text.innerHTML = data.body;
    title.classList.add("body");

    overlay.appendChild(title);
    overlay.appendChild(text);
    overlayBg.appendChild(overlay);
    document.body.appendChild(overlayBg);
    setTimeout(() => {
      overlayBg.style.opacity = 1;
    }, 100);
  }
}

const load = document.querySelector("load");
setTimeout(() => {
  load.style.opacity = 0;
  setTimeout(() => {
    load.remove();
  }, 100);
}, 750);
