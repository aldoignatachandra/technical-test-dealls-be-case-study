export const PaginationBuilder = (
  params: { limit: number; page: number },
  total: number,
  total_data: number
) => {
  const per_page = parseInt(params.limit as any);
  const current_page = parseInt(params.page as any);
  const skip = (current_page - 1) * per_page;
  const last_page = Math.ceil(total / per_page) || 1;
  let from = 0;
  let to = 0;

  if (total > 0) {
    from = skip + 1;
    to = from - 1 + total_data ? from - 1 + total_data : total;
  }

  return {
    total,
    per_page,
    current_page,
    last_page,
    from,
    to,
  };
};
