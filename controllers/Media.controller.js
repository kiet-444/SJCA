const { PassThrough } = require('stream');
const cloudinary = require('../config/cloudinary.config');

const upload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.files[0];
        const { buffer } = file;

        const bufferStream = new PassThrough();
        bufferStream.end(buffer);

        const resourceType = file.mimetype.startsWith('image') ? 'image' : 'raw';

        cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ error: error.message });
                }
                // console.log('check',result);
                try {
                    const media = new Media({
                        id: result.public_id,
                        name: result.original_filename,
                        url: result.secure_url,
                        created_at: result.created_at
                    });

                    await media.save();
                    return res.json({
                        id: result.public_id,
                        name: result.original_filename,
                        url: result.secure_url,
                        created_at: result.created_at
                    });
                } catch (dbError) {
                    console.error('Error saving media to database:', dbError);
                    return res.status(500).json({ error: 'Error saving media to database' });
                }
            }
        ).end(buffer);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.buffer) return reject(new Error('Invalid file'));

        const bufferStream = new PassThrough();
        bufferStream.end(file.buffer);

        const resourceType = file.mimetype.startsWith('image') ? 'image' : 'raw';

        cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                else return resolve(result.secure_url); 
            }
        ).end(file.buffer);
    });
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
    uploadFile,
    deleteMedia
};
