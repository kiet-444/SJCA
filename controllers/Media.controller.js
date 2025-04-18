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

        cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
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

const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the media in the database to get the Cloudinary public_id
        const media = await Media.findOne({ id }); // change (id) to ({id}) and use findOne instead of findById
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Delete the file from Cloudinary
        cloudinary.uploader.destroy(media.id, async (error, result) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to delete media from Cloudinary' });
            }

            // Only delete from the database if Cloudinary deletion succeeded
            await Media.deleteOne({ id }); // change (id) to ({id}) and use deleteOne instead of deleteById
            res.status(200).json({ message: 'Media deleted successfully from database and Cloudinary' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete media', error });
    }
};

module.exports = {
    upload, 
    deleteMedia
};