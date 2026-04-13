export function simplifyExpensesByFriendId(expenses, userId, friendId) {
  return expenses.map((e) => {
    const userP = e.participants.find((p) => p.userId === userId);
    const friendP = e.participants.find((p) => p.userId === friendId);

    const uPaid = Number(userP?.paidAmount || 0);
    const uOwed = Number(userP?.owedAmount || 0);
    const fPaid = Number(friendP?.paidAmount || 0);
    const fOwed = Number(friendP?.owedAmount || 0);

    const uNet = uPaid - uOwed;
    const fNet = fPaid - fOwed;

    let amount = 0;
    let type = "no-balance";

    if (fNet > 0 && uNet < 0) {
      amount = Math.min(fNet, -uNet);
      type = "owe";
    } else if (uNet > 0 && fNet < 0) {
      amount = Math.min(uNet, -fNet);
      type = "owed";
    }

    return {
      id: e.id,
      title: e.title,
      amount,
      type,
      date: e.createdAt,
      createdByUser: e.createdByUser,
      category: e.category,
      groupId: e.groupId,
      groupType: e.group?.type,
    };
  });
}
