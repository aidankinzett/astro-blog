---
title: "How to use `astro-og-image` with Astro"
description: "Use `astro-og-image` to automatically generate Open Graph images for your blog posts."
pubDate: "Feb 5 2023"
draft: true
toc: true
---

# What is an Open Graph image?

Open Graph images are the images that are displayed when you share a link to your blog on social media. They are also used by search engines to display a preview of your blog post.

# How to set up automatic images

## Packages

We will be using the following packages:

- [astro-og-image](https://www.npmjs.com/package/astro-og-image)
- [astro-seo](https://www.npmjs.com/package/astro-seo)

## Set Up

1. First, install the packages:

```bash
npm install astro-og-image astro-seo
```

2. Create a new file in your `src/pages` directory. For example, `src/pages/og/[...route].ts`. This will be the page that generates the Open Graph images.

3. Add the following code to the file:

```tsx
import { OGImageRoute } from "astro-og-canvas";

// Import all pages from the content directory
const pages = import.meta.glob("/src/content/**/*.md", { eager: true });

// Remove the /src/content prefix from the paths
const newPages = Object.entries(pages).reduce((acc, [path, page]) => {
  const newPath = path.replace("/src/content", "");
  return { ...acc, [newPath]: page };
}, {});

export const { getStaticPaths, get } = OGImageRoute({
  // Tell us the name of your dynamic route segment.
  // In this case it’s `route`, because the file is named `[...route].ts`.
  param: "route",

  // A collection of pages to generate images for.
  // This can be any map of paths to data, not necessarily a glob result.
  pages: newPages,

  // For each page, this callback will be used to customize the OpenGraph
  // image. For example, if `pages` was passed a glob like above, you
  // could read values from frontmatter.
  getImageOptions: (path, page) => ({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  }),
});
```

This is assuming that the pages you want to generate images for are in the `src/content` directory. If you want to generate images for pages in a different directory, you can change the `import.meta.glob` path. You will also need to change the `newPages` object to remove the prefix from the paths.

