const translations = {
    'en': {
        title: 'Who Are the Girls With?',
        heading: 'Who Are the Girls With Today?',
        checking: 'Checking...',
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
        checking: 'Überprüfung...',
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
        checking: 'בודק...',
        no_info: 'אין מידע זמין להיום.',
        error: 'שגיאה בטעינת הנתונים.',
        with_dad: 'עם אבא',
        with_mom: 'עם אמא',
        this_weekend: 'סוף השבוע הזה',
        mixed: 'מעורב',
        not_sure: 'לא בטוח'
    }
};

const CALENDAR_ID = "3cvfh0265cia5frpnepbhaemp4@group.calendar.google.com";
const API_KEY = "AIzaSyC5Yn2gNLdoCIWctrsnPli-UBfUZ0qdsMY";

// Function to get the upcoming weekend dates (Friday, Saturday, Sunday)
function getUpcomingWeekendDates() {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7; // Days until next Friday

    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);

    const saturday = new Date(friday);
    saturday.setDate(friday.getDate() + 1);

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    return { friday, saturday, sunday };
}

// Function to format dates as "Feb 27"
function formatDate(date) {
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

// Function to fetch calendar events for a specific date
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

// Function to translate event titles based on the selected language
function translateEvent(eventTitle, lang) {
    if (eventTitle === 'Roie') {
        return translations[lang].with_dad;
    } else if (eventTitle === 'Anat') {
        return translations[lang].with_mom;
    } else {
        return eventTitle;
    }
}

// Function to detect the browser language and set the primary language
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

// Get the primary language from the browser settings
const primaryLang = detectBrowserLanguage();
// Set the page title, heading, and status based on the selected language
const pageTitleElement = document.getElementById("page-title");
const pageHeadingElement = document.getElementById("page-heading");
const statusElement = document.getElementById("status");
const weekendStatusElement = document.getElementById("weekend-status");

if (!pageTitleElement || !pageHeadingElement || !statusElement || !weekendStatusElement) {
    console.error("Required HTML elements are missing");
    throw new Error("Required HTML elements are missing"); // Stop execution if elements are missing
}

pageTitleElement.textContent = translations[primaryLang].title;
pageHeadingElement.textContent = translations[primaryLang].heading;
statusElement.textContent = translations[primaryLang].checking;

// Set the body class based on the language
document.body.className = primaryLang === 'he' ? 'rtl' : 'ltr';

// Get the upcoming weekend dates
const { friday, saturday, sunday } = getUpcomingWeekendDates();

Promise.all([fetchEventsForDate(friday), fetchEventsForDate(saturday), fetchEventsForDate(sunday)])
    .then(results => {
        const [fridayEvent, saturdayEvent, sundayEvent] = results.map(event => translateEvent(event, primaryLang));
        let weekendStatus;

        if (fridayEvent && fridayEvent === saturdayEvent && saturdayEvent === sundayEvent) {
            weekendStatus = fridayEvent;
        } else if (fridayEvent || saturdayEvent || sundayEvent) {
            weekendStatus = translations[primaryLang].mixed;
        } else {
            weekendStatus = translations[primaryLang].not_sure;
        }

        weekendStatusElement.textContent = `${translations[primaryLang].this_weekend}: ${weekendStatus}`;
    });

// Fetch data for today
const today = new Date();
fetchEventsForDate(today).then(eventTitle => {
    const translatedTitle = translateEvent(eventTitle, primaryLang);
    statusElement.textContent = translatedTitle || translations[primaryLang].no_info;
});
