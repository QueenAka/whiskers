setTimeout(() => {
  const uname = localStorage.getItem("uname");
  if (uname == null && window.location.href.includes("chats")) {
    goto("/pages/user");
  }
}, 500);

function clean(msg) {
  const emojiRegex = /:.*?:/;
  const italicsRegex = /\*(.*?)\*/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const strikethroughRegex = /~~(.*?)~~/g;
  const underlineRegex = /_(.*?)_/g;
  msg = msg.replace(/</g, "&lt;");
  msg = msg.replace(/\s/g, "&nbsp;");
  msg = msg.replace(emojiRegex, function (name) {
    const emoji = allEmojis.find((emoji) => emoji.name == name.slice(1, -1));
    if (emoji) {
      return `<img class="emoji" src="${emoji.url}" alt="${emoji.name}">`;
    }
    return name;
  });
  msg = msg.replace(boldRegex, "<b>$1</b>");
  msg = msg.replace(italicsRegex, "<i>$1</i>");
  msg = msg.replace(strikethroughRegex, "<del>$1</del>");
  msg = msg.replace(underlineRegex, "<u>$1</u>");
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