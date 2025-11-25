import type { Database } from './TodoTypes';

// 메모 (todoType.ts)
export type Memo = Database['public']['Tables']['memos']['Row'];
export type MemoInsert = Database['public']['Tables']['memos']['Insert'];
export type MemoUpdate = Database['public']['Tables']['memos']['Update'];
