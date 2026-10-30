# CodeSense AI

CodeSense AI is a JavaScript code review tool I built using Node.js, Express, and ESLint. It checks code for common issues and displays the results in a simple web interface, so you can review problems without having to read through terminal output.

The project started as a way to understand how static code analysis works and how to make the results more useful to developers.

## Features

- **Code analysis:** Detects common JavaScript issues, including undefined variables, unused variables, unreachable code, and equality checks.
- **Suggested fixes:** Shows possible fixes for supported issues, with options to apply individual fixes or apply all available fixes.
- **Quality score:** Gives the reviewed code a score based on the project's scoring logic.
- **Issue explanations:** Provides explanations of detected issues and guidance on how to fix them.
- **Review history:** Saves previous reviews so they can be viewed again or deleted.
- **Analytics:** Displays information about previous code reviews.
- **HTML report export:** Exports review results as an HTML report.
- **Input validation and feedback:** Handles empty input and displays the current analysis status.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Code analysis:** ESLint
- **Frontend:** HTML, CSS, JavaScript
- **Other tools:** npm, Git, GitHub

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your system.

### Installation

Clone the repository:

```bash
git clone https://github.com/LakshayDev04/codesense-ai.git
```

Move into the project directory:

```bash
cd codesense-ai
```

Install the dependencies:

```bash
npm install
```

### Run the application

Start the development server:

```bash
npm run dev
```

Open the following address in your browser:

```text
http://localhost:5000
```

To start the application without nodemon, use:

```bash
npm start
```

## How to Use

1. Open CodeSense AI in your browser.
2. Enter or paste a JavaScript code snippet into the editor.
3. Click **Analyze Code** to run the review.
4. Read the reported issues, their locations, and the suggested guidance.
5. Apply an available fix individually or use Apply All Fixes where supported.
6. Check the quality score and review analytics.
7. Revisit previous reviews through the history section or export a report.

## Example

Try analysing this JavaScript snippet:

```javascript
const age = 18;

if (age == 18) {
  console.log("Adult");
}
```

The analyzer can flag the use of `==` under the configured `eqeqeq` rule and suggest using `===` instead.

```javascript
const age = 18;

if (age === 18) {
  console.log("Adult");
}
```

The issues reported depend on the rules enabled in the project's ESLint configuration.

## Project Structure

```text
codesense-ai/
├── public/
│   ├── js/
│   │   └── app.js
│   └── ...
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── server.js
├── eslint.config.js
├── package.json
├── package-lock.json
├── test-analyzer.js
└── README.md
```

The `public` directory contains the frontend, while `src` contains the server, routes, controllers, and code analysis logic.

## What I Learned

Building this project helped me practise working with Express routes, integrating ESLint into a Node.js application, connecting frontend interactions to backend APIs, and handling analysis results in the UI.

I also worked on applying code fixes safely, protecting against changes made after an analysis, and displaying review history and analytics.

## Future Improvements

- Add more automated tests for different types of JavaScript issues and suggested fixes.
- Improve the accuracy and coverage of automatic fixes.
- Add support for more configurable linting rules.
- Deploy the application so it can be accessed online.
- Improve the review reports and analytics as the project grows.

## Author

**Lakshay Bhardwaj**

GitHub: [LakshayDev04](https://github.com/LakshayDev04)

---

This project is a learning project that I continue to improve as I explore JavaScript tooling and code quality analysis.


# CodeSense AI

CodeSense AI is a web-based code review tool built with JavaScript, Node.js, Express, and ESLint. It helps identify common coding issues and makes code review easier through a simple interface.

## Features

- Analyze JavaScript code for common errors and warnings
- Display issues with their line and column numbers
- Show suggested fixes for supported issues
- Apply individual fixes or apply multiple fixes
- Calculate a code quality score
- View review results through a web interface

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- ESLint

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/LakshayDev04/codesense-ai.git
   ```

2. Open the project folder:

   ```bash
   cd codesense-ai
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in your terminal. If the server uses port 5000, visit `http://localhost:5000`.

## Screenshots

### Dashboard
![CodeSense AI Dashboard](screenshots/dashboard.png)

### Code Analysis
![Code Analysis Results](screenshots/analytics.png)

### Code Quality Score
![Code Quality Score](screenshots/reviewscore.png)

### Suggested Fixes
![Suggested Fixes](screenshots/suggested-fixes.png)

### Issue Breakdown
![Issue Breakdown](screenshots/issue-breakdown.png)


## Project Status

This project is under development. Features and improvements may be added as development continues.
