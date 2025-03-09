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

    function loadTranslations() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "translations.js";
            script.onload = () => {
                if (typeof translations !== 'undefined') {
                    resolve();
                } else {
                    reject("Translations file is missing or incorrect.");
                }
            };
            script.onerror = () => reject("Failed to load translations.js");
            document.head.appendChild(script);
        });
    }

    const statusElement = document.getElementById("status");
    const weekendStatusElement = document.getElementById("weekend-status");

    let userLang = navigator.language.startsWith("de") ? "de" :
                   navigator.language.startsWith("he") ? "he" : "en";

    // ✅ Apply RTL class if Hebrew is detected
    if (userLang === "he") {
        document.body.classList.add("rtl");
    } else {
        document.body.classList.remove("rtl");
    }

    function applyTranslations() {
        if (!translations || !translations.pageTitle) {
            console.error("❌ Translations not loaded correctly.");
            return;
        }

        document.title = translations.pageTitle[userLang];
        document.getElementById("page-heading").textContent = translations.pageHeading[userLang];
        statusElement.textContent = translations.loading[userLang];
        weekendStatusElement.textContent = translations.loadingWeekend[userLang];
    }

    function getLocalISODate(date) {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    }

    function isWeekend(date) {
        const day = date.getDay();
        return day === 5 || day === 6 || day === 0; // Friday, Saturday, Sunday
    }

    async function fetchEventsForDate(date) {
        if (!CALENDAR_ID || !API_KEY) {
            console.error("❌ API keys are not loaded!");
            return null;
        }

        const isoDate = getLocalISODate(date);
        const timeMin = `${isoDate}T00:00:00Z`;  
        const timeMax = `${isoDate}T23:59:59Z`;  

        try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&key=${API_KEY}`);

            if (!response.ok) {
                console.error(`❌ API Request Failed with Status: ${response.status}`);
                return null;
            }

            const data = await response.json();
            console.log(`📅 Checking events for ${isoDate}:`, data.items);

            if (data.items && data.items.length > 0) {
                const validEvents = data.items.filter(event => {
                    const eventStart = event.start?.dateTime || event.start?.date; 
                    const eventEnd = event.end?.dateTime || event.end?.date;
                    return (eventStart <= isoDate && (!eventEnd || eventEnd >= isoDate));
                });

                console.log(`✅ Filtered events for ${isoDate}:`, validEvents);
                return validEvents.length > 0 ? validEvents[0].summary.trim() : null;
            } else {
                return null;
            }
        } catch (error) {
            console.error("❌ Error fetching calendar data:", error);
            return null;
        }
    }

    function translateEvent(eventTitle, lang, isEntireWeekend) {
        if (!translations || !translations.events) return "No Data Available";

        let translatedText = translations.events[eventTitle] && translations.events[eventTitle][lang] 
            ? translations.events[eventTitle][lang] 
            : translations.noData[lang];

        if (isEntireWeekend && translatedText !== translations.noData[lang]) {
            translatedText += ` (${translations.entireWeekend[lang]})`;
        }
        return translatedText;
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

    Promise.all([loadConfig(), loadTranslations()])
        .then(async () => {
            applyTranslations();

            const today = new Date();
            const isWeekendToday = isWeekend(today);
            const todayEvent = await fetchEventsForDate(today);
            statusElement.textContent = translateEvent(todayEvent, userLang, isWeekendToday);

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
                console.log("✅ No events found for the weekend.");
                weekendStatusElement.textContent = `${translations.nextWeekend[userLang]}: ${translations.noData[userLang]}`;
                return;
            }

            const uniqueValues = [...new Set(cleanedResults.filter(Boolean))];

            let weekendStatus;
            if (uniqueValues.length === 1) {
                weekendStatus = translateEvent(uniqueValues[0], userLang, false);
            } else {
                weekendStatus = translations.mixed[userLang];
            }

            console.log("✅ Weekend Processed Status:", weekendStatus);
            weekendStatusElement.textContent = `${translations.nextWeekend[userLang]}: ${weekendStatus}`;
        })
        .catch(error => {
            console.error("❌ Failed to load dependencies:", error);
            statusElement.textContent = translations.failedLoad[userLang] || "Failed to load data.";
        });
});
