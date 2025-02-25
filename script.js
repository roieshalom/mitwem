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
                document.getElementById(elementId).textContent = translations[lang].no_info;
            }
        })
        .catch(error => {
            document.getElementById(elementId).textContent = translations[lang].error;
            console.error("Error fetching calendar data:", error);
        });
}

// Get the upcoming weekend dates
const { friday, saturday, sunday } = getUpcomingWeekendDates();

// Update the weekend dates display
document.getElementById("weekend-dates").textContent = `(${formatDate(friday)}, ${formatDate(saturday)}, ${formatDate(sunday)})`;

// Fetch data for the weekend
fetchEventsForDate(friday, "friday-status");
fetchEventsForDate(saturday, "saturday-status");
fetchEventsForDate(sunday, "sunday-status");
