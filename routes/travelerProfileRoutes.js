import express from 'express'
import travelerProfileController from '../controllers/travelerProfileController.js'

const router = express.Router()

router.get('/profiles', travelerProfileController.findAllTravelerProfileController)
router.get('/profiles/:id_profile', travelerProfileController.findTravelerProfileByIdController)
router.post('/profiles/register', travelerProfileController.createTravelerProfileController)
router.put('/profiles/update/:id_profile', travelerProfileController.updateTravelerProfileController)
router.delete('/profiles/delete/:id_profile', travelerProfileController.deleteTravelerProfileController)

export default router