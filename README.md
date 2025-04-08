# 🤖 Code Review Assistant for Rocket.Chat

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![Status: PoC](https://img.shields.io/badge/status-Proof%20of%20Concept-yellow)
[![Rocket.Chat](https://img.shields.io/badge/Powered%20by-Rocket.Chat-red?logo=rocketchat)](https://rocket.chat)

An AI-powered assistant that helps automate and streamline the code review process inside Rocket.Chat by integrating with GitHub. From reviewer assignment to nudges and LLM-based summaries — this app enhances your team’s productivity and ensures smoother collaboration on pull requests.

> 🛠 Part of **GSoC 2025** under [Rocket.Chat](https://rocket.chat) | Project: **"Code Review Assistant for Open Source Projects"**

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

## 🔍 Demo Preview

[📹 Watch a short video demo](#)  
or  
![Screenshot](./public/demo.png)

---

## 📐 Architecture Overview

> Modular, clean, and extensible Rocket.Chat App following best practices.

```
+----------------------------+
|        Rocket.Chat        |
|        (App Host)         |
+----------------------------+
           ↓
    Slash Commands ("/cr")
           ↓
  ┌──────────────────────┐
  │ GitHubWebhookHandler │ <--- GitHub Webhooks
  └──────────────────────┘
           ↓
  ┌──────────────────────┐
  │ ReviewerAssignment   │  <-- Scoring Logic
  └──────────────────────┘
           ↓
  ┌──────────────────────┐
  │ ReviewerReminder     │  <-- Periodic Scheduler
  └──────────────────────┘
           ↓
  ┌──────────────────────┐
  │ LLMReviewSummary     │  <-- Pluggable AI Layer
  └──────────────────────┘
```

---

## 📦 Usage Examples

### 📌 Slash Commands
```
/cr help             → List available commands
/cr assign           → Force assign reviewers to open PR
/cr summary <pr>     → Generate review summary (mock)
```

### 📌 GitHub Webhook
Connect your GitHub repository’s webhook to:
```
https://your.rocketchat/your-app/webhook
```
Events Supported: `pull_request`, `issue_comment` (future)

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

### 4. Slash Command for Manual Actions
- **Scenario**: A team member wants to manually assign reviewers or trigger a summary.
- **Action**: Use the `/cr assign` or `/cr summary <pr>` commands in Rocket.Chat.
- **Outcome**: Offers flexibility for manual interventions when needed.

### 5. Configurable Settings for Customization
- **Scenario**: A team wants to adjust the reminder interval or enable/disable AI summaries.
- **Action**: Modify the settings via the Rocket.Chat app settings panel or `.env` file.
- **Outcome**: Allows teams to tailor the app to their specific workflows.

---

## 📁 Project Structure

```
/src
  /models            → Reviewer schema (future)
  /commands          → Slash command logic
  /listeners         → GitHub webhook handler
  /services          → GitHub API, reminders, utilities
     └ ReviewerAssignment.ts
     └ ReviewerReminder.ts
     └ LLMReviewSummary.ts
  /config            → App-level Rocket.Chat settings
/tests               → Unit and integration tests
/public              → Static assets
/.rcappsconfig       → RC App Config
```

---

## ⚙️ Technologies Used

- **Node.js**, **TypeScript**
- **Rocket.Chat Apps Engine**
- **Express.js** (for local testing)
- **MongoDB** with **Mongoose** (mocked in PoC)
- **Jest** (unit testing)
- **dotenv**, **ESLint**, **Prettier**

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

## 🔧 Configuration & Setup

### 📄 `.env`
```env
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY=your_private_key
WEBHOOK_SECRET=your_webhook_secret
```


### 📄 Rocket.Chat Settings Panel
- `github_webhook_secret`
- `review_reminder_interval` (minutes)
- `enable_llm_review_summary` (boolean)
- `llm_provider_choice` (future use)

---

## 🧠 GSoC 2025 Project Goals

This PoC contributes to a broader project proposed to Google Summer of Code 2025:

- 🔁 Automate reviewer workflows based on PR metadata
- 📡 Use LLMs like CodeLlama or Mistral for in-chat PR summaries
- 📬 Nudge inactive reviewers through periodic reminders
- 📊 Build analytics on PR activity per contributor
- 🔒 Ensure security and secret management via Rocket.Chat settings

---

## 🛡️ Security & Limitations

- Current LLM logic is **simulated for the PoC**; no real inference yet
- Reviewer scoring is **static** and can be extended
- Webhook secret verification is enabled but basic
- GitHub App auth is **not yet production-ready**
- Secrets should be managed via `.env` or Rocket.Chat settings only

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



