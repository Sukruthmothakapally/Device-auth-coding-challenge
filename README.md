# Device Authentication Coding Challenge

## Overview
Create a web application with a secure email authentication flow that includes local device verification.

## Requirements
- Build a simple UI with an email input field accessible from a desktop browser.
- Implement local device authentication before submitting the email to the backend:
  - Use the device's built-in biometric authentication (like Touch ID or Face ID).
  - Do **not** use passkey technology.
  - Only after successful biometric verification should the email be sent to the server.

## Technical Requirements
- **Frontend Interface**: UI for email input.
- **Technology Stack**: Choose any modern frontend/backend stack. You can also use a combination of React, HTML, JavaScript, and TypeScript.
- **Biometric Authentication**: Use local biometric APIs (Web Authentication API excluding passkeys).
- **Email Submission Handling**: Send the email to the backend only after biometric verification.
- **User Feedback**: Provide clear user feedback throughout the authentication process.

## Goal
Ensure that only the legitimate device owner can submit their email through this authentication flow, particularly in **desktop browser environments** where biometric authentication is less common.

## Considerations
- Use available biometric authentication methods for desktop environments.
- Consider platform-specific solutions, such as:
  - **Windows Hello** for Windows users.
  - **MacOS Touch ID** for Mac users (if supported).
- Only after successful biometric verification should the email be sent to the server.

## Suggested Workflow
1. Verify the user's biometrics on the device using platform APIs (without passkeys), such as:
   - Android BiometricPrompt
   - iOS LocalAuthentication
2. Treat the biometric result as a **boolean** (success/failure) instead of cryptographic proof.
3. After successful biometric verification, generate a **time-bound, device-bound token** (not cryptographically signed).

### Interaction Flow
User->>Browser App: Requests access
Browser App->>Device OS: Triggers biometric prompt
Device OS-->>Browser App: Returns "success"
Browser App->>Server: Sends {userId, deviceId, expires}
Server->>Server: Checks:
    1. Is deviceId trusted?
    2. Is the token expired?
Server-->>Browser App: Grants access or denies

## Deliverables
1. **Video Walkthrough**: Record a video with voiceover explaining your solution.
2. **GitHub Repository**: Share a link to your repository containing the solution.

---
