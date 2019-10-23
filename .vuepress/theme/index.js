module.exports = {
  extend: "@vuepress/theme-default",
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
