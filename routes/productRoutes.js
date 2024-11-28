const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const productController = require('../controllers/productController');
const router = express.Router();

// Đảm bảo thư mục 'uploads/' tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Thư mục lưu trữ tệp tin
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Giữ nguyên tên gốc của tệp tin
    }
});


// Chỉ chấp nhận các tệp hình ảnh
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'));
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
});

// Middleware xử lý lỗi Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Định nghĩa các route
router.get('/', productController.getAllProducts);
router.post('/', upload.single('image'), handleMulterError, productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
