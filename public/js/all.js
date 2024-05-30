const userN = localStorage.getItem("name");

fetch("/api/settings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: userN,
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
      localStorage.setItem("userData", JSON.stringify(data.json));
      const userD = JSON.parse(localStorage.getItem("userData"));
      if (userD != null) {
        if (window.location.href.includes("/pages/user"))
          goto("/pages/settings");
      } else if (window.location.href.includes("chats")) {
        goto("/pages/user");
      }
    }
  });

function goto(url) {
  window.location.href = url;
}

class GlobalVariables {
  constructor() {}
  get(v) {
    const varAndArg = v.split(".");
    const varName = varAndArg[0];
    const arg = varAndArg[1];
    this[varName](arg);
  }
  chat(args) {
    if (args == "name") {
      const id = window.location.href.split("/chat/")[0];
      if (id) {
        fetch(`/api/chat/${id}/settings`)
          .then((res) => res.json())
          .then((data) => {
            return data.name;
          });
      } else {
        return null;
      }
    } else if (args == "owner") {
      const id = window.location.href.split("/chat/")[0];
      if (id) {
        fetch(`/api/chat/${id}/settings`)
          .then((res) => res.json())
          .then((data) => {
            return data.author;
          });
      } else {
        return null;
      }
    } else if (args == "id") {
      const id = window.location.href.split("/chat/")[0];
      if (id) {
        return id;
      } else {
        return null;
      }
    } else if (args == "settings") {
      const id = window.location.href.split("/chat/")[0];
      if (id) {
        fetch(`/api/chat/${id}/settings`)
          .then((res) => res.json())
          .then((data) => {
            return data;
          });
      } else {
        return null;
      }
    }
  }
}
