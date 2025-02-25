const translations = {
    'en': {
        title: 'Who Are the Girls With?',
        heading: 'Who Are the Girls With Today?',
        checking: 'Checking...',
        no_info: 'No info available today.',
        error: 'Error loading data.',
        with_dad: 'With Dad',
        with_mom: 'With Mom'
    },
    'de': {
        title: 'Mit wem sind Gali und Daniella?',
        heading: 'Mit wem sind Gali und Daniella heute zusammen?',
        checking: 'Überprüfung...',
        no_info: 'Keine Informationen für heute verfügbar.',
        error: 'Fehler beim Laden der Daten.',
        with_dad: 'Mit Papa',
        with_mom: 'Mit Mama'
    },
    'he': {
        title: 'עם מי גלי ודניאלה היום?',
        heading: 'עם מי גלי ודניאלה היום?',
        checking: 'בודק...',
        no_info: 'אין מידע זמין להיום.',
        error: 'שגיאה בטעינת הנתונים.',
        with_dad: 'עם אבא',
        with_mom: 'עם אמא'
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
function fetchEventsForDate(date, elementId) {
    const isoDate = date.toISOString().split("T")[0];
    const timeMin = `${isoDate}T00:00:00-00:00`;
    const timeMax = `${isoDate}T23:59:59-00:00`;

    fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const eventTitle = data.items[0].summary;
                const translatedTitle = translateEvent(eventTitle, primaryLang);
                document.getElementById(elementId).textContent = translatedTitle;
            } else {
                document.getElementById(elementId).textContent = translations[primaryLang].no_info;
            }
        })
        .catch(error => {
            document.getElementById(elementId).textContent = translations[primaryLang].error;
            console.error("Error fetching calendar data:", error);
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

// Get the primary language from the document (default to English)
const primaryLang = document.documentElement.lang || 'en';

// Set the page title and heading based on the selected language
document.getElementById("page-title").textContent = translations[primaryLang].title;
document.getElementById("page-heading").textContent = translations[primaryLang].heading;
document.getElementById("status").textContent = translations[primaryLang].checking;

// Get the upcoming weekend dates
const { friday, saturday, sunday } = getUpcomingWeekendDates();

// Update the weekend dates display
document.getElementById("weekend-dates").textContent = `(${formatDate(friday)}, ${formatDate(saturday)}, ${formatDate(sunday)})`;

// Fetch data for the weekend
fetchEventsForDate(friday, "friday-status");
fetchEventsForDate(saturday, "saturday-status");
fetchEventsForDate(sunday, "sunday-status");

// Fetch data for today
const today = new Date();
fetchEventsForDate(today, "status");
