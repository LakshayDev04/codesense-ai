
const { analyzeCode } = require("./src/services/codeAnalyzer");

const sampleCode = `
const age = 18;

if (age == 18) {
    console.log("Adult");
}
`;

console.log("========== CODESENSE AI TEST ==========\n");

console.log("SUBMITTED CODE:");
console.log(sampleCode);

const issues = analyzeCode(sampleCode);

console.log("\n========== ANALYSIS RESULTS ==========\n");

console.log(JSON.stringify(issues, null, 2));

console.log("\n========== TEST SUMMARY ==========\n");

console.log("Total issues:", issues.length);

const errors = issues.filter(
    (issue) => issue.severity === "error"
).length;

const warnings = issues.filter(
    (issue) => issue.severity === "warning"
).length;

console.log("Errors:", errors);
console.log("Warnings:", warnings);

const fixableIssues = issues.filter(
    (issue) => issue.fixAvailable
);

console.log("Issues with automatic fixes:", fixableIssues.length);

const suggestedIssues = issues.filter(
    (issue) => issue.suggestionsAvailable
);

console.log("Issues with suggested fixes:", suggestedIssues.length);

console.log("\n========== TEST COMPLETED ==========");
