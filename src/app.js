// #################################################################
//
//                        BLINMAKER5000
//      Special thx to Life of Boris for the inspiration!
//
// #################################################################

const electron = require('electron');
const { ipcRenderer } = electron;
const Bootstrap = require('bootstrap');
const Flickity = require('flickity');
let flkty;

// #################################################################
//
//                       HTML DOM ELEMENTS
//
// #################################################################

const mainContainer = document.querySelector('.container-fluid');
const carousel = document.querySelector('.carousel');
const startBtn = document.getElementById('startBtn');
const userEggs = document.getElementById('userEggs');
const userMilk = document.getElementById('userMilk');
const userFlour = document.getElementById('userFlour');
const eggForm = document.getElementById('eggForm');
const milkForm = document.getElementById('milkForm');
const flourForm = document.getElementById('flourForm');
const calcBtn = document.getElementById('calcBtn');
const greetingDiv = document.querySelector('.greeting');
const totalBlins = document.getElementById('totalBlins');
const ingredientsNeeded = document.getElementById('blinIngredients');
const startOverBtn = document.getElementById('startOverBtn');

// Amount of user ingredients
let userEggAmount;
let userMilkAmount;
let userFlourAmount;

// Minimal ingredients for at least 1 portion of blin
const minEggsForBlin = 1;
const minMilkForBlin = 200;  // in ml
const minFlourForBlin = 100; // in g


// #################################################################
//
//                       EVENT LISTENERS
//
// #################################################################

// Launch loading screen and carousel with user input forms
startBtn.addEventListener('click', e => {
  greetingDiv.style.display = 'none';

  // Create div to nest h3 and loading screen div into it
  const loadingContainer = document.createElement('div');
  loadingContainer.classList.add('loadingContainer');

  // Display animated loading screen
  const loadingTitle = document.createElement('h3');
  loadingTitle.innerHTML = 'Blinmaker5000 is starting ...'

  const div = document.createElement('div');
  div.classList.add('progress');
  div.innerHTML = `
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div> 
    `;

  loadingContainer.appendChild(loadingTitle);
  loadingContainer.appendChild(div);
  mainContainer.appendChild(loadingContainer);

  // Remove loading screen and display carousel
  setTimeout(() => {
    loadingContainer.parentNode.removeChild(loadingContainer);

    carousel.style.display = 'block';

    // Init flickity carousel
    flkty = new Flickity(carousel, {
      // options
      lazyLoad: true,
      imagesLoaded: true,
      fullscreen: true
    });

    calcBtn.style.display = 'inline-block'
    userEggs.focus();

  }, 3000);
});

// Get amount of eggs from user
eggForm.addEventListener('submit', e => {
  e.preventDefault();
  userEggAmount = userEggs.value;

  if (checkUserInput(userEggAmount)) {
    toggleFormStatus(userEggs);
    userEggs.blur();
    flkty.next();

    // Wait for next slide before focus input
    setTimeout(() => {
      userMilk.focus();
    }, 500);

  } else {
    toggleFormStatus(userEggs);
  }

});

// Get amount of milk from user
milkForm.addEventListener('submit', e => {
  e.preventDefault();
  userMilkAmount = userMilk.value;

  if (checkUserInput(userMilkAmount)) {
    toggleFormStatus(userMilk);
    userMilk.blur();
    flkty.next();

    setTimeout(() => {
      userFlour.focus();
    }, 500);
  } else {
    toggleFormStatus(userMilk);
  }

});

// Get amount of flour from user
flourForm.addEventListener('submit', e => {
  e.preventDefault();
  userFlourAmount = userFlour.value;

  if (checkUserInput(userFlourAmount)) {
    toggleFormStatus(userFlour);
    userFlour.blur();
    // After this input has correctly finished, calcBtn should turn green
    toggleCalcBtnStatus();

  } else {
    toggleFormStatus(userFlour);
  }
});

// Display blin results in modal
calcBtn.addEventListener('click', e => {
  const blinPortions = calcBlinPortions(userEggAmount, userMilkAmount, userFlourAmount);

  renderBlinResult(blinPortions);
});

// Send reload app to main process
startOverBtn.addEventListener('click', e => {
  ipcRenderer.send('button:startOver');
});


// #################################################################
//
//                        FUNCTIONS
//
// #################################################################

// Determine max. possible portions of blin based on smallest ingredient
function calcBlinPortions(eggs, milk, flour) {

  // Round down to whole int
  const possibleWithEggs = Math.floor(eggs / minEggsForBlin);
  const possibleWithMilk = Math.floor(milk / minMilkForBlin);
  const possibleWithFlour = Math.floor(flour / minFlourForBlin);

  // Create new array
  const ingredients = [possibleWithEggs, possibleWithMilk, possibleWithFlour];

  // Find smallest value because it's the limiting one
  let smallest = possibleWithEggs;

  ingredients.forEach(el => {
    if (el < smallest) {
      smallest = el;
    }
  });

  return smallest;
}

// Enable calculation only if all 3 forms are filled
function toggleCalcBtnStatus() {

  if (userEggAmount.length == 0 || userMilkAmount.length == 0 || userFlourAmount.length == 0) {

    calcBtn.disabled = true;
    calcBtn.classList.remove('btn-success');
    calcBtn.classList.add('btn-primary');

  } else {
    calcBtn.disabled = false;
    calcBtn.classList.remove('btn-primary');
    calcBtn.classList.add('btn-success');

  }
}

// validate integer input
function checkUserInput(input) {
  return input == parseInt(input, 10) && input.length != 0 ? true : false;
}

// highlight input form in red if user input is not an integer
function toggleFormStatus(formID) {
  checkUserInput(formID.value) ? formID.classList.remove('is-invalid') : formID.classList.add('is-invalid');
}

// Render results of blin calculation in modal
function renderBlinResult(portions) {
  if (portions == 0) {
    totalBlins.innerHTML = 'Sorry, no blins for you today! =('
  } else {
    totalBlins.innerHTML = `You can make ${portions} portion(s) of blin today!`
    ingredientsNeeded.innerHTML = `For that, you'll need ${portions * minEggsForBlin} egg(s), ${portions *
      minMilkForBlin}ml of milk and ${portions * minFlourForBlin}g of flour.`
  }
}