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
                console.log("Fetched Data:", data);

                if (data.items && data.items.length > 0) {
                    console.log("Today's Event Titles:", data.items.map(event => event.summary));

                    const eventTitle = data.items[0].summary.trim();
                    console.log("Selected Event Title:", eventTitle);

                    const translatedTitle = translateEvent(eventTitle, userLang);
                    console.log("Translated Event Title:", translatedTitle);

                    status.textContent = translatedTitle !== eventTitle ? translatedTitle : "⚠️ Unrecognized Event Title";
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

        const trimmedTitle = title.trim();
        const translation = eventTranslations[trimmedTitle] && eventTranslations[trimmedTitle][lang];

        if (translation) {
            return translation; // ✅ Correctly translated
        } else {
            console.warn(`⚠️ Unrecognized event title: "${trimmedTitle}"`);
            return title; // Keep original if no match
        }
    }

    loadConfig().then(() => {
        fetchTodaysEvent();
    }).catch(error => {
        console.error("❌ Error loading config.js:", error);
        status.textContent = "Failed to load config.";
    });

    // Feedback form functionality
    const feedbackLink = document.getElementById('feedback-link');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const closeBtn = document.getElementById('close-btn');
    const sendBtn = document.getElementById('send-btn');
    const feedbackText = document.getElementById('feedback-text');
    const confirmationMessage = document.getElementById('confirmation-message');

    feedbackLink.addEventListener('click', function () {
        feedbackOverlay.style.display = 'block';
    });

    closeBtn.addEventListener('click', function () {
        feedbackOverlay.style.display = 'none';
    });

    feedbackText.addEventListener('input', function () {
        sendBtn.disabled = feedbackText.value.trim() === '';
    });

    sendBtn.addEventListener('click', function () {
        const feedback = feedbackText.value.trim();
        if (feedback) {
            sendEmail(feedback);
        }
    });

    function sendEmail(feedback) {
        emailjs.send("service_5xcb59c", "template_g9mg4k5", { 
            message: feedback 
        }).then(
            function(response) {
                console.log("SUCCESS!", response.status, response.text);
                confirmationMessage.style.display = "block";

                feedbackText.value = "";
                sendBtn.disabled = true;

                setTimeout(function () {
                    confirmationMessage.style.display = "none";
                    feedbackOverlay.style.display = "none";
                }, 3000);
            },
            function(error) {
                console.error("FAILED...", error.text);
            }
        );
    }

    if (userLang.startsWith('de')) {
        feedbackLink.textContent = 'Feedback und Anfragen';
    } else if (userLang.startsWith('he')) {
        feedbackLink.textContent = 'משוב ובקשות';
    }
});
