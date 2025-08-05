import express from 'express';
import { createEvent, deleteEvent, getEvent, getEvents, getTags, rsvpEvent, updateEvent } from '../controllers/eventController.js';

const router = express.Router();

router.post(
  '/', createEvent
);
router.get('/tags', getTags);
router.post('/:id/rsvp', rsvpEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);


export default router;