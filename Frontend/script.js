const emailInput = document.getElementById("emailInput");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("error-message");

async function handleAction(action) {
    const email = emailInput.value.trim();

    if (!email) {
        errorMessage.textContent = "Email is required!";
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage.textContent = "Invalid email format!";
        return;
    }

    errorMessage.textContent = "";

    try {
        const response = await fetch(`http://127.0.0.1:8000/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail);
        }

        alert(`${action} successful! User ID: ${data.id}`);

        if (action === "login" || action === "register") {
            window.location.href = `welcome.html?email=${email}`;
        }
    } catch (error) {
        errorMessage.textContent = error.message;
    }
}

registerBtn.addEventListener("click", () => handleAction("register"));
loginBtn.addEventListener("click", () => handleAction("login"));
