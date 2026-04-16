import MainLayout from "@/layouts/MainLayout.vue";
import HomePage from "../views/Home/HomePage.vue";

import FriendsPage from "@/views/Friends/FriendsPage.vue";
import ChatsPage from "@/views/Chats/ChatsPage.vue";
import GroupsPage from "@/views/Groups/GroupsPage.vue";
import CreateGroupModal from "@/modals/CreateGroupModal/CreateGroupModal.vue";
import GroupPage from "@/views/SingleGroup/GroupPage.vue";
import EditGroup from "@/views/EditGroup/EditGroup.vue";
import AddExpenseModal from "@/views/AddExpense/AddExpenseModal/AddExpenseModal.vue";
import ProfilePage from "@/views/ProfilePage/ProfilePage.vue";
// import SharedProfile from "@/views/SharedProfile/SharedProfile.vue";
import AddFriendModal from "@/modals/AddFriendModal/AddFriendModal.vue";

// const sharedProfileRoute = (name) => ({
//   name,
//   path: "/add-friend/:shareCode",
//   component: SharedProfile,
//   props: true,
// });

export default {
  path: "/home",
  component: MainLayout,
  children: [
    {
      name: "Home",
      path: "/home",
      component: HomePage,
    },
    {
      name: "AddExpense",
      path: "/add-expense",
      component: AddExpenseModal,
      children: [
        {
          name: "AddFriend",
          path: "add-friend",
          component: AddFriendModal,
        },
      ],
    },
    {
      name: "Friends",
      path: "/friends",
      component: FriendsPage,
      children: [
        {
          name: "Chats",
          path: "chats/:id",
          component: ChatsPage,
          props: true,
        },

        {
          name: "AddFriend",
          path: "add-friend",
          component: AddFriendModal,
        },
      ],
    },
    {
      name: "Groups",
      path: "/groups",
      component: GroupsPage,
      children: [
        {
          name: "GroupChats",
          path: "chats/:id",
          component: ChatsPage,
          props: true,
        },
        {
          name: "CreateGroup",
          path: "create",
          component: CreateGroupModal,
        },
      ],
    },
    { name: "Group", path: "/group/:id", component: GroupPage, props: true },
    {
      name: "EditGroup",
      path: "/group/:id/edit",
      component: EditGroup,
      props: true,
    },
    {
      name: "ProfilePage",
      path: "/my-profile",
      component: ProfilePage,
      children: [
        {
          name: "Profile-AddFriend",
          path: "add-friend",
          component: AddFriendModal,
        },
      ],
    },
  ],
};
