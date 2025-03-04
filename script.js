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
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    }

    async function fetchEventsForDate(date) {
        if (!CALENDAR_ID || !API_KEY) {
            console.error("❌ API keys are not loaded!");
            return null;
        }

        const isoDate = getLocalISODate(date);
        const timeMin = new Date(date.setHours(0, 1, 0, 0)).toISOString();
        const timeMax = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${API_KEY}`);
            const data = await response.json();

            console.log(`📅 Checking events for ${isoDate}:`, data.items);

            if (!data.items || data.items.length === 0) {
                console.warn(`⚠️ No events found for ${isoDate}`);
                return null;
            }

            // 🔹 Log every event for debugging
            data.items.forEach(event => {
                console.log(`🕒 Event Found: "${event.summary}" - Starts at:`, event.start);
            });

            // ✅ Improved Filtering: Handle All-Day & Timed Events
            const filteredEvents = data.items.filter(event => {
                const eventStart = event.start?.dateTime || event.start?.date; 
                const eventStartDate = eventStart.split("T")[0];

                const isValid = eventStartDate === isoDate;
                if (!isValid) {
                    console.warn(`🚨 Event "${event.summary}" is being excluded! Start Date: ${eventStartDate}, Expected: ${isoDate}`);
                }
                return isValid;
            });

            console.log(`✅ Filtered events for ${isoDate}:`, filteredEvents);

            return filteredEvents.length > 0 ? filteredEvents[0].summary.trim() : null;
        } catch (error) {
            console.error("❌ Error fetching calendar data:", error);
            return null;
        }
    }

    function translateEvent(eventTitle, lang) {
        const translations = {
            'Roie': { 'en': 'With Dad', 'de': 'Mit Papa', 'he': 'עם אבא' },
            'Anat': { 'en': 'With Mom', 'de': 'Mit Mama', 'he': 'עם אמא' }
        };

        return translations[eventTitle] && translations[eventTitle][lang]
            ? translations[eventTitle][lang]
            : null;
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

    loadConfig().then(async () => {
        const today = new Date();
        const todayEvent = await fetchEventsForDate(today);
        const translatedToday = translateEvent(todayEvent, userLang);

        // ✅ Ensure correct fallback if no valid event found
        statusElement.textContent = translatedToday || "No info available today.";

        const { friday, saturday, sunday } = getUpcomingWeekendDates();
        const results = await Promise.all([
            fetchEventsForDate(friday),
            fetchEventsForDate(saturday),
            fetchEventsForDate(sunday)
        ]);

        console.log("📝 Weekend Raw Data (Before Filter):", results);

        const cleanedResults = results.map(event => event && event.trim() ? event.trim() : null);
        console.log("🧹 Cleaned Weekend Data:", cleanedResults);

        if (cleanedResults.every(event => event === null)) {
            weekendStatusElement.textContent = "Th
