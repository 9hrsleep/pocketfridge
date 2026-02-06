import express from 'express';
import { dbRun, dbGet, dbAll } from '../database/db.js';

const router = express.Router();

// Get all fridges
router.get('/', async (req, res) => {
  try {
    const fridges = await dbAll('SELECT * FROM fridges ORDER BY created_at DESC');
    res.json(fridges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single fridge by ID
router.get('/:id', async (req, res) => {
  try {
    const fridge = await dbGet('SELECT * FROM fridges WHERE id = ?', [
      req.params.id,
    ]);
    if (!fridge) {
      return res.status(404).json({ error: 'Fridge not found' });
    }
    res.json(fridge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new fridge
router.post('/', async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Fridge name is required' });
    }

    const result = await dbRun(
      'INSERT INTO fridges (name, location) VALUES (?, ?)',
      [name, location || null]
    );

    const newFridge = await dbGet('SELECT * FROM fridges WHERE id = ?', [
      result.lastID,
    ]);
    res.status(201).json(newFridge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a fridge
router.put('/:id', async (req, res) => {
  try {
    const { name, location } = req.body;
    await dbRun(
      'UPDATE fridges SET name = ?, location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, location, req.params.id]
    );

    const updatedFridge = await dbGet('SELECT * FROM fridges WHERE id = ?', [
      req.params.id,
    ]);
    if (!updatedFridge) {
      return res.status(404).json({ error: 'Fridge not found' });
    }
    res.json(updatedFridge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a fridge
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM fridges WHERE id = ?', [
      req.params.id,
    ]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Fridge not found' });
    }
    res.json({ message: 'Fridge deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all items in a fridge
router.get('/:id/items', async (req, res) => {
  try {
    const items = await dbAll(
      'SELECT * FROM items WHERE fridge_id = ? ORDER BY expiry_date ASC',
      [req.params.id]
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
