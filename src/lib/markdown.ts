import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface MarkdownContent {
  slug: string;
  content: string;
  data: Record<string, unknown>;
}

const contentRoot = path.join(process.cwd(), "src", "content");

export async function getMarkdown(slug: string): Promise<MarkdownContent | null> {
  const filePath = path.join(contentRoot, `${slug}.mdx`);

  try {
    const file = await fs.readFile(filePath, "utf-8");
    const parsed = matter(file);
    return {
      slug,
      content: parsed.content,
      data: parsed.data,
    };
  } catch (error) {
    console.warn("Unable to load markdown for", slug, error);
    return null;
  }
}

export async function listCourseMarkdown() {
  const courseDir = path.join(contentRoot, "courses");
  try {
    const entries = await fs.readdir(courseDir);
    return entries
      .filter((entry) => entry.endsWith(".mdx"))
      .map((entry) => entry.replace(/\.mdx$/, ""));
  } catch (error) {
    console.warn("Unable to list course markdown", error);
    return [];
  }
}
