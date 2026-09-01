export interface AuditLogEntry {
  case_id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: {
    step?: string;
    root_cause?: string;
    confidence?: number;
    reasoning?: string;
    chosen_intervention?: string;
    reason?: string;
    alternatives_rejected?: Array<{ action: string; rejected_because: string }>;
    result?: string;
    rule?: string;
    details?: string;
    intervention?: string;
    status?: string;
    amount_recovered?: number;
    nudge_content?: any;
    rescheduled_to?: string | null;
  };
}

export interface CaseItem {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_company?: string | null;
  leak_type: 'payment_failure' | 'checkout_abandonment' | 'subscription_failure' | 'b2b_receivable';
  amount_at_risk: number;
  amount_recovered: number;
  root_cause: string;
  root_cause_confidence: number;
  reasoning_chain: string;
  chosen_intervention: string;
  intervention_reason: string;
  alternatives_rejected: Array<{ action: string; rejected_because: string }>;
  compliance_status: 'allowed' | 'blocked_time_window' | 'blocked_frequency' | 'blocked_exhausted' | 'blocked_duplicate' | 'rescheduled';
  compliance_rule: string;
  compliance_details: string;
  rescheduled_to?: string | null;
  status: 'open' | 'diagnosing' | 'intervening' | 'awaiting_response' | 'recovered' | 'partially_recovered' | 'failed' | 'escalated' | 'stopped';
  nudge_content?: {
    whatsapp?: string;
    email_subject?: string;
    email_body?: string;
  } | null;
  created_at: string;
  audit_logs?: AuditLogEntry[];
  audit_log_count?: number;
}

export interface BatchSummary {
  total_cases: number;
  total_at_risk: number;
  total_recovered: number;
  recovery_rate: number;
  by_leak_type: Record<string, { count: number; at_risk: number; recovered: number }>;
  by_root_cause: Record<string, { count: number; at_risk: number; recovered: number }>;
  by_status: Record<string, number>;
  compliance: {
    total_checks: number;
    blocked: number;
    compliance_rate: number;
  };
  exceptions: Array<{
    case_id: string;
    customer: string;
    amount: number;
    root_cause: string;
    reason: string;
    status: string;
  }>;
}

export interface VoiceCallDemoResponse {
  status: string;
  phone_number: string;
  duration_seconds: number;
  conversation: {
    language: string;
    flow: Array<{
      step: number;
      speaker: 'agent' | 'debtor';
      text: string;
      translation: string;
    }>;
    promise_to_pay: {
      amount: number;
      date: string;
      invoice: string;
      logged_at: string;
      follow_up_date: string;
    };
    compliance: {
      contact_window: string;
      language: string;
      frequency: string;
      full_transcript_logged: boolean;
    };
  };
  message: string;
}
