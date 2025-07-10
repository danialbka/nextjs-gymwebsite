// Mock database for frontend-only build
// This is a placeholder since the actual database would be in the backend

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export async function query<T = any>(sql: string, _params: unknown[] = []): Promise<QueryResult<T>> {
  // Mock implementation - returns empty results
  console.warn('Database query called in frontend-only mode:', sql);
  return {
    rows: [],
    rowCount: 0
  };
}

export default query;