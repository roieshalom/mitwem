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

    // ✅ Initialize EmailJS
    emailjs.init({ publicKey: "yy6VY8fPG-HIw6Hf1" });

    // ✅ DOM Elements
    const statusElement = document.getElementById("status");
    const weekendStatusElement = document.getElementById("weekend-status");
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackText = document.getElementById("feedback-text");
    const sendFeedbackBtn = document.getElementById("send-feedback");
    const feedbackConfirmation = document.getElementById("feedback-confirmation");
    const feedbackLink = document.getElementById("feedback-link");
    const closeBtn = document.querySelector(".close-btn");

    // ✅ Ensure Modal is Hidden on Page Load
    if (feedbackModal) {
        feedbackModal.style.display = "none";
    }

    // ✅ Detect User Language
    const userLang = navigator.language.startsWith("de") ? "de" :
                     navigator.language.startsWith("he") ? "he" : "en";

    // ✅ Set Default Loading Text
    statusElement.textContent = "Loading...";
    weekendStatusElement.textContent = "Loading weekend info...";

    // ✅ Prevent CTRL + SHIFT + R from Opening Modal
    document.addEventListener("keydown", function(event) {
        if ((event.ctrlKey && event.shiftKey && event.key === "R") || 
            (event.ctrlKey && event.key === "r")) {
            return; // ✅ Allow page refresh, do nothing
        }
    });

    // ✅ Open Feedback Modal ONLY on Click
    feedbackLink.addEventListener("click", function (event) {
        event.preventDefault();
        feedbackModal.style.display = "flex";
    });

    // ✅ Close Modal on "X" Button Click
    closeBtn.addEventListener("click", () => {
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
                if (data.items && data.items.length > 0) {
                    return data.items[0].summary;
                } else {
                    return null;
                }
            })
            .catch(error => {
                console.error("Error fetching calendar data:", error);
                return null;
            });
    }

    // ✅ Translate Event Names
    function translateEvent(eventTitle, lang) {
        const translations = {
            'Roie': {
                'en': 'With Dad',
                'de': 'Mit Papa',
                'he': 'עם אבא'
            },
            'Anat': {
                'en': 'With Mom',
                'de': 'Mit Mama',
                'he': 'עם אמא'
            }
        };

        return translations[eventTitle] && translations[eventTitle][lang] 
            ? translations[eventTitle][lang] 
            : eventTitle || "No info available";
    }

    // ✅ Get Upcoming Weekend Dates
    function getUpcomingWeekendDates() {
        const today = new Date();
        const daysUntilFriday = (5 - today.getDay() + 7) % 7;

        const friday = new Date(today);
        friday.setDate(today.getDate() + daysUntilFriday);

        const saturday = new Date(friday);
        saturday.setDate(friday.getDate() + 1);

        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        return { friday, saturday, sunday };
    }

    // ✅ Load Data After Config is Loaded
    loadConfig().then(() => {
        // ✅ Fetch & Display Today's Event
        fetchEventsForDate(new Date()).then(eventTitle => {
            statusElement.textContent = translateEvent(eventTitle, userLang);
        });

        // ✅ Fetch & Display Weekend Info (FIXED LOGIC)
        const { friday, saturday, sunday } = getUpcomingWeekendDates();
        Promise.all([fetchEventsForDate(friday), fetchEventsForDate(saturday), fetchEventsForDate(sunday)])
            .then(results => {
                const [fridayEvent, saturdayEvent, sundayEvent] = results.map(event => translateEvent(event, userLang));

                let weekendStatus;
                if (fridayEvent && fridayEvent === saturdayEvent && saturdayEvent === sundayEvent) {
                    weekendStatus = fridayEvent; // ✅ All three days match
                } else if (!fridayEvent && !saturdayEvent && !sundayEvent) {
                    weekendStatus = "No info available"; // ✅ No events found
                } else {
                    weekendStatus = "Mixed"; // ✅ At least two different values
                }

                weekendStatusElement.textContent = `This Weekend: ${weekendStatus}`;
            });

    }).catch(error => {
        console.error("Failed to load config.js:", error);
        statusElement.textContent = "Failed to load API keys.";
    });
});
