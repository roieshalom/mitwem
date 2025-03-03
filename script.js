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
            script.onerror = () => reject("Failed to load config.js");
            document.head.appendChild(script);
        });
    }

    const statusElement = document.getElementById("status");
    const weekendStatusElement = document.getElementById("weekend-status");

    const userLang = navigator.language.startsWith("de") ? "de" :
                     navigator.language.startsWith("he") ? "he" : "en";

    statusElement.textContent = "Loading...";
    weekendStatusElement.textContent = "Loading weekend info...";

    function getLocalISODate(date) {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date - tzOffset).toISOString().split("T")[0];
    }

    function fetchEventsForDate(date) {
        if (!CALENDAR_ID || !API_KEY) {
            console.error("❌ API keys are not loaded!");
            return Promise.resolve(null);
        }

        const isoDate = date.toISOString().split("T")[0];
        const timeMin = `${isoDate}T00:00:00-00:00`;
        const timeMax = `${isoDate}T23:59:59-00:00`;

        return fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log(`📅 Events for ${isoDate}:`, data.items);
                if (data.items && data.items.length > 0) {
                    return data.items[0].summary.trim();
                } else {
                    return null;
                }
            })
            .catch(error => {
                console.error("❌ Error fetching calendar data:", error);
                return null;
            });
    }

    function translateEvent(eventTitle, lang) {
        const translations = {
            'Roie': { 'en': 'With Dad', 'de': 'Mit Papa', 'he': 'עם אבא' },
            'Anat': { 'en': 'With Mom', 'de': 'Mit Mama', 'he': 'עם אמא' }
        };

        return translations[eventTitle] && translations[eventTitle][lang]
            ? translations[eventTitle][lang]
            : eventTitle || "No info available";
    }

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

    loadConfig().then(() => {
        fetchEventsForDate(new Date()).then(eventTitle => {
            statusElement.textContent = translateEvent(eventTitle, userLang);
        });

        const { friday, saturday, sunday } = getUpcomingWeekendDates();
        Promise.all([fetchEventsForDate(friday), fetchEventsForDate(saturday), fetchEventsForDate(sunday)])
            .then(results => {
                console.log("📝 Weekend Raw Data:", results);

                const normalizedResults = results.map(event => event ? event.trim() : null);
                const uniqueValues = [...new Set(normalizedResults.filter(Boolean))];

                let weekendStatus;
                if (normalizedResults.every(event => event === null)) {
                    weekendStatus = "No Data Available"; // ✅ Fix: Show when all days are missing
                } else if (uniqueValues.length === 1) {
                    weekendStatus = translateEvent(uniqueValues[0], userLang);
                } else {
                    weekendStatus = "Mixed";
                }

                console.log("✅ Weekend Processed Status:", weekendStatus);
                weekendStatusElement.textContent = `This Weekend: ${weekendStatus}`;
            });

    }).catch(error => {
        console.error("❌ Failed to load config.js:", error);
        statusElement.textContent = "Failed to load API keys.";
    });
});
