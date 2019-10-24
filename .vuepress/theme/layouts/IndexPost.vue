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