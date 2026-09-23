const express = require('express');
const {
  getCompetitionDetails,
  registerForCompetition,
  submitForCompetition,
  getWinners,
} = require('../controllers/competitionController');
const {
  validateGetDetails,
  validateRegister,
  validateSubmit,
  validateWinners,
} = require('../middlewares/validate');

const router = express.Router();

router.get('/:id', validateGetDetails, getCompetitionDetails);
router.post('/:id/register', validateRegister, registerForCompetition);
router.post('/:id/submit', validateSubmit, submitForCompetition);
router.get('/:id/winners', validateWinners, getWinners);

module.exports = router;
