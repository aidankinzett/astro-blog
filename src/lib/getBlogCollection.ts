import { getCollection } from "astro:content";
import { SITE_URL } from "../consts";


export default async () => {
  const posts = await getCollection("blog", ({ data }) => {
    // Filter out posts that are not published on production
    if (import.meta.env.MODE === "production" && data.draft) {
      return false;
    } else {
      return true;
    }
  });

  const sortedPosts = posts.sort((a, b) =>  b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return sortedPosts.map((post) => ({
    ...post,
    data: {
      ...post.data,
      ogImage: `${SITE_URL}/og/blog/${post.slug}.png`,
    },
  }));
};
