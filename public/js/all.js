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
        if(window.location.href.includes("/pages/user")) goto("/pages/settings")
      } else if(window.location.href.includes("chats")) {
        goto("/pages/user")
      }
    }
  });

const logo = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--noto" preserveAspectRatio="xMidYMid meet" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M114.67 70.19C112.71 44.22 94.44 26.3 64 26.3S15.25 45.33 13.45 71.31c-1.05 15.14 4.58 28.63 15.91 36.32c7.46 5.07 17.88 7.88 34.77 7.88c17.18 0 27.03-3.71 34.49-8.73c12.43-8.35 17.18-21.67 16.05-36.59z" fill="#ffffff"> </path> <path d="M53.72 42.6C46.3 23.4 30.1 10.34 23.87 8.39c-2.35-.74-5.3-.81-6.63 1.35c-3.36 5.45-7.66 22.95 1.85 47.78L53.72 42.6z" fill="#ffffff"> </path> <path d="M36.12 34.21c1.54-1.29 2.29-2.55.6-5.16c-2.62-4.05-7.33-8.78-9.16-10.23c-3-2.38-5.32-3.18-6.21.65c-1.65 7.08-1.52 16.69.25 21.99c.62 1.87 2.54 2.86 4.02 1.57l10.5-8.82z" fill="#fffffffd1d1"> </path> <path d="M54.12 45.02c1.13.96 3.42.82 4.75-.72c1.61-1.87 3.29-8.17 2.24-17.91c-4.67.17-9.09.84-13.21 1.97c3.33 5.46 4.13 14.88 6.22 16.66z" fill="#fffffff9b31"> </path> <path d="M73.88 45.02c-1.13.96-3.42.82-4.75-.72c-1.61-1.87-3.29-8.17-2.24-17.91c4.67.17 9.09.84 13.21 1.97c-3.33 5.46-4.13 14.88-6.22 16.66z" fill="#fffffff9b31"> </path> <path d="M79.9 29.22c8.08-12.41 19.38-20.75 24.07-22.24c2.32-.74 5.02-.62 6.34 1.55c3.32 5.45 6.13 22.24-.42 45.75L85.96 42.74L79.9 29.22z" fill="#ffffff"> </path> <path d="M97.55 38.23c2.43 2.43 4.41 4.06 5.84 5.61c.95 1.03 2.69.56 2.97-.82c2.45-11.8 1.67-21.86 0-24.5c-.8-1.26-2.29-1.59-3.65-1.13c-2.44.81-8.66 5.45-13.05 12.22c-.51.79-.32 1.85.46 2.38c1.58 1.07 4.34 3.14 7.43 6.24z" fill="#fffffffd1d1"> </path> <path d="M55.67 77.75c-.05-3.08 4.37-4.55 8.54-4.62c4.18-.07 8.68 1.29 8.73 4.37c.05 3.08-5.22 7.13-8.54 7.13c-3.31 0-8.67-3.81-8.73-6.88z" fill="#ffffff"> </path> <g fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-miterlimit="10"> <path d="M6.7 71.03c.34.41 4.41.35 14.36 5.07"> </path> <path d="M2.9 82.86s6.42-2.24 17.46-.28"> </path> <path d="M8.81 92.29s2.74-1.38 12.67-2.25"> </path> <g> <path d="M120.87 67.51s-3.41.33-13.94 6.34"> </path> <path d="M122.42 78.49s-5.09-.36-16.05 1.97"> </path> <path d="M120.45 89.05s-4.83-1.71-14.78-2.25"> </path> </g> </g> <path d="M96.09 66.37c-.34 5.51-3.76 8.54-7.65 8.54s-7.04-3.88-7.04-8.66s3.28-8.71 7.65-8.47c5.07.29 7.32 4.09 7.04 8.59z" fill="#ffffff"> </path> <path d="M46 65.81c.78 5.61-1.58 9.03-5.49 9.82c-3.91.79-7.26-1.84-8.23-6.64c-.98-4.81.9-9.32 5.34-9.97c5.15-.75 7.74 2.2 8.38 6.79z" fill="#ffffff"> </path> <path d="M44.99 85.16c-2.57 1.67.47 5.54 2.25 6.85c1.78 1.31 4.98 2.92 9.67 2.44c5.54-.56 7.13-4.69 7.13-4.69s1.97 4.6 8.82 4.79c6.95.19 9.1-3.57 10.04-4.69c.94-1.13 1.88-4.04.28-5.16c-1.6-1.13-2.72.28-4.41 2.63c-1.69 2.35-5.16 3.66-8.54 2.06s-3.57-7.04-3.57-7.04l-4.79.28s-.75 4.69-2.91 6.19s-7.32 1.88-9.48-1.41c-.95-1.46-2.33-3.66-4.49-2.25z" fill="#ffffff"> </path> </g></svg>`;

document.addEventListener("DOMContentLoaded", () => {
  let elms = document.querySelectorAll(".logo");
  elms.forEach((l) => (l.innerHTML = logo));
});

function goto(url) {
  window.location.href = url;
}
