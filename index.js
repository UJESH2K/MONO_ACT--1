import { GoogleGenerativeAI } from "@google/generative-ai";

// Your Gemini API key
const GEMINI_API_KEY = "AIzaSyC8j0ORvnxI4B9wrbfgZAe_MOCVYDT1DPg";

const generateStoryBtn = document.getElementById("generate-story-btn");
generateStoryBtn.addEventListener("click", generateStory);

const storyInput = document.getElementById("story-input");
storyInput.addEventListener("focus", handleTextAreaFocus);
storyInput.addEventListener("blur", handleTextAreaBlur);

function expandPrompt(input) {
  input = input.trim();

  if (input.length === 0) {
    displayError("Please enter a word or a phrase to generate a story.");
    return null;
  }

  const starters = [
    "Once upon a time,",
    "In a faraway land,",
    "Deep in the heart of the forest,",
    "Long ago, in a forgotten kingdom,",
    "Beneath the endless night sky,"
  ];

  if (input.split(" ").length <= 2) {
    const randomStarter = starters[Math.floor(Math.random() * starters.length)];
    return `${randomStarter} there was a place called ${input}, where something extraordinary was about to happen.`;
  }

  const validStoryStarters = starters.map(s => s.toLowerCase());
  if (validStoryStarters.some(starter => input.toLowerCase().startsWith(starter))) {
    return input;
  }

  return `Once upon a time, in a world where ${input}, a new adventure was about to unfold.`;
}

async function generateStory() {
  let userInput = document.getElementById("story-input").value.trim();
  let storyPrompt = expandPrompt(userInput);
  
  if (!storyPrompt) return;

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const spinner = document.getElementById("spinner");
  spinner.style.display = "flex";

  try {
    const result = await model.generateContent(storyPrompt);
    const response = await result.response;
    let story = await response.text();

    story = story.replace(/[\*#_~`]/g, "").replace(/\s(?=\w)/g, " ").replace(/(?:\r\n|\r|\n)/g, "<br />");

    displayStory(story);
  } catch (error) {
    console.error("Error generating story:", error);
    displayError("Sorry, I am having trouble generating the story.");
  } finally {
    spinner.style.display = "none";
  }
}

function displayStory(story) {
  const generatedContent = document.getElementById("generated-content");
  generatedContent.innerHTML = `<p>${story}</p><hr />`;
}

function displayError(message) {
  const generatedContent = document.getElementById("generated-content");
  generatedContent.innerHTML = `<p class="error">${message}</p>`;
}

async function generatePhoto() {
  const query = document.getElementById("story-input").value;
  const apiUrl = `https://api.unsplash.com/photos/random?query=${query}&count=6&client_id=${UNSPLASH_ACCESS_KEY}`;

  const spinner = document.getElementById("spinner");
  spinner.style.display = "flex";

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && Array.isArray(data) && data.length > 0) {
      displayPhotos(data);
    } else {
      displayError("Failed to fetch photos.");
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
    displayError("Failed to fetch photos.");
  } finally {
    spinner.style.display = "none";
  }
}

function displayPhotos(photos) {
  const generatedContent = document.getElementById("generated-content");
  generatedContent.innerHTML = photos
    .map(
      (photo) =>
        `<img src="${photo.urls.regular}" alt="Generated Photo" class="generated-photo">`
    )
    .join("");
}

function handleTextAreaFocus() {
  const storyInput = document.getElementById("story-input");
  storyInput.style.borderColor = "purple";
  storyInput.style.height = "120px";
}

function handleTextAreaBlur() {
  const storyInput = document.getElementById("story-input");
  storyInput.style.borderColor = "";
  storyInput.style.height = "";
}
