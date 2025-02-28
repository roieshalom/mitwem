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

    const pageTitle = document.getElementById('page-title');
    const pageHeading = document.getElementById('page-heading');
    const status = document.getElementById('status');

    // 🚀 Step 1: Hide the status completely before JavaScript runs
    status.style.display = "none";

    function getLocalISODate(date) {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date - tzOffset).toISOString().split("T")[0];
    }

    function fetchTodaysEvent() {
        if (!CALENDAR_ID || !API_KEY) {
            console.error("❌ API Keys not loaded!");
            status.textContent = "Error loading API keys.";
            status.style.display = "block";
            return;
        }

        // 🚀 Step 2: Show "Loading..." only when JavaScript is ready
        status.textContent = userLang.startsWith('he') ? 'טוען...' : userLang.startsWith('de') ? 'Laden...' : 'Loading...';
        status.style.display = "block";

        const today = getLocalISODate(new Date());
        const timeMin = `${today}T00:00:00-00:00`;
        const timeMax = `${today}T23:59:59-00:00`;

        console.log("📅 Fetching events for:", today);

        fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log("✅ Fetched Calendar Data:", data);

                if (data.items && data.items.length > 0) {
                    const eventTitle = data.items[0].summary.trim();
                    console.log(`🎯 Selected Event Title (Raw): "${eventTitle}"`);

                    const translatedTitle = translateEvent(eventTitle, userLang);
                    console.log(`🌍 Translated Event Title: "${translatedTitle}"`);

                    status.textContent = translatedTitle;
                } else {
                    console.warn("⚠️ No events found for today!");
                    status.textContent = userLang.startsWith('he') ? 'אין מידע להיום' : userLang.startsWith('de') ? 'Keine Information für heute' : 'No info available today.';
                }
            })
            .catch(error => {
                console.error("❌ Error fetching calendar data:", error);
                status.textContent = userLang.startsWith('he') ? 'שגיאה בטעינת הנתונים' : userLang.startsWith('de') ? 'Fehler beim Laden der Daten' : 'Error loading data.';
            });
    }

    function translateEvent(title, lang) {
        const eventTranslations = {
            'roie': {
                'en': 'With Dad',
                'de': 'Mit Papa',
                'he': 'עם אבא'
            },
            'anat': {
                'en': 'With Mom',
                'de': 'Mit Mama',
                'he': 'עם אמא'
            }
        };

        const cleanedTitle = title.trim().toLowerCase();
        console.log(`🔍 Checking translation for: "${cleanedTitle}"`);

        if (eventTranslations[cleanedTitle]) {
            console.log(`✅ Exact match found for: "${cleanedTitle}"`);
            return eventTranslations[cleanedTitle][lang];
        }

        for (const key in eventTranslations) {
            if (cleanedTitle.includes(key)) {
                console.log(`✅ Matched with partial title: "${key}"`);
                return eventTranslations[key][lang];
            }
        }

        console.warn(`⚠️ Unrecognized event title: "${cleanedTitle}"`);
        return title; // Fallback to original title
    }

    loadConfig().then(() => {
        fetchTodaysEvent();
    }).catch(error => {
        console.error("❌ Error loading config.js:", error);
        status.textContent = "Failed to load config.";
        status.style.display = "block";
    });
});
