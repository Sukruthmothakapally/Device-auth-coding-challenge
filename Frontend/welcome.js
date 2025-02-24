window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    if (email) {
        document.getElementById("user-email").textContent = email;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        
        window.location.href = "index.html";
    });
};
