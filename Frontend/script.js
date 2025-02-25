const emailInput = document.getElementById("emailInput");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("error-message");

async function handleRegistration() {
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
    console.log("Starting registration with Windows Hello...");

    if (!window.PublicKeyCredential) {
      errorMessage.textContent = "WebAuthn is not supported by your browser.";
      return;
    }

    const challengeBuffer = new Uint8Array(32);
    window.crypto.getRandomValues(challengeBuffer);

    const publicKeyCredentialCreationOptions = {
      challenge: challengeBuffer,
      rp: {
        name: "Your App Name",
        id: "device-auth-coding-challenge.vercel.app"
      },
      user: {

        id: Uint8Array.from(email, c => c.charCodeAt(0)),
        name: email,
        displayName: email
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", 
        userVerification: "required"
      },
      timeout: 30000,
      attestation: "none" 
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
    console.log("Credential created:", credential);

    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    window.localStorage.setItem("credentialId", credentialId);

    const apiUrl = process.env.FASTAPI_URL;
    const response = await fetch(`${apiUrl}/register`, {
    method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, credentialId })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Server registration failed.");
    }

    console.log("Registration successful.");
    window.location.href = `welcome.html?email=${email}`;
  } catch (error) {
    console.error("Registration error:", error);
    errorMessage.textContent = error.message;
  }
}

async function handleLogin() {
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
    console.log("Starting Windows Hello authentication for login...");

    if (!window.PublicKeyCredential) {
      errorMessage.textContent = "WebAuthn is not supported by your browser.";
      return;
    }

    const challengeBuffer = new Uint8Array(32);
    window.crypto.getRandomValues(challengeBuffer);

    const storedCredentialId = window.localStorage.getItem("credentialId");
    if (!storedCredentialId) {
      throw new Error("No registered credential found. Please register first.");
    }

    const credIdUint8 = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0));

    const publicKeyCredentialRequestOptions = {
      challenge: challengeBuffer,
      timeout: 30000,
      rpId: "device-auth-coding-challenge.vercel.app",
      userVerification: "required",
      allowCredentials: [
        {
          type: "public-key",
          id: credIdUint8,
          transports: ["internal"]
        }
      ]
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });
    console.log("Assertion obtained:", assertion);

    const signature = btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature)));
    const response = await fetch(`${apiUrl}/login`, {
    method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, assertion: signature })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Server login failed.");
    }

    console.log("Login successful.");
    window.location.href = `welcome.html?email=${email}`;
  } catch (error) {
    console.error("Login error:", error);
    errorMessage.textContent = error.message;
  }
}

registerBtn.addEventListener("click", handleRegistration);
loginBtn.addEventListener("click", handleLogin);
