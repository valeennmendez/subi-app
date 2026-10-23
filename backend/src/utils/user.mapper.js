export function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    rating_average:
      row.rating_average === null ? null : Number(row.rating_average),
    created_at: row.created_at,
  };
}
