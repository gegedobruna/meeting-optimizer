import { useState } from 'react';
import { evaluateMeetingRequest, MEETING_REQUEST_STATUSES } from '../utils/meetingRules';
import { canApproveMeeting } from '../utils/permissions';
import { USERS } from '../data/mockData';

const VERDICT_STYLE = {
  "Recommended":     "bg-green-100 text-green-800 border-green-300",
  "Optional":        "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Not Recommended": "bg-red-100 text-red-800 border-red-300",
};

const STATUS_BADGE = {
  PENDING:  "bg-gray-100 text-gray-600",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  participantCount: 4,
  estimatedMinutes: 30,
  hasBlocker: false,
  hasDecision: false,
  hasUpdate: false,
  alternativeExists: false,
  title: "",
};

export default function MeetingRequests({ currentUser, meetingRequests, setMeetingRequests }) {
  const isApprover = canApproveMeeting(currentUser);

  // ── Requester state ──────────────────────────────────────────────
  const [form, setForm]         = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const verdict = evaluateMeetingRequest(form);

  const toggle = (field) => setForm(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const req = {
      id:           `mr-${Date.now()}`,
      title:        form.title.trim(),
      requesterId:  currentUser.id,
      requesterName:currentUser.name,
      params:       { ...form },
      verdict:      verdict.verdict,
      reasons:      verdict.reasons,
      status:       MEETING_REQUEST_STATUSES.PENDING,
      createdAt:    new Date().toISOString(),
      scheduledDate: null,
    };
    setMeetingRequests(prev => [...prev, req]);
    setForm(EMPTY_FORM);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // ── Approver actions ─────────────────────────────────────────────
  const updateStatus = (id, status) => {
    setMeetingRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status } : r)
    );
  };

  const requesterRequests = meetingRequests.filter(r => r.requesterId === currentUser.id);

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-8">

      {/* ── Requester: form ───────────────────────────────────────── */}
      {!isApprover && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Request a Meeting</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-5">

            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Meeting title</label>
              <input
                className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
                placeholder="e.g. Sprint blocker resolution"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Participants</label>
                <input
                  type="number" min={1} max={50}
                  className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
                  value={form.participantCount}
                  onChange={e => setForm(prev => ({ ...prev, participantCount: +e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Estimated duration (min)</label>
                <input
                  type="number" min={5} max={480}
                  className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
                  value={form.estimatedMinutes}
                  onChange={e => setForm(prev => ({ ...prev, estimatedMinutes: +e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { field: "hasBlocker",        label: "There is an active blocker that needs to be resolved" },
                { field: "hasDecision",       label: "A group decision needs to be made" },
                { field: "hasUpdate",         label: "This is primarily a status update" },
                { field: "alternativeExists", label: "An async alternative (doc, Slack thread) already exists" },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form[field]}
                    onChange={() => toggle(field)}
                    className="rounded"
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Real-time verdict */}
            <div className={`border rounded-lg px-4 py-3 text-sm ${VERDICT_STYLE[verdict.verdict]}`}>
              <p className="font-semibold mb-1">{verdict.verdict}</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                {verdict.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm rounded-lg px-5 py-2 font-medium"
              >
                Submit Request
              </button>
              {submitted && <span className="text-green-600 text-sm">Request submitted!</span>}
            </div>
          </form>

          {/* Own requests status */}
          {requesterRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Requests</h3>
              <div className="flex flex-col gap-2">
                {requesterRequests.map(r => (
                  <div key={r.id} className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between text-sm">
                    <span className="text-gray-800 font-medium">{r.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Approver: all pending requests ────────────────────────── */}
      {isApprover && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Meeting Requests</h2>
          {meetingRequests.length === 0 ? (
            <p className="text-sm text-gray-400">No requests yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {meetingRequests.map(r => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        by {r.requesterName} · {r.params.participantCount} people · {r.params.estimatedMinutes} min
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[r.status]}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className={`border rounded px-3 py-2 text-xs ${VERDICT_STYLE[r.verdict]}`}>
                    <span className="font-semibold">{r.verdict}</span>
                    {" — "}
                    {r.reasons.join(" ")}
                  </div>

                  {r.status === MEETING_REQUEST_STATUSES.PENDING && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => updateStatus(r.id, MEETING_REQUEST_STATUSES.APPROVED)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, MEETING_REQUEST_STATUSES.REJECTED)}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
