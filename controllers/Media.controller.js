const { PassThrough } = require('stream');
const cloudinary = require('../config/cloudinary.config');

const upload = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadResults = [];

        for (const key in req.files) {
            const file = req.files[key][0]; 
            const { buffer, mimetype } = file;

            const bufferStream = new PassThrough();
            bufferStream.end(buffer);

            const resourceType = mimetype.startsWith('image') ? 'image' : 'raw';

            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: resourceType },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            uploadResults.push({
                field: key,
                id: result.public_id,
                name: result.original_filename,
                url: result.secure_url,
                created_at: result.created_at
            });
        }

        return res.status(200).json({ uploaded: uploadResults });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        await cloudinary.uploader.destroy(id);
        res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    upload,
    deleteMedia
};
