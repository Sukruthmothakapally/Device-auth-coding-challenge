const emailInput = document.getElementById("emailInput");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("error-message");

async function handleRegistration() {
  console.log("[Registration] Handler started.");
  const email = emailInput.value.trim();
  if (!email) {
    console.log("[Registration] Email field is empty.");
    errorMessage.textContent = "Email is required!";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log("[Registration] Email format is invalid.");
    errorMessage.textContent = "Invalid email format!";
    return;
  }
  console.log("[Registration] Email validated:", email);
  errorMessage.textContent = "";
  try {
    console.log("[Registration] Starting registration with Windows Hello...");
    if (!window.PublicKeyCredential) {
      console.log("[Registration] WebAuthn not supported by browser.");
      errorMessage.textContent = "WebAuthn is not supported by your browser.";
      return;
    }
    console.log("[Registration] Generating challenge and options for credential creation.");
    const challengeBuffer = new Uint8Array(32);
    window.crypto.getRandomValues(challengeBuffer);
    const publicKeyCredentialCreationOptions = {
      challenge: challengeBuffer,
      rp: {
        name: "Biometrics Auth",
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
    console.log("[Registration] Calling navigator.credentials.create() with options:", publicKeyCredentialCreationOptions);
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
    console.log("[Registration] Credential created:", credential);
    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    console.log("[Registration] Storing credentialId in localStorage:", credentialId);
    window.localStorage.setItem("credentialId", credentialId);
    console.log("[Registration] Sending registration request to server.");
    const response = await fetch("https://1f71-73-231-49-218.ngrok-free.app/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, credentialId })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.log("[Registration] Server returned an error:", errorData);
      throw new Error(errorData.detail || "Server registration failed.");
    }
    console.log("[Registration] Registration successful.");
    window.location.href = `welcome.html?email=${email}`;
  } catch (error) {
    console.error("[Registration] Error occurred:", error);
    errorMessage.textContent = error.message;
  }
}

async function handleLogin() {
  console.log("[Login] Handler started.");
  const email = emailInput.value.trim();
  if (!email) {
    console.log("[Login] Email field is empty.");
    errorMessage.textContent = "Email is required!";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log("[Login] Email format is invalid.");
    errorMessage.textContent = "Invalid email format!";
    return;
  }
  console.log("[Login] Email validated:", email);
  errorMessage.textContent = "";
  try {
    console.log("[Login] Starting Windows Hello authentication for login...");
    if (!window.PublicKeyCredential) {
      console.log("[Login] WebAuthn not supported by browser.");
      errorMessage.textContent = "WebAuthn is not supported by your browser.";
      return;
    }
 
    errorMessage.textContent = "Initiating Windows Hello authentication...";
    console.log("[Login] Generating challenge for biometric authentication.");
    const challengeBuffer = new Uint8Array(32);
    window.crypto.getRandomValues(challengeBuffer);
    const storedCredentialId = window.localStorage.getItem("credentialId");
    if (!storedCredentialId) {
      console.log("[Login] No stored credential found in localStorage.");
      throw new Error("No registered credential found. Please register first.");
    }
    console.log("[Login] Retrieved stored credentialId:", storedCredentialId);
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
    console.log("[Login] Calling navigator.credentials.get() with options:", publicKeyCredentialRequestOptions);
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });
    console.log("[Login] Biometric authentication succeeded. Assertion obtained:", assertion);
    errorMessage.textContent = "Biometric authentication successful. Generating device token...";
    
    console.log("[Login] Generating time-bound device token.");
    const expiresDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    const expiresISO = expiresDate.toISOString();
    console.log("[Login] Token expiration set to:", expiresISO);

    const device_id = storedCredentialId;
    const loginPayload = { email, device_id, expires: expiresISO };
    console.log("[Login] Sending login request to server with payload:", loginPayload);
    
    const response = await fetch("https://1f71-73-231-49-218.ngrok-free.app/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log("[Login] Server returned an error:", errorData);
      throw new Error(errorData.detail || "Server login failed.");
    }
    
    console.log("[Login] Login successful.");
    window.location.href = `welcome.html?email=${email}`;
  } catch (error) {
    console.error("[Login] Error occurred:", error);
    if (error.name === "NotAllowedError") {
      errorMessage.textContent = "Authentication was canceled or timed out. Please try again.";
    } else {
      errorMessage.textContent = error.message;
    }
  }
}

console.log("[Main] Adding event listeners for registration and login.");
registerBtn.addEventListener("click", handleRegistration);
loginBtn.addEventListener("click", handleLogin);
