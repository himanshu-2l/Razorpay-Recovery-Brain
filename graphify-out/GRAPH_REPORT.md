# Graph Report - revenue-recovery-brain  (2026-09-04)

## Corpus Check
- 109 files · ~195,108 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1172 nodes · 1899 edges · 81 communities (77 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5723db3d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_competitive_enhancements.py
- ABTestEngine
- main.py
- test_rails_clearing.py
- devDependencies
- post
- .pre_call_check
- CryptographicAuditLedger
- CircuitBreaker
- dpdp_compliance.py
- RecoveryPipeline
- recovery_pipeline.py
- compilerOptions
- RootCause
- run_verification_suite.py
- DPDPGovernanceEngine
- smart_scheduler.py
- App.tsx
- compilerOptions
- VoiceIntentClassifier
- BankCircuitBreaker
- SpendGovernor
- ABTestResults.tsx
- llm_service.py
- test_recovery_brain.py
- audit_ledger.py
- CustomerRiskProfileStore
- DiagnosisEngine
- types.ts
- models/database.py
- ArchitectureFlow.tsx
- IdempotencyMutex
- RazorpayClientWrapper
- react
- WebhookIdempotencyStore
- trigger_bolna_call
- Revenue Recovery Brain
- diagnosis_engine.py
- VoiceSafetyFilter
- app/database.py
- env.py
- RateLimitTracker
- plugins
- send_whatsapp_recovery
- reseed_ab_experiment
- WebhookPlayground.tsx
- vercel.json
- stage_planner.py
- CrossLeakShowcase.tsx
- razorpay_webhook
- delete_dpdp_customer_data
- tsconfig.json
- setup_gpu_server.sh
- The Cashier: Payment Dispatch & Merkle Hash Audit Ledger
- 🧠 Grand Unified Architecture Brief: Razorpay AI Revenue Recovery Brain
- 🎬 5-Minute Video Demo Script
- Diagnosis Classifier Held-Out Validation Report
- 2. Guardrail Evidence Details
- voice_service.py
- Working on: GPU LLM Integration, SSE Telemetry & UI/UX Pro Max Architecture
- Abe et al. Constrained RL for Debt Collections (ACM SIGKDD 2010)
- UI/UX Design System & Architectural Standard
- 📊 Razorpay AI Buildathon 2026 — Pitch Slide Outline
- idempotency_mutex.py
- Batch Results & Recovery Performance Report
- get_telephony_status
- Project: Razorpay Revenue Recovery Brain (Track 03)
- Voice Pipeline End-to-End Latency & Telephony Report
- React + TypeScript + Vite

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
- `CATE Uplift Modeling & Counterfactual ENRV Framework` --conceptually_related_to--> `ABTestEngine`  [EXTRACTED]
  docs/DECISIONS.md → backend/app/core/ab_testing.py
- `ORF Study on UPI Outages & Resilient Systems` --rationale_for--> `BankCircuitBreaker`  [EXTRACTED]
  docs/DECISIONS.md → backend/app/services/circuit_breaker.py
- `The Police Chief: Policy Engine, Curfew & Autonomy Envelope` --implements--> `BankCircuitBreaker`  [EXTRACTED]
  docs/PITCH_STRATEGY_MASTER_PLAN.md → backend/app/services/circuit_breaker.py
- `DPDP Act 2023 Cryptographic Anonymization & Erasure` --implements--> `DPDPGovernanceEngine`  [EXTRACTED]
  docs/COMPLIANCE.md → backend/app/services/dpdp_governance.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Causal Treatment Effect Optimization Triad** — docs_decisions_abe_kdd_2010, docs_decisions_cate_uplift_modeling, docs_decisions_sleeping_dogs_defense [EXTRACTED 1.00]
- **India Sovereign Payment Rails & Mandates Grounding** — docs_decisions_upi_autopay_revocations, docs_decisions_orf_upi_outages, docs_decisions_fair_distribution_upi, docs_compliance_section_43bh_msme [EXTRACTED 1.00]
- **Trust Boundary Architecture (Bouncer, Investigator, Police Chief, Cashier)** — docs_pitch_strategy_master_plan_the_bouncer, docs_pitch_strategy_master_plan_the_investigator, docs_pitch_strategy_master_plan_the_police_chief, docs_pitch_strategy_master_plan_the_cashier [EXTRACTED 1.00]

## Communities (81 total, 4 thin omitted)

### Community 0 - "test_competitive_enhancements.py"
Cohesion: 0.07
Nodes (27): HinglishTimeParser, Any, datetime, Deterministic Hinglish Time-Phrase Parser…, Convenience method returning parsed ISO string and audit metadata., Enforces RBI calling curfew invariant: 07:00 <= hour < 19:00 IST., Deterministic parser for Indian conversational payment promises., Parses a Hinglish phrase into an IST datetime. Returns (parsed_datetime_ist,… (+19 more)

### Community 1 - "ABTestEngine"
Cohesion: 0.06
Nodes (39): ABTestEngine, ExperimentConfig, ExperimentOutcome, _minimum_sample_size(), _normal_ppf_95(), Any, A/B Test Engine — Statistical Significance & Causal Methodology Validation…, Approximation of the standard normal CDF Φ(x). Accuracy: max error ~7.5e-8 for… (+31 more)

### Community 2 - "main.py"
Cohesion: 0.06
Nodes (50): export_audit_ledger(), export_dpdp_customer_data(), get_ab_variant(), get_autonomy_envelope(), get_batch_summary(), get_candidate_windows(), get_case(), get_case_stages() (+42 more)

### Community 3 - "test_rails_clearing.py"
Cohesion: 0.07
Nodes (35): AdmissibilityClass, EvidenceEnvelope, EvidenceItem, is_admissible(), join(), meet(), ObligationObject, Any (+27 more)

### Community 4 - "devDependencies"
Cohesion: 0.04
Nodes (45): autoprefixer, clsx, framer-motion, dependencies, clsx, framer-motion, lucide-react, react (+37 more)

### Community 5 - "post"
Cohesion: 0.06
Nodes (48): approve_case_action(), contract_autonomy_envelope(), create_recovery_payment_link(), demo_compliance_block(), erase_customer_data(), expand_autonomy_envelope(), generate_and_process_batch(), llm_analyze_dispute() (+40 more)

### Community 6 - ".pre_call_check"
Cohesion: 0.15
Nodes (9): Any, Vasool Recovery Agent — DPDP Consent & Compliance Gate…, Autonomous collection agent enforcing: 1. DPDP Act 2023 Consent verification…, Gating check before initiating outreach. Returns: - allowed: bool - action:…, VasoolRecoveryAgent, Any, datetime, Voice Safety Filter & Regulatory Guardrail… (+1 more)

### Community 7 - "CryptographicAuditLedger"
Cohesion: 0.10
Nodes (18): AuditRecord, CryptographicAuditLedger, Any, Create the audit_records table if it doesn't already exist., Persist one AuditRecord to SQLite. Must be called while _mutex is held., Load persisted audit history from SQLite into in-memory state. Call this on…, Append a new tamper-evident record to the cryptographic ledger. Writes to both…, Walk the internal hash chain from block 1 to head. Returns: (is_valid: bool,… (+10 more)

### Community 8 - "CircuitBreaker"
Cohesion: 0.06
Nodes (28): CircuitBreaker, CircuitState, Any, Enum, str, API Circuit Breaker — External Service Resilience…, Execute function within circuit breaker protection. If OPEN and fallback…, Telemetry on circuit state, failure counts, and cooldown. (+20 more)

### Community 9 - "dpdp_compliance.py"
Cohesion: 0.09
Nodes (19): DPDPAuditExporter, DPDPConsentManager, DPDPDataRetention, Any, Digital Personal Data Protection (DPDP) Act 2023 Core Compliance Engine…, Revoke customer consent across all or specific channels., Statutory retention scheduler: - Voice recordings: 90 days TTL - Call…, Schedule automated purging of sensitive data upon retention expiration. (+11 more)

### Community 10 - "RecoveryPipeline"
Cohesion: 0.10
Nodes (23): Demonstration of 4-Funnel Unification: The same customer's position across all…, unified_recovery_scenario(), Any, datetime, Core pipeline: diagnose → route → compliance → simulate execution., End-to-end recovery pipeline that processes a batch of revenue-at-risk cases.…, Gap-Payment Defense (Benchmark: HappyGarg8o/ai-revenue-recovery): Double-check…, Simulate execution outcome based on intervention type and root cause. Returns… (+15 more)

### Community 11 - "recovery_pipeline.py"
Cohesion: 0.16
Nodes (17): ComplianceAction, InterventionType, str, ComplianceEngine, Any, datetime, Compliance + Audit Layer — Every action passes through this gate. Implements a…, Count contacts made today (IST). (+9 more)

### Community 12 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 13 - "RootCause"
Cohesion: 0.17
Nodes (19): LeakType, RootCause, InterventionRouter, Any, Intervention Router — Optimal Decision Engine for Recovery Interventions.…, Route a diagnosed case to the single best intervention. Computes Expected Net…, Maps diagnosis results to the single best intervention. Cross-references…, Generate human-readable reason for the chosen intervention. (+11 more)

### Community 14 - "run_verification_suite.py"
Cohesion: 0.14
Nodes (26): Reload audit ledger from SQLite so history survives process restarts and auto-…, reload_ledger_on_startup(), generate_b2b_invoices(), generate_checkout_abandonments(), generate_customers(), generate_email(), generate_full_batch(), generate_payment_failures() (+18 more)

### Community 15 - "DPDPGovernanceEngine"
Cohesion: 0.13
Nodes (11): DPDPGovernanceEngine, Any, Digital Personal Data Protection (DPDP) Act 2023 Compliance & Privacy…, Evaluate whether an asset has exceeded statutory DPDP retention TTL., DPDP Act 2023 Governance Engine enforcing data minimization, retention, and…, Mask middle 5 digits of Indian mobile number (+91 98765*****)., Mask email address (a***@example.com)., Mask bank account / card number (**** 1234). (+3 more)

### Community 16 - "smart_scheduler.py"
Cohesion: 0.18
Nodes (17): CandidateType, days_until_payday(), get_next_month_end_window(), get_next_payday_window(), get_next_personalized_window(), Any, datetime, Enum (+9 more)

### Community 17 - "App.tsx"
Cohesion: 0.14
Nodes (13): App(), ConsoleTab, Navbar(), NavbarProps, ViewMode, ComplianceTrustSeal(), ComplianceTrustSealProps, ShowcaseHero() (+5 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "VoiceIntentClassifier"
Cohesion: 0.23
Nodes (15): classify_voice_turn(), demo_voice_call(), Classify a debtor utterance in real-time into structured tools & intents., Offline Hinglish Dialogue Simulator (LLM-generated or heuristic script, not…, Any, Enum, str, Voice Intent Classifier & Telephony Strategy Engine. Implements structured… (+7 more)

### Community 20 - "BankCircuitBreaker"
Cohesion: 0.12
Nodes (10): BankCircuitBreaker, IssuerHealth, Any, Bank Gateway & Issuer Circuit Breaker =====================================…, Check if an issuer rail is healthy for retries., Simulate an outage event for testing and demonstrations., Get status of all monitored bank rails., Record transaction outcome and update rolling circuit status. (+2 more)

### Community 21 - "SpendGovernor"
Cohesion: 0.15
Nodes (7): Any, Spend Governor & Autonomous Action Circuit Breaker…, Record actual spend for an executed autonomous intervention., Instantly halt all autonomous actions across the platform., Resume autonomous actions after incident resolution., Check whether an automated intervention can proceed or if it violates spend…, SpendGovernor

### Community 22 - "ABTestResults.tsx"
Cohesion: 0.12
Nodes (11): API_BASE, ABExperimentResult, ABTestResponse, ABTestResults(), StratificationBalance, EVENT_ICONS, INTERVENTION_COLORS, LiveEvent (+3 more)

### Community 23 - "llm_service.py"
Cohesion: 0.18
Nodes (16): AsyncClient, analyze_dispute_text(), _format_amount_in_words(), generate_hinglish_call(), _get_client(), get_server_info(), is_server_available(), Any (+8 more)

### Community 24 - "test_recovery_brain.py"
Cohesion: 0.12
Nodes (3): test_26_personalized_retry_scheduling(), test_27_cross_leak_customer_profile_unification(), test_8_human_in_the_loop_approval_gate()

### Community 25 - "audit_ledger.py"
Cohesion: 0.05
Nodes (24): handle_razorpay_webhook(), post, Request, Webhook Ingestion Engine — Razorpay Idempotency & Rate Limit Headers…, Inbound Razorpay webhook endpoint. Handles temporal retries safely: - Same…, Cryptographic Audit Ledger — Tamper-Resistant Decision Proof…, AutonomyEnvelope, Any (+16 more)

### Community 26 - "CustomerRiskProfileStore"
Cohesion: 0.16
Nodes (8): CustomerRiskProfile, CustomerRiskProfileStore, Any, Cross-Leak Customer Risk Profile Store ======================================…, Update cross-leak profile based on incoming failure/abandonment/invoice event., Clear store for tests., Recompute composite cross-leak risk and human-readable explanation., Thread-safe in-memory store for cross-leak customer intelligence.

### Community 27 - "DiagnosisEngine"
Cohesion: 0.21
Nodes (9): DiagnosisEngine, Any, Diagnose why a checkout was abandoned., Diagnose why a subscription payment failed., Diagnose why a B2B invoice is overdue., Root-cause classifier that maps symptoms to actionable diagnoses. Processes…, Synchronous main diagnosis entry point. Routes to the appropriate classifier.…, Async diagnosis that enhances low-confidence rule results with LLM reasoning.… (+1 more)

### Community 28 - "types.ts"
Cohesion: 0.18
Nodes (11): ComplianceShield(), ComplianceShieldProps, ProofRibbon(), ProofRibbonProps, StatsGrid(), StatsGridProps, PERSONAS, VoiceStudio() (+3 more)

### Community 29 - "models/database.py"
Cohesion: 0.25
Nodes (11): AuditLog, Case, CaseStatus, Customer, get_session_factory(), init_db(), Invoice, Database models for Revenue Recovery Brain. Five core entities: - Customer: the… (+3 more)

### Community 30 - "ArchitectureFlow.tsx"
Cohesion: 0.21
Nodes (11): ArchitectureFlow(), ArchitectureFlowProps, PipelineNode, toTitleCase(), CaseDetailModal(), CaseDetailModalProps, toTitleCase(), CaseTable() (+3 more)

### Community 31 - "IdempotencyMutex"
Cohesion: 0.25
Nodes (5): IdempotencyMutex, Any, Get telemetry on processed idempotency keys., Atomically tries to acquire execution lock for an event key. Returns:…, Mark an idempotency key as successfully executed.

### Community 32 - "RazorpayClientWrapper"
Cohesion: 0.18
Nodes (8): Any, Razorpay Client — API v1 Integration Wrapper…, Alias for create_recovery_payment_link supporting both naming styles., Production-ready wrapper for Razorpay Test Mode API. Provides verified HMAC…, Cryptographic verification of Razorpay HMAC-SHA256 signature on raw webhook…, Cancel an existing payment link on Razorpay test API., Create a personalized Razorpay Payment Link for invoice recovery or cart…, RazorpayClientWrapper

### Community 33 - "react"
Cohesion: 0.18
Nodes (7): HeroBannerProps, PREBUILT_AGENTS, COMPARISON, ImpactCounter(), useCountUp(), StickyAgentShowcaseProps, react

### Community 34 - "WebhookIdempotencyStore"
Cohesion: 0.22
Nodes (4): Handles Razorpay webhook delivery retries and temporal duplicates.…, Returns True if this exact (event_id + event_timestamp) was processed before…, Stores event with a 7-day TTL and purges any expired historical webhook entries., WebhookIdempotencyStore

### Community 35 - "trigger_bolna_call"
Cohesion: 0.21
Nodes (16): _get_auth_headers(), get_bolna_account_info(), is_bolna_configured(), list_bolna_agents(), _normalize_phone_number(), Any, Bolna AI Conversational Telephony Service…, Trigger an outbound Hinglish recovery call via Bolna AI with VoiceSafetyFilter… (+8 more)

### Community 36 - "Revenue Recovery Brain"
Cohesion: 0.12
Nodes (16): Architecture: How It Works, Bug 1: Classifier Answer Leakage (Caught, Fixed), Bug 2: Razorpay Integration Was Mocked (Caught, Fixed), Bug 3: Reconciler Ambiguous Amount-Match (Caught, Fixed), Failure Recovery — What Broke and What We Fixed, How to Run (Judges), One-Line Pitch, Production vs. Demo Architecture (+8 more)

### Community 38 - "VoiceSafetyFilter"
Cohesion: 0.21
Nodes (13): _build_twiml(), _get_twilio_client(), Any, Twilio Outbound Call Service ============================ Makes real outbound…, Initiate a real outbound Twilio call with full VoiceSafetyFilter compliance…, Initialize Twilio Client using either: 1) API Key SID (SK...) + API Key Secret…, Build TwiML response for the Hinglish recovery call. Uses Polly.Aditi (Amazon…, trigger_real_call() (+5 more)

### Community 39 - "app/database.py"
Cohesion: 0.22
Nodes (8): AsyncSession, create_engine_for_url(), get_db(), init_db(), Enterprise Database Engine — Async PostgreSQL & SQLite Mutex…, Construct async engine. If PostgreSQL, applies high-throughput connection pool…, FastAPI dependency for yielding transactional async sessions., Create all relational tables asynchronously.

### Community 40 - "env.py"
Cohesion: 0.28
Nodes (8): do_run_migrations(), Run migrations in 'offline' mode., In this scenario we need to create an Engine and associate a connection with…, Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online(), Connection

### Community 41 - "RateLimitTracker"
Cohesion: 0.31
Nodes (5): RateLimitTracker, Sliding window rate limit defense for external APIs: - Razorpay: 100 requests /…, Returns True if within rate limit, False if threshold exceeded., Records an API call. Returns True if accepted, False if rate limited., Telemetry on API rate limit headroom and reset countdown.

### Community 42 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 43 - "send_whatsapp_recovery"
Cohesion: 0.19
Nodes (11): Central Application Configuration Module…, build_whatsapp_message(), _get_twilio_client(), Any, WhatsApp Outreach Service ========================= Dispatches WhatsApp…, Get authenticated Twilio Client., Format a compliant, respectful Hinglish recovery message with payment link.…, Dispatch a recovery WhatsApp message with Razorpay payment link. Returns status… (+3 more)

### Community 44 - "reseed_ab_experiment"
Cohesion: 0.25
Nodes (8): initialize_vasool_experiment(), Register the primary Vasool vs. Baseline A/B experiment. Called at application…, get_ab_test_results(), METHODOLOGY VALIDATION — SYNTHETIC SCENARIO ONLY. This function seeds the A/B…, Returns METHODOLOGY VALIDATION results — a synthetic scenario demonstrating the…, Re-seeds the methodology validation scenario from the current batch. This…, reseed_ab_experiment(), _seed_methodology_validation_scenario()

### Community 45 - "WebhookPlayground.tsx"
Cohesion: 0.25
Nodes (7): COMPLIANCE_COLORS, LEAK_TYPE_LABELS, ScenarioPreset, SCENARIOS, WebhookEvent, WebhookPlayground(), WebhookResponse

### Community 46 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, env, VITE_API_BASE_URL, framework, installCommand, outputDirectory

### Community 47 - "stage_planner.py"
Cohesion: 0.33
Nodes (4): Any, Multi-Stage Recovery Execution Planner ======================================…, Generate the 4-stage execution lifecycle for a case., StagePlanner

### Community 48 - "CrossLeakShowcase.tsx"
Cohesion: 0.50
Nodes (4): CrossLeakShowcase(), LeakCase, toTitleCase(), UnifiedScenarioResponse

### Community 49 - "razorpay_webhook"
Cohesion: 0.50
Nodes (4): _broadcast_event(), Receive Razorpay webhooks (payment.failed, subscription.halted,…, Push an event to all connected SSE clients., razorpay_webhook()

### Community 51 - "delete_dpdp_customer_data"
Cohesion: 0.67
Nodes (3): delete_dpdp_customer_data(), Section 12 DPDP Act 2023: Statutory Right to Erasure., delete

### Community 65 - "🧠 Grand Unified Architecture Brief: Razorpay AI Revenue Recovery Brain"
Cohesion: 0.12
Nodes (15): 1. Executive Summary & Problem Thesis, 24 Architectural Verification Tests (`test_recovery_brain.py`):, 2. System Architecture & Component Topology, 3. Key Mathematical & Algorithmic Modules, 4. Current Test Suite & Verification Status, 5. Technology Stack, 6. Questions & Review Points for Claude, 8 Statistical A/B Testing Verification Tests (`test_ab_testing.py`): (+7 more)

### Community 66 - "🎬 5-Minute Video Demo Script"
Cohesion: 0.14
Nodes (13): [0:00 – 0:25] The Problem — No Slides, Just Real Numbers, [0:25 – 1:10] Real Razorpay Integration — Split Screen, Unfakeable, [1:10 – 2:30] The Climax — A Real Phone Rings, [2:30 – 3:15] Compliance Gate — Show It Refusing to Act, [3:15 – 3:55] Cross-Leak Unified Intelligence, [3:55 – 4:25] Honest Batch Metrics, [4:25 – 4:50] Grounded Core & Verifiable Proof, 🎬 5-Minute Video Demo Script (+5 more)

### Community 67 - "Diagnosis Classifier Held-Out Validation Report"
Cohesion: 0.25
Nodes (7): 1. Overall Classifier Summary, 2. Per-Class Precision, Recall, and F1, 3. Confusion Matrix (Held-Out Test Set), 4. Known Limitations & Misclassification Analysis, Diagnosis Classifier Held-Out Validation Report, Real-World Telemetry Limitations & Fallback Strategy, Zero Misclassifications on Current Deterministic Rule Patterns

### Community 68 - "2. Guardrail Evidence Details"
Cohesion: 0.25
Nodes (7): 1. Adversarial Test Results Matrix, 2. Guardrail Evidence Details, a. Webhook Concurrency Race Test, Adversarial Guardrail Verification Report, b. Economic Floor Guardrail, c. Time Window Contact Guardrail, d. High-Stakes Human-in-the-Loop Threshold

### Community 69 - "voice_service.py"
Cohesion: 0.29
Nodes (5): Any, Voice Service — Outbound Telephony & DPDP Retention Lifecycle…, High-level telephony service managing call execution and statutory retention…, Initiates call via twilio_caller, then schedules: - 90-day retention for raw…, VoiceService

### Community 70 - "Working on: GPU LLM Integration, SSE Telemetry & UI/UX Pro Max Architecture"
Cohesion: 0.29
Nodes (6): Build & Git Status, Decisions Made, Key Deliverables, Remaining Work, Summary, Working on: GPU LLM Integration, SSE Telemetry & UI/UX Pro Max Architecture

### Community 71 - "Abe et al. Constrained RL for Debt Collections (ACM SIGKDD 2010)"
Cohesion: 0.29
Nodes (7): Abe et al. Constrained RL for Debt Collections (ACM SIGKDD 2010), CATE Uplift Modeling & Counterfactual ENRV Framework, Fair Distribution of Digital Payments (arXiv:2601.02369), Sleeping Dogs Quadrant Penalty & Churn Defense, UPI AutoPay 20M Monthly Revocations Grounding, Judges Defense Playbook: CATE Uplift & Abe et al. Formulation, Razorpay Revenue Recovery Brain Platform Overview

### Community 72 - "UI/UX Design System & Architectural Standard"
Cohesion: 0.29
Nodes (6): 1. Core Philosophy: No "AI Slop" / Clean Enterprise Fintech, 2. Color Palette & Design Tokens, 3. Tab Structure & Information Architecture, 4. Guidelines for Adding Future Features, Razorpay Revenue Recovery Brain · Agent Studio, UI/UX Design System & Architectural Standard

### Community 73 - "📊 Razorpay AI Buildathon 2026 — Pitch Slide Outline"
Cohesion: 0.29
Nodes (6): 📊 Razorpay AI Buildathon 2026 — Pitch Slide Outline, Slide 1: The Thesis — Revenue Leakage is a Unified Diagnosis Problem, Slide 2: Architectural Superiority — Sub-500ms Deterministic Core, Slide 3: The Secret Weapon — Hinglish Conversational Debt Recovery, Slide 4: Compliance as a Differentiator — RBI Fair Practices Hard Guards, Slide 5: Business Impact & Execution Roadmap

### Community 74 - "idempotency_mutex.py"
Cohesion: 0.33
Nodes (3): Application Configuration Facade (app.config)…, Stateful Idempotency Mutex — Atomic Guardrail…, Idempotency Guard — Compatibility Facade…

### Community 75 - "Batch Results & Recovery Performance Report"
Cohesion: 0.33
Nodes (5): 1. Executive Summary Table, 2. Category Performance Breakdown, 3. Honest Exception & Non-Automated Cases List, 4. Full Per-Case Audit Sample (First 20 Cases), Batch Results & Recovery Performance Report

### Community 76 - "get_telephony_status"
Cohesion: 0.40
Nodes (5): get_telephony_status(), Inspect live configuration and credentials status for Twilio, Bolna AI, and…, _is_twilio_configured(), is_whatsapp_configured(), Check if either Twilio WhatsApp or Meta WhatsApp Cloud API is configured.

### Community 77 - "Project: Razorpay Revenue Recovery Brain (Track 03)"
Cohesion: 0.40
Nodes (4): Build & Verification, Key Completed Deliverables, Project: Razorpay Revenue Recovery Brain (Track 03), Summary

### Community 78 - "Voice Pipeline End-to-End Latency & Telephony Report"
Cohesion: 0.50
Nodes (3): 1. Live Measured Local Pipeline Telemetry, 2. Telephony Turn Latency Waterfall (Target Budget: 800ms SLA), Voice Pipeline End-to-End Latency & Telephony Report

### Community 79 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **179 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RecoveryPipeline` connect `RecoveryPipeline` to `test_competitive_enhancements.py`, `main.py`, `post`, `recovery_pipeline.py`, `RootCause`, `run_verification_suite.py`, `test_recovery_brain.py`, `DiagnosisEngine`, `models/database.py`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `RecoveryPipeline` (e.g. with `generate_and_process_batch()` and `reload_ledger_on_startup()`) actually correct?**
  _`RecoveryPipeline` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `RootCause` (e.g. with `DiagnosisEngine` and `InterventionRouter`) actually correct?**
  _`RootCause` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `LeakType` (e.g. with `llm_enhanced_diagnosis()` and `unified_recovery_scenario()`) actually correct?**
  _`LeakType` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_competitive_enhancements.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06976744186046512 - nodes in this community are weakly interconnected._
- **Should `ABTestEngine` be split into smaller, more focused modules?**
  _Cohesion score 0.05959183673469388 - nodes in this community are weakly interconnected._