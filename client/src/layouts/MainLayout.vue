<template>
  <div class="main-layout">
    <SideBar />

    <!-- Navbar -->
    <div
      class="top-bar"
      :class="{
        'sidebar-expanded': !sidebarState.isCollapsed,
        'has-chat-panel': hasChatPanel,
      }"
    >
      <NavBar />
    </div>

    <!-- Page content -->
    <div
      class="page-content custom-scroll"
      :class="{
        'sidebar-expanded': !sidebarState.isCollapsed,
      }"
    >
      <router-view />
    </div>
  </div>
</template>

<script src="./MainLayout.js" />
<style src="./MainLayout.css" scoped />
