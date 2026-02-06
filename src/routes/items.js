import express from 'express';
import { dbRun, dbGet, dbAll } from '../database/db.js';

const router = express.Router();

// Get items expiring soon (within specified days) - must be before /:id
router.get('/expiring/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const items = await dbAll(
      `SELECT * FROM items 
       WHERE expiry_date IS NOT NULL 
       AND DATE(expiry_date) <= DATE('now', '+' || ? || ' days')
       ORDER BY expiry_date ASC`,
      [days]
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await dbAll('SELECT * FROM items ORDER BY expiry_date ASC');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await dbGet('SELECT * FROM items WHERE id = ?', [
      req.params.id,
    ]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new item
router.post('/', async (req, res) => {
  try {
    const { fridge_id, name, quantity, unit, category, expiry_date, notes } =
      req.body;

    if (!fridge_id || !name) {
      return res
        .status(400)
        .json({ error: 'Fridge ID and item name are required' });
    }

    const result = await dbRun(
      `INSERT INTO items (fridge_id, name, quantity, unit, category, expiry_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        fridge_id,
        name,
        quantity || 1,
        unit || null,
        category || null,
        expiry_date || null,
        notes || null,
      ]
    );

    const newItem = await dbGet('SELECT * FROM items WHERE id = ?', [
      result.lastID,
    ]);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an item
router.put('/:id', async (req, res) => {
  try {
    const { name, quantity, unit, category, expiry_date, notes } = req.body;

    await dbRun(
      `UPDATE items 
       SET name = ?, quantity = ?, unit = ?, category = ?, 
           expiry_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, quantity, unit, category, expiry_date, notes, req.params.id]
    );

    const updatedItem = await dbGet('SELECT * FROM items WHERE id = ?', [
      req.params.id,
    ]);
    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an item
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM items WHERE id = ?', [
      req.params.id,
    ]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
