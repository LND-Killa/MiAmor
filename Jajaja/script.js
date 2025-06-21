let chars = [..."💖 Laura Mi Amor 💖"];         
let currentCount = 1;
let increasing = true;

async function changeTitle() {
  while (true) {
    document.title = chars.slice(0, currentCount).join("");

    await sleep(250);

    if (increasing) {
      if (currentCount >= chars.length) {
        increasing = false;
        currentCount--;
      } else {
        currentCount++;
      }
    } else {
      if (currentCount <= 1) {
        increasing = true;
        currentCount++;
      } else {
        currentCount--;
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

changeTitle();

function CheckIfRight(event) {
  event.preventDefault();

  const userInput = document
    .getElementById("name-input")
    .value
    .trim()
    .toLowerCase();

  if (userInput === "laura") {
    document.querySelector(".main-body").style.display = "none";

    document.getElementById("hiddenBody").classList.add("active");

    document.body.classList.add("heart-bg");
  } else {
    alert("Eres tu?!?");
  }
}