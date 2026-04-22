import gql from "graphql-tag";
import apolloClient from "@/apollo";

const GET_GROUPS = gql`
  query GetGroups($type: String) {
    getGroups(type: $type) {
      title
      id
      type
      currentCycleId
      profilePic
      profilePicVersion
      members {
        user {
          id
          name
        }
      }
    }
  }
`;

const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($title: String!, $type: GroupType, $members: [String]) {
    createGroup(title: $title, type: $type, members: $members) {
      type
      title
      id
    }
  }
`;

const GET_GROUP_DETAILS = gql`
  query getGroupDetails($id: ID!) {
    getGroupDetails(id: $id) {
      id
      createdById
      title
      type
      currentCycleId
      profilePic
      profilePicVersion
      members {
        user {
          name
          id
          email
        }
      }
    }
  }
`;

const RENAME_GROUP = gql`
  mutation RenameGroup($groupId: String!, $title: String!) {
    renameGroup(groupId: $groupId, title: $title) {
      id
      createdById
      title
      type
      members {
        user {
          name
          id
          email
        }
      }
    }
  }
`;

const DELETE_GROUP = gql`
  mutation DeleteGroup($groupId: String!) {
    deleteGroup(groupId: $groupId)
  }
`;

const ADD_MEMBER_TO_GROUP = gql`
  mutation AddMemberToGroup($groupId: String!, $userIds: [ID!]!) {
    addMemberToGroup(groupId: $groupId, userIds: $userIds) {
      added
      alreadyMembers
      invited
      updatedGroup {
        id
        createdById
        title
        type
        members {
          user {
            name
            id
            email
          }
        }
      }
    }
  }
`;

const GET_PERSONAL_GROUP_ID = gql`
  query GetFriends($otherUserId: ID!) {
    getPersonalGroupId(otherUserId: $otherUserId)
  }
`;

const GET_COMMON_GROUPS = gql`
  query GetCommonGroups($friendId: String!) {
    getCommonGroups(friendId: $friendId) {
      id
      title
      type
    }
  }
`;

const GET_OR_CREATE_NON_GROUP = gql`
  mutation GetOrCreateNonGroup($memberIds: [ID!]!) {
    getOrCreateNonGroup(memberIds: $memberIds) {
      id
    }
  }
`;

export const groupService = {
  async getGroups(type) {
    const resp = await apolloClient.query({
      query: GET_GROUPS,
      variables: { type },
      fetchPolicy: "cache-first",
    });
    return resp.data.getGroups;
  },

  async createGroup(title, type, members = []) {
    const resp = await apolloClient.mutate({
      mutation: CREATE_GROUP_MUTATION,
      variables: { title, type, members },
      refetchQueries: [{ query: GET_GROUPS, variables: { type } }],
      awaitRefetchQueries: true,
    });
    return resp.data;
  },

  async getGroupDetails(id) {
    const resp = await apolloClient.query({
      query: GET_GROUP_DETAILS,
      variables: { id },
      fetchPolicy: "cache-first",
    });
    return resp.data;
  },

  async renameGroup(groupId, title) {
    const resp = await apolloClient.mutate({
      mutation: RENAME_GROUP,
      variables: { groupId, title },
      fetchPolicy: "no-cache",
    });
    return resp.data;
  },

  async deleteGroup(groupId) {
    const resp = await apolloClient.mutate({
      mutation: DELETE_GROUP,
      variables: { groupId },
      fetchPolicy: "no-cache",
    });
    return resp.data;
  },

  async addMemberToGroup(groupId, userIds) {
    const resp = await apolloClient.mutate({
      mutation: ADD_MEMBER_TO_GROUP,
      variables: { groupId, userIds },
      fetchPolicy: "no-cache",
    });
    return resp.data;
  },

  async getPersonalGroupId(otherUserId) {
    const resp = await apolloClient.query({
      query: GET_PERSONAL_GROUP_ID,
      variables: { otherUserId },
      fetchPolicy: "no-cache",
    });

    return resp.data.getPersonalGroupId;
  },
};

export const getCommonGroups = async (friendId) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_COMMON_GROUPS,
      variables: { friendId },
      fetchPolicy: "no-cache",
    });

    // console.log("Common groups", data.getCommonGroups);
    return data.getCommonGroups;
  } catch (error) {
    console.log("Error getting common groups:", error);
  }
};

export const getOrCreateNonGroup = async (memberIds) => {
  const { data } = await apolloClient.mutate({
    mutation: GET_OR_CREATE_NON_GROUP,
    variables: { memberIds },
    fetchPolicy: "no-cache",
  });

  return data.getOrCreateNonGroup;
};
