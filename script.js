const todayElem = document.getElementById("today");
const fullMonthBtn = document.getElementById("fullMonthBtn");
const monthView = document.getElementById("monthView");
const dialog = document.getElementById("myDialog");
const datePicker = document.getElementById("datePicker");
const dateSubmitBtn = document.getElementById("dateSubmit");
const checkbox = document.getElementById("myCheckbox");
const moonSightingBtn = document.getElementById("moonSightingBtn");

moonSightingBtn.addEventListener("click", function () {
  dialog.showModal();
});

checkbox.addEventListener("click", function () {
  const checked = this.checked;

  if (checked) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const { month, year } = getHijriParts(today);
    const sightedKey = `moonSighting-${year}-${month}`;
    localStorage.setItem(sightedKey, tomorrow.toISOString());
    dialog.close();
    displayToday();
  }
});

let dateValue = "";

datePicker.addEventListener("change", function () {
  const dateString = this.value;
  const dateObj = new Date(dateString);
  dateValue = dateObj.toISOString();
});

dateSubmitBtn.addEventListener("click", function () {
  if (dateValue) {
    const today = new Date();
    const { month, year } = getHijriParts(today);
    const sightedKey = `moonSighting-${year}-${month}`;
    localStorage.setItem(sightedKey, dateValue);
    dialog.close();
    displayToday();
  } else {
    alert("Please select date");
  }
});

const hijriMonths = [
  "Muharram",
  "Safar",
  "Rabiʿ al-awwal",
  "Rabiʿ ath-thani",
  "Jumada al-awwal",
  "Jumada ath-thaniyah",
  "Rajab",
  "Shaʿban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qiʿdah",
  "Dhu al-Ḥijjah",
];

function toHijri(hijriDay) {
  const today = new Date();

  const hijriFormatter = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const parts = hijriFormatter.formatToParts(today);

  const hijriMonth = parts.find((p) => p.type === "month")?.value;
  const hijriYear = parts.find((p) => p.type === "year")?.value;

  return `${hijriMonth} ${hijriDay}, ${hijriYear} AH`;
}

function getHijriParts(gDate) {
  const hijri = new Intl.DateTimeFormat("en-u-ca-islamic", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(gDate);
  const parts = {};
  hijri.forEach((part) => {
    if (part.type !== "literal") parts[part.type] = part.value;
  });
  return {
    day: parseInt(parts.day),
    month: parseInt(parts.month),
    year: parseInt(parts.year),
  };
}

const getSavedDate = () => {
  const today = new Date();
  const { day, month, year } = getHijriParts(today);
  const sightedKey = `moonSighting-${year}-${month}`;
  if (localStorage.getItem(sightedKey)) {
    return new Date(localStorage.getItem(sightedKey));
  }
  return null;
};

const getCurrentHijriDate = (hijriStartDate) => {
  const today = new Date();

  // Calculate how many days have passed since the 1st of the Hijri month
  const diffTime = today.getTime() - hijriStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Reconstruct "current" Hijri date in that month as a Date object
  const currentHijriDate = new Date(hijriStartDate);
  currentHijriDate.setDate(currentHijriDate.getDate() + diffDays);
  return currentHijriDate;
};

const getDifferenceBetween = (date1, date2) => {
  const diffTime = date2 - date1;

  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.floor(diffDays);
};

function displayToday() {
  checkLastMoonSighting(new Date());
  const savedDate = getSavedDate() || new Date();
  const difference = getDifferenceBetween(savedDate, new Date());
  const gDate = new Date().toDateString();
  const hijriFormatted = toHijri(difference + 1);
  todayElem.textContent = `${hijriFormatted} | ${gDate}`;
}

function checkLastMoonSighting(today) {
  const { month, year } = getHijriParts(today);
  const sightedKey = `moonSighting-${year}-${month}`;
  if (!localStorage.getItem(sightedKey)) {
    dialog.showModal();
  }
}

function generateMonthView() {
  const savedDate = getSavedDate() || new Date();
  const { month, year } = getHijriParts(new Date());
  let html = `<h2>${
    hijriMonths[month - 1]
  } ${year} AH</h2><ul style="list-style: none;">`;
  for (let i = 0; i < 30; i++) {
    const tempDate = new Date(savedDate);
    tempDate.setDate(savedDate.getDate() + i);
    html += `<li>${i + 1} - ${tempDate.toDateString()}</li>`;
  }
  html += `</ul>`;
  monthView.innerHTML = html;
  monthView.classList.remove("hidden");
}

fullMonthBtn.addEventListener("click", generateMonthView);
displayToday();
