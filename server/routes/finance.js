const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const parseAmountToCents = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  const normalized = String(value).trim().replace(',', '.');
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
};

const formatRow = (row) => ({
  ...row,
  amount_cents: Number(row.amount_cents)
});

router.get('/transactions', [auth, admin], async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit, 10) || 200));
    const result = await pool.query(
      `SELECT id, kind, amount_cents, currency, occurred_at, source_name, holder_name, spent_by, description, created_by_user_id, created_at
       FROM finance_transactions
       ORDER BY occurred_at DESC, id DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows.map(formatRow));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/summary', [auth, admin], async (req, res) => {
  try {
    const totals = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN kind IN ('SPONSOR', 'REGISTRATION') THEN amount_cents ELSE 0 END), 0) AS income_cents,
         COALESCE(SUM(CASE WHEN kind = 'EXPENSE' THEN amount_cents ELSE 0 END), 0) AS expense_cents
       FROM finance_transactions`
    );

    const byKind = await pool.query(
      `SELECT kind, COALESCE(SUM(amount_cents), 0) AS total_cents
       FROM finance_transactions
       GROUP BY kind`
    );

    const byHolder = await pool.query(
      `SELECT
         COALESCE(NULLIF(TRIM(holder_name), ''), 'Non specificato') AS holder_name,
         COALESCE(SUM(CASE WHEN kind IN ('SPONSOR', 'REGISTRATION') THEN amount_cents ELSE -amount_cents END), 0) AS net_cents
       FROM finance_transactions
       GROUP BY COALESCE(NULLIF(TRIM(holder_name), ''), 'Non specificato')
       ORDER BY net_cents DESC`
    );

    const incomeCents = Number(totals.rows[0].income_cents);
    const expenseCents = Number(totals.rows[0].expense_cents);

    res.json({
      income_cents: incomeCents,
      expense_cents: expenseCents,
      net_cents: incomeCents - expenseCents,
      by_kind: byKind.rows.map((r) => ({
        kind: r.kind,
        total_cents: Number(r.total_cents)
      })),
      by_holder: byHolder.rows.map((r) => ({
        holder_name: r.holder_name,
        net_cents: Number(r.net_cents)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/transactions', [auth, admin], async (req, res) => {
  try {
    const {
      kind,
      amount,
      currency,
      occurred_at,
      source_name,
      holder_name,
      spent_by,
      description
    } = req.body || {};

    const allowedKinds = new Set(['SPONSOR', 'REGISTRATION', 'EXPENSE']);
    if (!allowedKinds.has(kind)) {
      return res.status(400).json({ message: 'Invalid kind' });
    }

    const amountCents = parseAmountToCents(amount);
    if (amountCents === null || amountCents < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const cur = (currency || 'EUR').toUpperCase().slice(0, 3);
    if (!/^[A-Z]{3}$/.test(cur)) {
      return res.status(400).json({ message: 'Invalid currency' });
    }

    const result = await pool.query(
      `INSERT INTO finance_transactions
        (kind, amount_cents, currency, occurred_at, source_name, holder_name, spent_by, description, created_by_user_id)
       VALUES ($1, $2, $3, COALESCE($4, NOW()), $5, $6, $7, $8, $9)
       RETURNING id, kind, amount_cents, currency, occurred_at, source_name, holder_name, spent_by, description, created_by_user_id, created_at`,
      [
        kind,
        amountCents,
        cur,
        occurred_at || null,
        source_name || null,
        holder_name || null,
        spent_by || null,
        description || null,
        req.user?.id || null
      ]
    );

    res.status(201).json(formatRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/transactions/:id', [auth, admin], async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const deleted = await pool.query(
      'DELETE FROM finance_transactions WHERE id = $1 RETURNING id',
      [id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
