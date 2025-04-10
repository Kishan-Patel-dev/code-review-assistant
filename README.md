# 🤖 Code Review Assistant for Rocket.Chat

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![Status: PoC](https://img.shields.io/badge/status-Proof%20of%20Concept-yellow)
[![Rocket.Chat](https://img.shields.io/badge/Powered%20by-Rocket.Chat-red?logo=rocketchat)](https://rocket.chat)

An AI-powered assistant that helps automate and streamline the code review process inside Rocket.Chat by integrating with GitHub. From reviewer assignment to nudges and LLM-based summaries — this app enhances your team’s productivity and ensures smoother collaboration on pull requests.

---

## 🎯 Features at a Glance

| Feature                             | Status       | Description                                                                 |
|-------------------------------------|--------------|-----------------------------------------------------------------------------|
| 🧩 GitHub Webhook Handler           | ✅ Done       | Listens to `pull_request` events and triggers logic                        |
| 👥 Reviewer Assignment              | ✅ Mock       | Uses scoring logic to assign reviewers (customizable)                      |
| ⏰ Reviewer Reminder                | ✅ Active     | Sends automated reminders for pending PR reviews                           |
| 🤖 LLM-based Review Summary         | ✅ Simulated (PoC) | Posts AI-generated summaries in PR threads (pluggable LLM support planned) |
| ⚙️ Configurable Settings             | ✅ Done       | All logic toggleable via settings panel and `.env`                         |
| 💬 Slash Command (`/cr`)            | ✅ Done       | Interact with the bot directly via Rocket.Chat                             |

---

## 📌 Slash Commands

| Command                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `/cr help`               | Lists all available commands                                               |
| `/cr assign`             | Force assign reviewers to open PR                                          |
| `/cr summary <PR>`       | Generate a review summary for the given pull request                       |
| `/cr review-status <PR>` | View the review reminder status for a given pull request                   |
| `/cr review-config`      | View the current configuration settings (admin-only)                      |
| `/cr initialize`         | Manually initialize app dependencies                                      |

---

## 🔗 GitHub Webhook Setup

To enable GitHub integration, configure a webhook in your GitHub repository:

1. Go to your repository's **Settings** → **Webhooks** → **Add webhook**.
2. Set the **Payload URL** to:
   ```
   https://your.rocketchat/your-app/webhook
   ```
3. Choose **application/json** as the content type.
4. Add the following events:
   - `pull_request`
   - `pull_request_review`
5. Use the **Webhook Secret** from your Rocket.Chat app settings.

---

## 🧠 Summary Generation

The app uses a simulated LLM (Large Language Model) to generate concise summaries of pull requests. The summary includes:

- **Intent**: What the PR aims to do.
- **Impact**: What parts of the codebase or product it affects.
- **Scope**: How big or risky the change is (e.g., refactors, new features, bug fixes).

Example prompt used for summary generation:
```
Summarize the following pull request description and diff context in 2-4 short and precise sentences.

Your summary must include:
- The **intent** (What the PR aims to do)
- The **impact** (What parts of the codebase or product it affects)
- The **scope** (How big or risky the change is, like refactors, new features, bug fixes, etc.)

Pull Request Content: ###
{pull_request_text}
###

Summary:
```

---

## 📦 Example Use Cases

### 1. Automating Reviewer Assignment
- **Scenario**: A new pull request is created in a GitHub repository.
- **Action**: The app automatically assigns reviewers based on their past contributions and activity.
- **Outcome**: Saves time and ensures the most suitable reviewers are assigned.

### 2. Periodic Reviewer Reminders
- **Scenario**: A pull request remains unreviewed for a specified period.
- **Action**: The app sends reminders to assigned reviewers via Rocket.Chat.
- **Outcome**: Ensures timely reviews and prevents PRs from being overlooked.

### 3. AI-Generated Review Summaries
- **Scenario**: A reviewer wants a quick summary of a pull request.
- **Action**: The app generates a mock AI-based summary of the PR using the `/cr summary <pr>` command.
- **Outcome**: Provides a concise overview, helping reviewers focus on critical changes.

### 4. Manual Initialization
- **Scenario**: The app's dependencies need to be re-initialized after a configuration change.
- **Action**: Use the `/cr initialize` command to manually initialize the app's modules.
- **Outcome**: Ensures the app is ready to handle requests with the latest configuration.

---

## 🛠️ Installation & Setup

### Prerequisites
- Install the Rocket.Chat Apps CLI:
  ```bash
  npm install -g @rocket.chat/apps-cli
  ```

### Clone & Install
1. Clone the repository:
   ```bash
   git clone https://github.com/Kishan-Patel-dev/code-review-assistant.git
   cd code-review-assistant
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configure
1. Copy the example configuration file:
   ```bash
   cp .rcappsconfig.example .rcappsconfig
   ```
2. Edit `.rcappsconfig` with your Rocket.Chat server details, username, and password.

### Deploy
Deploy the app to your Rocket.Chat instance:
```bash
rc-apps deploy
```

---

## 🛠️ Development Notes

The app uses Rocket.Chat’s best practices for runtime dependency injection. Services like `IModify`, `IPersistence`, etc., are injected only during runtime (e.g., `onEnable`, slash commands) and are not used directly in constructors. This ensures compliance with the Rocket.Chat Apps-Engine standards and improves maintainability.

---

## 🛡️ Security & Limitations

- Current LLM logic is **simulated for the PoC**; no real inference yet.
- Reviewer scoring is **static** and can be extended.
- Webhook secret verification is enabled but basic.
- GitHub App auth is **not yet production-ready**.
- Secrets should be managed via `.env` or Rocket.Chat settings only.

---

## 💡 Roadmap

- [x] Webhook Handler
- [x] Reviewer Assignment Module
- [x] Reviewer Reminder Logic
- [x] Mock LLM Summary Module
- [ ] Real LLM Integration with prompt templates
- [ ] GitHub App authentication & reviewer API usage [WIP]
- [ ] UI/UX feedback via Rocket.Chat Messages
- [ ] PR stats and heatmaps
- [ ] Role-based access for commands

---

## 🤝 Community & Contributors

Built with ❤️ by:

- **Kishan Patel** – [GitHub](https://github.com/Kishan-Patel-dev)

- Mentors: **Felipe Scuciatto**, **Dnouv** (Rocket.Chat Core Team)

Contributions and suggestions are welcome!  
File issues or PRs in [GitHub Repository](https://github.com/Kishan-Patel-dev/code-review-assistant)

---

## 📚 Documentation & Resources
- [Prompt Engineering](https://www.promptingguide.ai/)
- [Rocket.Chat Apps Hands-On Workshop](https://github.com/RocketChat/Workshop.Apps.Development/)
- [Rocket.Chat Apps Development Guide](https://developer.rocket.chat/apps-engine/getting-started)

## 🙏 Acknowledgments
- GSoC 2025 program
- Rocket.Chat community
- Special Thanks to Project mentor **Felipe Scuciatto**, **Dnouv** & **Rocket.Chat**

## Connect with Me
- [X](https://x.com/KishanPatel_dev)
- [Linkedin](https://www.linkedin.com/in/kishan-patel-dev/)
- [Gmail](kishan.patel.tech.dev@gmail.com)

## 📄 License

MIT License © 2025 Kishan Patel



