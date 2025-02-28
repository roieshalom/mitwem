document.addEventListener('DOMContentLoaded', function () {
    let CALENDAR_ID, API_KEY;

    // ✅ EmailJS Initialization
    emailjs.init("your_public_key_here"); // Replace with your EmailJS public key

    // ✅ Define translations FIRST to prevent errors
    const translations = {
        'en': {
            title: 'Who Are the Girls With?',
            heading: 'Who Are the Girls With Today?',
            checking: 'Loading...',
            no_info: 'No info available today.',
            error: 'Error loading data.',
            with_dad: 'With Dad',
            with_mom: 'With Mom',
            this_weekend: 'This Weekend',
            mixed: 'mixed',
            not_sure: 'not sure'
        },
        'de': {
            title: 'Mit wem sind Gali und Daniella?',
            heading: 'Mit wem sind Gali und Daniella heute zusammen?',
            checking: 'Laden...',
            no_info: 'Keine Informationen für heute verfügbar.',
            error: 'Fehler beim Laden der Daten.',
            with_dad: 'Mit Papa',
            with_mom: 'Mit Mama',
            this_weekend: 'Dieses Wochenende',
            mixed: 'gemischt',
            not_sure: 'nicht sicher'
        },
        'he': {
            title: 'עם מי גלי ודניאלה היום?',
            heading: 'עם מי גלי ודניאלה היום?',
            checking: 'טוען...',
            no_info: 'אין מידע זמין להיום.',
            error: 'שגיאה בטעינת הנתונים.',
            with_dad: 'עם אבא',
            with_mom: 'עם אמא',
            this_weekend: 'סוף השבוע הזה',
            mixed: 'מעורב',
            not_sure: 'לא בטוח'
        }
    };

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

    const userLang = navigator.language.startsWith("de") ? "de" :
                     navigator.language.startsWith("he") ? "he" : "en";

    const pageTitleElement = document.getElementById("page-title");
    const pageHeadingElement = document.getElementById("page-heading");
    const statusElement = document.getElementById("status");

    if (!pageTitleElement || !pageHeadingElement || !statusElement) {
        console.error("Required HTML elements are missing");
        return;
    }

    statusElement.textContent = translations[userLang].checking;
    statusElement.style.visibility = "visible";

    function getLocalISODate(date) {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date - tzOffset).toISOString().split("T")[0];
    }

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

    function translateEvent(eventTitle, lang) {
        if (eventTitle === 'Roie') {
            return translations[lang].with_dad;
        } else if (eventTitle === 'Anat') {
            return translations[lang].with_mom;
        } else {
            return eventTitle || translations[lang].no_info;
        }
    }

    function detectBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        if (lang.startsWith('de')) {
            return 'de';
        } else if (lang.startsWith('he')) {
            return 'he';
        } else {
            return 'en';
        }
    }

    loadConfig().then(() => {
        const primaryLang = detectBrowserLanguage();
        pageTitleElement.textContent = translations[primaryLang].title;
        pageHeadingElement.textContent = translations[primaryLang].heading;

        setTimeout(() => {
            fetchEventsForDate(new Date()).then(eventTitle => {
                statusElement.textContent = translateEvent(eventTitle, primaryLang);
            });
        }, 500);

    }).catch(error => {
        console.error("Config.js failed to load:", error);
        statusElement.textContent = "Failed to load API keys";
    });

    // ✅ Feedback Modal Logic
    const feedbackLink = document.getElementById("feedback-link");
    const feedbackModal = document.getElementById("feedback-modal");
    const closeBtn = document.querySelector(".close-btn");
    const feedbackText = document.getElementById("feedback-text");
    const sendFeedbackBtn = document.getElementById("send-feedback");
    const feedbackConfirmation = document.getElementById("feedback-confirmation");

    feedbackLink.addEventListener("click", () => feedbackModal.style.display = "block");
    closeBtn.addEventListener("click", () => feedbackModal.style.display = "none");
    feedbackText.addEventListener("input", () => sendFeedbackBtn.disabled = !feedbackText.value.trim());

    sendFeedbackBtn.addEventListener("click", function () {
        emailjs.send("your_service_id", "your_template_id", { message: feedbackText.value })
            .then(() => {
                feedbackConfirmation.style.display = "block";
                feedbackText.value = "";
                sendFeedbackBtn.disabled = true;
                setTimeout(() => feedbackModal.style.display = "none", 3000);
            })
            .catch(error => console.error("Failed to send feedback:", error));
    });
});
