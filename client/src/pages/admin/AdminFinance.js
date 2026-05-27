import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Alert, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaChartPie, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
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
      setForm((prev) => ({
        ...prev,
        amount: '',
        source_name: '',
        description: '',
        spent_by: prev.kind === 'EXPENSE' ? prev.spent_by : ''
      }));
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

      <Row className="g-3">
        <Col lg={5}>
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
        </Col>

        <Col lg={7}>
          <Card className="admin-card app-card">
            <Card.Body>
              <div className="app-title mb-3">Nuova registrazione</div>

              <Form onSubmit={submit}>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tipo</Form.Label>
                      <Form.Select value={form.kind} onChange={onChange('kind')}>
                        <option value="SPONSOR">Sponsor (entrata)</option>
                        <option value="REGISTRATION">Iscrizione (entrata)</option>
                        <option value="EXPENSE">Spesa (uscita)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Importo (€)</Form.Label>
                      <Form.Control value={form.amount} onChange={onChange('amount')} placeholder="Es. 50 oppure 50,00" />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Chi lo tiene</Form.Label>
                      <Form.Control value={form.holder_name} onChange={onChange('holder_name')} placeholder="Es. Giuseppe" />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Data/Ora</Form.Label>
                      <Form.Control type="datetime-local" value={form.occurred_at} onChange={onChange('occurred_at')} />
                    </Form.Group>
                  </Col>

                  {form.kind !== 'EXPENSE' ? (
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>{form.kind === 'SPONSOR' ? 'Sponsor' : 'Squadra'}</Form.Label>
                        <Form.Control value={form.source_name} onChange={onChange('source_name')} placeholder={form.kind === 'SPONSOR' ? 'Es. Bar Centrale' : 'Es. Torino'} />
                      </Form.Group>
                    </Col>
                  ) : (
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Chi ha speso</Form.Label>
                        <Form.Control value={form.spent_by} onChange={onChange('spent_by')} placeholder="Es. Giuseppe" />
                      </Form.Group>
                    </Col>
                  )}

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Descrizione</Form.Label>
                      <Form.Control value={form.description} onChange={onChange('description')} placeholder="Es. Stampa locandine" />
                    </Form.Group>
                  </Col>

                  <Col xs={12} className="mt-2">
                    <Button type="submit" variant="warning" className="w-100" disabled={submitting}>
                      {submitting ? 'Salvataggio...' : 'Aggiungi'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Card className="admin-card app-card mt-3">
            <Card.Body className="p-0">
              <div className="d-flex align-items-center justify-content-between px-3 pt-3">
                <div className="app-title">Movimenti</div>
                <Badge bg="secondary" className="app-badge">{transactions.length}</Badge>
              </div>
              <div className="table-responsive px-3 pb-3 pt-2">
                <Table className="mb-0 leaderboard-table finance-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Dettagli</th>
                      <th className="text-center">Cassa</th>
                      <th className="text-center">Importo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => {
                      const meta = kindMeta[t.kind] || { label: t.kind, icon: null };
                      const occurred = t.occurred_at ? new Date(t.occurred_at) : null;
                      return (
                        <tr key={t.id}>
                          <td className="align-middle">
                            <div className="d-flex align-items-center gap-2">
                              {meta.icon}
                              <span className="finance-kind">{meta.label}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="finance-details">
                              <div className="finance-title">
                                {t.kind === 'EXPENSE'
                                  ? (t.description || 'Spesa')
                                  : (t.source_name || 'Entrata')}
                              </div>
                              <div className="finance-sub app-dim">
                                {t.kind === 'EXPENSE'
                                  ? (t.spent_by ? `Spesa da: ${t.spent_by}` : '')
                                  : (t.kind === 'REGISTRATION' ? 'Iscrizione' : 'Sponsor')}
                                {occurred ? ` • ${occurred.toLocaleDateString('it-IT')}` : ''}
                              </div>
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <span className="app-dim">{t.holder_name || '—'}</span>
                          </td>
                          <td className="align-middle text-center">
                            <span className={t.kind === 'EXPENSE' ? 'badge bg-danger app-badge' : 'badge bg-warning text-dark app-badge'}>
                              {t.kind === 'EXPENSE' ? `-${formatCents(t.amount_cents)}` : formatCents(t.amount_cents)}
                            </span>
                          </td>
                          <td className="align-middle text-end">
                            <Button variant="outline-light" size="sm" onClick={() => removeTx(t.id)} className="finance-delete">
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminFinance;
