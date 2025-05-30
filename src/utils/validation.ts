
export const isValidObjectId = (id: string): boolean => {
  // MongoDB ObjectId validation - typically 24 hex chars
  return /^[0-9a-fA-F]{24}$/.test(id) || 
         // Allow simplified mock IDs for development
         /^\d+$/.test(id);
};
