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
  status: 'open' | 'diagnosing' | 'intervening' | 'awaiting_response' | 'recovered' | 'partially_recovered' | 'failed' | 'escalated' | 'stopped' | 'reconciled_late_auth';
  nudge_content?: {
    whatsapp?: string;
    email_subject?: string;
    email_body?: string;
  } | null;
  counterfactual?: {
    p_natural_recovery: number;
    p_intervention_recovery: number;
    incremental_lift_pct: number;
    intervention_cost_inr: number;
    churn_penalty_inr?: number;
    expected_net_recovery_inr: number;
    revenue_bounds_inr?: {
      p10_pessimistic: number;
      p50_expected: number;
      p90_optimistic: number;
    };
    autonomy_envelope_state?: 'EXPANDED' | 'CONTRACTED';
    requires_human_approval: boolean;
  };
  tax_clock?: {
    applies: boolean;
    invoice_amount: number;
    due_date: string;
    deadline_date: string;
    days_overdue: number;
    days_until_45d_deadline: number;
    is_breached: boolean;
    deferral_cost_inr: number;
    urgency_level: string;
    cfo_negotiation_lever: string;
    hinglish_script_snippet: string;
  } | null;
  smart_schedule?: {
    optimal_window: string;
    optimal_label: string;
    scheduled_at: string;
    hours_from_failure: number;
    alignment: string;
    reason: string;
    days_to_payday: number;
    candidates: Array<{
      type: string;
      label: string;
      scheduled_at: string;
      hours_from_failure: number;
      target_rationale: string;
      alignment: string;
    }>;
  };
  requires_human_approval?: boolean;
  operator_approval?: {
    status: 'approved' | 'rejected';
    approved_at?: string;
    rejected_at?: string;
    note?: string;
    reason?: string;
  };
  receipt?: {
    receipt_id: string;
    timestamp: string;
    sha256_seal: string;
    financials: {
      amount_at_risk_inr: number;
      amount_recovered_inr: number;
      expected_net_recovery_inr: number;
      intervention_cost_inr: number;
    };
    counterfactual_analysis: {
      p_natural_recovery: number;
      p_intervention_recovery: number;
      incremental_lift_pct: number;
    };
    compliance_citations: {
      status: string;
      rule_cited: string;
    };
    rails_clearing?: {
      obligation_id: string;
      obligation_hash: string;
      envelope_hash: string;
      admissibility_class: 'SELF' | 'SIGN' | 'WIT' | 'REC' | 'ATT' | 'PROOF';
      admissibility_floor: 'SELF' | 'SIGN' | 'WIT' | 'REC' | 'ATT' | 'PROOF';
      soundness_verified: boolean;
      finality_status: 'PROVISIONAL' | 'FINAL' | 'POLICY_VETOED' | 'ABORTED';
      soundness_statement: string;
      evidence_envelope: {
        obligation_hash: string;
        envelope_hash: string;
        aggregate_admissibility: string;
        timestamp: string;
        evidence_count: number;
        evidence_items: Array<{
          id: string;
          source: string;
          evidence_type: string;
          admissibility: 'SELF' | 'SIGN' | 'WIT' | 'REC' | 'ATT' | 'PROOF';
          hash: string;
          verified: boolean;
          timestamp: string;
          preview?: any;
        }>;
      };
    };
  };
  stages?: Array<{
    stage_number: number;
    name: string;
    status: 'COMPLETED' | 'HALTED' | 'AWAITING_APPROVAL' | 'EXECUTED' | 'RECONCILED' | 'SEALED' | 'PENDING';
    summary: string;
    latency_ms: number;
  }>;
  reconciliation?: {
    reconciled_at: string;
    trigger_event: string;
    payment_id: string;
    order_id?: string;
    previous_status?: string;
    pending_actions_cancelled: boolean;
  };
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
  persona?: string;
  strategy?: string;
  tone?: string;
  duration_seconds: number;
  conversation: {
    language: string;
    flow: Array<{
      step: number;
      speaker: 'agent' | 'debtor';
      text: string;
      translation?: string;
      intent?: string;
      intent_meta?: {
        intent?: string;
        confidence?: number;
        reason?: string;
        action?: string;
        promised_date?: string;
      };
    }>;
    promise_to_pay: {
      amount: number;
      date: string;
      invoice: string;
      logged_at: string;
      follow_up_date: string;
      status?: string;
    };
    compliance: {
      contact_window: string;
      language: string;
      frequency: string;
      full_transcript_logged: boolean;
    };
  };
  latency_waterfall?: {
    vad_ms: number;
    stt_ms: number;
    context_cache_ms: number;
    llm_ttft_ms: number;
    tts_synthesis_ms: number;
    network_ms: number;
    total_turn_latency_ms: number;
    target_budget_ms: number;
    within_budget: boolean;
    budget_headroom_ms: number;
  };
  message: string;
}
