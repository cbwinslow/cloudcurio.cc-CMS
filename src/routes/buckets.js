const express = require('express');
const router = express.Router();
const bucketController = require('../controllers/bucketController');

router.get('/', bucketController.getAllBuckets);
router.get('/:id', bucketController.getBucket);
router.get('/:id/stats', bucketController.getBucketStats);
router.post('/', bucketController.createBucket);
router.put('/:id', bucketController.updateBucket);
router.delete('/:id', bucketController.deleteBucket);

module.exports = router;
