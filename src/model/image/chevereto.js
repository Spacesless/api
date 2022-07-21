module.exports = class extends think.Model {
  getAlbumId(albumName) {
    this.model('albums')
      .field('album_id,album_image_count')
      .where({ album_name: albumName })
      .find();
  }

  getRandomImage(albumId, offset) {
    this.model('images')
      .field('image_size,image_width,image_height,image_date,image_original_filename')
      .where({ album_id: albumId })
      .limit(offset, 1)
      .select();
  }
};
