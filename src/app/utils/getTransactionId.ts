export const getTransactionId = () => {
    return `T_${Date.now()}_${Math.floor(Math.random() * 1000)}`
};