module.exports = {
  extend: "@vuepress/theme-default",
  themeConfig: {
    nav: [{ text: "Home", link: "/" }, { text: "Blog", link: "/posts/" }]
  },
  plugins: [
    [
      "@vuepress/blog",
      {
        directories: [
          {
            id: "post",
            dirname: "_posts",
            path: "/posts/",
            itemPermalink: "/posts/:slug"
          }
        ]
      }
    ]
  ]
};
