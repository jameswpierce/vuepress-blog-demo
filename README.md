# vuepress-blog-demo
Companion repository to VuePress tutorial on jamespierce.dev

Learn to set up a blog using VuePress by following along here: https://jamespierce.dev/posts/creating-a-blog-with-vuepress.html

# Creating a statically-generated blog with Vuepress

In this post, I am going to illustrate how to use Vuepress to quickly stand up a blog.

## Initialize project

```bash
# create directory
mkdir blog && cd blog

# initialize new git repository
git init

# ignore node dependencies
echo 'node_modules' > .gitignore

# dummy front page
echo '# Hello' > index.md

# install vuepress to project
yarn add -D vuepress

# get this in version control!
git add .
git commit -m 'Initial commit'

# run vuepress dev server
yarn run vuepress dev
```

Nice work! You now have a hot-reloading development server available at [http://localhost:8080](http://localhost:8080/). It doesn't do much yet, but we have a nice environment set up to quickly begin iterating on our site.

If you are familiar with [Markdown](https://daringfireball.net/projects/markdown/), feel free to add a little spice to your home page. Otherwise, here's a quick [cheatsheet](https://commonmark.org/help/) to get you started.

## Automatic posts

We could create a posts directory with an `index.md` that we update manually with every new blog post, but it would be a lot nicer if we had a posts index that updated automatically. For that, we are going to use the officially supported blog plugin for VuePress: [@vuepress/plugin-blog](https://github.com/vuepressjs/vuepress-plugin-blog).

```bash
# install vuepress blog plugin
yarn add -D @vuepress/plugin-blog

# create .vuepress directory to override defaults
mkdir .vuepress

# init custom theme config file
touch .vuepress/config.js
```

Now we need to add the plugin to our site's configuration. Open `.vuepress/config.js` and add this code:

```js
// .vuepress/config.js

module.exports = {
  plugins: ["@vuepress/blog"]
};
```

```bash
# version controllll
git add .
git commit -m 'install @vuepress/plugin-blog'
```

Now that the plugin is installed, we need to set up our posts directory and configure the plugin to use it.

```bash
# create posts directory
mkdir _posts

# first post!
echo '# Welcome 2 the Future' > _posts/my-first-blog-post.md
```

and update `.vuepress/config.js` to look like this:

```js
// .vuepress/config.js
module.exports = {
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
```

You may need to restart your development server to see these changes take effect. After that, you should be able to see a post with the URL: [http://localhost:8080/posts/my-first-blog-post/](http://localhost:8080/posts/my-first-blog-post/).

Commit your changes to version control, and let's proceed.

## Creating the blog index layout

You may have noticed that the index page at [http://localhost:8080/posts/](http://localhost:8080/posts/) is blank. That is because `@vuepress/plugin-blog` is looking for a layout component called `IndexPost` in our project. Because that layout is not there, it falls back to the default Layout, which does not have any idea how to handle any data about the files in the `_posts` directory, thus rendering a blank page.

```bash
# create directory structure for theme and layout
mkdir -P .vuepress/theme/layouts
```

Next we need to move `.vuepress/config.js` to the theme folder and change it's name to `index.js`

```bash
mv .vuepress/config.js .vuepress/theme/index.js
```

Then we need to add a line to let Vuepress know that which theme to inherit defaults from.

```js
// .vuepress/theme/index.js
module.exports = {
  extend: "@vuepress/theme-default", // add this line!
  plugins: [
    [...]
  ]
};
```

Now lets add a link in the navigation of our site to the `/posts` page (and throw in one back to the home page as well). Create a new file at `.vuepress/config.js` and add the code below.

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    nav: [{ text: "Home", link: "/" }, { text: "Blog", link: "/posts/" }]
  }
};
```

Create a new file `IndexPost.vue` in `.vuepress/theme/layouts`

```bash
# initialize layout
touch .vuepress/theme/layouts/IndexPost.vue
```

In `IndexPost.vue` the Vuepress blog plugin exposes a variable `$pagination`, that gives the layout access to information about the posts contained in the `_posts` directory. We can use it to generate a simple (and paginated) index like so:

```vue
// .vuepress/theme/layouts/IndexPost.vue

<template>
  <div>
    <ul id="posts-list">
      <li v-for="post in $pagination.pages">
        <router-link class="post-link" :to="post.path">
          {{ post.title }}
        </router-link>
      </li>
    </ul>
    <div id="pagination">
      <router-link v-if="$pagination.hasPrev" :to="$pagination.prevLink">Prev</router-link>
      <router-link v-if="$pagination.hasNext" :to="$pagination.nextLink">Next</router-link>
    </div>
  </div>
</template>
```

## Inheriting from the parent theme

The posts index is working as advertised, but it isn't rendering inside of the default layout of our theme.  Vuepress gives our components access to `@parent-theme` in our custom layouts, which will allow this page to inherit all the functionality included in the other pages.

## In the future this will work...

As of this writing (10/23/2019, version 1.2.0 of vuepress), there is a bug in the default layout that keeps us from using Vue's slots correctly. There is a fix on the master branch, which should be released soon.

```vue
// .vuepress/theme/layouts/IndexPost.vue

<template>
  <Layout>
    <template #page-top>
      <div class="theme-default-content content__default">
        <ul id="posts-list">
          <li v-for="post in $pagination.pages">
            <router-link class="post-link" :to="post.path">{{ post.title }}</router-link>
          </li>
        </ul>
        <div id="pagination">
          <router-link v-if="$pagination.hasPrev" :to="$pagination.prevLink">Prev</router-link>
          <router-link v-if="$pagination.hasNext" :to="$pagination.nextLink">Next</router-link>
        </div>
      </div>
    </template>
  </Layout>
</template>
<script>
import Layout from "@parent-theme/layouts/Layout.vue";

export default {
  components: {
    Layout
  }
};
</script>
```

## A temporary workaround!

Until then, copy this code into `.vuepress/theme/layouts/Layout.vue` and use the version of `IndexPost.vue` below as well. Don't concern yourself too much with this code unless you are feeling particularly adventurous.

```vue
// .vuepress/theme/layouts/Layout.vue

<template>
  <div
    class="theme-container"
    :class="pageClasses"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar" />

    <div class="sidebar-mask" @click="toggleSidebar(false)"></div>

    <Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
      <template #top>
        <slot name="sidebar-top" />
      </template>
      <template #bottom>
        <slot name="sidebar-bottom" />
      </template>
    </Sidebar>

    <Home v-if="$page.frontmatter.home" />

    <Page v-else :sidebar-items="sidebarItems">
      <template #top>
        <slot name="page-top" />
      </template>
      <template #bottom>
        <slot name="page-bottom" />
      </template>
    </Page>
  </div>
</template>

<script>
import Home from "@parent-theme/components/Home.vue";
import Navbar from "@parent-theme/components/Navbar.vue";
import Page from "@parent-theme/components/Page.vue";
import Sidebar from "@parent-theme/components/Sidebar.vue";
import { resolveSidebarItems } from "@parent-theme/util";
export default {
  components: { Home, Page, Sidebar, Navbar },
  data() {
    return {
      isSidebarOpen: false
    };
  },
  computed: {
    shouldShowNavbar() {
      const { themeConfig } = this.$site;
      const { frontmatter } = this.$page;
      if (frontmatter.navbar === false || themeConfig.navbar === false) {
        return false;
      }
      return (
        this.$title ||
        themeConfig.logo ||
        themeConfig.repo ||
        themeConfig.nav ||
        this.$themeLocaleConfig.nav
      );
    },
    shouldShowSidebar() {
      const { frontmatter } = this.$page;
      return (
        !frontmatter.home &&
        frontmatter.sidebar !== false &&
        this.sidebarItems.length
      );
    },
    sidebarItems() {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      );
    },
    pageClasses() {
      const userPageClass = this.$page.frontmatter.pageClass;
      return [
        {
          "no-navbar": !this.shouldShowNavbar,
          "sidebar-open": this.isSidebarOpen,
          "no-sidebar": !this.shouldShowSidebar
        },
        userPageClass
      ];
    }
  },
  mounted() {
    this.$router.afterEach(() => {
      this.isSidebarOpen = false;
    });
  },
  methods: {
    toggleSidebar(to) {
      this.isSidebarOpen = typeof to === "boolean" ? to : !this.isSidebarOpen;
      this.$emit("toggle-sidebar", this.isSidebarOpen);
    },
    // side swipe
    onTouchStart(e) {
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
    },
    onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true);
        } else {
          this.toggleSidebar(false);
        }
      }
    }
  }
};
</script>
```

Finally, `IndexPost.vue`!

```vue
// .vuepress/theme/layouts/IndexPost.vue

<template>
  <Layout>
    <template #page-top>
      <div class="theme-default-content content__default">
        <ul id="posts-list">
          <li v-for="post in $pagination.pages">
            <router-link class="post-link" :to="post.path">{{ post.title }}</router-link>
          </li>
        </ul>
        <div id="pagination">
          <router-link v-if="$pagination.hasPrev" :to="$pagination.prevLink">Prev</router-link>
          <router-link v-if="$pagination.hasNext" :to="$pagination.nextLink">Next</router-link>
        </div>
      </div>
    </template>
  </Layout>
</template>
<script>
import Layout from "@theme/layouts/Layout.vue";

export default {
  components: {
    Layout
  }
};
</script>
```

Annnnnnd it works! Commit this sucker to version control. You've got yourself a basic blog that builds to an ultra-fast static website, that you can easily deploy for free.

I will tackle deployment in an upcoming post. Until then:
## Dig Deeper

Read: [VuePress](https://vuepress.vuejs.org/)

Read: [@vuepress/plugin-blog](https://vuepress-plugin-blog.ulivz.com/)

Bonus Points: [ZEIT](https://zeit.co)

## Thanks for reading!
