// Category as the API returns and accepts it (backend/src/Dto/Category*.php, docs/analisis.md §4).
export interface Category {
  id: number;
  name: string;
}

export interface CategoryInput {
  name: string;
}
