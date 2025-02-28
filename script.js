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

    const userLang = navigator.language || navigator.userLanguage;
    const pageTitle = document.getElementById('page-title');
    const pageHeading = document.getElementById('page-heading');
    const status = document.getElementById('status');

    if (userLang.startsWith('de')) {
        pageTitle.textContent = 'Mit wem sind die Mädchen heute?';
        pageHeading.textContent = 'Mit wem sind die Mädchen heute?';
    } else if (userLang.startsWith('he')) {
        pageTitle.textContent = 'עם מי הבנות היום?';
        pageHeading.textContent = 'עם מי הבנות היום?';
    }

    function getLocalISODate(date) {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date - tzOffset).toISOString().split("T")[0];
    }

    function fetchTodaysEvent() {
        if (!CALENDAR_ID || !API_KEY) {
            console.error("❌ API Keys not loaded!");
            status.textContent = "Error loading API keys.";
            return;
        }

        status.textContent = userLang.startsWith('he') ? 'טוען...' : userLang.startsWith('de') ? 'Laden...' : 'Loading...';

        const today = getLocalISODate(new Date());
        const timeMin = `${today}T00:00:00-00:00`;
        const timeMax = `${today}T23:59:59-00:00`;

        fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log("📅 Fetched Calendar Data:", data);

                if (data.items && data.items.length > 0) {
                    console.log("✅ Today's Event Titles:", data.items.map(event => `"${event.summary}"`));

                    const eventTitle = data.items[0].summary.trim();
                    console.log(`🎯 Selected Event Title (Raw): "${eventTitle}"`);

                    const translatedTitle = translateEvent(eventTitle, userLang);
                    console.log(`🌍 Translated Event Title: "${translatedTitle}"`);

                    status.textContent = translatedTitle !== eventTitle ? translatedTitle : `⚠️ Unrecognized: "${eventTitle}"`;
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

        const cleanedTitle = title.trim().toLowerCase(); // Convert everything to lowercase
        console.log(`🔍 Checking translation for: "${cleanedTitle}"`);

        // Check for an exact match
        if (eventTranslations[cleanedTitle]) {
            return eventTranslations[cleanedTitle][lang];
        }

        // **New: Allow Partial Matching**
        for (const key in eventTranslations) {
            if (cleanedTitle.includes(key)) {
                console.log(`✅ Matched with partial title: "${key}"`);
                return eventTranslations[key][lang];
            }
        }

        console.warn(`⚠️ Unrecognized event title: "${cleanedTitle}"`);
        return `⚠️ Unrecognized: "${cleanedTitle}"`; // Show actual title in UI
    }

    loadConfig().then(() => {
        fetchTodaysEvent();
    }).catch(error => {
        console.error("❌ Error loading config.js:", error);
        status.textContent = "Failed to load config.";
    });
});
