import gql from "graphql-tag";
import apolloClient from "@/apollo/client";

const GET_GROUPS = gql`
  query GetGroups($type: String!) {
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
  mutation CreateGroup($input: GroupInput!) {
    createGroup(input: $input) {
      type
      title
      id
      profilePic
      profilePicVersion
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

const EDIT_GROUP_DETAILS = gql`
  mutation EditGroupDetails(
    $groupId: String!
    $title: String!
    $profilePic: String
    $profilePicVersion: String
  ) {
    editGroupDetails(
      groupId: $groupId
      title: $title
      profilePic: $profilePic
      profilePicVersion: $profilePicVersion
    ) {
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
    const { data } = await apolloClient.query({
      query: GET_GROUPS,
      variables: { type },
      fetchPolicy: "cache-first",
    });

    return data.getGroups;
  },

  async createGroup(input) {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_GROUP_MUTATION,
      variables: { input },
      refetchQueries: [{ query: GET_GROUPS, variables: { type: input.type } }],
      awaitRefetchQueries: true,
    });

    return data.createGroup;
  },

  async getGroupDetails(id) {
    const { data } = await apolloClient.query({
      query: GET_GROUP_DETAILS,
      variables: { id },
      fetchPolicy: "cache-first",
    });

    return data.getGroupDetails;
  },

  async editGroupDetails(payload) {
    const { data } = await apolloClient.mutate({
      mutation: EDIT_GROUP_DETAILS,
      variables: payload,
      fetchPolicy: "no-cache",
    });

    return data.editGroupDetails;
  },

  async deleteGroup(groupId) {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_GROUP,
      variables: { groupId },
      fetchPolicy: "no-cache",
    });

    return data.deleteGroup;
  },

  async addMemberToGroup(groupId, userIds) {
    const { data } = await apolloClient.mutate({
      mutation: ADD_MEMBER_TO_GROUP,
      variables: { groupId, userIds },
      fetchPolicy: "no-cache",
    });

    return data.addMemberToGroup;
  },

  async getPersonalGroupId(otherUserId) {
    const { data } = await apolloClient.query({
      query: GET_PERSONAL_GROUP_ID,
      variables: { otherUserId },
      fetchPolicy: "no-cache",
    });

    return data.getPersonalGroupId;
  },
};

export const getCommonGroups = async (friendId) => {
  const { data } = await apolloClient.query({
    query: GET_COMMON_GROUPS,
    variables: { friendId },
    fetchPolicy: "no-cache",
  });

  return data.getCommonGroups;
};

export const getOrCreateNonGroup = async (memberIds) => {
  const { data } = await apolloClient.mutate({
    mutation: GET_OR_CREATE_NON_GROUP,
    variables: { memberIds },
    fetchPolicy: "no-cache",
  });

  return data.getOrCreateNonGroup;
};
