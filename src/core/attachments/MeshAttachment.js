import { VertexAttachment } from './Attachment';
import { Color, newFloatArray, arrayCopy } from '../utils';

/**
 * An attachment that displays a textured mesh. A mesh has hull vertices and internal vertices within the hull. Holes are not
 * supported. Each vertex has UVs (texture coordinates) and triangles are used to map an image on to the mesh.
 *
 * See [Mesh attachments](http://esotericsoftware.com/spine-meshes) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.VertexAttachment
 */
class MeshAttachment extends VertexAttachment {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name);

    /**
     * @name region
     * @type {Tiny.spine.TextureRegion}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * The name of the texture region for this attachment.
     *
     * @name path
     * @type {string}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * The UV pair for each vertex, normalized within the texture region.
     *
     * @name regionUVs
     * @type {number[]}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * Triplets of vertex indices which describe the mesh's triangulation.
     *
     * @name triangles
     * @type {number[]}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * The width of the mesh's image. Available only when nonessential data was exported.
     *
     * @name width
     * @type {number}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * The height of the mesh's image. Available only when nonessential data was exported.
     *
     * @name height
     * @type {number}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * The number of entries at the beginning of {@link #vertices} that make up the mesh hull.
     *
     * @name hullLength
     * @type {number}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * Vertex index pairs describing edges for controling triangulation. Mesh triangles will never cross edges. Only available if
     * nonessential data was exported. Triangulation is not performed at runtime.
     *
     * @name edges
     * @type {number[]}
     * @memberof Tiny.spine.MeshAttachment.prototype
     */
    /**
     * @name parentMesh
     * @type {Tiny.spine.Attachment}
     * @memberof Tiny.spine.MeshAttachment.prototype
     * @private
     */

    /**
     * The color to tint the mesh.
     *
     * @type {Tiny.spine.Color}
     */
    this.color = new Color(1, 1, 1, 1);
    /**
     * @type {Tiny.spine.Color}
     */
    this.tempColor = new Color(0, 0, 0, 0);
  }

  /**
   * Calculates uvs using {@link Tiny.spine.MeshAttachment#regionUVs} and the {@link Tiny.spine.MeshAttachment#region}. Must be called after changing the region UVs or
   * region.
   *
   * @param {Tiny.spine.TextureRegion} region
   * @param {number[]} uvs
   */
  updateUVs(region, uvs) {
    const regionUVs = this.regionUVs;
    const n = regionUVs.length;

    if (!uvs || uvs.length !== n) {
      uvs = newFloatArray(n);
    }

    if (region == null) {
      return;
    }

    const texture = region.texture;
    const r = texture._uvs;
    const w1 = region.width;
    const h1 = region.height;
    const w2 = region.originalWidth;
    const h2 = region.originalHeight;
    const x = region.offsetX;
    const y = region.tinyOffsetY;

    for (let i = 0; i < n; i += 2) {
      let u = this.regionUVs[i];
      let v = this.regionUVs[i + 1];

      u = (u * w2 - x) / w1;
      v = (v * h2 - y) / h1;
      uvs[i] = (r.x0 * (1 - u) + r.x1 * u) * (1 - v) + (r.x3 * (1 - u) + r.x2 * u) * v;
      uvs[i + 1] = (r.y0 * (1 - u) + r.y1 * u) * (1 - v) + (r.y3 * (1 - u) + r.y2 * u) * v;
    }

    return uvs;
  }

  /**
   * The parent mesh if this is a linked mesh, else null. A linked mesh shares the {@link Tiny.spine.MeshAttachment#bones}, {@link Tiny.spine.MeshAttachment#vertices},
   * {@link Tiny.spine.MeshAttachment#regionUVs}, {@link Tiny.spine.MeshAttachment#triangles}, {@link Tiny.spine.MeshAttachment#hullLength}, {@link Tiny.spine.MeshAttachment#edges}, {@link Tiny.spine.MeshAttachment#width}, and {@link Tiny.spine.MeshAttachment#height} with the
   * parent mesh, but may have a different {@link Tiny.spine.MeshAttachment#name} or {@link Tiny.spine.MeshAttachment#path} (and therefore a different texture).
   *
   * @return {Tiny.spine.Attachment}
   */
  getParentMesh() {
    return this.parentMesh;
  }

  /**
   *
   * @param {?Tiny.spine.Attachment} parentMesh
   */
  setParentMesh(parentMesh) {
    this.parentMesh = parentMesh;
    if (parentMesh != null) {
      this.bones = parentMesh.bones;
      this.vertices = parentMesh.vertices;
      this.regionUVs = parentMesh.regionUVs;
      this.triangles = parentMesh.triangles;
      this.hullLength = parentMesh.hullLength;
      this.worldVerticesLength = parentMesh.worldVerticesLength;
    }
  }

  /**
   * @return {Tiny.spine.Attachment}
   */
  copy() {
    if (this.parentMesh != null) {
      return this.newLinkedMesh();
    }

    const copy = new MeshAttachment(this.name);

    copy.region = this.region;
    copy.path = this.path;
    copy.color.setFromColor(this.color);

    this.copyTo(copy);
    copy.regionUVs = new Float32Array(this.regionUVs.length);
    arrayCopy(this.regionUVs, 0, copy.regionUVs, 0, this.regionUVs.length);
    copy.uvs = new Array(this.uvs.length);
    arrayCopy(this.uvs, 0, copy.uvs, 0, this.uvs.length);
    copy.triangles = new Array(this.triangles.length);
    arrayCopy(this.triangles, 0, copy.triangles, 0, this.triangles.length);
    copy.hullLength = this.hullLength;

    // Nonessential.
    if (this.edges != null) {
      copy.edges = new Array(this.edges.length);
      arrayCopy(this.edges, 0, copy.edges, 0, this.edges.length);
    }
    copy.width = this.width;
    copy.height = this.height;

    return copy;
  }

  /**
   * Returns a new mesh with the {@link Tiny.spine.MeshAttachment#parentMesh} set to this mesh's parent mesh, if any, else to this mesh.
   *
   * @return {Tiny.spine.MeshAttachment}
   */
  newLinkedMesh() {
    const copy = new MeshAttachment(this.name);

    copy.region = this.region;
    copy.path = this.path;
    copy.color.setFromColor(this.color);
    copy.deformAttachment = this.deformAttachment;
    copy.setParentMesh(this.parentMesh != null ? this.parentMesh : this);
    // copy.updateUVs();
    return copy;
  }
}

export default MeshAttachment;
