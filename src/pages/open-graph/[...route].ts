import { OGImageRoute } from "astro-og-canvas";
import hexRgb from "hex-rgb";
import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../../tailwind.config.cjs";

const config = resolveConfig(tailwindConfig);
const hex = (config.theme?.colors as any)?.primary?.[200];
const rgb = hexRgb(hex);

export const { getStaticPaths, get } = OGImageRoute({
  // Tell us the name of your dynamic route segment.
  // In this case it’s `route`, because the file is named `[...route].ts`.
  param: "route",

  // A collection of pages to generate images for.
  // This can be any map of paths to data, not necessarily a glob result.
  pages: import.meta.glob("/src/content/**/*.md", { eager: true }),

  // For each page, this callback will be used to customize the OpenGraph
  // image. For example, if `pages` was passed a glob like above, you
  // could read values from frontmatter.
  getImageOptions: (path, page) => ({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    logo: {
      path: "./public/apple-icon.png",
    },
    font: {
      title: {
        families: ["BerkleyMono", "monospaced"],
        color: [0, 0, 0],
      },
      description: {
        families: ["BerkleyMono", "monospaced"],
        color: [0, 0, 0],
      },
    },
    fonts: ["https://aidankinzett.com/fonts/BerkeleyMonoVariable-Regular.ttf"],
    bgGradient: [[rgb.red, rgb.green, rgb.blue]],
   
  }),
});
