<template>
  <div class="messages-container" ref="messagesContainer">
    <div v-if="page === 'friends' && isCheckingFriend" class="empty-state">
      <p class="text-muted-custom">Checking...</p>
    </div>

    <div
      v-else-if="page === 'friends' && shouldShowStartChatButton"
      class="empty-state"
    >
      <img
        src="https://img.icons8.com/color/64/chat.png"
        alt="Start Chat"
        class="mb-2 opacity-50"
      />
      <p class="text-muted-custom mb-3">Start a conversation</p>
      <button class="btn-start-chat" @click="handleStartChat">
        Start Chat
      </button>
    </div>

    <div
      v-else-if="(isFriend || page === 'groups') && !chats?.length"
      class="empty-state"
    >
      <img :src="ChatImage" alt="No Messages" class="mb-2 opacity-50" />
      <p class="text-muted-custom">No messages yet</p>
    </div>

    <div
      v-else-if="(isFriend || page === 'groups') && chats?.length"
      class="messages-list"
    >
      <div
        v-for="message in chats"
        :key="message.id"
        class="message-item"
        :class="{
          'message-sent': message.sentByYou,
          'message-received': !message.sentByYou,
        }"
      >
        <div class="message-bubble">
          <!-- Sender name for group chats -->
          <div
            v-if="page === 'groups' && !message.sentByYou"
            class="sender-name"
            @click="goToSender(message.senderId)"
          >
            {{ userCache[message.senderId] || "Loading..." }}
          </div>
          <p class="message-text">{{ message.chatMessage }}</p>
          <span class="message-time">
            {{ formatDate(parseInt(message.createdAt)) }}
            {{ formatTime(parseInt(message.createdAt)) }}
          </span>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom-anchor" ref="bottomAnchor"></div>

  <div
    v-if="page === 'groups' || shouldShowMessageBar"
    class="message-input-container"
  >
    <ErrorWrapper :message="generalError" />
    <input
      v-model="newMessage"
      type="text"
      size="20"
      class="message-input"
      placeholder="Type a message..."
      maxlength="1000"
      @keyup.enter="sendMessage"
    />
    <button
      class="btn-send"
      @click="sendMessage"
      :disabled="!newMessage.trim()"
    >
      <i class="fa-solid fa-paper-plane"></i>
    </button>
  </div>
</template>

<script src="./ChatTab.js" />
<style src="./ChatTab.css" scoped />
