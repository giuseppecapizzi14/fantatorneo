import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Alert, Form, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaChartPie, FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';
import api from '../../services/api';

const formatCents = (cents) => {
  const value = Number(cents || 0) / 100;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const AdminFinance = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('income');

  const [form, setForm] = useState({
    kind: 'SPONSOR',
    amount: '',
    occurred_at: '',
    source_name: '',
    holder_name: '',
    spent_by: '',
    description: ''
  });

  const kindMeta = useMemo(() => {
    const map = {
      SPONSOR: { label: 'Sponsor (entrata)', icon: <FaArrowUp className="text-success" /> },
      REGISTRATION: { label: 'Iscrizione (entrata)', icon: <FaArrowUp className="text-success" /> },
      EXPENSE: { label: 'Spesa (uscita)', icon: <FaArrowDown className="text-danger" /> }
    };
    return map;
  }, []);

  const loadAll = async () => {
    setError('');
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/transactions?limit=300')
      ]);
      setSummary(s.data);
      setTransactions(t.data || []);

      const users = await api.get('/users');
      const admins = (users.data || []).filter((u) => u.role === 'admin');
      setAdminUsers(admins);
    } catch (e) {
      setError('Errore nel caricamento della gestione spese');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const body = {
        kind: form.kind,
        amount: form.amount,
        occurred_at: form.occurred_at ? new Date(form.occurred_at).toISOString() : null,
        source_name: form.source_name || null,
        holder_name: form.holder_name || null,
        spent_by: form.spent_by || null,
        description: form.description || null
      };

      await api.post('/finance/transactions', body);
      setShowModal(false);
      setForm((prev) => ({ ...prev, amount: '', source_name: '', description: '', occurred_at: '' }));
      await loadAll();
    } catch (e2) {
      setError('Errore durante il salvataggio');
    } finally {
      setSubmitting(false);
    }
  };

  const removeTx = async (id) => {
    setError('');
    try {
      await api.delete(`/finance/transactions/${id}`);
      await loadAll();
    } catch (e) {
      setError('Errore durante l’eliminazione');
    }
  };

  const income = summary?.income_cents ?? 0;
  const expense = summary?.expense_cents ?? 0;
  const net = summary?.net_cents ?? 0;
  const maxAbs = Math.max(1, Number(income), Number(expense));

  const chart = useMemo(() => {
    const w = 360;
    const h = 110;
    const pad = 12;
    const barW = w - pad * 2;
    const incomeW = Math.round((Number(income) / maxAbs) * barW);
    const expenseW = Math.round((Number(expense) / maxAbs) * barW);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="110" className="finance-chart">
        <rect x={pad} y={20} rx="10" ry="10" width={barW} height="18" fill="rgba(255,255,255,0.06)" />
        <rect x={pad} y={20} rx="10" ry="10" width={incomeW} height="18" fill="rgba(255,191,0,0.75)" />
        <text x={pad} y={15} fill="rgba(255,255,255,0.7)" fontSize="12">Entrate</text>
        <text x={w - pad} y={15} textAnchor="end" fill="rgba(255,255,255,0.92)" fontSize="12">{formatCents(income)}</text>

        <rect x={pad} y={64} rx="10" ry="10" width={barW} height="18" fill="rgba(255,255,255,0.06)" />
        <rect x={pad} y={64} rx="10" ry="10" width={expenseW} height="18" fill="rgba(255,90,111,0.8)" />
        <text x={pad} y={59} fill="rgba(255,255,255,0.7)" fontSize="12">Spese</text>
        <text x={w - pad} y={59} textAnchor="end" fill="rgba(255,255,255,0.92)" fontSize="12">{formatCents(expense)}</text>

        <text x={pad} y={104} fill="rgba(255,255,255,0.7)" fontSize="12">Saldo</text>
        <text x={w - pad} y={104} textAnchor="end" fill="rgba(255,255,255,0.92)" fontSize="12">{formatCents(net)}</text>
      </svg>
    );
  }, [income, expense, net, maxAbs]);

  const openIncome = () => {
    setModalMode('income');
    setForm({
      kind: 'SPONSOR',
      amount: '',
      occurred_at: '',
      source_name: '',
      holder_name: adminUsers[0]?.username || '',
      spent_by: '',
      description: ''
    });
    setShowModal(true);
  };

  const openExpense = () => {
    setModalMode('expense');
    setForm({
      kind: 'EXPENSE',
      amount: '',
      occurred_at: '',
      source_name: '',
      holder_name: adminUsers[0]?.username || '',
      spent_by: '',
      description: ''
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const txAmountLabel = (t) => {
    const sign = t.kind === 'EXPENSE' ? '-' : '+';
    return `${sign}${formatCents(t.amount_cents)}`;
  };

  const txTitle = (t) => {
    if (t.kind === 'EXPENSE') return t.description || 'Spesa';
    if (t.kind === 'REGISTRATION') return t.source_name || 'Iscrizione';
    return t.source_name || 'Sponsor';
  };

  const txSubtitle = (t) => {
    const parts = [];
    if (t.kind === 'SPONSOR') parts.push('Sponsor');
    if (t.kind === 'REGISTRATION') parts.push('Iscrizione');
    if (t.kind === 'EXPENSE' && t.spent_by) parts.push(`Spesa da: ${t.spent_by}`);
    if (t.description && t.kind !== 'EXPENSE') parts.push(t.description);
    if (t.holder_name) parts.push(`Cassa: ${t.holder_name}`);
    if (t.occurred_at) parts.push(new Date(t.occurred_at).toLocaleDateString('it-IT'));
    return parts.filter(Boolean).join(' • ');
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center mb-4">
        <FaMoneyBillWave className="me-2 text-warning" />
        <h2 className="mb-0 text-warning app-title">Gestione Spese</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="admin-card app-card">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <FaChartPie className="text-warning" />
              <span className="app-title">Riepilogo</span>
            </div>
            <Badge bg="warning" className="text-dark app-badge">{formatCents(net)}</Badge>
          </div>

          <div className="mb-3">{chart}</div>

          <div className="d-flex align-items-center justify-content-between">
            <div className="app-muted">Entrate</div>
            <div className="fw-semibold">{formatCents(income)}</div>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="app-muted">Spese</div>
            <div className="fw-semibold">{formatCents(expense)}</div>
          </div>

          <div className="finance-actions mt-3">
            <Button variant="warning" className="finance-action-btn" onClick={openIncome}>
              <FaPlus className="me-2" />
              Aggiungi Entrata
            </Button>
            <Button variant="outline-light" className="finance-action-btn finance-action-btn--danger" onClick={openExpense}>
              <FaPlus className="me-2" />
              Aggiungi Uscita
            </Button>
          </div>

          <div className="finance-movements mt-3">
            <div className="finance-movements-header">
              <div className="app-title">Movimenti</div>
              <Badge bg="secondary" className="app-badge">{transactions.length}</Badge>
            </div>

            <div className="finance-movements-list">
              {transactions.map((t) => (
                <div key={t.id} className="finance-movement-row">
                  <div className="finance-movement-icon">
                    {t.kind === 'EXPENSE' ? <FaArrowDown className="text-danger" /> : <FaArrowUp className="text-success" />}
                  </div>
                  <div className="finance-movement-main">
                    <div className="finance-movement-title">{txTitle(t)}</div>
                    <div className="finance-movement-sub app-dim">{txSubtitle(t)}</div>
                  </div>
                  <div className="finance-movement-amount">
                    <span className={t.kind === 'EXPENSE' ? 'badge bg-danger app-badge' : 'badge bg-warning text-dark app-badge'}>
                      {txAmountLabel(t)}
                    </span>
                  </div>
                  <div className="finance-movement-user app-dim">
                    {t.created_by_username || (t.created_by_user_id ? `#${t.created_by_user_id}` : '—')}
                  </div>
                  <div className="finance-movement-actions">
                    <Button variant="outline-light" size="sm" onClick={() => removeTx(t.id)} className="finance-delete">
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="app-title mb-2">Saldo per cassa</div>
            <div className="finance-holder-list">
              {(summary?.by_holder || []).map((h) => (
                <div key={h.holder_name} className="finance-holder-row">
                  <div className="finance-holder-name">{h.holder_name}</div>
                  <div className="finance-holder-value">{formatCents(h.net_cents)}</div>
                </div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={closeModal} centered>
        <Form onSubmit={submit}>
          <Modal.Header closeButton>
            <Modal.Title className="app-title">
              {modalMode === 'income' ? 'Nuova Entrata' : 'Nuova Uscita'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Importo (€)</Form.Label>
                  <Form.Control value={form.amount} onChange={onChange('amount')} placeholder="Es. 50 oppure 50,00" />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Chi lo tiene</Form.Label>
                  <Form.Select value={form.holder_name} onChange={onChange('holder_name')}>
                    <option value="">Seleziona</option>
                    {adminUsers.map((u) => (
                      <option key={u.id} value={u.username}>{u.name ? `${u.name} (${u.username})` : u.username}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Data/Ora</Form.Label>
                  <Form.Control type="datetime-local" value={form.occurred_at} onChange={onChange('occurred_at')} />
                </Form.Group>
              </Col>

              <Col md={6}>
                {modalMode === 'income' ? (
                  <Form.Group>
                    <Form.Label>Tipo Entrata</Form.Label>
                    <Form.Select value={form.kind} onChange={onChange('kind')}>
                      <option value="SPONSOR">Sponsor</option>
                      <option value="REGISTRATION">Iscrizione</option>
                    </Form.Select>
                  </Form.Group>
                ) : (
                  <Form.Group>
                    <Form.Label>Chi ha speso</Form.Label>
                    <Form.Control value={form.spent_by} onChange={onChange('spent_by')} placeholder="Es. Giuseppe" />
                  </Form.Group>
                )}
              </Col>

              {modalMode === 'income' && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{form.kind === 'SPONSOR' ? 'Sponsor' : 'Squadra'}</Form.Label>
                    <Form.Control value={form.source_name} onChange={onChange('source_name')} placeholder={form.kind === 'SPONSOR' ? 'Es. Bar Centrale' : 'Es. Torino'} />
                  </Form.Group>
                </Col>
              )}

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Descrizione</Form.Label>
                  <Form.Control value={form.description} onChange={onChange('description')} placeholder="Es. Stampa locandine" />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-light" onClick={closeModal} disabled={submitting}>
              Annulla
            </Button>
            <Button type="submit" variant="warning" disabled={submitting}>
              {submitting ? 'Salvataggio...' : 'Salva'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminFinance;
