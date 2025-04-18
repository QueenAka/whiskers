const defaults = {
  account: {
    pfp: "/media/image/icons/profile.png",
    displayName: "Guest",
    nameColor: "#FFFFFF",
    abtMe: "",
    decor: "none",
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
      cropper(e.target.result);
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
        `.option input[type='checkbox'][group='${type}']`
      );
      toggles.forEach((toggle) => {
        if (toggle.checked) {
          toggle.click();
        }
      });
    }
  });
  saveSettings();
}

function displaySound(value) {
  const aud = new Audio(value);
  aud.play();
  saveSettings();
}

function displayTheme(theme) {
  const root = document.querySelector("html");
  root.setAttribute("theme", theme);
  saveSettings();
}

const pfp = document.getElementById("pfp");
const displayName = document.getElementById("displayName");
const nameColor = document.getElementById("nameColor");
const sPfpDecor = document.getElementById("pfpDecor");
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
const showPfpDecor = document.getElementById("showPfpDecor");
const abtMe = document.getElementById("abtMe");

function displaySettings(json = s) {
  pfp.src = json.account.pfp;
  document.getElementById("profileNav").src = json.account.pfp;
  displayName.value = json.account.displayName;
  nameColor.value = json.account.nameColor;
  sPfpDecor.value = json.account.decor;
  abtMe.value = json.account.abtMe;
  messageSound.value = json.general.messageSound;
  appTheme.value = json.general.appTheme;
  joinMessages.checked = json.general.joinMessages;
  chatSounds.checked = json.general.chatSounds;
  messageEmbeds.checked = json.general.messageEmbeds;
  showPfps.checked = json.general.showPfps;
  showNameColors.checked = json.general.showNameColors;
  showDisplayNames.checked = json.general.showDisplayNames;
  devMode.checked = json.advanced.devMode;
  reconnectPopups.checked = json.advanced.reconnectPopups;
  displayIds.checked = json.advanced.displayIds;
  showPfpDecor.checked = json.general.showPfpDecor;
  displayTheme(json.general.appTheme);
  selectDecor(json.account.decor);
  document.documentElement.style = `--pfp-src: url(${json.account.pfp}); --name-color: ${json.account.nameColor}; --name: "${json.account.displayName}"`;
  abtMe.placeholder = `Who even is ${json.account.displayName}..?`;
}

function saveSettings() {
  s.account.pfp = pfp.src;
  s.account.displayName = displayName.value.slice(0, 30);
  s.account.nameColor = nameColor.value;
  s.account.decor = sPfpDecor.value;
  s.account.abtMe = abtMe.value.slice(0, 300);
  s.general.appTheme = appTheme.value;
  s.general.messageSound = messageSound.value;
  s.general.joinMessages = joinMessages.checked;
  s.general.chatSounds = chatSounds.checked;
  s.general.messageEmbeds = messageEmbeds.checked;
  s.general.showPfps = showPfps.checked;
  s.general.showNameColors = showNameColors.checked;
  s.general.showDisplayNames = showDisplayNames.checked;
  s.advanced.devMode = devMode.checked;
  s.advanced.reconnectPopups = reconnectPopups.checked;
  s.advanced.displayIds = displayIds.checked;
  s.general.showPfpDecor = showPfpDecor.checked;
  localStorage.setItem("settings", JSON.stringify(s));
  document.documentElement.style = `--pfp-src: url(${s.account.pfp}); --name-color: ${s.account.nameColor}; --name: "${s.account.displayName}"`;
  abtMe.placeholder = `Who even is ${s.account.displayName}..?`;
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
  pfpDecor: {
    type: "text",
    title: "Profile Picture Decorations",
    body: "A little decoration to be overlayed ontop of your profile picture",
  },
  showPfpDecor: {
    type: "text",
    title: "Show Profile Picture Decorations",
    body: "Enable or disable weither profile decorations are displayed or not",
  },
  abtMe: {
    type: "text",
    title: "About Me",
    body: "A little blurb (300 character limit) about yourself to be displayed on your profile (supports CatsTail Markdown)",
  },
};

const contexts = document.querySelectorAll(".context");
contexts.forEach((context) => {
  context.addEventListener("click", (e) => {
    overlay(contextObj[context.id.split("-")[1]]);
  });
});

const changeables = document.querySelectorAll(".changeable");
changeables.forEach((sett) => {
  sett.onchange = function () {
    saveSettings();
  };
});

function importSettings() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const json = JSON.parse(e.target.result);
        const requiredKeys = {
          account: ["pfp", "displayName", "nameColor"],
          general: [
            "appTheme",
            "messageSound",
            "joinMessages",
            "chatSounds",
            "messageEmbeds",
            "showPfps",
            "showNameColors",
            "showDisplayNames",
          ],
          advanced: ["devMode", "reconnectPopups", "displayIds"],
        };

        function hasValidKeys(obj, keys) {
          return keys.every((key) => obj.hasOwnProperty(key));
        }

        if (
          typeof json !== "object" ||
          !hasValidKeys(json, Object.keys(requiredKeys)) ||
          !hasValidKeys(json.account, requiredKeys.account) ||
          !hasValidKeys(json.general, requiredKeys.general) ||
          !hasValidKeys(json.advanced, requiredKeys.advanced)
        ) {
          throw new Error("Invalid settings file structure.");
        }
        saveSettings();
        localStorage.setItem("settings", JSON.stringify(json));
        displaySettings(json);
      } catch (error) {
        console.error("Error importing settings:", error.message);
        popup("Invalid settings imported");
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

function exportSettings() {
  const settings = localStorage.getItem("settings");
  if (!settings) {
    console.error("No settings found in localStorage.");
    return;
  }

  const blob = new Blob([settings], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Whiskers_Settings.json";
  a.click();
}

fetch("/api/decors")
  .then((res) => res.json())
  .then((data) => {
    const decors = document.getElementById("decorSelect");
    data.forEach((decor) => {
      const holder = document.createElement("div");
      const image = document.createElement("div");
      const subholder = document.createElement("div");
      const name = document.createElement("div");
      const message = document.createElement("div");
      holder.classList.add("main");
      holder.id = `decorSelect${decor.name}`;
      holder.onclick = () => {
        selectDecor(decor.name);
      };
      image.classList.add("img");
      subholder.style = `--img: url(${decor.url})`;
      subholder.classList.add("sub");
      name.classList.add("name");
      message.classList.add("message");
      message.innerHTML = `Guys look! I got the <b>${decor.name}</b> PFP decoration on!!`;
      subholder.appendChild(image);
      holder.appendChild(subholder);
      holder.appendChild(name);
      holder.appendChild(message);
      decors.appendChild(holder);
    });
  });

function selectDecor(name) {
  document
    .getElementById(`decorSelect${sPfpDecor.value}`)
    ?.classList.remove("selected");
  sPfpDecor.value = name;
  document.getElementById(`decorSelect${name}`)?.classList.add("selected");
  saveSettings();
}

function cropper(imgSrc) {
  const popupHolder = document.createElement("div");
  const popup = document.createElement("div");
  const image = document.createElement("img");
  const container = document.createElement("div");
  container.classList.add("container");
  const cropButton = document.createElement("button");
  const closeButton = document.createElement("button");
  popupHolder.classList.add("overlay-background");
  cropButton.textContent = "Save";
  closeButton.textContent = "Cancel";
  popup.classList.add("popup");
  popupHolder.appendChild(popup);
  container.appendChild(image);
  popup.appendChild(container);
  popup.appendChild(cropButton);
  popup.appendChild(closeButton);
  document.body.appendChild(popupHolder);
  image.src = imgSrc;
  const cropperInstance = new Cropper(image, {
    aspectRatio: 1,
    viewMode: 1,
  });

  cropButton.addEventListener("click", () => {
    const canvas = cropperInstance.getCroppedCanvas({ width: 75, height: 75 });
    const croppedImage = canvas.toDataURL("image/jpeg", 1);
    document.getElementById("pfp").src = croppedImage;
    document.getElementById("profileNav").src = croppedImage;
    saveSettings();
    popupHolder.style.opacity = 0;
    setTimeout(() => {
      popupHolder.remove();
    }, 110);
  });

  closeButton.addEventListener("click", () => {
    popupHolder.style.opacity = 0;
    setTimeout(() => {
      popupHolder.remove();
    }, 110);
  });
}
