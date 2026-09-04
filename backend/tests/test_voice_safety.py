"""
Voice Safety Filter & Credential Shield Tests
=============================================
Verifies:
1. Devanagari Script Coverage (पिन, ओटीपी, पासवर्ड, सीवीवी, etc.)
2. Punctuation & Spacing Evasion Detection (o.t.p., p-i-n, c.v.v, p i n, etc.)
3. Mixed Hinglish Sentences with Mid-Sentence Credential Solicitations
4. Safe Legitimate Word Protection (spin, pine, etc.)
5. Per-Turn Dialogue Validation and Sanitization (generate_persona_flow)
"""

import pytest
from app.services.voice_safety import VoiceSafetyFilter, MANDATORY_CLOSING_DISCLAIMER, SAFE_FALLBACK_TEXT
from app.services.voice_intent_classifier import VoiceIntentClassifier, VoicePersona, PERSONA_CONFIGS


def test_devanagari_script_credential_detection():
    """
    Test 1: Devanagari Script Input:
    Verifies that credential requests written in Hindi/Devanagari script are blocked.
    """
    dirty_devanagari_cases = [
        "कृपया अपना ओटीपी बताएं",
        "अपना यूपीआई पिन किसी को मत देना",
        "क्या आप अपना पासवर्ड बता सकते हैं?",
        "कार्ड नंबर और सीवीवी दर्ज करें",
        "अपना एटीएम पिन फोन पर बताएं",
        "कृपया अपना गुप्त कोड शेयर करें",
        "वन टाइम पासवर्ड बताइए",
    ]

    for utterance in dirty_devanagari_cases:
        assert VoiceSafetyFilter.validate_script(utterance) is False, f"Failed to block Devanagari: {utterance}"

    # Clean Devanagari should pass
    clean_devanagari = "नमस्ते, आपका ₹50,000 का इनवॉइस पेंडिंग है। क्या आप आज बात कर सकते हैं?"
    assert VoiceSafetyFilter.validate_script(clean_devanagari) is True


def test_punctuation_and_spacing_evasion():
    """
    Test 2: Punctuation & Spaced-Out Evasion:
    Verifies that bypass attempts using punctuation (e.g. 'o.t.p.', 'p-i-n') or spaced letters ('p i n') are normalized and blocked.
    """
    evasion_cases = [
        # Punctuation-separated
        "Please enter your o.t.p. now",
        "Tell me your p-i-n right now",
        "Give me your c.v.v code",
        "Enter your p_a_s_s_w_o_r_d",
        "Share o/t/p please",
        "Enter your p*i*n",
        "Enter your u.p.i. p.i.n.",
        "Aapka upi-pin batayein",
        # Spaced-out letters
        "Enter your p i n here",
        "Tell me the o t p",
        "Give c v v",
        "Apna p a s s w o r d share karein",
        # Devanagari punctuation & spacing
        "कृपया अपना ओ.टी.पी. शेयर करें",
        "अपना ओ टी पी बताएं",
        "सी वी वी कोड दर्ज करें",
        "यू पी आई पिन बताइए",
    ]

    for utterance in evasion_cases:
        assert VoiceSafetyFilter.validate_script(utterance) is False, f"Failed to catch evasion: {utterance}"


def test_mixed_hinglish_mid_sentence_credentials():
    """
    Test 3: Mixed Hinglish Sentences with Mid-Sentence Credentials:
    Verifies detection when forbidden credential terms are embedded in natural Hinglish dialogue.
    """
    mixed_hinglish_cases = [
        "Sir payment confirmation ke liye apna otp batayein",
        "Aapka account verify karne ke liye hume pin chahiye",
        "Verification ke liye apna password verify karein",
        "Razorpay transaction complete karne ke liye cvv enter kijiye",
        "Payment verification ke liye apna o.t.p. share karna zaroori hai",
        "Abhi call par apna u.p.i. p-i-n verify kar dijiye",
        "Aapka mpin phone par verify karne se payment ho jayega",
    ]

    for utterance in mixed_hinglish_cases:
        assert VoiceSafetyFilter.validate_script(utterance) is False, f"Failed to catch Hinglish: {utterance}"


def test_legitimate_words_not_falsely_blocked():
    """
    Test 4: False Positive Protection:
    Verifies that words containing credential substrings (spin, pine, spine, pinnacle) are NOT blocked.
    """
    legitimate_cases = [
        "Aapko payment link WhatsApp par share kiya gaya hai.",
        "Wheel spin karke discount check karein.",
        "Pine valley store se invoice generate hua hai.",
        "Aap kal subah tak payment clear kar sakte hain.",
        "Hum aapke liye convenient installment plan bana rahe hain.",
    ]

    for utterance in legitimate_cases:
        assert VoiceSafetyFilter.validate_script(utterance) is True, f"False positive on clean text: {utterance}"


def test_per_turn_conversational_guardrail():
    """
    Test 5: Per-Turn Conversational LLM Guardrail:
    Verifies that validate_turn and sanitize_turn work per dialogue turn,
    and that generate_persona_flow automatically sanitizes dirty agent turns.
    """
    # 1. Per-turn validation
    assert VoiceSafetyFilter.validate_turn("Aapka OTP batao", speaker="agent") is False
    assert VoiceSafetyFilter.validate_turn("Aapka OTP batao", speaker="debtor") is True  # debtor intent allowed
    assert VoiceSafetyFilter.validate_turn("Aapko link bheja gaya hai", speaker="agent") is True

    # 2. Per-turn sanitization
    sanitized_turn = VoiceSafetyFilter.sanitize_turn("Sir call par apna p-i-n enter kijiye", speaker="agent")
    assert "p-i-n" not in sanitized_turn
    assert "payment link" in sanitized_turn

    # 3. generate_persona_flow per-turn verification
    flow_result = VoiceIntentClassifier.generate_persona_flow(
        persona=VoicePersona.FIRST_TIME_MISS,
        debtor_name="Rahul Verma",
        invoice_number="INV-2026-001",
        amount=45000.0,
    )
    assert len(flow_result["flow"]) > 0

    # Ensure all agent turns in the generated flow are 100% clean of forbidden credentials
    for turn in flow_result["flow"]:
        if turn["speaker"] == "agent":
            assert VoiceSafetyFilter.validate_script(turn["text"]) is True, f"Agent turn dirty: {turn['text']}"


def test_script_sanitization_includes_mandatory_disclaimer():
    """
    Test 6: Sanitization Fallback & Mandatory Closing Disclaimer:
    Verifies fallback replacement and mandatory RBI disclaimer presence.
    """
    dirty = "Aapka o.t.p. bataiye abhi payment karne ke liye."
    sanitized = VoiceSafetyFilter.sanitize_script(dirty)
    assert "o.t.p." not in sanitized
    assert MANDATORY_CLOSING_DISCLAIMER in sanitized
    assert SAFE_FALLBACK_TEXT in sanitized
