import hmac
import hashlib
from unittest.mock import MagicMock, patch
import pytest
import razorpay
from razorpay.errors import SignatureVerificationError

from app.services.razorpay_client import RazorpayClientWrapper


def test_razorpay_sdk_initialization():
    """Verify that RazorpayClientWrapper initializes the official razorpay.Client (v2.0.1)."""
    client = RazorpayClientWrapper()
    assert client.sdk_client is not None
    assert isinstance(client.sdk_client, razorpay.Client)
    assert hasattr(client.sdk_client, "payment_link")
    assert hasattr(client.sdk_client, "utility")


def test_razorpay_sdk_webhook_verification():
    """Verify HMAC webhook signature validation through the SDK 2.0.1 utility."""
    client = RazorpayClientWrapper()
    client.webhook_secret = "test_webhook_secret_key_123"

    payload = b'{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test_999"}}}}'
    valid_signature = hmac.new(
        key=b"test_webhook_secret_key_123",
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()

    # Valid signature should pass
    assert client.verify_webhook_signature(payload, valid_signature) is True

    # Tampered signature should fail
    tampered_sig = valid_signature[:-4] + "ffff"
    assert client.verify_webhook_signature(payload, tampered_sig) is False

    # Empty signature should fail
    assert client.verify_webhook_signature(payload, "") is False


def test_razorpay_sdk_payment_link_creation():
    """Verify that create_recovery_payment_link invokes the official SDK client method."""
    client = RazorpayClientWrapper()
    client.key_id = "rzp_test_real_key_mock"

    mock_sdk_response = {
        "id": "plink_sdk_test_12345",
        "entity": "payment_link",
        "amount": 250000,
        "amount_paid": 0,
        "currency": "INR",
        "status": "created",
        "short_url": "https://rzp.io/i/testsdk",
        "description": "Invoice INV-2026-901 Recovery",
        "customer": {"name": "Test Merchant", "contact": "+919999999999", "email": "test@merchant.in"},
    }

    with patch.object(client.sdk_client.payment_link, "create", return_value=mock_sdk_response) as mock_create:
        res = client.create_recovery_payment_link(
            amount_inr=2500.0,
            customer_name="Test Merchant",
            customer_phone="+919999999999",
            customer_email="test@merchant.in",
            description="Invoice INV-2026-901 Recovery",
            invoice_number="INV-2026-901",
        )

        assert mock_create.called
        assert res["id"] == "plink_sdk_test_12345"
        assert res["mode"] == "live_razorpay_sdk_v2"
        assert res["short_url"] == "https://rzp.io/i/testsdk"


def test_razorpay_sdk_payment_link_invalidation():
    """Verify single-active-link enforcement: prior link is invalidated on new issuance."""
    client = RazorpayClientWrapper()
    client.key_id = "rzp_test_real_key_mock"

    link1 = {
        "id": "plink_first_001",
        "status": "created",
        "short_url": "https://rzp.io/i/first",
    }
    link2 = {
        "id": "plink_second_002",
        "status": "created",
        "short_url": "https://rzp.io/i/second",
    }

    with patch.object(client.sdk_client.payment_link, "cancel", return_value={"status": "cancelled"}) as mock_cancel, \
         patch.object(client.sdk_client.payment_link, "create", side_effect=[link1, link2]):

        # First link
        res1 = client.create_recovery_payment_link(
            amount_inr=1000.0,
            customer_name="Alpha Corp",
            customer_phone="+919876543210",
            customer_email="alpha@corp.in",
            description="Payment Link 1",
            invoice_number="INV-ALPHA-01",
        )
        assert res1["id"] == "plink_first_001"

        # Second link for same invoice should invalidate link1
        res2 = client.create_recovery_payment_link(
            amount_inr=1000.0,
            customer_name="Alpha Corp",
            customer_phone="+919876543210",
            customer_email="alpha@corp.in",
            description="Payment Link 2",
            invoice_number="INV-ALPHA-01",
        )
        assert res2["id"] == "plink_second_002"
        assert res2["invalidated_previous_link_id"] == "plink_first_001"
        assert mock_cancel.called


def test_razorpay_sdk_fetch_payment_link():
    """Verify that fetch_payment_link queries the SDK and extracts paid status and timestamps."""
    client = RazorpayClientWrapper()
    client.key_id = "rzp_test_real_key_mock"

    mock_fetch_response = {
        "id": "plink_test_fetch_777",
        "status": "paid",
        "amount": 49900,
        "amount_paid": 49900,
        "short_url": "https://rzp.io/i/paid777",
        "payments": [{"id": "pay_test_payment_999", "created_at": 1757077200, "status": "captured"}],
    }

    with patch.object(client.sdk_client.payment_link, "fetch", return_value=mock_fetch_response):
        data = client.fetch_payment_link("plink_test_fetch_777")
        assert data["id"] == "plink_test_fetch_777"
        assert data["status"] == "paid"
        assert data["amount"] == 49900
        assert data["amount_paid"] == 49900
        assert data["paid_at"] == 1757077200
        assert len(data["payments"]) == 1


def test_live_payment_link_endpoints_and_status_check():
    """Verify POST /api/live/payment-link and POST /api/live/payment-link/{id}/check endpoints."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Create live payment link
    resp = client.post(
        "/api/live/payment-link",
        json={
            "customer_name": "Rohan Sharma",
            "amount": 2499.0,
            "reason": "expired_card",
            "phone": "+919876543210",
            "email": "rohan@example.com"
        }
    )
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["status"] == "success"
    assert "case" in res_data
    assert "link" in res_data
    link_id = res_data["link"]["id"]

    # 2. Check payment link status (unpaid)
    check_resp = client.post(f"/api/live/payment-link/{link_id}/check")
    assert check_resp.status_code == 200
    check_data = check_resp.json()
    assert check_data["status"] == "success"
    assert "payment_status" in check_data

    # 3. Check compliance stopped cases
    stopped_resp = client.get("/api/compliance/stopped-cases")
    assert stopped_resp.status_code == 200
    stopped_data = stopped_resp.json()
    assert stopped_data["status"] == "success"
    assert isinstance(stopped_data["stopped_cases"], list)
