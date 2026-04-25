export const lastDaysRange = (days: number): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10)
  };
};
