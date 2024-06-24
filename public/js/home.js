function select(id) {
  const tabs = [
    "tab-news",
    "tab-publicChats",
    "tab-joinChat",
    "tab-createChat",
  ];
  tabs.forEach((tabId) =>
    document.getElementById(tabId).classList.remove("active"),
  );
  const contentIds = ["news", "publicChats", "joinChat", "createChat"];
  contentIds.forEach(
    (contentId) => (document.getElementById(contentId).style.display = "none"),
  );
  const selectedTabId = `tab-${id}`;
  const selectedContentId = id;
  document.getElementById(selectedTabId).classList.add("active");
  document.getElementById(selectedContentId).style.display = "block";
}

setTimeout(() => {
  fetch("/api/updates")
    .then((res) => res.json())
    .then((data) => {
      data.forEach(async (update) => {
        const updateDiv = document.createElement("div");
        updateDiv.classList.add("chat-card");

        const updateHead = document.createElement("div");
        updateHead.classList.add("head");

        const updateTitle = document.createElement("h3");
        updateTitle.innerHTML = clean(update.name);
        updateTitle.classList = "name";

        const updateTimestamp = document.createElement("p");
        updateTimestamp.innerHTML = `${update.timestamp}`;
        updateTimestamp.classList = "author";

        updateHead.appendChild(updateTitle);
        updateHead.appendChild(updateTimestamp);

        const updateDescription = document.createElement("div");
        updateDescription.innerHTML = clean(update.description);
        updateDescription.classList = "desc";

        updateDiv.appendChild(updateHead);
        updateDiv.appendChild(updateDescription);
        document.getElementById("news").appendChild(updateDiv);
      });
    });

  fetch("/api/chats")
    .then((res) => res.json())
    .then((data) => {
      data.forEach(async (chat) => {
        const chatDiv = document.createElement("div");
        chatDiv.classList.add("chat-card");

        const chatHead = document.createElement("div");
        chatHead.classList.add("head");

        const chatTitle = document.createElement("h3");
        chatTitle.innerHTML = clean(chat.name);
        chatTitle.classList = "name";

        const chatAuthor = document.createElement("p");
        chatAuthor.innerHTML = `@${chat.author}`;
        chatAuthor.classList = "author";

        chatHead.appendChild(chatTitle);
        chatHead.appendChild(chatAuthor);

        const chatDescription = document.createElement("p");
        chatDescription.innerHTML = clean(chat.description);
        chatDescription.classList = "desc";

        chatDiv.appendChild(chatHead);
        chatDiv.appendChild(chatDescription);
        chatDiv.onclick = () => {
          goto(`/chats/${chat.id}`);
        };
        document.getElementById("publicChats").appendChild(chatDiv);
      });
    });
}, 500);