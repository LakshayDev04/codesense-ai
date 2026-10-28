
const codeInput = document.getElementById("codeInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const applyAllBtn = document.createElement("button");
const exportReportBtn = document.getElementById("exportReportBtn");

applyAllBtn.type = "button";
applyAllBtn.id = "applyAllBtn";
applyAllBtn.className = "apply-fix-btn";
applyAllBtn.textContent = "Apply All Fixes";
applyAllBtn.hidden = true;

analyzeBtn.insertAdjacentElement("afterend", applyAllBtn);
const editorMessage = document.getElementById("editorMessage");
const results = document.getElementById("results");
const reviewHistoryList = document.getElementById("reviewHistoryList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
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

  reviewHistory.forEach((review) => {
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
      codeInput.value = review.code;
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
  codeInput.value = "";

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

  codeInput.focus();
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
  if (codeInput.value !== currentOriginalCode) {
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

codeInput.value = updatedCode;


  editorMessage.textContent =
    "Fixes applied. Analyze the updated code to verify the results.";

  applyAllBtn.hidden = true;
  codeInput.focus();
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
        if (codeInput.value !== originalCode) {
          editorMessage.textContent =
            "The editor has changed. Analyze the code again before applying this fix.";
          return;
        }

        const [start, end] = fix.range;

        codeInput.value =
          originalCode.slice(0, start) +
          fix.text +
          originalCode.slice(end);

        editorMessage.textContent =
          "Suggested fix applied. Analyze the updated code to verify it.";

        applyButton.textContent = "Fix Applied";
        applyButton.disabled = true;
        codeInput.focus();
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
  `Why it matters: ${
    issue.explanation ||
    "Review this issue and its reported location."
  }`
);

const howToFix = createTextElement(
  "p",
  "text-sm text-slate-300 mt-2",
  `How to fix: ${
    issue.howToFix ||
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
  const code = codeInput.value;

 if (!code.trim()) {
    editorMessage.textContent =
      "Please enter some JavaScript code.";
    codeInput.focus();
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

loadReviewHistory();


