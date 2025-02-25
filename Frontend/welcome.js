window.onload = () => {
    console.log("[Welcome] Page loaded. Parsing URL parameters.");
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    if (email) {
        console.log("[Welcome] Found email in URL:", email);
        document.getElementById("user-email").textContent = email;
    } else {
        console.log("[Welcome] No email found in URL.");
    }

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        console.log("[Welcome] Logout button clicked. Redirecting to index.html");
        window.location.href = "index.html";
    });
};
