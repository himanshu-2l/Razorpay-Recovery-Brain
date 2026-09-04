# Graph Report - revenue-recovery-brain  (2026-09-04)

## Corpus Check
- 123 files · ~189,974 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1028 nodes · 1712 edges · 65 communities (62 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.95)
- Token cost: 15,200 input · 3,400 output

## Community Hubs (Navigation)
- Inbound Webhooks & Idempotency
- A/B Testing & Causal Methodology
- FastAPI Core API Endpoints
- Legal Admissibility & Rails Clearing
- Frontend UI Dependencies & Styling
- Autonomous Action & Envelope Control
- Vasool Autonomous Recovery Agent
- Cryptographic Merkle Audit Ledger
- Core Circuit Breaker & Resiliency
- DPDP Compliance & Consent Exporter
- Unified 4-Funnel Recovery Pipeline
- Compliance Engine & Regulatory Rules
- React & TypeScript Client Configuration
- CATE Uplift Intervention Router
- Data Generation & State Initialization
- DPDP Governance Engine & Data Minimization
- Smart Scheduler & Payday Window Engine
- Dashboard Shell & Navigation
- TypeScript Node Runtime Configuration
- Hinglish Voice Recovery & NLP Intent
- Bank Issuer Health & Gateway Resiliency
- Autonomous Spend Governor & Kill Switch
- A/B Testing Results Visualizer
- LLM Diagnostics & Speech Generation
- Recovery Brain Architecture Test Suite
- Autonomy Envelope & Hysteresis Controller
- Cross-Leak Customer Risk Profiling
- Root-Cause Diagnosis Engine
- Compliance Shield & Trust Banners
- Database Schema & Entity Models
- Architecture Flow & Forensic Modal
- Idempotency Mutex & SQLite WAL
- Razorpay Test Mode Client Wrapper
- Hero Showcase & Impact Metrics
- Webhook Deduplication & Temporal TTL
- Staleness Monitor & SLA Observability
- Section 43B(h) MSME Tax Clock
- Rule-Based Classifier & Diagnostics
- Razorpay Service Rate Limiting Facade
- Async Database Engine & Connection Pooling
- Alembic Database Migrations
- Sliding Window Rate Limit Tracker
- Oxlint Linter Configuration
- Central Configuration & Environment
- Vasool A/B Experiment Controller
- Interactive Webhook Simulator Playground
- Vercel Deployment Settings
- 4-Stage Execution Lifecycle Planner
- Cross-Leak Unification Showcase
- Real-time Server-Sent Events (SSE)
- DPDP Right to Erasure Endpoint
- Root TypeScript Configuration
- GPU Server Provisioning Script
- Cashier Payment Dispatch & Merkle Ledger

## God Nodes (most connected - your core abstractions)
1. `RecoveryPipeline` - 31 edges
2. `RootCause` - 30 edges
3. `LeakType` - 28 edges
4. `InterventionRouter` - 26 edges
5. `InterventionType` - 23 edges
6. `react` - 23 edges
7. `DiagnosisEngine` - 20 edges
8. `ComplianceEngine` - 19 edges
9. `compilerOptions` - 18 edges
10. `ABTestEngine` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Sleeping Dogs Quadrant Penalty & Churn Defense` --rationale_for--> `InterventionRouter`  [EXTRACTED]
  docs/DECISIONS.md → backend/app/services/intervention_router.py
- `ORF Study on UPI Outages & Resilient Systems` --rationale_for--> `BankCircuitBreaker`  [EXTRACTED]
  docs/DECISIONS.md → backend/app/services/circuit_breaker.py
- `The Police Chief: Policy Engine, Curfew & Autonomy Envelope` --implements--> `BankCircuitBreaker`  [EXTRACTED]
  docs/PITCH_STRATEGY_MASTER_PLAN.md → backend/app/services/circuit_breaker.py
- `DPDP Act 2023 Cryptographic Anonymization & Erasure` --implements--> `DPDPGovernanceEngine`  [EXTRACTED]
  docs/COMPLIANCE.md → backend/app/services/dpdp_governance.py
- `RBI Fair Practices Code & Curfew Windows (07:00-19:00 IST)` --rationale_for--> `InterventionRouter`  [EXTRACTED]
  docs/COMPLIANCE.md → backend/app/services/intervention_router.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trust Boundary Architecture (Bouncer, Investigator, Police Chief, Cashier)** — docs_pitch_strategy_master_plan_the_bouncer, docs_pitch_strategy_master_plan_the_investigator, docs_pitch_strategy_master_plan_the_police_chief, docs_pitch_strategy_master_plan_the_cashier [EXTRACTED 1.00]
- **Causal Treatment Effect Optimization Triad** — docs_decisions_abe_kdd_2010, docs_decisions_cate_uplift_modeling, docs_decisions_sleeping_dogs_defense [EXTRACTED 1.00]
- **India Sovereign Payment Rails & Mandates Grounding** — docs_decisions_upi_autopay_revocations, docs_decisions_orf_upi_outages, docs_decisions_fair_distribution_upi, docs_compliance_section_43bh_msme [EXTRACTED 1.00]

## Communities (65 total, 3 thin omitted)

### Community 0 - "Inbound Webhooks & Idempotency"
Cohesion: 0.05
Nodes (35): handle_razorpay_webhook(), post, Request, Webhook Ingestion Engine — Razorpay Idempotency & Rate Limit Headers…, Inbound Razorpay webhook endpoint. Handles temporal retries safely: - Same…, Cryptographic Audit Ledger — Tamper-Resistant Decision Proof…, HinglishTimeParser, Any (+27 more)

### Community 1 - "A/B Testing & Causal Methodology"
Cohesion: 0.05
Nodes (46): ABTestEngine, ExperimentConfig, ExperimentOutcome, _minimum_sample_size(), _normal_ppf_95(), Any, A/B Test Engine — Statistical Significance & Causal Methodology Validation…, Approximation of the standard normal CDF Φ(x). Accuracy: max error ~7.5e-8 for… (+38 more)

### Community 2 - "FastAPI Core API Endpoints"
Cohesion: 0.06
Nodes (50): export_audit_ledger(), export_dpdp_customer_data(), get_ab_variant(), get_autonomy_envelope(), get_batch_summary(), get_candidate_windows(), get_case(), get_case_stages() (+42 more)

### Community 3 - "Legal Admissibility & Rails Clearing"
Cohesion: 0.07
Nodes (35): AdmissibilityClass, EvidenceEnvelope, EvidenceItem, is_admissible(), join(), meet(), ObligationObject, Any (+27 more)

### Community 4 - "Frontend UI Dependencies & Styling"
Cohesion: 0.04
Nodes (45): autoprefixer, clsx, framer-motion, dependencies, clsx, framer-motion, lucide-react, react (+37 more)

### Community 5 - "Autonomous Action & Envelope Control"
Cohesion: 0.06
Nodes (44): approve_case_action(), contract_autonomy_envelope(), create_recovery_payment_link(), demo_compliance_block(), erase_customer_data(), expand_autonomy_envelope(), generate_and_process_batch(), llm_analyze_dispute() (+36 more)

### Community 6 - "Vasool Autonomous Recovery Agent"
Cohesion: 0.09
Nodes (26): Any, Vasool Recovery Agent — DPDP Consent & Compliance Gate…, Autonomous collection agent enforcing: 1. DPDP Act 2023 Consent verification…, Gating check before initiating outreach. Returns: - allowed: bool - action:…, VasoolRecoveryAgent, _build_twiml(), _is_twilio_configured(), Any (+18 more)

### Community 7 - "Cryptographic Merkle Audit Ledger"
Cohesion: 0.10
Nodes (18): AuditRecord, CryptographicAuditLedger, Any, Create the audit_records table if it doesn't already exist., Persist one AuditRecord to SQLite. Must be called while _mutex is held., Load persisted audit history from SQLite into in-memory state. Call this on…, Append a new tamper-evident record to the cryptographic ledger. Writes to both…, Walk the internal hash chain from block 1 to head. Returns: (is_valid: bool,… (+10 more)

### Community 8 - "Core Circuit Breaker & Resiliency"
Cohesion: 0.09
Nodes (22): CircuitBreaker, CircuitState, Any, Enum, str, API Circuit Breaker — External Service Resilience…, Execute function within circuit breaker protection. If OPEN and fallback…, Telemetry on circuit state, failure counts, and cooldown. (+14 more)

### Community 9 - "DPDP Compliance & Consent Exporter"
Cohesion: 0.09
Nodes (19): DPDPAuditExporter, DPDPConsentManager, DPDPDataRetention, Any, Digital Personal Data Protection (DPDP) Act 2023 Core Compliance Engine…, Revoke customer consent across all or specific channels., Statutory retention scheduler: - Voice recordings: 90 days TTL - Call…, Schedule automated purging of sensitive data upon retention expiration. (+11 more)

### Community 10 - "Unified 4-Funnel Recovery Pipeline"
Cohesion: 0.17
Nodes (15): Demonstration of 4-Funnel Unification: The same customer's position across all…, unified_recovery_scenario(), Any, datetime, Core pipeline: diagnose → route → compliance → simulate execution., End-to-end recovery pipeline that processes a batch of revenue-at-risk cases.…, Gap-Payment Defense (Benchmark: HappyGarg8o/ai-revenue-recovery): Double-check…, Simulate execution outcome based on intervention type and root cause. Returns… (+7 more)

### Community 11 - "Compliance Engine & Regulatory Rules"
Cohesion: 0.16
Nodes (17): ComplianceAction, InterventionType, str, ComplianceEngine, Any, datetime, Compliance + Audit Layer — Every action passes through this gate. Implements a…, Count contacts made today (IST). (+9 more)

### Community 12 - "React & TypeScript Client Configuration"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 13 - "CATE Uplift Intervention Router"
Cohesion: 0.17
Nodes (18): LeakType, RootCause, InterventionRouter, Any, Intervention Router — Optimal Decision Engine for Recovery Interventions.…, Route a diagnosed case to the single best intervention. Computes Expected Net…, Maps diagnosis results to the single best intervention. Cross-references…, Generate human-readable reason for the chosen intervention. (+10 more)

### Community 14 - "Data Generation & State Initialization"
Cohesion: 0.17
Nodes (20): Reload audit ledger from SQLite so history survives process restarts and auto-…, reload_ledger_on_startup(), generate_b2b_invoices(), generate_checkout_abandonments(), generate_customers(), generate_email(), generate_full_batch(), generate_payment_failures() (+12 more)

### Community 15 - "DPDP Governance Engine & Data Minimization"
Cohesion: 0.13
Nodes (11): DPDPGovernanceEngine, Any, Digital Personal Data Protection (DPDP) Act 2023 Compliance & Privacy…, Evaluate whether an asset has exceeded statutory DPDP retention TTL., DPDP Act 2023 Governance Engine enforcing data minimization, retention, and…, Mask middle 5 digits of Indian mobile number (+91 98765*****)., Mask email address (a***@example.com)., Mask bank account / card number (**** 1234). (+3 more)

### Community 16 - "Smart Scheduler & Payday Window Engine"
Cohesion: 0.18
Nodes (17): CandidateType, days_until_payday(), get_next_month_end_window(), get_next_payday_window(), get_next_personalized_window(), Any, datetime, Enum (+9 more)

### Community 17 - "Dashboard Shell & Navigation"
Cohesion: 0.14
Nodes (13): App(), ConsoleTab, Navbar(), NavbarProps, ViewMode, ComplianceTrustSeal(), ComplianceTrustSealProps, ShowcaseHero() (+5 more)

### Community 18 - "TypeScript Node Runtime Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "Hinglish Voice Recovery & NLP Intent"
Cohesion: 0.23
Nodes (15): classify_voice_turn(), demo_voice_call(), Classify a debtor utterance in real-time into structured tools & intents., Trigger a Hinglish voice recovery call. Accepts persona: first_time_miss /…, Any, Enum, str, Voice Intent Classifier & Telephony Strategy Engine. Implements structured… (+7 more)

### Community 20 - "Bank Issuer Health & Gateway Resiliency"
Cohesion: 0.12
Nodes (10): BankCircuitBreaker, IssuerHealth, Any, Bank Gateway & Issuer Circuit Breaker =====================================…, Check if an issuer rail is healthy for retries., Simulate an outage event for testing and demonstrations., Get status of all monitored bank rails., Record transaction outcome and update rolling circuit status. (+2 more)

### Community 21 - "Autonomous Spend Governor & Kill Switch"
Cohesion: 0.15
Nodes (7): Any, Spend Governor & Autonomous Action Circuit Breaker…, Record actual spend for an executed autonomous intervention., Instantly halt all autonomous actions across the platform., Resume autonomous actions after incident resolution., Check whether an automated intervention can proceed or if it violates spend…, SpendGovernor

### Community 22 - "A/B Testing Results Visualizer"
Cohesion: 0.12
Nodes (11): API_BASE, ABExperimentResult, ABTestResponse, ABTestResults(), StratificationBalance, EVENT_ICONS, INTERVENTION_COLORS, LiveEvent (+3 more)

### Community 23 - "LLM Diagnostics & Speech Generation"
Cohesion: 0.18
Nodes (16): AsyncClient, analyze_dispute_text(), _format_amount_in_words(), generate_hinglish_call(), _get_client(), get_server_info(), is_server_available(), Any (+8 more)

### Community 24 - "Recovery Brain Architecture Test Suite"
Cohesion: 0.12
Nodes (3): test_26_personalized_retry_scheduling(), test_27_cross_leak_customer_profile_unification(), test_8_human_in_the_loop_approval_gate()

### Community 25 - "Autonomy Envelope & Hysteresis Controller"
Cohesion: 0.12
Nodes (7): AutonomyEnvelope, Any, Dynamic Autonomy Envelope Engine ================================ Defines…, Get the live status of the autonomy envelope., Check if an action is within the current active autonomy envelope. Returns:…, Immediately contract autonomy envelope to protect capital., Record a stable cycle; expands back after 5 consecutive stable cycles.

### Community 26 - "Cross-Leak Customer Risk Profiling"
Cohesion: 0.16
Nodes (8): CustomerRiskProfile, CustomerRiskProfileStore, Any, Cross-Leak Customer Risk Profile Store ======================================…, Update cross-leak profile based on incoming failure/abandonment/invoice event., Clear store for tests., Recompute composite cross-leak risk and human-readable explanation., Thread-safe in-memory store for cross-leak customer intelligence.

### Community 27 - "Root-Cause Diagnosis Engine"
Cohesion: 0.21
Nodes (9): DiagnosisEngine, Any, Diagnose why a checkout was abandoned., Diagnose why a subscription payment failed., Diagnose why a B2B invoice is overdue., Root-cause classifier that maps symptoms to actionable diagnoses. Processes…, Synchronous main diagnosis entry point. Routes to the appropriate classifier.…, Async diagnosis that enhances low-confidence rule results with LLM reasoning.… (+1 more)

### Community 28 - "Compliance Shield & Trust Banners"
Cohesion: 0.18
Nodes (11): ComplianceShield(), ComplianceShieldProps, ProofRibbon(), ProofRibbonProps, StatsGrid(), StatsGridProps, PERSONAS, VoiceStudio() (+3 more)

### Community 29 - "Database Schema & Entity Models"
Cohesion: 0.25
Nodes (11): AuditLog, Case, CaseStatus, Customer, get_session_factory(), init_db(), Invoice, Database models for Revenue Recovery Brain. Five core entities: - Customer: the… (+3 more)

### Community 30 - "Architecture Flow & Forensic Modal"
Cohesion: 0.21
Nodes (11): ArchitectureFlow(), ArchitectureFlowProps, PipelineNode, toTitleCase(), CaseDetailModal(), CaseDetailModalProps, toTitleCase(), CaseTable() (+3 more)

### Community 31 - "Idempotency Mutex & SQLite WAL"
Cohesion: 0.18
Nodes (7): IdempotencyMutex, Any, Stateful Idempotency Mutex — Atomic Guardrail…, Get telemetry on processed idempotency keys., Atomically tries to acquire execution lock for an event key. Returns:…, Mark an idempotency key as successfully executed., Idempotency Guard — Compatibility Facade…

### Community 32 - "Razorpay Test Mode Client Wrapper"
Cohesion: 0.21
Nodes (7): Any, Alias for create_recovery_payment_link supporting both naming styles., Production-ready wrapper for Razorpay Test Mode API. Provides verified HMAC…, Cryptographic verification of Razorpay HMAC-SHA256 signature on raw webhook…, Cancel an existing payment link on Razorpay test API., Create a personalized Razorpay Payment Link for invoice recovery or cart…, RazorpayClientWrapper

### Community 33 - "Hero Showcase & Impact Metrics"
Cohesion: 0.18
Nodes (7): HeroBannerProps, PREBUILT_AGENTS, COMPARISON, ImpactCounter(), useCountUp(), StickyAgentShowcaseProps, react

### Community 34 - "Webhook Deduplication & Temporal TTL"
Cohesion: 0.22
Nodes (4): Handles Razorpay webhook delivery retries and temporal duplicates.…, Returns True if this exact (event_id + event_timestamp) was processed before…, Stores event with a 7-day TTL and purges any expired historical webhook entries., WebhookIdempotencyStore

### Community 35 - "Staleness Monitor & SLA Observability"
Cohesion: 0.24
Nodes (7): Any, datetime, Staleness Monitor & Deadlock Observability Engine…, Monitors in-flight recovery cases for silent timeouts and pending human…, Check whether a single case has exceeded its operational SLA., Scan a list of recovery cases, flag stale cases, and record audit escalations., StalenessMonitor

### Community 36 - "Section 43B(h) MSME Tax Clock"
Cohesion: 0.20
Nodes (8): Any, Section 43B(h) MSME Tax Clock Engine ====================================…, Evaluates Section 43B(h) compliance exposure and generates B2B leverage…, Evaluate Section 43B(h) tax status for an invoice., TaxClockEngine, TaxClockStatus, Section 43B(h) MSMED Act 2006 Tax Clock Leverage, B2B Cash Collection Prediction via Machine Learning (arXiv:1912.10828)

### Community 37 - "Rule-Based Classifier & Diagnostics"
Cohesion: 0.29
Nodes (8): Root-Cause Diagnosis Engine — The Brain. Two-tier classification: 1. Rule-…, Any, Revenue Recovery Brain — Comprehensive Verification & Reporting Suite Compliant…, run_classifier_heldout_evaluation(), write_batch_results_report(), write_classifier_report(), write_guardrail_report(), write_voice_latency_report()

### Community 38 - "Razorpay Service Rate Limiting Facade"
Cohesion: 0.22
Nodes (5): Any, Resilient facade over RazorpayClientWrapper. Enforces upstream rate limit…, Returns live telemetry on remaining Razorpay calls per minute., Creates a payment link protected by rate limiter and circuit breaker. If rate…, RazorpayService

### Community 39 - "Async Database Engine & Connection Pooling"
Cohesion: 0.22
Nodes (8): AsyncSession, create_engine_for_url(), get_db(), init_db(), Enterprise Database Engine — Async PostgreSQL & SQLite Mutex…, Construct async engine. If PostgreSQL, applies high-throughput connection pool…, FastAPI dependency for yielding transactional async sessions., Create all relational tables asynchronously.

### Community 40 - "Alembic Database Migrations"
Cohesion: 0.28
Nodes (8): do_run_migrations(), Run migrations in 'offline' mode., In this scenario we need to create an Engine and associate a connection with…, Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online(), Connection

### Community 41 - "Sliding Window Rate Limit Tracker"
Cohesion: 0.31
Nodes (5): RateLimitTracker, Sliding window rate limit defense for external APIs: - Razorpay: 100 requests /…, Returns True if within rate limit, False if threshold exceeded., Records an API call. Returns True if accepted, False if rate limited., Telemetry on API rate limit headroom and reset countdown.

### Community 42 - "Oxlint Linter Configuration"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 43 - "Central Configuration & Environment"
Cohesion: 0.25
Nodes (4): Application Configuration Facade (app.config)…, Central Application Configuration Module…, Razorpay Client — API v1 Integration Wrapper…, Razorpay Service — Rate Limit Defense & Circuit Breaker Wrapper…

### Community 44 - "Vasool A/B Experiment Controller"
Cohesion: 0.25
Nodes (8): initialize_vasool_experiment(), Register the primary Vasool vs. Baseline A/B experiment. Called at application…, get_ab_test_results(), METHODOLOGY VALIDATION — SYNTHETIC SCENARIO ONLY. This function seeds the A/B…, Returns METHODOLOGY VALIDATION results — a synthetic scenario demonstrating the…, Re-seeds the methodology validation scenario from the current batch. This…, reseed_ab_experiment(), _seed_methodology_validation_scenario()

### Community 45 - "Interactive Webhook Simulator Playground"
Cohesion: 0.25
Nodes (7): COMPLIANCE_COLORS, LEAK_TYPE_LABELS, ScenarioPreset, SCENARIOS, WebhookEvent, WebhookPlayground(), WebhookResponse

### Community 46 - "Vercel Deployment Settings"
Cohesion: 0.29
Nodes (6): buildCommand, env, VITE_API_BASE_URL, framework, installCommand, outputDirectory

### Community 47 - "4-Stage Execution Lifecycle Planner"
Cohesion: 0.33
Nodes (4): Any, Multi-Stage Recovery Execution Planner ======================================…, Generate the 4-stage execution lifecycle for a case., StagePlanner

### Community 48 - "Cross-Leak Unification Showcase"
Cohesion: 0.50
Nodes (4): CrossLeakShowcase(), LeakCase, toTitleCase(), UnifiedScenarioResponse

### Community 49 - "Real-time Server-Sent Events (SSE)"
Cohesion: 0.50
Nodes (4): _broadcast_event(), Receive Razorpay webhooks (payment.failed, subscription.halted,…, Push an event to all connected SSE clients., razorpay_webhook()

### Community 51 - "DPDP Right to Erasure Endpoint"
Cohesion: 0.67
Nodes (3): delete_dpdp_customer_data(), Section 12 DPDP Act 2023: Statutory Right to Erasure., delete

## Knowledge Gaps
- **107 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `InterventionRouter` connect `CATE Uplift Intervention Router` to `A/B Testing & Causal Methodology`, `Rule-Based Classifier & Diagnostics`, `Unified 4-Funnel Recovery Pipeline`, `Compliance Engine & Regulatory Rules`, `Smart Scheduler & Payday Window Engine`, `Recovery Brain Architecture Test Suite`, `Root-Cause Diagnosis Engine`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `CryptographicAuditLedger` connect `Cryptographic Merkle Audit Ledger` to `Inbound Webhooks & Idempotency`, `Recovery Brain Architecture Test Suite`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `CircuitBreaker` connect `Core Circuit Breaker & Resiliency` to `Recovery Brain Architecture Test Suite`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `RecoveryPipeline` (e.g. with `generate_and_process_batch()` and `reload_ledger_on_startup()`) actually correct?**
  _`RecoveryPipeline` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `RootCause` (e.g. with `DiagnosisEngine` and `InterventionRouter`) actually correct?**
  _`RootCause` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `LeakType` (e.g. with `llm_enhanced_diagnosis()` and `unified_recovery_scenario()`) actually correct?**
  _`LeakType` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `InterventionRouter` (e.g. with `InterventionType` and `LeakType`) actually correct?**
  _`InterventionRouter` has 4 INFERRED edges - model-reasoned connections that need verification._