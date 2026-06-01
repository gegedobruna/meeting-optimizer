export const MEETING_REQUEST_STATUSES = {
  PENDING:  "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

/**
 * evaluateMeetingRequest({ participantCount, estimatedMinutes, hasBlocker, hasDecision, hasUpdate, alternativeExists })
 * Returns { verdict: "Recommended"|"Optional"|"Not Recommended", reasons: string[] }
 */
export function evaluateMeetingRequest({
  participantCount = 0,
  estimatedMinutes = 0,
  hasBlocker = false,
  hasDecision = false,
  hasUpdate = false,
  alternativeExists = false,
}) {
  const reasons = [];

  if (hasBlocker) {
    reasons.push("Meeting has an active blocker — sync is recommended.");
  }
  if (hasDecision) {
    reasons.push("A decision needs to be made that requires group alignment.");
  }
  if (hasBlocker || hasDecision) {
    return { verdict: "Recommended", reasons };
  }

  if (alternativeExists && !hasBlocker && !hasDecision) {
    reasons.push("An async alternative exists and no blocker or decision is required.");
    return { verdict: "Not Recommended", reasons };
  }

  if (estimatedMinutes > 60 && participantCount > 8) {
    reasons.push(`A ${estimatedMinutes}-minute meeting with ${participantCount} participants is likely inefficient.`);
    return { verdict: "Not Recommended", reasons };
  }

  if (hasUpdate) {
    reasons.push("Meeting is informational — consider an async update instead.");
  } else {
    reasons.push("No strong signal for or against this meeting.");
  }
  return { verdict: "Optional", reasons };
}
