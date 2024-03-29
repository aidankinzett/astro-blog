import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
const parser = new MarkdownIt();

export async function GET(context: any) {
  const posts = await getCollection("blog", ({ data }) => {
    // Filter out posts that are not published on production
    if (import.meta.env.MODE === "production" && data.draft) {
      return false;
    } else {
      return true;
    }
  });
  
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
      // Note: this will not process components or JSX expressions in MDX files.
      content: sanitizeHtml(parser.render(post.body)),
      ...post.data,
    })),
  });
}
