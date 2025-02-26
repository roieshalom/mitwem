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
        status.textContent = 'Mit Mama';
        weekendStatus.textContent = 'Dieses Wochenende: Mit Papa';
    } else if (userLang.startsWith('he')) {
        pageTitle.textContent = 'עם מי הבנות היום?';
        pageHeading.textContent = 'עם מי הבנות היום?';
        status.textContent = 'עם אמא';
        weekendStatus.textContent = 'בסוף השבוע הזה: עם אבא';
    }

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
        })
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            // Show confirmation message
            confirmationMessage.style.display = 'block';

            // Reset form
            feedbackText.value = '';
            sendBtn.disabled = true;

            // Hide confirmation message after 3 seconds
            setTimeout(function () {
                confirmationMessage.style.display = 'none';
                feedbackOverlay.style.display = 'none';
            }, 3000);
        }, function(error) {
            console.log('FAILED...', error);
        });
    }

    // Additional translation for feedback link
    if (userLang.startsWith('de')) {
        feedbackLink.textContent = 'Feedback und Anfragen';
    } else if (userLang.startsWith('he')) {
        feedbackLink.textContent = 'משוב ובקשות';
    }
});
