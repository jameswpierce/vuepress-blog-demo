<template>
  <div>
    <ul id="posts-list">
      <li v-for="post in $pagination.pages">
        <router-link class="post-link" :to="post.path">{{ post.title }}</router-link>
      </li>
    </ul>
  </div>
</template>