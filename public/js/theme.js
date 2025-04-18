let s = JSON.parse(localStorage.getItem("settings"));
if (!s && window.location.href.includes("/chats/")) goto(`/pages/settings`);
document.documentElement.setAttribute("theme", s.general.appTheme);
