document.addEventListener('DOMContentLoaded', function () {
    let CALENDAR_ID, API_KEY;

    function loadConfig() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "config.js";
            script.onload = () => {
                if (typeof CONFIG !== 'undefined') {
                    CALENDAR_ID = CONFIG.CALENDAR_ID;
                    API_KEY = CONFIG.API_KEY;
                    resolve();
                } else {
                    reject("CONFIG is undefined!");
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
    const weekendStatusElement = document.getElementById("weekend-status");

    // 🚀 Step 1: Ensure all elements are ready before setting text
    if (!pageTitleElement || !pageHeadingElement || !statusElement || !weekendStatusElement) {
        console.error("Required HTML elements are missing");
        throw new Error("Required HTML elements are missing");
    }

    // 🚀 Step 2: Ensure the initial status text is fully hidden
    statusElement.style.visibility = "hidden";
    statusElement.style.minHeight = "40px"; // Prevents layout shift

    function getLocalISODate(date) {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date - tzOffset).toISOString().split("T")[0];
    }

    function fetchEventsForDate(date) {
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
            return eventTitle;
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

        // 🚀 Step 3: Set empty placeholders first to avoid flickering
        pageTitleElement.textContent = translations[primaryLang].title;
        pageHeadingElement.textContent = translations[primaryLang].heading;
        statusElement.textContent = "";
        statusElement.style.visibility = "hidden";

        document.body.className = primaryLang === 'he' ? 'rtl' : 'ltr';

        // 🚀 Step 4: Only show "Loading..." once API keys are confirmed loaded
        statusElement.textContent = translations[primaryLang].checking;
        statusElement.style.visibility = "visible";

        const today = new Date();
        fetchEventsForDate(today).then(eventTitle => {
            const translatedTitle = translateEvent(eventTitle, primaryLang);
            statusElement.textContent = translatedTitle || translations[primaryLang].no_info;
        });

    }).catch(error => {
        console.error("Error loading config.js:", error);
        statusElement.textContent = "Error loading API keys.";
        statusElement.style.visibility = "visible";
    });
});
