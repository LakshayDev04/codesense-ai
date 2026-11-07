
const codeInput = document.getElementById("codeInput");
const analyzeBtn = document.getElementById("analyzeBtn");
// Ollama AI Review elements
const aiReviewBtn = document.getElementById("aiReviewBtn");

const aiReviewPanel = document.getElementById("aiReviewPanel");

const aiReviewContent = document.getElementById("aiReviewContent");
// AI Coding Chat elements
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const chatClearBtn = document.getElementById("chatClearBtn");
const chatStatus = document.getElementById("chatStatus");
const chatIncludeCode = document.getElementById("chatIncludeCode");

// Stores previous conversation messages
let chatHistory = [];
const clearBtn = document.getElementById("clearBtn");
const applyAllBtn = document.createElement("button");
const exportReportBtn = document.getElementById("exportReportBtn");
const formatBtn = document.getElementById("formatBtn");
const languageSelect = document.getElementById("languageSelect");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const themeToggle = document.getElementById("themeToggle");
const reviewHistoryList = document.getElementById("reviewHistoryList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
// Review history search and filter controls
const historySearch = document.getElementById("historySearch");
const historyDateFilter = document.getElementById("historyDateFilter");
const qualityFilter = document.getElementById("qualityFilter");
const issueFilter = document.getElementById("issueFilter");
applyAllBtn.type = "button";
applyAllBtn.id = "applyAllBtn";
applyAllBtn.className = "apply-fix-btn";
applyAllBtn.textContent = "Apply All Fixes";
applyAllBtn.hidden = true;

analyzeBtn.insertAdjacentElement("afterend", applyAllBtn);
const editorMessage = document.getElementById("editorMessage");
const results = document.getElementById("results");

const averageQualityScore = document.getElementById("averageQualityScore");
const totalErrorsElement = document.getElementById("totalErrors");
const totalWarningsElement = document.getElementById("totalWarnings");
const qualityScoreTrend = document.getElementById("qualityScoreTrend");
const qualityScoreCanvas = document.getElementById("qualityScoreChart");

let qualityScoreChart = null;
const issueBreakdownCanvas = document.getElementById(
  "issueBreakdownChart"
);

let issueBreakdownChart = null;

const reviewCount = document.getElementById("reviewCount");
const issueCount = document.getElementById("issueCount");
const reviewStatus = document.getElementById("reviewStatus");
// Initialize the advanced CodeMirror editor.
let editor = null;

if (typeof CodeMirror !== "undefined") {
  editor = CodeMirror.fromTextArea(codeInput, {
    mode: "javascript",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: true,
    electricChars: true,
    autoCloseBrackets: true,
    matchBrackets: true,

    extraKeys: {
      "Ctrl-Enter": function (cm) {
        analyzeBtn.click();
      },
      "Cmd-Enter": function (cm) {
        analyzeBtn.click();
      },
      "Ctrl-/": "toggleComment",
      "Cmd-/": "toggleComment",
      "Tab": function (cm) {
        cm.execCommand("indentMore");
      },
      "Shift-Tab": function (cm) {
        cm.execCommand("indentLess");
      }
    }
  });

  editor.on("change", () => {
    editor.save();

  });
  // Update cursor position whenever the cursor moves.
  editor.on("cursorActivity", updateCursorPosition);
}
if (languageSelect && formatBtn) {
  formatBtn.disabled = languageSelect.value !== "javascript";
}

// Change editor language dynamically.
if (editor && languageSelect) {
  languageSelect.addEventListener("change", function () {

    const selectedLanguage = languageSelect.value;

    // Update syntax highlighting.
    editor.setOption("mode", selectedLanguage);

    // Enable formatting only for JavaScript.
    if (selectedLanguage === "javascript") {
      formatBtn.disabled = false;
      formatBtn.textContent = "Format Code";
      formatBtn.title = "Format JavaScript code";
    }
    else {
      formatBtn.disabled = true;
      formatBtn.textContent = "Format Code (JS only)";
      formatBtn.title = "Formatting is currently supported only for JavaScript";
    }

    updateCurrentLanguage();
  });
}

// Toggle between dark and light editor themes.
if (editor && themeToggle) {
  themeToggle.addEventListener("change", function () {

    const selectedTheme = themeToggle.checked
      ? "default"
      : "dracula";

    editor.setOption("theme", selectedTheme);
    editor.refresh();

    console.log("Current theme:", selectedTheme);
  });
}



// Helper to read the current editor content.
function getEditorCode() {
  return editor ? editor.getValue() : codeInput.value;
}
// Update editor statistics.
function updateEditorStats() {
  const code = getEditorCode();

  const lines = code.split("\n").length;
  const characters = code.length;
  const words = code.trim() ? code.trim().split(/\s+/).length : 0;

  document.getElementById("lineCount").textContent = lines;
  document.getElementById("charCount").textContent = characters;
  document.getElementById("wordCount").textContent = words;
}

// Update cursor position.
function updateCursorPosition() {
  if (!editor) return;

  const cursor = editor.getCursor();

  document.getElementById("cursorPosition").textContent =
    `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
}

// Update displayed language.
function updateCurrentLanguage() {
  const languageNames = {
    javascript: "JavaScript",
    python: "Python",
    "text/x-c++src": "C++",
    "text/x-java": "Java"
  };

  document.getElementById("currentLanguage").textContent =
    languageNames[languageSelect.value] || "Text";
}

// Set initial status bar values when page loads.
updateCursorPosition();
updateCurrentLanguage();
// Update statistics whenever editor content changes.
if (editor) {
  editor.on("change", updateEditorStats);
}

// Show initial statistics.
updateEditorStats();

// Helper to update the editor content.
function setEditorCode(code) {
  if (editor) {
    editor.setValue(code);
    editor.save();
  } else {
    codeInput.value = code;
  }
}
// Toggle fullscreen editor.
fullscreenBtn.addEventListener("click", async function () {
  const editorContainer = document.querySelector(".editor-container");

  if (!editorContainer) {
    alert("Editor container not found.");
    return;
  }

  try {
    if (!document.fullscreenElement) {
      await editorContainer.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error("Fullscreen error:", error);
    alert("Could not open fullscreen mode.");
  }
});

// Update button text when fullscreen changes.
document.addEventListener("fullscreenchange", function () {
  if (document.fullscreenElement) {
    fullscreenBtn.textContent = "✕ Exit Fullscreen";
  } else {
    fullscreenBtn.textContent = "⛶ Fullscreen";
  }

  if (editor) {
    editor.refresh();
  }
});

// Helper to focus the editor.
function focusEditor() {
  if (editor) {
    editor.focus();
  } else {
    codeInput.focus();
  }
}
// Format JavaScript code using Prettier.
async function formatCode() {
  const code = getEditorCode();

  if (!code.trim()) {
    alert("Please enter some code before formatting.");
    return;
  }

  try {
    formatBtn.disabled = true;
    formatBtn.textContent = "Formatting...";

    const formattedCode = await prettier.format(code, {
      parser: "babel",
      plugins: [
        prettierPlugins.babel,
        prettierPlugins.estree
      ],
      semi: true,
      singleQuote: false,
      tabWidth: 4,
      useTabs: false
    });

    setEditorCode(formattedCode);
    focusEditor();

  } catch (error) {
    console.error("Formatting failed:", error);
    alert("Could not format this code. Please check its JavaScript syntax.");
  } finally {
    formatBtn.disabled = false;
    formatBtn.textContent = "Format Code";
  }
}

// Connect the button to the formatter.
formatBtn.addEventListener("click", formatCode);


const REVIEW_HISTORY_KEY = "codesense_review_history";

let reviewHistory = [];

let totalReviews = 0;


function loadReviewHistory() {
  try {
    const savedHistory = localStorage.getItem(
      REVIEW_HISTORY_KEY
    );

    const parsedHistory = savedHistory
      ? JSON.parse(savedHistory)
      : [];

    reviewHistory = Array.isArray(parsedHistory)
      ? parsedHistory
      : [];
  } catch (error) {
    console.error("Unable to load review history:", error);
    reviewHistory = [];
  }

  totalReviews = reviewHistory.length;
  reviewCount.textContent = String(totalReviews);
  renderReviewHistory();
  renderAnalytics();
}

function saveReviewHistory() {
  try {
    localStorage.setItem(
      REVIEW_HISTORY_KEY,
      JSON.stringify(reviewHistory)
    );
    return true;
  } catch (error) {
    console.error("Unable to save review history:", error);
    editorMessage.textContent =
      "Review completed, but history could not be saved.";
    return false;
  }
}


function deleteReviewFromHistory(reviewId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this review? This cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  const previousHistory = reviewHistory;
  reviewHistory = reviewHistory.filter(
    (review) => review.id !== reviewId
  );

  if (reviewHistory.length === previousHistory.length) {
    editorMessage.textContent = "Review not found in history.";
    return;
  }

  if (!saveReviewHistory()) {
    reviewHistory = previousHistory;
    renderReviewHistory();
    renderAnalytics();
    return;
  }

  totalReviews = reviewHistory.length;
  reviewCount.textContent = String(totalReviews);

  renderReviewHistory();
  renderAnalytics();

  editorMessage.textContent = "Review deleted successfully.";
}


function addReviewToHistory(code, issues) {
  const score = calculateQualityScore(issues);

  const review = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    code,
    issueCount: issues.length,
    errors: issues.filter(
      (issue) => issue.severity === "error"
    ).length,
    warnings: issues.filter(
      (issue) => issue.severity === "warning"
    ).length,
    qualityScore: score,
    issues
  };

  reviewHistory.unshift(review);

  const saved = saveReviewHistory();

  if (!saved) {
    reviewHistory.shift();
    return false;
  }

  totalReviews = reviewHistory.length;
  reviewCount.textContent = String(totalReviews);
  renderReviewHistory();
  renderAnalytics();

  return true;
}
function getFilteredReviews() {
  const searchText = historySearch.value.trim().toLowerCase();
  const selectedDate = historyDateFilter.value;
  const selectedQuality = qualityFilter.value;
  const selectedIssues = issueFilter.value;

  return reviewHistory.filter((review) => {
    // Search inside the saved code
    const searchableText = [
      review.code || "",
      JSON.stringify(review.issues || []),
      String(review.qualityScore ?? ""),
      String(review.issueCount ?? ""),
      String(review.errors ?? ""),
      String(review.warnings ?? "")
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(searchText);

    // Match the selected date
    const reviewDate = new Date(review.date);
    const localReviewDate = [
      reviewDate.getFullYear(),
      String(reviewDate.getMonth() + 1).padStart(2, "0"),
      String(reviewDate.getDate()).padStart(2, "0")
    ].join("-");

    const matchesDate =
      !selectedDate || localReviewDate === selectedDate;

    // Match quality score
    const score = Number(review.qualityScore);

    const matchesQuality =
      selectedQuality === "all" ||
      (selectedQuality === "excellent" && score >= 80) ||
      (selectedQuality === "good" && score >= 60 && score < 80) ||
      (selectedQuality === "average" && score >= 40 && score < 60) ||
      (selectedQuality === "poor" && score < 40);

    // Match issue count
    const count = Number(review.issueCount);

    const matchesIssues =
      selectedIssues === "all" ||
      (selectedIssues === "none" && count === 0) ||
      (selectedIssues === "low" && count >= 1 && count <= 5) ||
      (selectedIssues === "medium" && count >= 6 && count <= 10) ||
      (selectedIssues === "high" && count > 10);

    return (
      matchesSearch &&
      matchesDate &&
      matchesQuality &&
      matchesIssues
    );
  });
}


function renderReviewHistory() {
  reviewHistoryList.replaceChildren();

  if (reviewHistory.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const title = createTextElement(
      "p",
      "text-slate-300 font-medium",
      "No reviews saved yet"
    );

    const description = createTextElement(
      "p",
      "text-sm text-slate-500 mt-2",
      "Your completed reviews will appear here."
    );

    emptyState.append(title, description);
    reviewHistoryList.appendChild(emptyState);
    return;
  }

  const filteredReviews = getFilteredReviews();

  if (filteredReviews.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    emptyState.textContent = "No reviews match your search or filters.";

    reviewHistoryList.appendChild(emptyState);
    return;
  }

  filteredReviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "issue-card";

    const date = new Date(review.date);
    const formattedDate = Number.isNaN(date.getTime())
      ? "Unknown date"
      : date.toLocaleString();

    const heading = createTextElement(
      "h4",
      "font-semibold",
      formattedDate
    );

    const score = createTextElement(
      "p",
      "text-sm text-slate-300 mt-2",
      `Quality Score: ${review.qualityScore}/100`
    );

    const issueDetails = createTextElement(
      "p",
      "text-sm text-slate-400 mt-1",
      `Issues: ${review.issueCount} · Errors: ${review.errors} · Warnings: ${review.warnings}`
    );

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "apply-fix-btn mt-4 mr-3";
    viewButton.textContent = "View Review";

    viewButton.addEventListener("click", () => {
      setEditorCode(review.code);
      issueCount.textContent = String(review.issueCount);

      renderResults(review.issues, review.code);

      reviewStatus.textContent = "Previous Review";
      editorMessage.textContent =
        "Previous review loaded. Your saved code is restored.";
    });


    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "apply-fix-btn mt-4";
    deleteButton.textContent = "Delete Review";

    deleteButton.addEventListener("click", () => {
      deleteReviewFromHistory(review.id);
    });


    card.append(
      heading,
      score,
      issueDetails,
      viewButton,
      deleteButton
    );

    reviewHistoryList.appendChild(card);
  });
}
// Refresh review history whenever a filter changes.
historySearch.addEventListener("input", renderReviewHistory);
historyDateFilter.addEventListener("change", renderReviewHistory);
qualityFilter.addEventListener("change", renderReviewHistory);
issueFilter.addEventListener("change", renderReviewHistory);

function renderAnalytics() {
  const validReviews = reviewHistory.filter(
    (review) =>
      Number.isFinite(review.qualityScore) &&
      Number.isFinite(review.errors) &&
      Number.isFinite(review.warnings)
  );

  if (reviewHistory.length === 0) {
    averageQualityScore.textContent = "0/100";
    totalErrorsElement.textContent = "0";
    totalWarningsElement.textContent = "0";

    if (qualityScoreChart) {
      qualityScoreChart.destroy();
      qualityScoreChart = null;
    }
    if (issueBreakdownChart) {
      issueBreakdownChart.destroy();
      issueBreakdownChart = null;
    }

    return;
  }

  const totalScore = validReviews.reduce(
    (sum, review) => sum + review.qualityScore,
    0
  );

  const averageScore = validReviews.length
    ? Math.round(totalScore / validReviews.length)
    : 0;

  const errors = validReviews.reduce(
    (sum, review) => sum + review.errors,
    0
  );

  const warnings = validReviews.reduce(
    (sum, review) => sum + review.warnings,
    0
  );

  averageQualityScore.textContent = `${averageScore}/100`;
  totalErrorsElement.textContent = String(errors);
  totalWarningsElement.textContent = String(warnings);

  if (typeof Chart === "undefined" || !qualityScoreCanvas) {
    console.error(
      "Chart.js or the quality score canvas is unavailable."
    );
    return;
  }

  const recentReviews = [...validReviews]
    .reverse()
    .slice(-7);

  const labels = recentReviews.map((review) => {
    const date = new Date(review.date);

    return Number.isNaN(date.getTime())
      ? "Unknown date"
      : date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
  });

  const scores = recentReviews.map(
    (review) => review.qualityScore
  );

  if (qualityScoreChart) {
    qualityScoreChart.destroy();
  }

  qualityScoreChart = new Chart(qualityScoreCanvas, {
    type: "line",

    data: {
      labels,

      datasets: [
        {
          label: "Quality Score",
          data: scores,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          pointBackgroundColor: "#60a5fa",
          pointBorderColor: "#ffffff",
          pointRadius: 5,
          pointHoverRadius: 8,
          borderWidth: 3,
          tension: 0.3,
          fill: true
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: "index"
      },

      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#cbd5e1"
          }
        },

        tooltip: {
          enabled: true,

          callbacks: {
            label(context) {
              return `Quality Score: ${context.parsed.y}/100`;
            }
          }
        }
      },

      scales: {
        x: {
          ticks: {
            color: "#94a3b8",
            maxRotation: 45,
            minRotation: 0
          },

          grid: {
            color: "rgba(148, 163, 184, 0.12)"
          }
        },

        y: {
          min: 0,
          max: 100,

          ticks: {
            color: "#94a3b8",
            stepSize: 20
          },

          grid: {
            color: "rgba(148, 163, 184, 0.12)"
          },

          title: {
            display: true,
            text: "Quality Score",
            color: "#cbd5e1"
          }
        }
      }
    }
  });
  if (issueBreakdownChart) {
    issueBreakdownChart.destroy();
  }

  issueBreakdownChart = new Chart(issueBreakdownCanvas, {
    type: "doughnut",

    data: {
      labels: ["Errors", "Warnings"],

      datasets: [
        {
          label: "Issue Count",
          data: [errors, warnings],
          backgroundColor: ["#ef4444", "#f59e0b"],
          borderColor: ["#1e293b", "#1e293b"],
          borderWidth: 3,
          hoverOffset: 12
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            color: "#cbd5e1",
            padding: 20
          }
        },

        tooltip: {
          enabled: true,

          callbacks: {
            label(context) {
              return `${context.label}: ${context.parsed}`;
            }
          }
        }
      }
    }
  });
}
let currentOriginalCode = "";
let currentFixes = [];
let latestReviewForExport = null;



clearBtn.addEventListener("click", () => {
  // Clear the editor.
  setEditorCode("");

  // Invalidate the previous analysis and its fixes.
  currentOriginalCode = "";
  currentFixes = [];

  // Hide Apply All Fixes until a new analysis is ready.
  applyAllBtn.hidden = true;

  // Reset the visible results.
  editorMessage.textContent = "Editor cleared.";
  results.replaceChildren();
  issueCount.textContent = "0";
  reviewStatus.textContent = "Ready";

  focusEditor();
});

// Create an element safely using textContent.
function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

// Display the summary of the analysis.
function renderSummary(issues) {
  const summary = document.createElement("div");
  summary.className = "issue-summary";

  const errors = issues.filter(
    (issue) => issue.severity === "error"
  ).length;

  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;


  const score = calculateQualityScore(issues);
  const qualityLabel = getQualityLabel(score);

  const items = [
    {
      label: "Quality Score",
      count: `${score}/100 (${qualityLabel})`
    },
    { label: "Total Issues", count: issues.length },
    { label: "Errors", count: errors },
    { label: "Warnings", count: warnings }
  ];


  items.forEach((item) => {
    const stat = document.createElement("div");
    stat.className = "issue-summary-item";

    if (item.label === "Quality Score") {
      stat.classList.add("quality-score-card");
      stat.dataset.quality = getQualityLabel(score)
        .toLowerCase()
        .replaceAll(" ", "-");
    }

    const label = createTextElement("p", "", item.label);
    const count = createTextElement(
      "strong",
      "",
      String(item.count)
    );



    stat.append(label, count);
    summary.appendChild(stat);
  });

  results.appendChild(summary);
}

function calculateQualityScore(issues) {
  const errors = issues.filter(
    (issue) => issue.severity === "error"
  ).length;

  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;

  const penalty = errors * 15 + warnings * 5;

  return Math.max(0, 100 - penalty);
}


function getQualityLabel(score) {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 50) {
    return "Needs Improvement";
  }

  return "Poor";
}

function exportReviewReport(review) {
  if (!review) {
    editorMessage.textContent =
      "Analyze some code before exporting a report.";
    return;
  }

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });

  const errors = review.issues.filter(
    (issue) => issue.severity === "error"
  ).length;

  const warnings = review.issues.filter(
    (issue) => issue.severity === "warning"
  ).length;

  const issueRows = review.issues.length
    ? review.issues.map((issue) => `
        <tr>
          <td>${escapeHtml(issue.title || issue.ruleId || "Code issue")}</td>
          <td>${escapeHtml(issue.severity || "warning")}</td>
          <td>${escapeHtml(issue.message || "")}</td>
          <td>${escapeHtml(issue.line ?? "—")}</td>
          <td>${escapeHtml(issue.ruleId || "—")}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="5">No issues reported.</td></tr>`;

  const date = new Date(review.date).toLocaleString();

  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CodeSense AI Review Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1e293b;
      line-height: 1.6;
    }
    h1, h2 { color: #0f172a; }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin: 24px 0;
    }
    .stat {
      flex: 1;
      min-width: 150px;
      padding: 18px;
      background: #f1f5f9;
      border-radius: 10px;
    }
    .stat strong {
      display: block;
      font-size: 28px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      border: 1px solid #cbd5e1;
      text-align: left;
      overflow-wrap: anywhere;
    }
    th { background: #e2e8f0; }
    pre {
      padding: 16px;
      background: #f1f5f9;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      border-radius: 8px;
    }
    .error { color: #b91c1c; }
    .warning { color: #b45309; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <h1>CodeSense AI Review Report</h1>
  <p>Generated: ${escapeHtml(date)}</p>

  <div class="stats">
    <div class="stat">
      Quality Score
      <strong>${escapeHtml(review.qualityScore)}/100</strong>
      ${escapeHtml(getQualityLabel(review.qualityScore))}
    </div>
    <div class="stat">
      Total Issues
      <strong>${review.issues.length}</strong>
    </div>
    <div class="stat">
      Errors
      <strong class="error">${errors}</strong>
    </div>
    <div class="stat">
      Warnings
      <strong class="warning">${warnings}</strong>
    </div>
  </div>

  <h2>Detected Issues</h2>
  <table>
    <thead>
      <tr>
        <th>Issue</th>
        <th>Severity</th>
        <th>Description</th>
        <th>Line</th>
        <th>Rule</th>
      </tr>
    </thead>
    <tbody>${issueRows}</tbody>
  </table>

  <h2>Reviewed Code</h2>
  <pre><code>${escapeHtml(review.code)}</code></pre>
</body>
</html>`;

  const blob = new Blob([reportHtml], {
    type: "text/html;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `codesense-review-${Date.now()}.html`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  editorMessage.textContent =
    "Review report downloaded successfully.";
}



// Check whether a suggested replacement is safe to apply.
function isValidFix(fix, sourceLength) {
  return Boolean(
    fix &&
    Array.isArray(fix.range) &&
    fix.range.length === 2 &&
    Number.isInteger(fix.range[0]) &&
    Number.isInteger(fix.range[1]) &&
    fix.range[0] >= 0 &&
    fix.range[1] >= fix.range[0] &&
    fix.range[1] <= sourceLength &&
    typeof fix.text === "string"
  );
}

function getApplicableFixes(issues, originalCode) {
  const fixes = [];

  issues.forEach((issue) => {
    // Prefer a direct automatic fix when one exists.
    if (issue.fixAvailable && isValidFix(issue.fix, originalCode.length)) {
      fixes.push(issue.fix);
      return;
    }

    // Suggestions are alternatives, so choose only the first
    // valid suggestion for each issue.
    const suggestions = Array.isArray(issue.suggestions)
      ? issue.suggestions
      : [];

    const firstValidSuggestion = suggestions.find(
      (suggestion) =>
        isValidFix(suggestion.fix, originalCode.length)
    );

    if (firstValidSuggestion) {
      fixes.push(firstValidSuggestion.fix);
    }
  });

  // Sort fixes by their original positions.
  fixes.sort((a, b) => a.range[0] - b.range[0]);

  // Exclude overlapping fixes so they don't corrupt the code.
  const compatibleFixes = [];
  let previousEnd = -1;

  fixes.forEach((fix) => {
    const [start, end] = fix.range;

    if (start < previousEnd) {
      return;
    }

    compatibleFixes.push(fix);
    previousEnd = end;
  });

  return compatibleFixes;
}

function applyAllFixes(originalCode, fixes) {
  let updatedCode = originalCode;

  // Apply from right to left so earlier character positions
  // remain valid as the code changes.
  const fixesRightToLeft = [...fixes].sort(
    (a, b) => b.range[0] - a.range[0]
  );

  fixesRightToLeft.forEach((fix) => {
    const [start, end] = fix.range;

    updatedCode =
      updatedCode.slice(0, start) +
      fix.text +
      updatedCode.slice(end);
  });

  return updatedCode;
}
exportReportBtn.addEventListener("click", () => {
  exportReviewReport(latestReviewForExport);
});

applyAllBtn.addEventListener("click", () => {
  if (getEditorCode() !== currentOriginalCode) {
    editorMessage.textContent =
      "The editor has changed. Analyze the code again before applying fixes.";
    return;
  }

  if (currentFixes.length === 0) {
    editorMessage.textContent =
      "No applicable fixes are available.";
    return;
  }


  const updatedCode = applyAllFixes(
    currentOriginalCode,
    currentFixes
  );

  // Safety check: never erase all code unexpectedly.
  if (currentOriginalCode.trim() && !updatedCode.trim()) {
    editorMessage.textContent =
      "Safety check stopped Apply All Fixes because the fixes would remove all code. No changes were applied.";
    return;
  }

  setEditorCode(updatedCode);


  editorMessage.textContent =
    "Fixes applied. Analyze the updated code to verify the results.";

  applyAllBtn.hidden = true;
  focusEditor();
});


clearHistoryBtn.addEventListener("click", () => {
  if (reviewHistory.length === 0) {
    editorMessage.textContent = "There is no review history to clear.";
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to clear all review history? This cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  const previousHistory = reviewHistory;
  reviewHistory = [];

  if (!saveReviewHistory()) {
    reviewHistory = previousHistory;
    renderReviewHistory();
    renderAnalytics();
    return;
  }

  totalReviews = 0;
  reviewCount.textContent = "0";

  renderReviewHistory();
  renderAnalytics();

  editorMessage.textContent = "Review history cleared successfully.";
});



// Render suggestions supplied by ESLint.
function renderSuggestions(card, issue, originalCode) {
  const suggestions = Array.isArray(issue.suggestions)
    ? issue.suggestions
    : [];

  if (suggestions.length === 0) {
    return;
  }

  const section = document.createElement("div");
  section.className = "suggestions-section";

  const title = createTextElement(
    "h5",
    "suggestions-heading",
    "Suggested Fixes"
  );

  section.appendChild(title);

  suggestions.forEach((suggestion) => {
    const suggestionCard = document.createElement("div");
    suggestionCard.className = "suggestion-card";

    const description = createTextElement(
      "p",
      "suggestion-description",
      suggestion.description || "Suggested correction"
    );

    suggestionCard.appendChild(description);

    const fix = suggestion.fix;

    if (isValidFix(fix, originalCode.length)) {
      const applyButton = document.createElement("button");
      applyButton.type = "button";
      applyButton.className = "apply-fix-btn";
      applyButton.textContent = "Apply Fix";

      applyButton.addEventListener("click", () => {
        // Avoid applying old character positions to edited code.
        if (getEditorCode() !== originalCode) {
          editorMessage.textContent =
            "The editor has changed. Analyze the code again before applying this fix.";
          return;
        }

        const [start, end] = fix.range;

        setEditorCode(
          originalCode.slice(0, start) +
          fix.text +
          originalCode.slice(end)
        );

        editorMessage.textContent =
          "Suggested fix applied. Analyze the updated code to verify it.";

        applyButton.textContent = "Fix Applied";
        applyButton.disabled = true;
        focusEditor();
      });

      suggestionCard.appendChild(applyButton);
    }

    section.appendChild(suggestionCard);
  });

  card.appendChild(section);
}

// Render one issue card.
function renderIssue(issue, originalCode) {
  const card = document.createElement("article");
  card.className = "issue-card";

  const heading = createTextElement(
    "h4",
    "font-semibold",
    issue.title || issue.ruleId || "Code issue"
  );

  const severityValue =
    issue.severity === "error" ? "error" : "warning";

  const severity = createTextElement(
    "span",
    `issue-severity ${severityValue}`,
    severityValue === "error" ? "Error" : "Warning"
  );

  const description = createTextElement(
    "p",
    "text-sm text-slate-400 mt-2",
    issue.message || "No explanation available."
  );

  const explanation = createTextElement(
    "p",
    "text-sm text-slate-300 mt-3",
    `Why it matters: ${issue.explanation ||
    "Review this issue and its reported location."
    }`
  );

  const howToFix = createTextElement(
    "p",
    "text-sm text-slate-300 mt-2",
    `How to fix: ${issue.howToFix ||
    "Review the issue and correct the underlying problem."
    }`
  );

  const location = createTextElement(
    "p",
    "text-xs text-slate-500 mt-3",
    `Line ${issue.line ?? "?"}, Column ${issue.column ?? "?"}`
  );

  const rule = createTextElement(
    "p",
    "text-xs text-slate-500 mt-2",
    `Rule: ${issue.ruleId || "Not specified"}`
  );

  let fixMessage = "No automatic fix available.";

  if (
    Array.isArray(issue.suggestions) &&
    issue.suggestions.length > 0
  ) {
    fixMessage = "Suggested fixes available.";
  } else if (issue.fixAvailable) {
    fixMessage = "Automatic fix available.";
  }

  const fixInfo = createTextElement(
    "p",
    "text-xs text-slate-500 mt-2",
    fixMessage
  );

  card.append(
    heading,
    severity,
    description,
    explanation,
    howToFix,
    location,
    rule,
    fixInfo
  );

  renderSuggestions(card, issue, originalCode);

  return card;
}

// Display all analysis results.


function renderResults(issues, originalCode) {
  results.replaceChildren();

  renderSummary(issues);

  // Reset old fix data whenever a new result is rendered.
  currentOriginalCode = originalCode;
  currentFixes = [];

  // Hide and disable the button until valid fixes are found.
  applyAllBtn.hidden = true;
  applyAllBtn.disabled = true;
  applyAllBtn.textContent = "Apply All Fixes";

  if (issues.length === 0) {
    const message = createTextElement(
      "p",
      "text-slate-400",
      "No issues were reported by the analyzer."
    );

    results.appendChild(message);
    return;
  }

  // Get fixes for this analysis only.
  currentFixes = getApplicableFixes(
    issues,
    originalCode
  );

  applyAllBtn.hidden = currentFixes.length === 0;
  applyAllBtn.disabled = currentFixes.length === 0;
  applyAllBtn.textContent =
    `Apply All Fixes (${currentFixes.length})`;

  issues.forEach((issue) => {
    results.appendChild(renderIssue(issue, originalCode));
  });
}



// Send code to the backend for analysis.
analyzeBtn.addEventListener("click", async () => {
  const code = getEditorCode();
  // Allow code analysis only for JavaScript.
  if (languageSelect.value !== "javascript") {
    alert("Code analysis is currently supported only for JavaScript.");
    return;
  }

  if (!code.trim()) {
    editorMessage.textContent =
      "Please enter some JavaScript code.";
    focusEditor();
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  editorMessage.textContent = "Sending code for analysis...";
  reviewStatus.textContent = "Working";

  try {
    const response = await fetch("/api/reviews/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Analysis failed.");
    }

    const issues = Array.isArray(data.issues)
      ? data.issues
      : [];

    // Store results for the Code Reactor
    latestReactorIssues = issues;
    latestReviewForExport = {
      code,
      issues,
      qualityScore: calculateQualityScore(issues),
      date: new Date().toISOString()
    };

    exportReportBtn.disabled = false;


    addReviewToHistory(code, issues);

    issueCount.textContent = String(issues.length);

    renderResults(issues, code);


    reviewStatus.textContent = "Completed";
    editorMessage.textContent =
      "Analysis completed successfully.";
  } catch (error) {
    latestReactorIssues = [];
    currentOriginalCode = "";
    currentFixes = [];

    applyAllBtn.hidden = true;
    applyAllBtn.disabled = true;
    latestReviewForExport = null;
    exportReportBtn.disabled = true;
    reviewStatus.textContent = "Error";
    editorMessage.textContent =
      error.message || "An unexpected error occurred.";

    results.replaceChildren();

    const errorMessage = createTextElement(
      "p",
      "text-sm text-red-400",
      error.message || "Unable to analyze code."
    );

    results.appendChild(errorMessage);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Code →";
  }
});

// ========================================
// OLLAMA AI CODE REVIEW
// ========================================

aiReviewBtn.addEventListener("click", async () => {

  const code = getEditorCode();

  // Current backend prompt supports JavaScript only.
  if (languageSelect.value !== "javascript") {
    editorMessage.textContent =
      "AI review currently supports JavaScript only.";

    return;
  }

  // Validate editor input.
  if (!code.trim()) {
    editorMessage.textContent =
      "Please enter code before requesting AI review.";

    focusEditor();
    return;
  }

  // Update interface.
  aiReviewBtn.disabled = true;
  aiReviewBtn.textContent = "AI Reviewing...";

  aiReviewPanel.hidden = false;

  aiReviewContent.textContent =
    "Ollama is analyzing your code. Please wait...";

  editorMessage.textContent =
    "Generating AI-powered code review...";

  try {

    const response = await fetch("/api/ai-reviews/review", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        code: code
      })

    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "AI review failed."
      );
    }

    // Display AI response safely.
    console.log("AI Review Response:", data);

    aiReviewPanel.hidden = false;
    aiReviewPanel.style.display = "block";

    aiReviewContent.textContent =
      data.review || "The AI returned an empty review.";

    aiReviewPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    editorMessage.textContent =
      "AI code review completed successfully.";

  } catch (error) {

    console.error("Ollama AI Review Error:", error);

    aiReviewContent.textContent =
      error.message || "Unable to generate AI review.";

    editorMessage.textContent =
      "AI review failed. Check whether Ollama is running.";

  } finally {

    aiReviewBtn.disabled = false;

    aiReviewBtn.textContent = "✨ AI Code Review";

  }

});


loadReviewHistory();

// Handle navigation for desktop and mobile.
const navigationLinks = document.querySelectorAll(".nav-link");

navigationLinks.forEach((link) => {
  link.addEventListener("click", function () {

    // Remove active state from all navigation links.
    navigationLinks.forEach((item) => {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    });

    // Activate the clicked link and its matching counterpart.
    const target = this.getAttribute("href");

    navigationLinks.forEach((item) => {
      if (item.getAttribute("href") === target) {
        item.classList.add("active");
        item.setAttribute("aria-current", "location");
      }
    });
  });
});

// =====================================
// CODE REACTOR - INTERACTIVE CONTROLS
// =====================================

const reactorWrapper = document.getElementById("reactorWrapper");
const reactorTrigger = document.getElementById("reactorTrigger");
const reactorPanel = document.getElementById("reactorPanel");

const reactorLanguage = document.getElementById("reactorLanguage");
const reactorSymbol = document.getElementById("reactorSymbol");
const reactorTitle = document.getElementById("reactorTitle");
const reactorMessage = document.getElementById("reactorMessage");

const reactorLanguageSelect = document.getElementById("languageSelect");
// Stores the latest ESLint issues
let latestReactorIssues = [];

// Open and close reactor on click
reactorTrigger.addEventListener("click", () => {
  const isOpen = reactorWrapper.classList.toggle("is-open");

  reactorTrigger.setAttribute("aria-expanded", String(isOpen));
});

// Close when clicking outside
document.addEventListener("click", (event) => {
  if (!reactorWrapper.contains(event.target)) {
    reactorWrapper.classList.remove("is-open");
    reactorTrigger.setAttribute("aria-expanded", "false");
  }
});

// Update badge when editor language changes
function updateReactorLanguage() {
  const selectedOption =
    reactorLanguageSelect.options[reactorLanguageSelect.selectedIndex];

  const language = selectedOption.text;

  const symbols = {
    "JavaScript": "JS",
    "Python": "PY",
    "C++": "C++",
    "Java": "JV"
  };

  reactorLanguage.textContent = language;
  reactorSymbol.textContent = symbols[language] || "DEV";
  reactorTitle.textContent = language + " Core";

  reactorMessage.textContent =
    language + " environment selected. Ready to explore.";
}

reactorLanguageSelect.addEventListener(
  "change",
  updateReactorLanguage
);

// Interactive reactor modules
const reactorModules = document.querySelectorAll(".reactor-module");

const moduleMessages = {
  syntax: "Syntax Engine: Your code is ready for parsing.",
  errors: "Error Scanner: Detect potential coding issues.",
  performance: "Performance: Explore code efficiency improvements.",
  ai: "AI Analysis: Discover intelligent code suggestions."
};

// Display actual ESLint results in the Error Scanner
function renderReactorErrors() {
  reactorMessage.replaceChildren();

  if (latestReactorIssues.length === 0) {
    reactorMessage.textContent =
      "No issues found yet. Analyze your code first.";
    return;
  }

  const heading = document.createElement("p");
  heading.textContent =
    `${latestReactorIssues.length} issue(s) detected`;

  heading.className = "font-semibold mb-2";
  reactorMessage.appendChild(heading);

  latestReactorIssues.forEach((issue) => {
    const issueCard = document.createElement("div");

    issueCard.style.textAlign = "left";
    issueCard.style.padding = "9px";
    issueCard.style.marginTop = "7px";
    issueCard.style.borderRadius = "8px";
    issueCard.style.background = "rgba(30, 41, 59, 0.8)";

    const severity =
      Number(issue.severity) === 2 ? "ERROR" : "WARNING";

    const severityColor =
      severity === "ERROR" ? "#f87171" : "#facc15";

    const title = document.createElement("strong");
    title.textContent = severity;
    title.style.color = severityColor;
    title.style.fontSize = "10px";

    const message = document.createElement("p");
    message.textContent = issue.message || "Issue detected";
    message.style.color = "#e2e8f0";
    message.style.fontSize = "11px";
    message.style.marginTop = "4px";

    const details = document.createElement("p");
    details.textContent =
      `Line ${issue.line ?? "?"} · ${issue.ruleId || "General rule"}`;
    details.style.color = "#94a3b8";
    details.style.fontSize = "10px";
    details.style.marginTop = "4px";

    issueCard.append(title, message, details);
    reactorMessage.appendChild(issueCard);
  });
}

// =====================================
// CODE REACTOR - PERFORMANCE DASHBOARD
// =====================================

function renderReactorPerformance() {
  reactorMessage.replaceChildren();

  // Check whether code has been analyzed
  if (!latestReviewForExport) {
    reactorMessage.textContent =
      "Analyze your code first to view performance metrics.";
    return;
  }

  const issues = latestReactorIssues;

  const errors = issues.filter(
    issue => Number(issue.severity) === 2
  ).length;

  const warnings = issues.filter(
    issue => Number(issue.severity) === 1
  ).length;

  const totalIssues = issues.length;

  const code = latestReviewForExport.code || "";

  const lines = code.trim()
    ? code.split(/\r\n|\r|\n/).length
    : 0;

  const score = Number(latestReviewForExport.qualityScore) || 0;

  // Dashboard container
  const dashboard = document.createElement("div");
  dashboard.className = "reactor-performance-dashboard";

  // Quality score
  const scoreSection = document.createElement("div");
  scoreSection.className = "performance-score";

  const scoreLabel = document.createElement("p");
  scoreLabel.textContent = "CODE QUALITY SCORE";

  const scoreValue = document.createElement("h2");
  scoreValue.textContent = `${score}/100`;

  const progressTrack = document.createElement("div");
  progressTrack.className = "performance-progress";

  const progressBar = document.createElement("div");
  progressBar.className = "performance-progress-fill";
  progressBar.style.width = `${Math.min(100, Math.max(0, score))}%`;

  progressTrack.appendChild(progressBar);

  scoreSection.append(
    scoreLabel,
    scoreValue,
    progressTrack
  );

  // Metric cards
  const metrics = [
    { label: "TOTAL ISSUES", value: totalIssues },
    { label: "ERRORS", value: errors },
    { label: "WARNINGS", value: warnings },
    { label: "CODE LINES", value: lines }
  ];

  const metricGrid = document.createElement("div");
  metricGrid.className = "performance-metrics";

  metrics.forEach(metric => {
    const card = document.createElement("div");
    card.className = "performance-metric-card";

    const value = document.createElement("strong");
    value.textContent = metric.value;

    const label = document.createElement("span");
    label.textContent = metric.label;

    card.append(value, label);
    metricGrid.appendChild(card);
  });

  const footer = document.createElement("p");
  footer.className = "performance-footer";
  footer.textContent = "Based on your latest code analysis.";

  dashboard.append(
    scoreSection,
    metricGrid,
    footer
  );

  reactorMessage.appendChild(dashboard);
}

// 
// CODE REACTOR - SYNTAX ENGINE


function renderReactorSyntax() {
  reactorMessage.replaceChildren();

  if (!latestReviewForExport) {
    reactorMessage.textContent =
      "Analyze your JavaScript code first.";
    return;
  }

  const code = latestReviewForExport.code || "";

  // Count JavaScript patterns
  function countPattern(pattern) {
    return (code.match(pattern) || []).length;
  }

  const syntaxStats = [
    {
      label: "FUNCTIONS",
      value: countPattern(/\bfunction\s+[\w$]*\s*\(/g)
    },
    {
      label: "VARIABLES",
      value: countPattern(/\b(?:let|const|var)\s+/g)
    },
    {
      label: "ARROW FUNCTIONS",
      value: countPattern(/=>/g)
    },
    {
      label: "LOOPS",
      value: countPattern(/\b(?:for|while|do)\b/g)
    },
    {
      label: "CONDITIONALS",
      value: countPattern(/\b(?:if|switch)\b/g)
    },
    {
      label: "COMMENTS",
      value: countPattern(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g)
    }
  ];

  const lines = code.trim()
    ? code.split(/\r\n|\r|\n/).length
    : 0;

  const dashboard = document.createElement("div");
  dashboard.className = "reactor-syntax-dashboard";

  const heading = document.createElement("h3");
  heading.textContent = "JavaScript Structure";
  heading.className = "syntax-heading";

  const lineInfo = document.createElement("p");
  lineInfo.textContent = `Total source lines: ${lines}`;
  lineInfo.className = "syntax-line-info";

  const grid = document.createElement("div");
  grid.className = "syntax-stats-grid";

  syntaxStats.forEach((stat) => {
    const card = document.createElement("div");
    card.className = "syntax-stat-card";

    const value = document.createElement("strong");
    value.textContent = stat.value;

    const label = document.createElement("span");
    label.textContent = stat.label;

    card.append(value, label);
    grid.appendChild(card);
  });

  const note = document.createElement("p");
  note.className = "syntax-note";
  note.textContent =
    "Pattern-based analysis of your JavaScript source.";

  dashboard.append(heading, lineInfo, grid, note);

  reactorMessage.appendChild(dashboard);
}

// =====================================
// CODE REACTOR - AI ANALYSIS
// =====================================

function renderReactorAIAnalysis() {
  reactorMessage.replaceChildren();

  if (!latestReviewForExport) {
    reactorMessage.textContent =
      "Analyze your code first to generate recommendations.";
    return;
  }

  const issues = latestReactorIssues;
  console.log("AI FUNCTION VERSION 2 RUNNING");
  console.log("TOTAL ISSUES:", issues.length);
  console.log("FIRST ISSUE:", issues[0]);
  console.log("ISSUE SEVERITIES:", issues.map(issue => ({
    ruleId: issue.ruleId,
    severity: issue.severity,
    type: typeof issue.severity
  })));

  // Recommendations based on ESLint rules
  const recommendations = {
    "no-undef": {
      title: "Undefined Variable",
      explanation:
        "Your code uses a variable that has not been declared.",
      solution:
        "Declare the variable using let, const or var before using it."
    },

    "no-unused-vars": {
      title: "Unused Variable",
      explanation:
        "A declared variable is not being used in your code.",
      solution:
        "Remove the unused variable or use it where required."
    },

    "eqeqeq": {
      title: "Loose Equality",
      explanation:
        "Using == can produce unexpected type conversions.",
      solution:
        "Use === or !== for strict comparisons."
    },

    "no-unreachable": {
      title: "Unreachable Code",
      explanation:
        "Some code may never execute because an earlier statement exits the function or block.",
      solution:
        "Review the control flow and remove or reposition unreachable statements."
    },

    "no-constant-condition": {
      title: "Constant Condition",
      explanation:
        "A condition always evaluates to the same result.",
      solution:
        "Check whether the condition should use a variable or dynamic expression."
    },

    "no-console": {
      title: "Console Statement",
      explanation:
        "Console statements may be unnecessary in production code.",
      solution:
        "Remove debugging logs or replace them with an appropriate logging system."
    },

    "prefer-const": {
      title: "Prefer Const",
      explanation:
        "A variable declared with let is never reassigned.",
      solution:
        "Consider using const to communicate that the variable will not be reassigned."
    },

    "semi": {
      title: "Missing Semicolon",
      explanation:
        "A statement may not follow your configured semicolon style.",
      solution:
        "Add a semicolon at the end of the statement if required by your project rules."
    },

    "quotes": {
      title: "Quote Style",
      explanation:
        "A string does not follow the configured quotation style.",
      solution:
        "Use the quotation style configured in your ESLint rules."
    }
  };

  const dashboard = document.createElement("div");
  dashboard.className = "reactor-ai-dashboard";

  // Header
  const heading = document.createElement("h3");
  heading.textContent = "Code Intelligence Report";
  heading.className = "ai-report-heading";

  const subtitle = document.createElement("p");
  subtitle.textContent =
    "Personalized recommendations from your latest code review.";

  subtitle.className = "ai-report-subtitle";

  // Issue summary
  const errors = issues.filter(
    issue => issue.severity === "error"
  ).length;

  const warnings = issues.filter(
    issue => issue.severity === "warning"
  ).length;

  const summary = document.createElement("div");
  summary.className = "ai-summary";

  const summaryTitle = document.createElement("strong");
  summaryTitle.textContent = "Review Summary";

  const summaryText = document.createElement("p");

  if (issues.length === 0) {
    summaryText.textContent =
      "Excellent! No ESLint issues were detected. Your code passed the configured checks.";
  } else {
    summaryText.textContent =
      `Found ${errors} error(s) and ${warnings} warning(s). Review the recommendations below to improve your code.`;
  }

  summary.append(summaryTitle, summaryText);

  dashboard.append(heading, subtitle, summary);

  // Recommendations heading
  const recommendationHeading = document.createElement("h4");
  recommendationHeading.textContent = "Improvement Suggestions";
  recommendationHeading.className = "ai-section-heading";

  dashboard.appendChild(recommendationHeading);

  if (issues.length === 0) {
    const success = document.createElement("div");
    success.className = "ai-success-card";
    success.textContent =
      "✓ No improvements suggested by the current ESLint findings.";

    dashboard.appendChild(success);
  }

  // Display recommendations
  issues.forEach((issue) => {
    const ruleId = issue.ruleId || "";
    const recommendation = recommendations[ruleId] || {
      title: issue.title || "Code Improvement",
      explanation:
        issue.explanation ||
        issue.message ||
        "Review this ESLint finding.",
      solution:
        issue.howToFix ||
        "Review the ESLint finding and update your code."
    };

    const card = document.createElement("div");
    card.className = "ai-recommendation-card";

    const priority =
      issue.severity === "error" ? "HIGH PRIORITY" : "SUGGESTION";

    const priorityLabel = document.createElement("span");
    priorityLabel.className =
      issue.severity === "error"
        ? "ai-priority high"
        : "ai-priority low";

    priorityLabel.textContent = priority;

    const title = document.createElement("h4");
    title.textContent =
      recommendation?.title || "Code Improvement";

    const explanation = document.createElement("p");
    explanation.textContent = recommendation.explanation;

    const solutionLabel = document.createElement("strong");
    solutionLabel.textContent = "Recommended action";

    const solution = document.createElement("p");
    solution.textContent = recommendation.solution;

    const location = document.createElement("small");
    location.textContent =
      `Line ${issue.line ?? "?"} · ${ruleId || "General finding"}`;

    card.append(
      priorityLabel,
      title,
      explanation,
      solutionLabel,
      solution,
      location
    );

    dashboard.appendChild(card);
  });

  reactorMessage.appendChild(dashboard);
}

// Interactive reactor modules
reactorModules.forEach((module) => {
  module.addEventListener("click", () => {

    reactorModules.forEach((item) => {
      item.classList.remove("active");
    });

    module.classList.add("active");

    const selectedModule = module.dataset.module;

    if (selectedModule === "errors") {
      renderReactorErrors();

    } else if (selectedModule === "performance") {
      renderReactorPerformance();

    } else if (selectedModule === "syntax") {
      renderReactorSyntax();

    } else if (selectedModule === "ai") {
      renderReactorAIAnalysis();

    } else {
      reactorMessage.textContent =
        moduleMessages[selectedModule];
    }
  });
});

// Set correct language when page loads
updateReactorLanguage();
// ========================================
// AI CODING CHAT
// ========================================

// Restore the welcome message
function showChatWelcome() {
  chatMessages.replaceChildren();

  const welcome = document.createElement("div");
  welcome.className = "p-4 rounded-lg bg-slate-800";

  const title = document.createElement("p");
  title.className = "text-xs text-cyan-400 font-semibold mb-2";
  title.textContent = "CODESENSE AI";

  const message = document.createElement("p");
  message.className = "text-sm text-slate-200";
  message.textContent =
    "Hello! I'm your AI coding assistant. Ask me anything about programming, or let me help you understand the code in your editor.";

  welcome.append(title, message);
  chatMessages.appendChild(welcome);
}

// Safely display a chat message

function addChatMessage(role, content) {
  const messageBox = document.createElement("div");

  messageBox.className = role === "user"
    ? "p-4 rounded-lg bg-cyan-950 ml-6"
    : "p-4 rounded-lg bg-slate-800 mr-6";

  const title = document.createElement("p");
  title.className =
    "text-xs font-semibold mb-2 " +
    (role === "user" ? "text-cyan-300" : "text-cyan-400");

  title.textContent =
    role === "user" ? "YOU" : "CODESENSE AI";

  const message = document.createElement("div");
  message.className =
    "chat-message-content text-sm text-slate-200 leading-7";

  if (role === "user") {
    // Display user messages as plain text.
    message.textContent = content;
  } else {
    // Convert Markdown to HTML and sanitize it.
    const rawHtml = marked.parse(content);

    message.innerHTML = DOMPurify.sanitize(rawHtml);

    // Highlight code blocks and add Copy buttons.
    message.querySelectorAll("pre code").forEach((codeBlock) => {
      hljs.highlightElement(codeBlock);

      const pre = codeBlock.parentElement;

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "chat-copy-btn";
      copyBtn.textContent = "Copy Code";

      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(
            codeBlock.textContent
          );

          copyBtn.textContent = "Copied!";

          setTimeout(() => {
            copyBtn.textContent = "Copy Code";
          }, 2000);

        } catch (error) {
          console.error("Copy failed:", error);
          copyBtn.textContent = "Copy failed";
        }
      });

      pre.appendChild(copyBtn);
    });
  }

  messageBox.append(title, message);
  chatMessages.appendChild(messageBox);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Send a message to the AI backend
async function sendChatMessage() {
  const message = chatInput.value.trim();

  if (!message) {
    chatStatus.textContent = "Please enter a message.";
    return;
  }

  if (chatSendBtn.disabled) {
    return;
  }

  // Keep only the most recent conversation messages
  const previousHistory = chatHistory.slice(-10);

  const editorCode = chatIncludeCode.checked
    ? getEditorCode()
    : "";

  const selectedOption =
    languageSelect.options[languageSelect.selectedIndex];

  const languageName = selectedOption
    ? selectedOption.text
    : "Unknown";

  const contextualMessage =
    `Current editor language: ${languageName}\n\n${message}`;

  // Display the user's message
  addChatMessage("user", message);

  chatInput.value = "";

  chatSendBtn.disabled = true;
  chatSendBtn.textContent = "Thinking...";
  chatStatus.textContent = "Ollama is generating a response...";

  // Show AI typing indicator
  const typingIndicator = document.createElement("div");

  typingIndicator.className =
    "p-3 rounded-lg bg-slate-800 mr-6 text-sm text-cyan-400";

  typingIndicator.textContent = "CodeSense AI is thinking...";

  typingIndicator.setAttribute("id", "chatTypingIndicator");

  chatMessages.appendChild(typingIndicator);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch("/api/ai-chat/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: contextualMessage,
        history: previousHistory,
        code: editorCode
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to generate a response."
      );
    }

    const reply = data.reply;

    // Remove typing indicator
    document.getElementById("chatTypingIndicator")?.remove();

    // Display AI response
    addChatMessage("assistant", reply);

    // Save successful conversation messages
    chatHistory.push(
      {
        role: "user",
        content: contextualMessage
      },
      {
        role: "assistant",
        content: reply
      }
    );

    // Keep conversation history limited
    chatHistory = chatHistory.slice(-10);

    chatStatus.textContent = "Powered by Ollama · Ready";

  } catch (error) {
    document.getElementById("chatTypingIndicator")?.remove();
    console.error("AI Chat Error:", error);

    addChatMessage(
      "assistant",
      error.message || "Something went wrong. Please try again."
    );

    chatStatus.textContent = "Chat request failed.";
  } finally {
    chatSendBtn.disabled = false;
    chatSendBtn.textContent = "Send Message →";
    chatInput.focus();
  }
}

// Send button
chatSendBtn.addEventListener("click", sendChatMessage);

// Enter sends; Shift + Enter creates a new line
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
});

// Start a new conversation
chatClearBtn.addEventListener("click", () => {
  if (chatSendBtn.disabled) {
    return;
  }

  chatHistory = [];

  chatInput.value = "";
  chatStatus.textContent = "Powered by Ollama · New conversation";

  showChatWelcome();
});


