"""Initial schema migration: PostgreSQL 15 enterprise tables and indexes

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-03 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Customers Table ──────────────────────────────────────────────────────
    op.create_table(
        'customers',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String()),
        sa.Column('phone', sa.String()),
        sa.Column('company', sa.String()),
        sa.Column('customer_type', sa.String(), server_default='individual'),
        sa.Column('razorpay_customer_id', sa.String()),
        sa.Column('total_lifetime_value', sa.Float(), server_default='0.0'),
        sa.Column('risk_score', sa.Float(), server_default='0.0'),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('idx_customer_phone', 'customers', ['phone'])
    op.create_index('idx_customer_email', 'customers', ['email'])

    # ── Transactions Table ───────────────────────────────────────────────────
    op.create_table(
        'transactions',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('customer_id', sa.String(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('razorpay_payment_id', sa.String()),
        sa.Column('razorpay_order_id', sa.String()),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), server_default='INR'),
        sa.Column('payment_method', sa.String()),
        sa.Column('status', sa.String()),
        sa.Column('error_code', sa.String()),
        sa.Column('error_description', sa.String()),
        sa.Column('error_source', sa.String()),
        sa.Column('gateway_response', sa.JSON()),
        sa.Column('is_recurring', sa.Boolean(), server_default='false'),
        sa.Column('subscription_id', sa.String()),
        sa.Column('attempt_count', sa.Integer(), server_default='1'),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('idx_txn_payment_id', 'transactions', ['razorpay_payment_id'])
    op.create_index('idx_txn_customer', 'transactions', ['customer_id'])
    op.create_index('idx_txn_created', 'transactions', ['created_at'])

    # ── Invoices Table ───────────────────────────────────────────────────────
    op.create_table(
        'invoices',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('customer_id', sa.String(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('invoice_number', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('due_date', sa.DateTime(), nullable=False),
        sa.Column('days_overdue', sa.Integer(), server_default='0'),
        sa.Column('aging_bucket', sa.String()),
        sa.Column('payment_terms', sa.String(), server_default='NET30'),
        sa.Column('status', sa.String(), server_default='overdue'),
        sa.Column('partial_amount_paid', sa.Float(), server_default='0.0'),
        sa.Column('promise_to_pay_date', sa.DateTime()),
        sa.Column('promise_to_pay_amount', sa.Float()),
        sa.Column('broken_promises', sa.Integer(), server_default='0'),
        sa.Column('last_contact_date', sa.DateTime()),
        sa.Column('contact_count', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('idx_invoice_status_due_date', 'invoices', ['status', 'due_date'])
    op.create_index('idx_invoice_customer', 'invoices', ['customer_id'])

    # ── Cases Table ──────────────────────────────────────────────────────────
    op.create_table(
        'cases',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('customer_id', sa.String(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('transaction_id', sa.String(), sa.ForeignKey('transactions.id')),
        sa.Column('invoice_id', sa.String(), sa.ForeignKey('invoices.id')),
        sa.Column('leak_type', sa.String(), nullable=False),
        sa.Column('amount_at_risk', sa.Float(), nullable=False),
        sa.Column('amount_recovered', sa.Float(), server_default='0.0'),
        sa.Column('root_cause', sa.String()),
        sa.Column('root_cause_confidence', sa.Float()),
        sa.Column('reasoning_chain', sa.Text()),
        sa.Column('diagnosis_timestamp', sa.DateTime()),
        sa.Column('chosen_intervention', sa.String()),
        sa.Column('intervention_reason', sa.Text()),
        sa.Column('alternatives_rejected', sa.JSON()),
        sa.Column('intervention_timestamp', sa.DateTime()),
        sa.Column('compliance_status', sa.String()),
        sa.Column('compliance_rule_cited', sa.String()),
        sa.Column('rescheduled_to', sa.DateTime()),
        sa.Column('status', sa.String(), server_default='open'),
        sa.Column('outcome_notes', sa.Text()),
        sa.Column('related_case_ids', sa.JSON()),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )
    op.create_index('idx_case_leak_status', 'cases', ['leak_type', 'status'])
    op.create_index('idx_case_customer', 'cases', ['customer_id'])
    op.create_index('idx_case_created', 'cases', ['created_at'])

    # ── Audit Logs Table ─────────────────────────────────────────────────────
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('case_id', sa.String(), sa.ForeignKey('cases.id'), nullable=False),
        sa.Column('timestamp', sa.DateTime()),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('actor', sa.String(), server_default='system'),
        sa.Column('details', sa.JSON(), nullable=False),
    )
    op.create_index('idx_audit_case_time', 'audit_logs', ['case_id', 'timestamp'])
    op.create_index('idx_audit_action', 'audit_logs', ['action'])


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('cases')
    op.drop_table('invoices')
    op.drop_table('transactions')
    op.drop_table('customers')
