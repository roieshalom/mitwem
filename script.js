document.addEventListener('DOMContentLoaded', function () {
    let CALENDAR_ID, API_KEY;

    // ✅ Correctly Initialize EmailJS
    emailjs.init({ publicKey: "yy6VY8fPG-HIw6Hf1" });

    // ✅ Feedback Modal Logic
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackText = document.getElementById("feedback-text");
    const sendFeedbackBtn = document.getElementById("send-feedback");
    const feedbackConfirmation = document.getElementById("feedback-confirmation");

    // ✅ Ensure clicking "Feedback" only opens the modal
    document.getElementById("feedback-link").addEventListener("click", function (event) {
        event.preventDefault(); // ⛔ Prevent accidental key triggering
        feedbackModal.style.display = "flex"; // ✅ Show overlay properly
    });

    // ✅ Close modal when clicking the "X" button
    document.querySelector(".close-btn").addEventListener("click", () => {
        feedbackModal.style.display = "none";
    });

    // ✅ Close modal when clicking outside the content box
    window.addEventListener("click", function(event) {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = "none";
        }
    });

    // ✅ Prevent CTRL + SHIFT + R from opening the modal
    document.addEventListener("keydown", function(event) {
        if (event.key === "r" && (event.ctrlKey || event.shiftKey)) {
            return; // ✅ Allow page refresh, do nothing
        }
        if (event.key === "r") {
            feedbackModal.style.display = "flex"; // If "r" is pressed alone, open modal
        }
    });

    // ✅ Enable the "Send" button when text is entered
    feedbackText.addEventListener("input", () => {
        sendFeedbackBtn.disabled = feedbackText.value.trim() === "";
    });

    // ✅ Fixed Email Send Function
    sendFeedbackBtn.addEventListener("click", function () {
        const feedbackMessage = feedbackText.value.trim();
        if (!feedbackMessage) return; // Prevent empty submissions

        emailjs.send("service_5xcb59c", "template_g9mg4k5", { 
            message: feedbackMessage 
        }, "yy6VY8fPG-HIw6Hf1") // ✅ Ensure Public Key is Passed
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
