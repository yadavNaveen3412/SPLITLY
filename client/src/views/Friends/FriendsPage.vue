<template>
  <div class="main" :class="{ 'has-chat-panel': hasChatPanel }">
    <div class="container">
      <!-- Page Header -->
      <BaseHeader title="Friends">
        <template #actions>
          <BaseButton
            label="Add Friend"
            icon="fa-solid fa-user-plus"
            @click="openAddFriendModal"
          />
        </template>
      </BaseHeader>

      <!-- Friends List -->
      <BaseList
        :items="friends"
        :loading="loading"
        loadingMessage="Loading friends..."
        emptyMessage="No friends yet. Start adding expenses to see your friends here!"
      >
        <FriendListItem
          v-for="friend in friends"
          :key="friend.id"
          :item="friend"
          :isActive="selectedFriendId === friend.id"
          @click="goToFriendChat(friend.id)"
        />
      </BaseList>
    </div>
    <!-- Child Route View (Chats Panel) -->
    <router-view></router-view>
  </div>
</template>

<script src="./Friends.js" />
<style src="./Friends.css" scoped />
