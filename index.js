"use strict";

const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

const dateElement = document.getElementById("current-date");
if (dateElement) {
  dateElement.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

const liveMessages = [
  "Rock Climbing at GSF",
  "Building data pipelines in Python and SQL",
  "Developing the I-80 closure risk dashboard",
  "Exploring data engineering and software roles",
  "Pumping Iron at RSF"
];

const liveTextElement = document.getElementById("live-text");
const liveTimeElement = document.getElementById("live-time");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (liveTextElement && liveTimeElement) {
  let liveIndex = 0;
  let startTime = Date.now() - randomMinutesAgo() * 60000;

  function randomMinutesAgo(min = 1, max = 30) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateTime() {
    const minutes = Math.floor((Date.now() - startTime) / 60000);
    liveTimeElement.textContent = minutes <= 0 ? "Just now" : `${minutes}m ago`;
  }

  liveTextElement.textContent = liveMessages[0];
  updateTime();

  if (!prefersReducedMotion.matches) {
    window.setInterval(() => {
      liveTextElement.classList.add("fade-out");

      window.setTimeout(() => {
        liveIndex = (liveIndex + 1) % liveMessages.length;
        liveTextElement.textContent = liveMessages[liveIndex];
        startTime = Date.now() - randomMinutesAgo() * 60000;
        updateTime();
        liveTextElement.classList.remove("fade-out");
      }, 400);
    }, 5000);
  }

  window.setInterval(updateTime, 60000);
}

const overlay = document.getElementById("page-fade");

if (overlay) {
  document.querySelectorAll('.main-nav a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();

      if (prefersReducedMotion.matches) {
        target.scrollIntoView({ block: "start" });
        return;
      }

      overlay.classList.add("active");
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          window.setTimeout(() => overlay.classList.remove("active"), 600);
        }, 120);
      });
    });
  });
}
