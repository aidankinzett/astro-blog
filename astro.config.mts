import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
import compress from "astro-compress";

// https://astro.build/config
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
import partytown from "@astrojs/partytown";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";

// https://astro.build/config

// https://astro.build/config
import prefetch from "@astrojs/prefetch";

// https://astro.build/config
import critters from "astro-critters";
import { SITE_URL } from "./src/consts";

// https://astro.build/config
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeSlug, rehypeExternalLinks, [(rehypeToc as any), {
      headings: ["h1", "h2"]
    }]]
  },
  site: SITE_URL,
  integrations: [mdx(), sitemap(), tailwind(), compress(), robotsTxt(), partytown({
    config: {
      forward: ["dataLayer.push"]
    }
  }), prefetch(), critters(), image()]
});