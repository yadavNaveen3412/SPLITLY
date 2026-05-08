const MainLayout = () => import("@/layouts/MainLayout.vue");
const HomePage = () => import("@/views/Home/HomePage.vue");
const FriendsPage = () => import("@/views/Friends/FriendsPage.vue");
const ChatsPage = () => import("@/views/Chats/ChatsPage.vue");
const GroupsPage = () => import("@/views/Groups/GroupsPage.vue");
const CreateGroupModal = () =>
  import("@/modals/CreateGroupModal/CreateGroupModal.vue");
const GroupDetails = () => import("@/views/GroupDetails/GroupDetails.vue");
const EditGroupModal = () =>
  import("@/modals/EditGroupModal/EditGroupModal.vue");
const MemberSelectorModal = () =>
  import("@/modals/MemberSelectorModal/MemberSelectorModal.vue");
const AddExpenseModal = () =>
  import("@/views/AddExpense/AddExpenseModal/AddExpenseModal.vue");
const ProfilePage = () => import("@/views/ProfilePage/ProfilePage.vue");
const AddFriendModal = () =>
  import("@/modals/AddFriendModal/AddFriendModal.vue");

export default {
  path: "",
  component: MainLayout,
  redirect: { name: "Home" },
  children: [
    {
      name: "Home",
      path: "home",
      component: HomePage,
    },
    {
      name: "AddExpense",
      path: "add-expense",
      component: AddExpenseModal,
      children: [
        {
          name: "AddExpense-AddFriend",
          path: "add-friend",
          component: AddFriendModal,
        },
      ],
      props: true,
    },
    {
      name: "Friends",
      path: "friends",
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
      path: "groups",
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
          children: [
            {
              name: "CreateGroupAddMembers",
              path: "add-members",
              component: MemberSelectorModal,
            },
          ],
        },
      ],
    },
    {
      name: "Group",
      path: "group/:id",
      component: GroupDetails,
      props: true,
      children: [
        {
          name: "EditGroup",
          path: "edit",
          component: EditGroupModal,
          props: true,
        },
        {
          name: "AddGroupMembers",
          path: "add-members",
          component: MemberSelectorModal,
          // props: true,
        },
      ],
    },
    {
      name: "ProfilePage",
      path: "my-profile",
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
