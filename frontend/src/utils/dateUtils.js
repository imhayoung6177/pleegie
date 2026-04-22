export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return 'normal';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(expiryDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired'; // 지남 (빨강)
  if (diffDays <= 3) return 'urgent'; // 3일 이내 (주황/번쩍임)
  return 'normal';
};