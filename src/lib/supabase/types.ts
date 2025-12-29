export type CustomerType = {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string
  description_en: string
  primary_color: string
  created_at: string
}

export type AccessCode = {
  id: string
  code: string
  customer_type_id: string
  pdf_url: string
  expires_at: string | null
  max_uses: number | null
  use_count: number
  is_active: boolean
  created_at: string
  // Joined fields
  customer_type?: CustomerType
}

export type CodeUsageLog = {
  id: string
  code_id: string
  accessed_at: string
  ip_address: string | null
  user_agent: string | null
  country: string | null
  language: string | null
  // Joined fields
  access_code?: AccessCode
}

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'viewer'
}

export interface Database {
  public: {
    Tables: {
      customer_types: {
        Row: CustomerType
        Insert: Omit<CustomerType, 'id' | 'created_at'>
        Update: Partial<Omit<CustomerType, 'id' | 'created_at'>>
      }
      access_codes: {
        Row: AccessCode
        Insert: Omit<AccessCode, 'id' | 'created_at' | 'use_count' | 'customer_type'>
        Update: Partial<Omit<AccessCode, 'id' | 'created_at' | 'customer_type'>>
      }
      code_usage_logs: {
        Row: CodeUsageLog
        Insert: Omit<CodeUsageLog, 'id' | 'accessed_at' | 'access_code'>
        Update: never
      }
      admin_users: {
        Row: AdminUser
        Insert: AdminUser
        Update: Partial<AdminUser>
      }
    }
  }
}
