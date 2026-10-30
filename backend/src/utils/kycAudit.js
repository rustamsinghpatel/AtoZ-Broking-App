const KycAudit = require("../models/KycAudit");

// Writes one KYC audit record (best effort).
//
// The review decision itself is saved first and is the source of truth for the
// current status; the audit record is the history around it. If the audit
// write fails we do NOT undo or block the admin's work (that would need
// multi-document transactions, which a standalone MongoDB does not offer).
// Instead the failure is logged together with the full event so it can be
// reconstructed from the server logs.
const recordKycEvent = async (event) => {
  try {
    return await KycAudit.create(event);
  } catch (error) {
    console.error(
      "KYC audit write FAILED:",
      error.message,
      JSON.stringify(event)
    );
    return null;
  }
};

module.exports = { recordKycEvent };
