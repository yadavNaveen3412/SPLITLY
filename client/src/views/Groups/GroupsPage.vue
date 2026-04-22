<template>
  <div class="main" :class="{ 'has-chat-panel': hasChatPanel }">
    <div class="container">
      <!-- Page Header -->
      <BaseHeader title="Groups">
        <template #actions>
          <BaseButton
            label="Create Group"
            icon="fa-solid fa-plus"
            :to="{ name: 'CreateGroup' }"
          />
        </template>
      </BaseHeader>

      <!-- Groups List -->
      <BaseList
        :items="groups"
        :loading="isLoading"
        loadingMessage="Loading groups..."
        emptyMessage="No groups found yet."
      >
        <GroupListItem
          v-for="group in groups"
          :key="group.id"
          :item="group"
          @click="goToGroup(group.id)"
        />
      </BaseList>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import BaseHeader from "@/components/layout/BaseHeader/BaseHeader.vue";
import BaseButton from "@/components/ui/BaseButton/BaseButton.vue";
import BaseList from "@/components/layout/BaseList/BaseList.vue";
import GroupListItem from "@/components/features/GroupListItem/GroupListItem.vue";
import GroupsLogic from "./Groups.js";

export default {
  ...GroupsLogic,
  components: {
    BaseHeader,
    BaseButton,
    BaseList,
    GroupListItem,
  },
};
</script>

<style src="./Groups.css" scoped />
