import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [
      "rehype-slug",
      "rehype-external-links",
      [
        "rehype-toc",
        {
          headings: ["h1", "h2"],
          cssClasses: {
            toc: "table-of-contents",
          },
        },
      ],
    ],
  },
  site: "https://aidankinzett.com",
  integrations: [mdx(), sitemap(), tailwind()],
});
