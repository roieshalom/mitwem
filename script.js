document.addEventListener('DOMContentLoaded', function () {
    let CALENDAR_ID, API_KEY;

    emailjs.init("yy6VY8fPG-HIw6Hf1"); // ✅ Your Public Key

    // Feedback Modal Logic
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackText = document.getElementById("feedback-text");
    const sendFeedbackBtn = document.getElementById("send-feedback");
    const feedbackConfirmation = document.getElementById("feedback-confirmation");

    // Show modal when clicking "Feedback"
    document.getElementById("feedback-link").addEventListener("click", () => {
        feedbackModal.style.display = "flex"; // Show overlay
    });

    // Close modal when clicking the "X" button
    document.querySelector(".close-btn").addEventListener("click", () => {
        feedbackModal.style.display = "none";
    });

    // Close modal when clicking outside the content box
    window.addEventListener("click", function(event) {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = "none";
        }
    });

    // Enable the "Send" button when text is entered
    feedbackText.addEventListener("input", () => {
        sendFeedbackBtn.disabled = feedbackText.value.trim() === "";
    });

    // Send feedback via EmailJS
    sendFeedbackBtn.addEventListener("click", function () {
        const feedbackMessage = feedbackText.value.trim();
        if (!feedbackMessage) return; // Prevent empty submissions

        emailjs.send("service_5xcb59c", "template_g9mg4k5", { message: feedbackMessage })
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
