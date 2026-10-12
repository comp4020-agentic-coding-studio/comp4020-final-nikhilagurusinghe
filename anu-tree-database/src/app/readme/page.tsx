import { getMarkdownData } from "./markdown/getMarkdownData";

export default async function Page() {
  const markdownContentHTML: string = await getMarkdownData("public/README.md");

  return (
    <div className="p-8 overflow-y-auto overscroll-contain">
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: markdownContentHTML }} />
    </div>
  )
}