const webfinger = {
  subject: "acct:aidankinzett@hachyderm.io",
  aliases: [
    "https://hachyderm.io/@aidankinzett",
    "https://hachyderm.io/users/aidankinzett",
  ],
  links: [
    {
      rel: "http://webfinger.net/rel/profile-page",
      type: "text/html",
      href: "https://hachyderm.io/@aidankinzett",
    },
    {
      rel: "self",
      type: "application/activity+json",
      href: "https://hachyderm.io/users/aidankinzett",
    },
    {
      rel: "http://ostatus.org/schema/1.0/subscribe",
      template: "https://hachyderm.io/authorize_interaction?uri={uri}",
    },
  ],
};

export const get = async () => ({ body: JSON.stringify(webfinger) });
