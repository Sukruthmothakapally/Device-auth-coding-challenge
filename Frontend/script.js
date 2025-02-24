const emailInput = document.getElementById("emailInput");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("error-message");

async function handleWindowsAuthentication() {
    try {
        if (!window.PublicKeyCredential) {
            errorMessage.textContent = "Your browser does not support WebAuthn.";
            return false;
        }

        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!isAvailable) {
            errorMessage.textContent = "Windows Hello authentication is not available on this device.";
            return false;
        }

        const challengeBuffer = Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32)));

        const authOptions = {
            challenge: challengeBuffer,
            timeout: 30000, 
            rpId: "localhost",
            userVerification: "required",
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                requireResidentKey: true,
                userVerification: "required"
            },
            allowCredentials: [],
            mediation: "required"
        };

        const credential = await navigator.credentials.get({ publicKey: authOptions });

        if (credential) {
            alert("Windows authentication successful!");
            return true;
        }
    } catch (error) {
        console.error("Authentication error:", error);

        if (error.name === "NotAllowedError") {
            alert("Authentication was cancelled or denied.");
        } else if (error.name === "NotSupportedError") {
            alert("Your Windows authentication method isn't properly configured.");
        } else {
            alert(`Authentication failed: ${error.message || "Please try again."}`);
        }

        return false;
    }
}

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

    if (action === "login") {
        const isAuthenticated = await handleWindowsAuthentication();
        if (!isAuthenticated) {
            return;
        }
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/${action}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail);
        }

        window.location.href = `welcome.html?email=${email}`;
    } catch (error) {
        errorMessage.textContent = error.message;
    }
}

registerBtn.addEventListener("click", () => handleAction("register"));
loginBtn.addEventListener("click", () => handleAction("login"));
