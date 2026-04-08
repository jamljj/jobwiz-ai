import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 导出常用的类型和方法
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  user_metadata: any;
  created_at: string;
  updated_at: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

export async function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  // 获取当前用户信息
  const { data: { user } } = await supabase.auth.getUser();
  
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.id,
      email: user?.email
    },
    operationType,
    path
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 测试连接（注释掉，因为数据库中可能没有test表）
/*
async function testConnection() {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (error) {
    console.error('Supabase connection test error:', error);
  }
}

testConnection();
*/