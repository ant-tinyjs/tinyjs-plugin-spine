import { newFloatArray, arrayCopy } from '../utils';

/**
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const AttachmentType = {
  Region: 0,
  BoundingBox: 1,
  Mesh: 2,
  LinkedMesh: 3,
  Path: 4,
  Point: 5,
  Clipping: 6,
};

/**
 * The base class for all attachments.
 *
 * @class
 * @memberof Tiny.spine
 */
class Attachment {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    if (name == null) {
      throw new Error('name cannot be null.');
    }
    /**
     * @member {string}
     */
    this.name = name;
  }
}

/**
 * Base class for an attachment with vertices that are transformed by one or more bones and can be deformed by a slot's
 * {@link Tiny.spine.Slot#deform}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.Attachment
 */
class VertexAttachment extends Attachment {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name);

    /**
     * The unique ID for this attachment.
     *
     * @member {number}
     */
    this.id = (VertexAttachment.nextID++ & 65535) << 11;

    /**
     * The bones which affect the {@link Tiny.spine.VertexAttachment#vertices}. The array entries are, for each vertex, the number of bones affecting
     * the vertex followed by that many bone indices, which is the index of the bone in {@link Tiny.spine.Skeleton#bones}. Will be null
     * if this attachment has no weights.
     *
     * @name bones
     * @type {number[]}
     * @memberof Tiny.spine.VertexAttachment.prototype
     */

    /**
     * The vertex positions in the bone's coordinate system. For a non-weighted attachment, the values are `x,y`
     * entries for each vertex. For a weighted attachment, the values are `x,y,weight` entries for each bone affecting
     * each vertex.
     *
     * @name vertices
     * @type {number[]}
     * @memberof Tiny.spine.VertexAttachment.prototype
     */

    /**
     * The maximum number of world vertex values that can be output by
     * {@link Tiny.spine.VertexAttachment#computeWorldVertices} using the `count` parameter.
     *
     * @member {number}
     * @default 0
     */
    this.worldVerticesLength = 0;

    /**
     * Deform keys for the deform attachment are also applied to this attachment. May be null if no deform keys should be applied.
     *
     * @member {Tiny.spine.VertexAttachment}
     */
    this.deformAttachment = this;
  }

  computeWorldVerticesOld(slot, worldVertices) {
    this.computeWorldVertices(slot, 0, this.worldVerticesLength, worldVertices, 0, 2);
  }

  /**
   * Transforms the attachment's local {@link Tiny.spine.VertexAttachment#vertices} to world coordinates. If the slot's {@link Tiny.spine.Slot#deform} is
   * not empty, it is used to deform the vertices.
   *
   * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
   * Runtimes Guide.
   *
   * @param {Tiny.spine.Slot} slot
   * @param {number} start - The index of the first {@link Tiny.spine.VertexAttachment#vertices} value to transform. Each vertex has 2 values, x and y.
   * @param {number} count - The number of world vertex values to output. Must be <= {@link Tiny.spine.VertexAttachment#worldVerticesLength} - `start`.
   * @param {number[]} worldVertices - The output world vertices. Must have a length >= `offset` + `count` * `stride` / 2.
   * @param {number} offset - The `worldVertices` index to begin writing values.
   * @param {number} stride - The number of `worldVertices` entries between the value pairs written.
   */
  computeWorldVertices(slot, start, count, worldVertices, offset, stride) {
    count = offset + (count >> 1) * stride;

    const skeleton = slot.bone.skeleton;
    const deformArray = slot.deform;
    let vertices = this.vertices;
    const bones = this.bones;

    if (bones == null) {
      if (deformArray.length > 0) {
        vertices = deformArray;
      }

      const mat = slot.bone.matrix;
      const x = mat.tx;
      const y = mat.ty;
      const a = mat.a;
      const b = mat.c;
      const c = mat.b;
      const d = mat.d;

      for (let v = start, w = offset; w < count; v += 2, w += stride) {
        const vx = vertices[v];
        const vy = vertices[v + 1];

        worldVertices[w] = vx * a + vy * b + x;
        worldVertices[w + 1] = vx * c + vy * d + y;
      }
      return;
    }

    let v = 0;
    let skip = 0;

    for (let i = 0; i < start; i += 2) {
      const n = bones[v];

      v += n + 1;
      skip += n;
    }

    let skeletonBones = skeleton.bones;

    if (deformArray.length === 0) {
      for (let w = offset, b = skip * 3; w < count; w += stride) {
        let wx = 0;
        let wy = 0;
        let n = bones[v++];

        n += v;
        for (; v < n; v++, b += 3) {
          const mat = skeletonBones[bones[v]].matrix;
          const vx = vertices[b];
          const vy = vertices[b + 1];
          const weight = vertices[b + 2];

          wx += (vx * mat.a + vy * mat.c + mat.tx) * weight;
          wy += (vx * mat.b + vy * mat.d + mat.ty) * weight;
        }
        worldVertices[w] = wx;
        worldVertices[w + 1] = wy;
      }
    } else {
      const deform = deformArray;

      for (let w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
        let wx = 0;
        let wy = 0;
        let n = bones[v++];

        n += v;
        for (; v < n; v++, b += 3, f += 2) {
          const mat = skeletonBones[bones[v]].matrix;
          const vx = vertices[b] + deform[f];
          const vy = vertices[b + 1] + deform[f + 1];
          const weight = vertices[b + 2];

          wx += (vx * mat.a + vy * mat.c + mat.tx) * weight;
          wy += (vx * mat.b + vy * mat.d + mat.ty) * weight;
        }
        worldVertices[w] = wx;
        worldVertices[w + 1] = wy;
      }
    }
  }

  /**
   * Does not copy id (generated) or name (set on construction)
   *
   * @param {Tiny.spine.VertexAttachment} attachment
   */
  copyTo(attachment) {
    if (this.bones != null) {
      attachment.bones = new Array(this.bones.length);
      arrayCopy(this.bones, 0, attachment.bones, 0, this.bones.length);
    } else {
      attachment.bones = null;
    }

    if (this.vertices != null) {
      attachment.vertices = newFloatArray(this.vertices.length);
      arrayCopy(this.vertices, 0, attachment.vertices, 0, this.vertices.length);
    } else {
      attachment.vertices = null;
    }

    attachment.worldVerticesLength = this.worldVerticesLength;
    attachment.deformAttachment = this.deformAttachment;
  }
}

/**
 * @private
 */
VertexAttachment.nextID = 0;

export {
  Attachment,
  VertexAttachment,
  AttachmentType,
};
