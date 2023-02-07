---
title: "How to use `astro-og-canvas` with Astro"
description: "Use `astro-og-canvas` to automatically generate Open Graph images for your blog posts."
pubDate: "Feb 7 2023"
draft: false
toc: true
---

# What is an Open Graph Image?

Open Graph images are the images that are displayed when you share a link to your blog post on social media. Open Graph is a standard that lets you provide details about your website through `meta` tags in your HTML. You can read more about the Open Graph Protocol [here](https://ogp.me/). The main thing to know is that you set the image by adding a `meta` tag to the `head` of your page:

```html
<meta property="og:image" content="https://picsum.photos/200" />
```

# How to Generate Open Graph Images

We will be using the [astro-og-canvas](https://www.npmjs.com/package/astro-og-canvas) package to generate our images.

1. First, install the package:

```bash
npm install astro-og-canvas
```

2. Create a new file in your `src/pages` directory. For example, `src/pages/og/[...route].ts`. This will be the route that generates the Open Graph images.

3. Add the following code to the file:

```tsx
// src/pages/og/[...route].ts
import { OGImageRoute } from "astro-og-canvas";

const directory = "src/content";

// Import all pages from the content directory
const rawPages = import.meta.glob(`${directory}/**/*.md`, { eager: true });

// Remove the /src/content prefix from the paths
const pages = Object.entries(rawPages).reduce(
  (acc, [path, page]) => ({ ...acc, [path.replace(directory, "")]: page }),
  {}
);

export const { getStaticPaths, get } = OGImageRoute({
  // Set the name of the dynamic route segment here it’s `route`,
  // because the file is named `[...route].ts`.
  param: "route",

  // Provide our pages object here
  pages,

  // For each page, this callback will be used to
  // customize the OpenGraph image.
  getImageOptions: (path, page) => ({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  }),
});
```

Set `directory` to the path of your content directory. In this example, we are using `src/content`.

There are more options you can provide in the `getImageOptions` function to customize the Open Graph image. You can read more about them in the [astro-og-canvas documentation](https://github.com/delucis/astro-og-canvas/tree/latest/packages/astro-og-canvas#image-options).

4. Create a helper function to add the Open Graph image to the data of each page:

```tsx
// src/lib/getBlogCollection.ts
import { getCollection } from "astro:content";
import { SITE_URL } from "../consts";

const collection = "blog";

export default async () => {
  const posts = await getCollection(collection);

  return posts.map((post) => ({
    ...post,
    data: {
      ...post.data,
      ogImage: `${SITE_URL}/og/${collection}/${post.slug}.png`,
    },
  }));
};
```

5. Call the helper function to get the blog posts in your `src/pages/blog/[...slug].ts` file instead of using `getCollection`:

```tsx
// src/pages/blog/[...slug].ts
...
export async function getStaticPaths() {
  const posts = await getBlogCollection();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: post,
  }));
}
...
```

6. Add the Open Graph image to the `BaseHead.astro` component:

```tsx
// src/components/BaseHead.astro
---
// Import the global.css file here so that it is included on
// all pages through the use of the <BaseHead /> component.
import "../styles/global.css";

export interface Props {
  title: string;
  description: string;
  ogImage?: string;
}

const canonicalURL = new URL(Astro.url.pathname, Astro.site);

const { title, description, ogImage = "/default-og.png" } = Astro.props;
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="generator" content={Astro.generator} />

<!-- Canonical URL -->
<link rel="canonical" href={canonicalURL} />

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />

<!-- Open Graph Tags -->
<meta property="og:title" content={title} />
<meta property="og:image" content={ogImage} />
<meta property="og:type" content="article" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:description" content={description} />
<meta property="og:locale" content="en_GB" />
```

Now when you share a link to your blog post on social media, it will display the Open Graph image that you generated. You can use [https://www.opengraph.xyz/](https://www.opengraph.xyz/) to test the Open Graph tags on your page.

The source code for this post is available in my blog’s [GitHub repository](https://github.com/aidankinzett/astro-blog).