import fs from "fs";
import path from "path";

const ignore = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".env",
  ".DS_Store"
]);

function generateTree(dir, prefix = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    if (ignore.has(file)) return;

    const fullPath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const connector = isLast ? "└── " : "├── ";

    console.log(prefix + connector + file);

    if (fs.statSync(fullPath).isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      generateTree(fullPath, newPrefix);
    }
  });
}

const root = process.argv[2] || ".";

console.log(path.resolve(root));
generateTree(root);