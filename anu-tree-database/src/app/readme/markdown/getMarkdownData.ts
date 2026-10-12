import { remark } from "remark";
import html from "remark-html";
import fs from "fs";
import path from "path";

// https://medium.com/@igorkhomenko/building-a-markdown-powered-page-in-next-js-and-style-it-with-tailwind-0a3bbf128649
export async function getMarkdownData(filePath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const processedContent = await remark().use(html).process(fileContents);

  return processedContent.toString();
}
