const emailInput = document.getElementById("emailInput");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("error-message");

async function handleWindowsAuthentication(action) {
    try {
        console.log("Starting Windows Hello Authentication...");

        if (!window.PublicKeyCredential) {
            console.error("WebAuthn is not supported by this browser.");
            errorMessage.textContent = "Your browser does not support WebAuthn.";
            return false;
        }

        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log("Is Windows Hello available? ", isAvailable);

        if (!isAvailable) {
            errorMessage.textContent = "Windows Hello authentication is not available on this device.";
            return false;
        }

        const challengeBuffer = new Uint8Array(32);
        window.crypto.getRandomValues(challengeBuffer);
        console.log("Generated challenge buffer: ", challengeBuffer);

        const authOptions = {
            challenge: challengeBuffer,
            timeout: 30000,
            rpId: "device-auth-coding-challenge.vercel.app", // need to set current domain here
            userVerification: "required",
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                requireResidentKey: false,
                userVerification: "required"
            },
            pubKeyCredParams: [
                { type: "public-key", alg: -7 },   // ES256
                { type: "public-key", alg: -257 }  // RS256
            ]
        };

        if (action === "login") {
            const credentials = await fetch(`https://7518-73-231-49-218.ngrok-free.app/get-credentials?email=${emailInput.value.trim()}`);
            const credentialData = await credentials.json();
            
            if (credentialData && credentialData.allowCredentials) {
                authOptions.allowCredentials = credentialData.allowCredentials;
            }
        }

        console.log("WebAuthn Request Options: ", authOptions);

        const credential = await navigator.credentials.get({ publicKey: authOptions });
        console.log("Credential received: ", credential);

        if (credential) {
            console.log("Windows Hello authentication successful!");
            alert("Windows authentication successful!");
            return true;
        }
    } catch (error) {
        console.error("Authentication error:", error);

        if (error.name === "NotAllowedError") {
            console.warn("User cancelled authentication or denied permission.");
            alert("Authentication was cancelled or denied.");
        } else if (error.name === "NotSupportedError") {
            console.warn("Windows Hello might not be configured properly.");
            alert("Your Windows authentication method isn't properly configured.");
        } else {
            console.error(`Authentication failed: ${error.message}`);
            alert(`Authentication failed: ${error.message || "Please try again."}`);
        }

        return false;
    }
}

async function handleAction(action) {
    const email = emailInput.value.trim();
    console.log(`Handling action: ${action} for email: ${email}`);

    if (!email) {
        console.warn("Email is required but missing.");
        errorMessage.textContent = "Email is required!";
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.warn("Invalid email format entered.");
        errorMessage.textContent = "Invalid email format!";
        return;
    }

    errorMessage.textContent = "";

    if (action === "login") {
        console.log("Initiating login process with Windows Hello...");
        const isAuthenticated = await handleWindowsAuthentication(action);
        if (!isAuthenticated) {
            console.log("Authentication failed. Stopping login process.");
            return;
        }
    }

    try {
        console.log(`Sending request to server: https://7518-73-231-49-218.ngrok-free.app/${action}`);
        const response = await fetch(`https://7518-73-231-49-218.ngrok-free.app/${action}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        console.log(`Response status: ${response.status}`);

        const data = await response.json();
        console.log("Server response data: ", data);

        if (!response.ok) {
            console.error("Server responded with an error:", data.detail);
            throw new Error(data.detail);
        }

        console.log("Redirecting to welcome page...");
        window.location.href = `welcome.html?email=${email}`;
    } catch (error) {
        console.error("Error in handleAction:", error);
        errorMessage.textContent = error.message;
    }
}

registerBtn.addEventListener("click", () => handleAction("register"));
loginBtn.addEventListener("click", () => handleAction("login"));
