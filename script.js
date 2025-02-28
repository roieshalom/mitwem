document.addEventListener('DOMContentLoaded', function () {
    // Existing translation code
    const userLang = navigator.language || navigator.userLanguage;
    const pageTitle = document.getElementById('page-title');
    const pageHeading = document.getElementById('page-heading');
    const status = document.getElementById('status');
    const weekendStatus = document.getElementById('weekend-status');

    if (userLang.startsWith('de')) {
        pageTitle.textContent = 'Mit wem sind die Mädchen heute?';
        pageHeading.textContent = 'Mit wem sind die Mädchen heute?';
    } else if (userLang.startsWith('he')) {
        pageTitle.textContent = 'עם מי הבנות היום?';
        pageHeading.textContent = 'עם מי הבנות היום?';
    }

    // Google Calendar API Integration
    const CALENDAR_ID = "your_calendar_id_here@group.calendar.google.com"; // Replace with actual Calendar ID
    const API_KEY = "your_google_api_key_here"; // Replace with actual API Key

    function getLocalISODate(date) {
        const tzOffset = date.getTimezoneOffset() * 60000; // Adjust for local timezone
        return new Date(date - tzOffset).toISOString().split("T")[0];
    }

    function fetchTodaysEvent() {
        const today = getLocalISODate(new Date());
        const timeMin = `${today}T00:00:00-00:00`;
        const timeMax = `${today}T23:59:59-00:00`;

        fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched Data:", data); // Debugging log

                if (data.items && data.items.length > 0) {
                    const eventTitle = data.items[0].summary.trim();
                    const translatedTitle = translateEvent(eventTitle, userLang);
                    status.textContent = translatedTitle;
                } else {
                    status.textContent = userLang.startsWith('he') ? 'אין מידע להיום' : userLang.startsWith('de') ? 'Keine Information für heute' : 'No info available today.';
                }
            })
            .catch(error => {
                console.error("Error fetching calendar data:", error);
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
        return eventTranslations[title] && eventTranslations[title][lang] ? eventTranslations[title][lang] : title;
    }

    fetchTodaysEvent(); // Call the function to load today's event

    // Feedback form functionality
    const feedbackLink = document.getElementById('feedback-link');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const closeBtn = document.getElementById('close-btn');
    const sendBtn = document.getElementById('send-btn');
    const feedbackText = document.getElementById('feedback-text');
    const confirmationMessage = document.getElementById('confirmation-message');

    // Show feedback overlay
    feedbackLink.addEventListener('click', function () {
        feedbackOverlay.style.display = 'block';
    });

    // Close feedback overlay
    closeBtn.addEventListener('click', function () {
        feedbackOverlay.style.display = 'none';
    });

    // Enable/disable send button based on text input
    feedbackText.addEventListener('input', function () {
        sendBtn.disabled = feedbackText.value.trim() === '';
    });

    // Send feedback
    sendBtn.addEventListener('click', function () {
        const feedback = feedbackText.value.trim();
        if (feedback) {
            sendEmail(feedback);
        }
    });

    // Send email using EmailJS
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

    // Additional translation for feedback link
    if (userLang.startsWith('de')) {
        feedbackLink.textContent = 'Feedback und Anfragen';
    } else if (userLang.startsWith('he')) {
        feedbackLink.textContent = 'משוב ובקשות';
    }
});
