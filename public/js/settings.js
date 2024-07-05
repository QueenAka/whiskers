const defaults = {
  account: {
    pfp: "/media/image/icons/profile.png",
    displayName: "Guest",
    nameColor: "#FFFFFF",
  },
  general: {
    appTheme: "poppy-seed",
    messageSound: "/media/audio/meow.mp3",
    joinMessages: true,
    chatSounds: true,
    messageEmbeds: true,
    showPfps: true,
    showNameColors: true,
    showDisplayNames: true,
  },
  advanced: {
    devMode: false,
    reconnectPopups: false,
    displayIds: false,
  },
};
setTimeout(() => {
  if (!s) {
    console.log("No S");
    s = defaults;
    localStorage.setItem("settings", JSON.stringify(s));
  }
  displaySettings();
}, 500);

const imgInput = document.getElementById("image-input");
imgInput.addEventListener("change", function (e) {
  if (e.target.files && e.target.files[0]) {
    const imageFile = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        let maxWidth = 75;
        let maxHeight = 75;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let optimizedDataUrl = canvas.toDataURL("image/jpeg", 1);
        document.getElementById("pfp").src = optimizedDataUrl;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  }
});

function toggle(id) {
  const content = document.getElementById(id + "-content");
  const toggle = document.getElementById(id + "-toggle");

  if (content.classList.contains("open")) {
    content.style.height = "0";
    toggle.style.transform = "rotate(0deg)";
    content.classList.remove("open");
  } else {
    const height = content.scrollHeight;
    content.style.height = height + "px";
    toggle.style.transform = "rotate(180deg)";
    content.classList.add("open");
  }
}

function toggleSettings(type) {
  const settings = document.querySelectorAll(`.option[type=${type}]`);
  settings.forEach((setting) => {
    if (setting.classList.contains("disabled")) {
      setting.classList.remove("disabled");
    } else {
      setting.classList.add("disabled");
      const toggles = document.querySelectorAll(
        `.option input[type='checkbox'][group='${type}']`,
      );
      toggles.forEach((toggle) => {
        if (toggle.checked) {
          toggle.click();
        }
      });
    }
  });
}

function displaySound(value) {
  const aud = new Audio(value);
  aud.play();
}

function displayTheme(theme) {
  const root = document.querySelector("html");
  root.setAttribute("theme", theme);
}

const pfp = document.getElementById("pfp");
const displayName = document.getElementById("displayName");
const nameColor = document.getElementById("nameColor");
const messageSound = document.getElementById("messageSound");
const appTheme = document.getElementById("appTheme");
const joinMessages = document.getElementById("joinMessages");
const chatSounds = document.getElementById("chatSounds");
const pushNotif = document.getElementById("pushNotif");
const messageEmbeds = document.getElementById("messageEmbeds");
const showPfps = document.getElementById("showPfps");
const showNameColors = document.getElementById("showNameColors");
const showDisplayNames = document.getElementById("showDisplayNames");
const devMode = document.getElementById("devMode");
const reconnectPopups = document.getElementById("reconnectPopups");
const displayIds = document.getElementById("displayIds");

function displaySettings() {
  pfp.src = s.account.pfp;
  displayName.value = s.account.displayName;
  nameColor.value = s.account.nameColor;
  messageSound.value = s.general.messageSound;
  appTheme.value = s.general.appTheme;
  joinMessages.checked = s.general.joinMessages;
  chatSounds.checked = s.general.chatSounds;
  messageEmbeds.checked = s.general.messageEmbeds;
  showPfps.checked = s.general.showPfps;
  showNameColors.checked = s.general.showNameColors;
  showDisplayNames.checked = s.general.showDisplayNames;
  devMode.checked = s.advanced.devMode;
  reconnectPopups.checked = s.advanced.reconnectPopups;
  displayIds.checked = s.advanced.displayIds;
  displayTheme(s.general.appTheme);
}

function saveSettings(type) {
  if (type == "account") {
    s.account.pfp = pfp.src;
    s.account.displayName = displayName.value;
    s.account.nameColor = nameColor.value;
  } else if (type == "general") {
    s.general.appTheme = appTheme.value;
    s.general.messageSound = messageSound.value;
    s.general.joinMessages = joinMessages.checked;
    s.general.chatSounds = chatSounds.checked;
    s.general.messageEmbeds = messageEmbeds.checked;
    s.general.showPfps = showPfps.checked;
    s.general.showNameColors = showNameColors.checked;
    s.general.showDisplayNames = showDisplayNames.checked;
  } else {
    s.advanced.devMode = devMode.checked;
    s.advanced.reconnectPopups = reconnectPopups.checked;
    s.advanced.displayIds = displayIds.checked;
  }
  localStorage.setItem("settings", JSON.stringify(s));
  popup(`Saved ${type} settings!`);
}

function resetSettings(type) {
  s[type] = defaults[type];
  displaySettings();
}

const contextObj = {
  nameColor: {
    type: "text",
    title: "Name Color",
    body: "Choose a color for your name while in chats",
  },
  messageSound: {
    type: "text",
    title: "Message Sound",
    body: "Set a sound to be played when a message is sent",
  },
  joinMessages: {
    type: "text",
    title: "Alert Messages",
    body: "Enable or disable message from being sent when you join or leave a chat",
  },
  chatSounds: {
    type: "text",
    title: "Chat Sounds",
    body: "Enable or disable weither sounds are played when a message is sent",
  },
  messageEmbeds: {
    type: "text",
    title: "Message Embeds",
    body: "Enable or disable weither messages sent in chats can have embedded content",
  },
  showPfps: {
    type: "text",
    title: "Show Profile Pictures",
    body: "Enable or disable weither profile pictures are shown in chats",
  },
  showNameColors: {
    type: "text",
    title: "Show Name Colors",
    body: "Enable or disable weither name colors are shown in chats",
  },
  showDisplayNames: {
    type: "text",
    title: "Show Display Names",
    body: "Enable or disable weither display names are shown in chats",
  },
  devMode: {
    type: "text",
    title: "Developer Mode",
    body: "Enable or disable developer mode",
  },
  reconnectPopups: {
    type: "text",
    title: "Error Popups",
    body: "Enable or disable weither popups are shown when a client side error occurs",
  },
  displayIds: {
    type: "text",
    title: "Copy IDs",
    body: "Enable or disable weither the option to copy IDs are shown",
  },
};
const contexts = document.querySelectorAll(".context");
contexts.forEach((context) => {
  context.addEventListener("click", (e) => {
    overlay(contextObj[context.id.split("-")[1]]);
  });
});
