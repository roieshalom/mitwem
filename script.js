document.addEventListener('DOMContentLoaded', function () {
    let CALENDAR_ID, API_KEY;

    // ✅ Load Config (Google Calendar API Keys)
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

    // ✅ Ensure Modal is Hidden by Default
    const feedbackModal = document.getElementById("feedback-modal");
    feedbackModal.style.display = "none"; // ✅ This prevents it from opening automatically

    const feedbackText = document.getElementById("feedback-text");
    const sendFeedbackBtn = document.getElementById("send-feedback");
    const feedbackConfirmation = document.getElementById("feedback-confirmation");
    const feedbackLink = document.getElementById("feedback-link");
    const closeBtn = document.querySelector(".close-btn");

    // ✅ Open Modal Only When Clicking "Feedback" Link
    feedbackLink.addEventListener("click", function (event) {
        event.preventDefault();
        feedbackModal.style.display = "flex";
    });

    // ✅ Close Modal When Clicking "X" Button
    closeBtn.addEventListener("click", () => {
        feedbackModal.style.display = "none";
    });

    // ✅ Close Modal When Clicking Outside It
    window.addEventListener("click", function(event) {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = "none";
        }
    });

    // ✅ Enable "Send" Button Only When User Types
    feedbackText.addEventListener("input", () => {
        sendFeedbackBtn.disabled = feedbackText.value.trim() === "";
    });

    // ✅ Send Feedback via EmailJS
    sendFeedbackBtn.addEventListener("click", function () {
        const feedbackMessage = feedbackText.value.trim();
        if (!feedbackMessage) return;

        emailjs.send("service_5xcb59c", "template_g9mg4k5", { 
            message: feedbackMessage 
        }, "yy6VY8fPG-HIw6Hf1")
        .then(() => {
            feedbackConfirmation.style.display = "block";
            feedbackText.value = "";
            sendFeedbackBtn.disabled = true;
            setTimeout(() => {
                feedbackModal.style.display = "none"; // Close modal after 3 seconds
                feedbackConfirmation.style.display = "none";
            }, 3000);
        })
        .catch(error => console.error("Failed to send feedback:", error));
    });

});
