import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "jsdoc", "node", "promise"],
  categories: {
    perf: "error"
  },
  ignorePatterns: ["node_modules", "**/*.cpp"],
  rules: {
    "eslint/no-await-in-loop": "allow"
  }
});