// 과제 제출용

import { supabase } from '../lib/supabase';
import type { Memo, MemoInsert, MemoUpdate } from '../types/todoType';

// 메모 (todoType.ts)
// export type Memo = Database['public']['Tables']['memos']['Row'];
// export type MemoInsert = Database['public']['Tables']['memos']['Insert'];
// export type MemoUpdate = Database['public']['Tables']['memos']['Update'];

// 메모 목록 조회 ( 메모 불러오기 )
export const getMemos = async (): Promise<Memo[]> => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`getMemos Error : ${error.message}`);
  }
  return data || [];
};
// ID를 이용한 메모 목록 조회
export const getMemoById = async (id: number): Promise<Memo | null> => {
  try {
    const { data, error } = await supabase.from(`memos`).select(`*`).eq(`id`, id).single();
    if (error) {
      throw new Error(`getMemoById Error : ${error.message}`);
    }
    return data;
  } catch (err) {
    console.log(`getMemoById Error : ${err}`);
    return null;
  }
};

// 1. 메모 생성
export const createMemo = async (newMemo: Omit<MemoInsert, 'user_id'>): Promise<Memo | null> => {
  try {
    const { data, error } = await supabase
      .from('memos')
      .insert([{ ...newMemo }])
      .select('*')
      .single();
    if (error) {
      throw new Error(`createMemo Error : ${error.message}`);
    }
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// 2. 메모 수정
export const updateMemo = async (id: number, updatedMemo: MemoUpdate): Promise<Memo | null> => {
  try {
    const { data, error } = await supabase
      .from('memos')
      .update(updatedMemo)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`updateMemo Error : ${error.message}`);
    }
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// 3. 메모 삭제
export const deleteMemo = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase.from('memos').delete().eq('id', id);

    if (error) {
      throw new Error(`deleteMemo Error : ${error.message}`);
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
