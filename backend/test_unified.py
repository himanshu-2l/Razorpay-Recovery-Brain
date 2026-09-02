import httpx, json

r = httpx.get("http://localhost:8000/api/demo/unified-recovery-scenario", timeout=15)
print("HTTP", r.status_code)
if r.status_code == 200:
    d = r.json()
    print("Customer:", d.get("customer", {}).get("name"))
    print("Exposure: Rs", d.get("total_exposure_inr"))
    for c in d.get("cases_by_priority", []):
        print(f"  #{c['rank']} {c['leak_type']} -> {c['chosen_intervention']} (status: {c['status']})")
    ci = d.get("cross_leak_intelligence", {})
    print("WhatsApp dedup:", ci.get("whatsapp_deduplication_triggered"))
    print("HITL required:", ci.get("hitl_required"))
    print("Section 43B(h) urgency:", ci.get("section_43bh_urgency", {}).get("urgency"))
else:
    print("ERROR:", r.text[:500])
