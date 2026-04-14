/**
 * Shared expense splitting logic and validation
 */

/**
 * Distributes a total amount exactly among a set of participants.
 * Handles rounding to 2 decimal places and assigns the remainder to the first participant.
 * 
 * @param {number} totalAmount - The total amount to distribute
 * @param {number} count - Number of participants
 * @returns {number[]} Array of amounts summing exactly to totalAmount
 */
export const distributeExactly = (totalAmount, count) => {
  if (count <= 0) return [];
  const amountInCents = Math.round(Number(totalAmount) * 100);
  const baseAmountInCents = Math.floor(amountInCents / count);
  const remainderInCents = amountInCents - (baseAmountInCents * count);

  return Array.from({ length: count }, (_, i) => {
    return (baseAmountInCents + (i === 0 ? remainderInCents : 0)) / 100;
  });
};

/**
 * Calculates owed amounts for all participants based on the split method.
 * 
 * @param {number} totalAmount - Total expense amount
 * @param {string} splitMethod - 'equal', 'unequal', 'percentage', 'shares'
 * @param {Array} participants - Array of { userId, splitValue }
 * @returns {Array} Array of { userId, owedAmount }
 */
export const calculateOwedAmounts = (totalAmount, splitMethod, participants) => {
  const targetCents = Math.round(Number(totalAmount) * 100);
  let totalAssignedCents = 0;
  const owedAssignments = [];

  if (splitMethod === "equal") {
    const includedParticipants = participants.filter(p => (Number(p.splitValue) ?? 1) > 0);
    const count = includedParticipants.length || participants.length;
    const amounts = distributeExactly(totalAmount, count);
    
    let amountIndex = 0;
    participants.forEach(p => {
      const isIncluded = (Number(p.splitValue) ?? 1) > 0 || includedParticipants.length === 0;
      const amount = isIncluded ? amounts[amountIndex++] : 0;
      owedAssignments.push({ userId: p.userId, owedAmount: amount });
      totalAssignedCents += Math.round(amount * 100);
    });
  } 
  else if (splitMethod === "unequal") {
    participants.forEach(p => {
      const amount = Number(p.splitValue) || 0;
      owedAssignments.push({ userId: p.userId, owedAmount: amount });
      totalAssignedCents += Math.round(amount * 100);
    });
  } 
  else if (splitMethod === "percentage") {
    participants.forEach(p => {
      const amount = (Number(totalAmount) * (Number(p.splitValue) || 0)) / 100;
      const cents = Math.round(amount * 100);
      owedAssignments.push({ userId: p.userId, owedAmount: cents / 100 });
      totalAssignedCents += cents;
    });
  } 
  else if (splitMethod === "shares") {
    const totalShares = participants.reduce((sum, p) => sum + (Number(p.splitValue) || 0), 0);
    if (totalShares === 0) {
      participants.forEach(p => owedAssignments.push({ userId: p.userId, owedAmount: 0 }));
    } else {
      participants.forEach(p => {
        const amount = (Number(totalAmount) * (Number(p.splitValue) || 0)) / totalShares;
        const cents = Math.round(amount * 100);
        owedAssignments.push({ userId: p.userId, owedAmount: cents / 100 });
        totalAssignedCents += cents;
      });
    }
  }

  // Adjust for rounding remainders (except for unequal which is validated strictly)
  if (splitMethod !== "unequal" && totalAssignedCents !== targetCents && owedAssignments.length > 0) {
    const remainderCents = targetCents - totalAssignedCents;
    const firstValidIndex = owedAssignments.findIndex(a => a.owedAmount > 0) === -1 ? 0 : owedAssignments.findIndex(a => a.owedAmount > 0);
    
    const adjAmount = Math.round((owedAssignments[firstValidIndex].owedAmount * 100) + remainderCents) / 100;
    owedAssignments[firstValidIndex].owedAmount = adjAmount;
  }

  return owedAssignments;
};

/**
 * Validates that the split is financially sound.
 * 
 * @param {number} totalAmount - Total expense amount
 * @param {Array} participants - Array of { paidAmount, owedAmount }
 * @throws {Error} If sums do not match totalAmount
 */
export const validateSplit = (totalAmount, participants) => {
  const targetCents = Math.round(Number(totalAmount) * 100);
  
  const totalPaidCents = participants.reduce((sum, p) => sum + Math.round(Number(p.paidAmount) * 100), 0);
  const totalOwedCents = participants.reduce((sum, p) => sum + Math.round(Number(p.owedAmount) * 100), 0);

  if (totalPaidCents !== targetCents) {
    throw new Error(`Integrity Error: Total paid (₹${totalPaidCents / 100}) must exactly equal the total expense amount (₹${totalAmount}).`);
  }

  if (totalOwedCents !== targetCents) {
    throw new Error(`Integrity Error: Total owed (₹${totalOwedCents / 100}) must exactly equal the total expense amount (₹${totalAmount}).`);
  }

  return true;
};
