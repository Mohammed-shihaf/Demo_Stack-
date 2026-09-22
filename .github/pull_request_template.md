## Change Control & SOC 2 Compliance Checklist

### Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Security fix / Vulnerability remediation
- [ ] Compliance / Governance update

### SOC 2 & Engineering Governance Verification
- [ ] **Peer Review Approval**: Mandatory approval by at least 1 designated code reviewer.
- [ ] **CI/CD Quality Gate**: All static analysis, unit tests, and coverage delta checks passed.
- [ ] **Secret Scan Verification**: Gitleaks/Trufflehog verification confirmed no credentials exposed.
- [ ] **Data Privacy Review**: Checked for PII (FERPA/COPPA) and Cardholder Data (PCI-DSS) protection.
