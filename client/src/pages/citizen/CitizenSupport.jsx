import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { HelpCircle, Plus, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

const CitizenSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Grievance Filing Inquiry',
    description: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support');
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/support', formData);
      if (res.data.success) {
        setSuccess('Support query ticket opened successfully.');
        setShowModal(false);
        setFormData({ subject: '', category: 'Grievance Filing Inquiry', description: '' });
        fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit support ticket.');
    }
  };

  const handleOpenConversation = async (t) => {
    try {
      const res = await api.get(`/support/${t._id}`);
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
      }
    } catch (err) {
      setSelectedTicket(t);
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseMsg.trim()) return;

    try {
      const res = await api.post(`/support/${selectedTicket._id}/respond`, {
        message: responseMsg.trim()
      });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        setResponseMsg('');
        fetchTickets();
      }
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Citizen Redressal Helpdesk & Support</h4>
          <p className="text-muted small mb-0">
            Open inquiry tickets for portal issues, procedural questions, or special requests.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
          <Plus size={16} /> Open Support Ticket
        </button>
      </div>

      {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}

      <div className="row g-4">
        {/* Ticket List */}
        <div className="col-lg-5">
          <div className="gov-card">
            <h6 className="fw-bold text-dark mb-3">Your Support Tickets ({tickets.length})</h6>
            <div className="d-flex flex-column gap-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => handleOpenConversation(t)}
                    className={`p-3 rounded border cursor-pointer transition ${
                      selectedTicket?._id === t._id ? 'border-primary bg-primary bg-opacity-10' : 'bg-white hover-bg-light'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold font-monospace small text-primary">{t.ticketId}</span>
                      <span className={`badge ${t.status === 'RESOLVED' ? 'bg-success' : t.status === 'IN_PROGRESS' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="fw-bold text-dark small text-truncate">{t.subject}</div>
                    <div className="text-muted small mt-1">{t.category}</div>
                    <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                      {new Date(t.createdAt).toLocaleDateString()} • {t.responses?.length || 0} Responses
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">No support tickets opened yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Conversation View */}
        <div className="col-lg-7">
          <div className="gov-card h-100 d-flex flex-column">
            {selectedTicket ? (
              <>
                <div className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-dark font-monospace fs-6">{selectedTicket.ticketId}</span>
                    <span className={`badge ${selectedTicket.status === 'RESOLVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark mt-2 mb-1">{selectedTicket.subject}</h5>
                  <p className="text-muted small mb-0">{selectedTicket.description}</p>
                </div>

                {/* Message Log */}
                <div className="flex-grow-1 overflow-auto mb-3 pe-2" style={{ minHeight: '260px', maxHeight: '400px' }}>
                  {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                    selectedTicket.responses.map((r, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded mb-2 small ${
                          r.senderRole === 'CITIZEN' ? 'bg-light text-dark ms-4 border' : 'bg-primary bg-opacity-10 text-dark me-4 border border-primary border-opacity-25'
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1 fw-bold">
                          <span>{r.sender?.name || (r.senderRole === 'CITIZEN' ? 'You' : 'Official Support Officer')}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>{r.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted small">
                      Your query has been logged. An official support agent will reply here shortly.
                    </div>
                  )}
                </div>

                {/* Response Input */}
                <form onSubmit={handleSendResponse} className="mt-auto border-top pt-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your reply message..."
                      required
                      value={responseMsg}
                      onChange={(e) => setResponseMsg(e.target.value)}
                    />
                    <button type="submit" className="btn btn-gov-primary px-3">
                      <Send size={16} /> Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center py-5 text-muted">
                <MessageSquare size={48} className="opacity-25 mb-2" />
                <h6 className="fw-semibold">Select a Support Ticket</h6>
                <p className="small">Click any ticket on the left to read official responses or send replies.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Open Helpdesk Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="gov-label">Subject *</label>
                    <input
                      type="text"
                      className="gov-input"
                      required
                      placeholder="e.g. Inability to track ticket status"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Inquiry Category *</label>
                    <select
                      className="gov-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Grievance Filing Inquiry">Grievance Filing Inquiry</option>
                      <option value="Technical Portal Bug">Technical Portal Bug</option>
                      <option value="Account & Profile Assistance">Account & Profile Assistance</option>
                      <option value="Urgent Civic Redirection">Urgent Civic Redirection</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Description Details *</label>
                    <textarea
                      className="gov-textarea"
                      rows="4"
                      required
                      placeholder="Describe your issue or query clearly..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    Submit Support Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenSupport;

