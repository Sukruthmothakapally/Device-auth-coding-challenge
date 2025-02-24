// Selecting elements
const emailInput = document.getElementById("emailInput");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("error-message");

// Function to validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Event listeners for buttons
registerBtn.addEventListener("click", () => handleAction("register"));
loginBtn.addEventListener("click", () => handleAction("login"));

// function for Register/Login actions
function handleAction(action) {
    const email = emailInput.value.trim();

    if (!email) {
        errorMessage.textContent = "Email is required!";
        return;
    }

    if (!isValidEmail(email)) {
        errorMessage.textContent = "Invalid email format!";
        return;
    }

    errorMessage.textContent = "";
    alert(`You clicked ${action} with email: ${email}`);
}
