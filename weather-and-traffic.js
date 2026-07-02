"use strict";

const dateElement = document.getElementById("current-date");
dateElement.textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
});

const DATA_BASE_URL = "https://d3iomsa5syi9uh.cloudfront.net";
const LATEST_RISK_KEY = "i80/latest/current_risk.json";
const ONE_HOUR = 60 * 60 * 1000;

const weatherCodes = {
  0: ["Clear sky", "☀"],
  1: ["Mainly clear", "🌤"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"],
  45: ["Fog", "☁"],
  48: ["Rime fog", "☁"],
  51: ["Light drizzle", "🌧"],
  53: ["Drizzle", "🌧"],
  55: ["Heavy drizzle", "🌧"],
  61: ["Light rain", "🌧"],
  63: ["Rain", "🌧"],
  65: ["Heavy rain", "🌧"],
  71: ["Light snow", "🌨"],
  73: ["Snow", "🌨"],
  75: ["Heavy snow", "🌨"],
  77: ["Snow grains", "🌨"],
  80: ["Light showers", "🌦"],
  81: ["Showers", "🌦"],
  82: ["Heavy showers", "🌧"],
  85: ["Snow showers", "🌨"],
  86: ["Heavy snow showers", "🌨"],
  95: ["Thunderstorm", "⛈"],
  96: ["Thunderstorm with hail", "⛈"],
  99: ["Severe thunderstorm with hail", "⛈"]
};

function objectUrl(key) {
  return `${DATA_BASE_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function getJson(key) {
  const response = await fetch(objectUrl(key));
  if (!response.ok) throw new Error(`Data request failed (${response.status})`);
  return response.json();
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function renderWeather(data) {
  const hourly = data.hourly;
  const latest = hourly.time.length - 1;
  if (latest < 0) throw new Error("Weather file contains no hourly observations");

  const precipitation24h = hourly.precipitation
    .slice(-24)
    .reduce((total, value) => total + (Number(value) || 0), 0);
  const [condition, symbol] = weatherCodes[hourly.weather_code[latest]] || ["Conditions available", "—"];

  setText("weather-location", "Donner Pass, California");
  setText("weather-symbol", symbol);
  setText("temperature", `${Math.round(hourly.temperature_2m[latest])}°`);
  setText("condition", condition);
  setText("precipitation", `${precipitation24h.toFixed(2)} in`);
  setText("wind", `${Math.round(hourly.wind_speed_10m[latest])} mph`);
  setText("cloud-cover", `${Math.round(hourly.cloud_cover[latest])}%`);
  setText("humidity", `${Math.round(hourly.relative_humidity_2m[latest])}%`);
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function renderRisk(data) {
  const rawRank = String(data.risk_rank || "Unavailable").toLowerCase();
  const rank = rawRank.charAt(0).toUpperCase() + rawRank.slice(1);
  const badgeClass = rawRank === "moderate" ? "moderate" : rawRank === "low" ? "low" : "high";
  const meterClass = ["low", "moderate", "high", "extreme"].includes(rawRank) ? rawRank : "";
  const probability = Number(data.closure_probability);
  const probabilityText = Number.isFinite(probability) ? `${(probability * 100).toFixed(1)}%` : "Not provided";

  setText("overall-risk", rank);
  document.getElementById("risk-meter-fill").className = meterClass;
  setText("risk-summary", `The latest road-closure model classifies conditions at Donner Pass as ${rawRank} risk.`);
  setText("last-updated", `Latest model: ${new Date(data.generated_at).toLocaleString()}`);

  const row = document.createElement("tr");
  row.append(createCell("I-80"), createCell("Donner Pass"), createCell("Latest weather model"));

  const riskCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.classList.add("risk-badge", badgeClass);
  badge.textContent = rank;
  riskCell.append(badge);

  row.append(riskCell, createCell(probabilityText));
  document.getElementById("road-risk-body").replaceChildren(row);
}

async function refreshDashboard() {
  const status = document.getElementById("last-updated");

  try {
    const risk = await getJson(LATEST_RISK_KEY);
    const weather = await getJson(risk.weather_s3_key);
    renderWeather(weather);
    renderRisk(risk);
  } catch (error) {
    console.error("Unable to refresh dashboard:", error);
    status.textContent = "Latest data unavailable — retrying in one hour";
  }
}

refreshDashboard();
window.setInterval(refreshDashboard, ONE_HOUR);
