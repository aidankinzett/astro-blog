import { getCollection } from "astro:content";

export default () => {
  return getCollection("blog", ({ data }) => {
    // Filter out posts that are not published on production
    if (import.meta.env.MODE === "production" && data.draft) {
      return false;
    } else {
      return true;
    }
  });
};
