document.addEventListener('DOMContentLoaded', function () {
    let CALENDAR_ID, API_KEY;

    // ✅ Load Config (Google Calendar API Keys)
    function loadConfig() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "config.js";
            script.onload = () => {
                if (typeof CONFIG !== 'undefined' && CONFIG.CALENDAR_ID && CONFIG.API_KEY) {
                    CALENDAR_ID = CONFIG.CALENDAR_ID;
                    API_KEY = CONFIG.API_KEY;
                    resolve();
                } else {
                    reject("CONFIG is undefined or missing keys!");
                }
            };
            script.onerror = () => reject("Failed to load config.js");
            document.head.appendChild(script);
        });
    }

    // ✅ Correctly Initialize EmailJS
    emailjs.init({ publicKey: "yy6VY8fPG-HIw6Hf1" });

    // ✅ Elements
    const statusElement = document.getElementById("status");
    const weekendStatusElement = document.getElementById("weekend-status");
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackText = document.getElementById("feedback-text");
    const sendFeedbackBtn = document.getElementById("send-feedback");
    const feedbackConfirmation = document.getElementById("feedback-confirmation");

    // ✅ Detect User Language
    const userLang = navigator.language.startsWith("de") ? "de" :
                     navigator.language.startsWith("he") ? "he" : "en";

    // ✅ Set Placeholder Loading Text
    statusElement.textContent = "Loading...";
    weekendStatusElement.textContent = "Loading weekend info...";

    // ✅ Prevent CTRL + SHIFT + R from opening modal (Allow Refresh)
    document.addEventListener("keydown", function(event) {
        if ((event.ctrlKey && event.shiftKey && event.key === "R") || 
            (event.ctrlKey && event.key === "r")) {
            return; // ✅ Allow page refresh
        }
    });

    // ✅ Show Feedback Modal
    document.getElementById("feedback-link").addEventListener("click", function (event) {
        event.preventDefault(); // ⛔ Prevent accidental key triggering
        feedbackModal.style.display = "flex"; // ✅ Show overlay properly
    });

    // ✅ Close Feedback Modal
    document.querySelector(".close-btn").addEventListener("click", () => {
        feedbackModal.style.display = "none";
    });

    // ✅ Close Modal When Clicking Outside It
    window.addEventListener("click", function(event) {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = "none";
        }
    });

    // ✅ Enable "Send" Button When User Types
    feedbackText.addEventListener("input", () => {
        sendFeedbackBtn.disabled = feedbackText.value.trim() === "";
    });

    // ✅ Send Feedback via EmailJS
    sendFeedbackBtn.addEventListener("click", function () {
        const feedbackMessage = feedbackText.value.trim();
        if (!feedbackMessage) return;

        emailjs.send("service_5xcb59c", "template_g9mg4k5", { 
            message: feedbackMessage 
        }, "yy6VY8fPG-HIw6Hf1")
        .then(() => {
            feedbackConfirmation.style.display = "block";
            feedbackText.value = "";
            sendFeedbackBtn.disabled = true;
            setTimeout(() => {
                feedbackModal.style.display = "none"; // Close modal after 3 seconds
                feedbackConfirmation.style.display = "none";
            }, 3000);
        })
        .catch(error => console.error("Failed to send feedback:", error));
    });

    // ✅ Function to Get Local Date
    function getLocalISODate(date) {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date - tzOffset).toISOString().split("T")[0];
    }

    // ✅ Fetch Events for a Given Date
    function fetchEventsForDate(date) {
        if (!CALENDAR_ID || !API_KEY) {
            console.error("API keys are not loaded!");
            return Promise.resolve(null);
        }

        const isoDate = date.toISOString().split("T")[0];
        const timeMin = `${isoDate}T00:00:00-00:00`;
        const timeMax = `${isoDate}T23:59:59-00:00`;

        return fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
   
