console.clear();
let consoleBigRed = "color:red; font-size:40px;";
console.log("%cSTOP!!", consoleBigRed);
console.log(
  "To keep you safe, and make sure your client doesnt break, we suggest that you do not run code here unless you know EXACTLY what you are doing.\nLove from the Whiskers Team <3",
);

let params = new URLSearchParams(window.location.search);
const popupParam = params.get("p");
if (popupParam) {
  params = params.delete("p");
  const updatedUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  window.history.pushState({}, "", updatedUrl);
}

let allEmojis = [];
let userData;
let s = JSON.parse(localStorage.getItem("settings"));
if (!s && window.location.href.includes("/chats/")) goto(`/pages/settings`);
if (s) {
  document.getElementById("profileNav").src = s.account.pfp;
  document.querySelector("html").setAttribute("theme", s.general.theme);
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
  const userRegex = /@([a-zA-Z0-9_]+)\b/g;
  let builtEmbeds = [];

  msg = msg
    .trim()
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
    .replace(userRegex, function (match) {
      let username = match.replace("@", "");
      const href = `<a href="/user/${username}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      return href;
    })
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

function clean(msg) {
  const codeRegex = /`(.*?)`/g;
  const emojiRegex = /:(.*?):/g;
  const linkRegex =
    /\b((http|https|ftp|ws|wss):\/\/[\w\-_]+(\.[\w\-_]+)+[/\w\-\.,@?^=%&:\/~\+]*[\w\-\@?^=%&\/~\+])/g;
  const headerRegex = /^(#{1,6})\s(.*)$/gm;
  const italicsRegex = /\*(.*?)\*/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const strikethroughRegex = /~~(.*?)~~/g;
  const underlineRegex = /_(.*?)_/g;
  const userRegex = /@([a-zA-Z0-9_]+)\b/g;
  msg = msg
    .trim()
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
    .replace(userRegex, function (match) {
      let username = match.replace("@", "");
      const href = `<a href="/user/${username}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      return href;
    })
    .replace(/\n/g, "<br>");

  return msg;
}

function overlay(data, id = `overlay-${Date.now()}`) {
  if (!data || !data.type) throw new Error("Overlay type not specified");
  if (!data.title) throw new Error("Overlay title not specified");
  if (data.type == "text") {
    const overlayBg = document.createElement("div");
    overlayBg.classList = "overlay-background";
    overlayBg.id = id;
    overlayBg.style.opacity = 0;
    overlayBg.onclick = (e) => {
      if (e.target != overlayBg) return;
      closeOverlay(id);
    };
    function keyDown(e) {
      if (e.key == "Escape") {
        e.preventDefault();
        document.removeEventListener(e, keyDown);
        closeOverlay(id);
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
    overlayBg.id = id;
    overlayBg.style.opacity = 0;
    overlayBg.onclick = (e) => {
      if (e.target != overlayBg) return;
      closeOverlay(id);
    };
    function keyDown(e) {
      if (e.key == "Escape") {
        e.preventDefault();
        document.removeEventListener(e, keyDown);
        closeOverlay(id);
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
  return id;
}

function closeOverlay(id) {
  const overlay = document.getElementById(id);
  overlay.style.opacity = 0;
  setTimeout(() => {
    overlay.remove();
  }, 100);
}

const load = document.querySelector("load");
setTimeout(() => {
  load.style.opacity = 0;
  setTimeout(() => {
    load.remove();
    if (popupParam) {
      popup(popupParam);
    }
  }, 100);
}, 750);

function copyText(txt) {
  navigator.clipboard.writeText(txt);
  popup("Copied text!");
}

function download(str, format, name = "download") {
  const el = document.createElement("a");
  const mimeTypes = {
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    xml: "application/xml",
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    exe: "application/octet-stream",
  };

  let mimeType;
  if (mimeTypes[format]) {
    mimeType = mimeTypes[format];
  } else {
    console.warn(`Unsupported file extension: ${format}`);
    return;
  }

  el.setAttribute(
    "href",
    `data:${mimeType};charset=utf-8,${encodeURIComponent(str)}`,
  );
  el.setAttribute("download", `${name}.${format}`);
  el.style.display = "none";
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
}
