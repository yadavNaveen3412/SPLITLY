<template>
  <div
    class="sidebar custom-scroll"
    :class="{ collapsed: sidebarState.isCollapsed }"
  >
    <!-- Brand logo + label at the very top -->
    <div class="sidebar-brand">
      <div class="sidebar-brand-logo">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 12h6" />
          <path d="M10 12l-3-3" />
          <path d="M10 12l-3 3" />
          <path d="M20 12h-6" />
          <path d="M14 12l3-3" />
          <path d="M14 12l3 3" />
        </svg>
      </div>
      <span class="sidebar-brand-name">
        Split<span class="sidebar-brand-ly">LY</span>
      </span>
    </div>

    <!-- Nav links (grow to fill space) -->
    <ul class="nav flex-column">
      <li class="nav-item">
        <router-link
          to="/home"
          :class="{ active: activeItem === 'Home' }"
          @click="setActive('Home')"
        >
          <i class="fa-solid fa-house"></i>
          <span class="nav-text">&nbsp; Home</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          to="/friends"
          :class="{ active: activeItem === 'Friends' }"
          @click="setActive('Friends')"
        >
          <i class="fa-solid fa-user-group"></i>
          <span class="nav-text">&nbsp; Friends</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          to="/groups"
          :class="{ active: activeItem === 'Groups' }"
          @click="setActive('Groups')"
        >
          <i class="fa-solid fa-people-group"></i>
          <span class="nav-text">&nbsp; Groups</span>
        </router-link>
      </li>
    </ul>

    <!-- Toggle Sidebar Button -->
    <div class="sidebar-toggle" @click="toggleSidebar()">
      <i
        class="fa-solid fa-chevron-right chevron"
        :class="{ open: !sidebarState.isCollapsed }"
      ></i>
      <span class="nav-text">&nbsp; Collapse</span>
    </div>
  </div>
</template>

<script src="./SideBar.js" />
<style src="./SideBar.css" scoped />
