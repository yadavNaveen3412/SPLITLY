export const settlementsTypeDefs = `#graphql

    type Settlement{
        id:String!
        group_id:String!
        payer_id:String!
        receiver_id:String!
        amount:Float!
        createdAt:DateTime!
        created_by:String!
        cycleId:Int!

        group:Group!
        payer:User!
        receiver:User!
        settlementCreator:User!
    }

    input CreateSettlementInput{
        group_id:String!
        payer_id:String!
        receiver_id:String!
        amount:Float!
    
    }
  
    type Mutation{
        createSettlement(input:CreateSettlementInput!):Settlement!
    }

    # type Query{
    #      getSettlementsByGroup(group_id: String!): [Settlement!]!
    # }

    type SettlementTransaction {
        from: ID!
        to: ID!
        amount: Float!
    }

    type UserBalance {
        type: String!
        person: ID!
        amount: Float!
        groupId: ID
        groupType: String
        groupTitle: String
    }

    type Query {
        getSettlementsByGroup(group_id: String!): [Settlement!]!        
        groupSettlements(groupId: ID!): [SettlementTransaction!]!
        myGroupBalances(groupId: ID!): [UserBalance!]!
        myAllBalances: [UserBalance!]!
        myFriendBalance(friendId: ID!): [UserBalance!]!
        myNetWithFriend(friendId: ID!): Float!
    }

`;
