import RegionAttachment from './attachments/RegionAttachment';
import MeshAttachment from './attachments/MeshAttachment';
import BoundingBoxAttachment from './attachments/BoundingBoxAttachment';
import PathAttachment from './attachments/PathAttachment';
import PointAttachment from './attachments/PointAttachment';
import ClippingAttachment from './attachments/ClippingAttachment';

/**
 * @name AttachmentLoader
 * @memberof Tiny.spine
 * @interface
 */
/**
 * @function
 * @name Tiny.spine.AttachmentLoader#newRegionAttachment
 * @param {Tiny.spine.Skin} skin
 * @param {string} name
 * @param {string} path
 * @return {?Tiny.spine.RegionAttachment}
 */
/**
 * @function
 * @name Tiny.spine.AttachmentLoader#newMeshAttachment
 * @param {Tiny.spine.Skin} skin
 * @param {string} name
 * @param {string} path
 * @return {?Tiny.spine.MeshAttachment}
 */
/**
 * @function
 * @name Tiny.spine.AttachmentLoader#newBoundingBoxAttachment
 * @param {Tiny.spine.Skin} skin
 * @param {string} name
 * @return {?Tiny.spine.BoundingBoxAttachment}
 */
/**
 * @function
 * @name Tiny.spine.AttachmentLoader#newPathAttachment
 * @param {Tiny.spine.Skin} skin
 * @param {string} name
 * @return {?Tiny.spine.PathAttachment}
 */
/**
 * @function
 * @name Tiny.spine.AttachmentLoader#newPointAttachment
 * @param {Tiny.spine.Skin} skin
 * @param {string} name
 * @return {?Tiny.spine.PointAttachment}
 */
/**
 * @function
 * @name Tiny.spine.AttachmentLoader#newClippingAttachment
 * @param {Tiny.spine.Skin} skin
 * @param {string} name
 * @return {?Tiny.spine.ClippingAttachment}
 */

/**
 * An {@link Tiny.spine.AttachmentLoader} that configures attachments using texture regions from an {@link Tiny.spine.TextureAtlas}.
 *
 * See [Loading skeleton data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the
 * Spine Runtimes Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @implements {Tiny.spine.AttachmentLoader}
 */
class AtlasAttachmentLoader {
  /**
   *
   * @param {Tiny.spine.TextureAtlas} atlas
   */
  constructor(atlas) {
    /**
     * @type {Tiny.spine.TextureAtlas}
     */
    this.atlas = atlas;
  }

  /**
   *
   * @param {Tiny.spine.Skin} skin
   * @param {string} name
   * @param {string} path
   * @return {?Tiny.spine.RegionAttachment}
   */
  newRegionAttachment(skin, name, path) {
    const region = this.atlas.findRegion(path);

    if (region == null) {
      throw new Error(`Region not found in atlas: ${path} (region attachment: ${name})`);
    }

    const attachment = new RegionAttachment(name);

    attachment.region = region;
    return attachment;
  }

  /**
   *
   * @param {Tiny.spine.Skin} skin
   * @param {string} name
   * @param {string} path
   * @return {?Tiny.spine.MeshAttachment}
   */
  newMeshAttachment(skin, name, path) {
    const region = this.atlas.findRegion(path);

    if (region == null) {
      throw new Error(`Region not found in atlas: ${path} (mesh attachment: ${name})`);
    }

    const attachment = new MeshAttachment(name);

    attachment.region = region;

    return attachment;
  }

  /**
   *
   * @param {Tiny.spine.Skin} skin
   * @param {string} name
   * @return {?Tiny.spine.BoundingBoxAttachment}
   */
  newBoundingBoxAttachment(skin, name) {
    return new BoundingBoxAttachment(name);
  }

  /**
   *
   * @param {Tiny.spine.Skin} skin
   * @param {string} name
   * @return {?Tiny.spine.PathAttachment}
   */
  newPathAttachment(skin, name) {
    return new PathAttachment(name);
  }

  /**
   *
   * @param {Tiny.spine.Skin} skin
   * @param {string} name
   * @return {?Tiny.spine.PointAttachment}
   */
  newPointAttachment(skin, name) {
    return new PointAttachment(name);
  }

  /**
   *
   * @param {Tiny.spine.Skin} skin
   * @param {string} name
   * @return {?Tiny.spine.ClippingAttachment}
   */
  newClippingAttachment(skin, name) {
    return new ClippingAttachment(name);
  }
}

export {
  AtlasAttachmentLoader,
};
