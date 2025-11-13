import express from 'express'
import TouristActivitiesController from '../controllers/touristActivitiesController.js'

const router = express.Router()

router.get('/tourist_activities', TouristActivitiesController.findAllTouristActivitiesController)
router.get('/tourist_activities/:id_activity', TouristActivitiesController.findTouristActivitiesByIdController)
router.post('/tourist_activities/register', TouristActivitiesController.createTouristActivitiesController)  
router.delete('/tourist_activities/delete/:id_activity', TouristActivitiesController.deleteTouristActivitiesController)

export default router