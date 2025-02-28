document.addEventListener('DOMContentLoaded', function () {
    let CALENDAR_ID, API_KEY;

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
            script.onerror = () => reject("Failed to load config.js (Check if the file exists and is accessible)");
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

    statusElement.style.visibility = "hidden";

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
        statusElement.textContent = translations[primaryLang].checking;
        statusElement.style.visibility = "visible";

        fetchEventsForDate(new Date()).then(eventTitle => {
            statusElement.textContent = translateEvent(eventTitle, primaryLang);
        });

    }).catch(error => {
        console.error("Config.js failed to load:", error);
        statusElement.textContent = "Failed to load API keys (Check console for details)";
        statusElement.style.visibility = "visible";
    });
});
