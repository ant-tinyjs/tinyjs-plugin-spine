/* eslint-disable no-useless-constructor */
import mesh from 'tinyjs-plugin-mesh';
import { TextureRegion, Bone, Skeleton, AnimationStateData, AnimationState, RegionAttachment, MeshAttachment, ClippingAttachment, degRad } from './core';

Bone.yDown = true;
let tempRgb = [0, 0, 0];

/**
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.Spine
 */
class SpineSprite extends Tiny.Sprite {
  /**
   *
   * @param {Tiny.Texture} texture
   */
  constructor(texture) {
    super(texture);
    /**
     * @type {Tiny.spine.TextureRegion}
     * @default null
     */
    this.region = null;
  }
}

/**
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.mesh.Mesh
 */
class SpineMesh extends mesh.Mesh {
  /**
   *
   * @param {Tiny.Texture} texture
   * @param {Float32Array} vertices
   * @param {Float32Array} uvs
   * @param {Uint16Array} indices
   * @param {number} drawMode
   */
  constructor(texture, vertices, uvs, indices, drawMode) {
    /**
     * @name region
     * @memberof Tiny.spine.SpineMesh.prototype
     * @type {Tiny.spine.TextureRegion}
     */
    super(texture, vertices, uvs, indices, drawMode);
  }
}

/**
 * A class that enables the you to import and run your spine animations in TinyJS.
 * The Spine animation data needs to be loaded using either the Loader or a SpineLoader before it can be used by this class
 *
 * @example
 * let spineAnimation = new Tiny.spine.Spine(spineData);
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.Container
 */
class Spine extends Tiny.Container {
  /**
   *
   * @param {object} spineData - The spine data loaded from a spine atlas.
   */
  constructor(spineData) {
    super();

    if (!spineData) {
      throw new Error('The spineData param is required.');
    }

    if (typeof spineData === 'string') {
      throw new Error('spineData param cant be string. Please use spine.Spine.fromAtlas("YOUR_RESOURCE_NAME") from now on.');
    }

    /**
     * The spineData object
     *
     * @type {Tiny.spine.SkeletonData}
     */
    this.spineData = spineData;

    /**
     * A spine Skeleton object
     *
     * @type {Tiny.spine.Skeleton}
     */
    this.skeleton = new Skeleton(spineData);
    this.skeleton.updateWorldTransform();

    /**
     * A spine AnimationStateData object created from the spine data passed in the constructor
     *
     * @type {Tiny.spine.AnimationStateData}
     */
    this.stateData = new AnimationStateData(spineData);

    /**
     * A spine AnimationState object created from the spine AnimationStateData object
     *
     * @type {Tiny.spine.AnimationState}
     */
    this.state = new AnimationState(this.stateData);

    /**
     * @type {Tiny.Container[]}
     * @default []
     */
    this.slotContainers = [];
    /**
     * @type {Tiny.Container[]}
     * @default []
     */
    this.tempClipContainers = [];
    /**
     * @name localDelayLimit
     * @type {number}
     * @memberof Tiny.spine.Spine.prototype
     */
    /**
     * @name _visible
     * @private
     * @type {boolean}
     */
    /**
     * @protected
     * @name lastTime
     * @type {number}
     * @memberof Tiny.spine.Spine.prototype
     */

    for (let i = 0, n = this.skeleton.slots.length; i < n; i++) {
      const slot = this.skeleton.slots[i];
      const attachment = slot.getAttachment();
      const slotContainer = this.newContainer();

      this.slotContainers.push(slotContainer);
      this.addChild(slotContainer);
      this.tempClipContainers.push(null);

      if (attachment instanceof RegionAttachment) {
        const spriteName = attachment.region.name;
        const sprite = this.createSprite(slot, attachment, spriteName);

        slot.currentSprite = sprite;
        slot.currentSpriteName = spriteName;
        slotContainer.addChild(sprite);
      } else if (attachment instanceof MeshAttachment) {
        const mesh = this.createMesh(slot, attachment);

        slot.currentMesh = mesh;
        slot.currentMeshName = attachment.name;
        slotContainer.addChild(mesh);
      } else if (attachment instanceof ClippingAttachment) {
        this.createGraphics(slot, attachment);
        slotContainer.addChild(slot.clippingContainer);
        slotContainer.addChild(slot.currentGraphics);
      } else {
        continue;
      }
    }

    /**
     * Should the Spine object update its transforms
     *
     * @member {boolean}
     */
    this.autoUpdate = true;
    /**
     * The tint applied to all spine slots. This is a [r,g,b] value. A value of [1,1,1] will remove any tint effect.
     *
     * @member {number[]}
     */
    this.tintRgb = new Float32Array([1, 1, 1]);
  }
  /**
   * If this flag is set to true, the spine animation will be autoupdated every time
   * the object id drawn. The down side of this approach is that the delta time is
   * automatically calculated and you could miss out on cool effects like slow motion,
   * pause, skip ahead and the sorts. Most of these effects can be achieved even with
   * autoupdate enabled but are harder to achieve.
   *
   * @member {boolean}
   * @default true
   */
  get autoUpdate() {
    return (this.updateTransform === Spine.prototype.autoUpdateTransform);
  }

  set autoUpdate(value) {
    this.updateTransform = value ? Spine.prototype.autoUpdateTransform : Tiny.Container.prototype.updateTransform;
  }

  /**
   * The visibility of the spine object. If false the object will not be drawn,
   * the updateTransform function will not be called, and the spine will not be automatically updated.
   *
   * @member {boolean}
   * @default true
   */
  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (value !== this._visible) {
      this._visible = value;
      if (value) {
        this.lastTime = 0;
      }
    }
  }

  /**
   * The tint applied to the spine object. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
   *
   * @member {number}
   * @default 0xFFFFFF
   */
  get tint() {
    return Tiny.rgb2hex(this.tintRgb);
  }

  set tint(value) {
    this.tintRgb = Tiny.hex2rgb(value, this.tintRgb);
  }

  /**
   * Limit value for the update dt with Spine.globalDelayLimit
   * that can be overridden with localDelayLimit
   *
   * @member {number} - Maximum processed dt value for the update
   * @readonly
   */
  get delayLimit() {
    const limit = typeof this.localDelayLimit !== 'undefined' ? this.localDelayLimit : Spine.globalDelayLimit;

    // If limit is 0, this means there is no limit for the delay
    return limit || Number.MAX_VALUE;
  }

  /**
   * Update the spine skeleton and its animations by delta time (dt)
   *
   * @param {number} dt - Delta time. Time by which the animation should be updated
   */
  update(dt) {
    // Limit delta value to avoid animation jumps
    const delayLimit = this.delayLimit;

    if (dt > delayLimit) {
      dt = delayLimit;
    }

    this.state.update(dt);
    this.state.apply(this.skeleton);

    //check we haven't been destroyed via a spine event callback in state update
    if (!this.skeleton) {
      return;
    }

    this.skeleton.updateWorldTransform();

    const slots = this.skeleton.slots;
    const globalClr = this.color;
    let light = null;
    let dark = null;

    if (globalClr) {
      light = globalClr.light;
      dark = globalClr.dark;
    } else {
      light = this.tintRgb;
    }

    let thack = Tiny.TransformBase && (this.transformHack() === 1);

    for (let i = 0, n = slots.length; i < n; i++) {
      const slot = slots[i];
      const attachment = slot.getAttachment();
      const slotContainer = this.slotContainers[i];

      if (!attachment) {
        slotContainer.visible = false;
        continue;
      }

      let spriteColor = null;
      const attColor = attachment.color;

      if (attachment instanceof RegionAttachment) {
        const region = attachment.region;

        if (region) {
          if (slot.currentMesh) {
            slot.currentMesh.visible = false;
            slot.currentMesh = null;
            slot.currentMeshName = undefined;
          }

          const ar = region;

          if (!slot.currentSpriteName || slot.currentSpriteName !== ar.name) {
            const spriteName = ar.name;

            if (slot.currentSprite) {
              slot.currentSprite.visible = false;
            }
            slot.sprites = slot.sprites || {};
            if (slot.sprites[spriteName] !== undefined) {
              slot.sprites[spriteName].visible = true;
            } else {
              const sprite = this.createSprite(slot, attachment, spriteName);

              slotContainer.addChild(sprite);
            }
            slot.currentSprite = slot.sprites[spriteName];
            slot.currentSpriteName = spriteName;
          }
        }

        if (slotContainer.transform) {
          //TODO: refactor this thing, switch it on and off for container
          let transform = slotContainer.transform;
          const transAny = transform;
          let lt = null;

          if (transAny.matrix2d) {
            //gameofbombs pixi fork, sorry for that, we really use it :)
            lt = transAny.matrix2d;
            transAny._dirtyVersion++;
            transAny.version = transAny._dirtyVersion;
            transAny.isStatic = true;
            transAny.operMode = 0;
          } else {
            if (thack) {
              if (transAny.position) {
                //TODO: refactor this shit
                transform = new Tiny.TransformBase();
                transform._parentID = -1;
                transform._worldID = slotContainer.transform._worldID;
                slotContainer.transform = transform;
              }
              lt = transform.localTransform;
            } else {
              // if (transAny.autoUpdateLocal) {
              //     transAny.autoUpdateLocal = false;
              // }
              transAny.setFromMatrix(slot.bone.matrix);
            }
          }
          if (lt) {
            slot.bone.matrix.copy(lt);
          }
        }
        if (slot.currentSprite.color) {
          //YAY! double - tint!
          spriteColor = slot.currentSprite.color;
        } else {
          tempRgb[0] = light[0] * slot.color.r * attColor.r;
          tempRgb[1] = light[1] * slot.color.g * attColor.g;
          tempRgb[2] = light[2] * slot.color.b * attColor.b;
          slot.currentSprite.tint = Tiny.rgb2hex(tempRgb);
        }
        slot.currentSprite.blendMode = slot.blendMode;
      } else if (attachment instanceof MeshAttachment) {
        if (slot.currentSprite) {
          //TODO: refactor this thing, switch it on and off for container
          slot.currentSprite.visible = false;
          slot.currentSprite = null;
          slot.currentSpriteName = undefined;

          if (slotContainer.transform) {
            //TODO: refactor this shit
            const transform = new Tiny.TransformStatic();

            transform._parentID = -1;
            transform._worldID = slotContainer.transform._worldID;
            slotContainer.transform = transform;
          } else {
            slotContainer.localTransform = new Tiny.Matrix();
            slotContainer.displayObjectUpdateTransform = Tiny.DisplayObject.prototype.updateTransform;
          }
        }
        if (!slot.currentMeshName || slot.currentMeshName !== attachment.name) {
          const meshName = attachment.name;

          if (slot.currentMesh) {
            slot.currentMesh.visible = false;
          }

          slot.meshes = slot.meshes || {};

          if (slot.meshes[meshName] !== undefined) {
            slot.meshes[meshName].visible = true;
          } else {
            const mesh = this.createMesh(slot, attachment);

            slotContainer.addChild(mesh);
          }

          slot.currentMesh = slot.meshes[meshName];
          slot.currentMeshName = meshName;
        }
        attachment.computeWorldVerticesOld(slot, slot.currentMesh.vertices);

        if (slot.currentMesh.color) {
          spriteColor = slot.currentMesh.color;
        }

        const tintRgb = slot.currentMesh.tintRgb;

        tintRgb[0] = light[0] * slot.color.r * attColor.r;
        tintRgb[1] = light[1] * slot.color.g * attColor.g;
        tintRgb[2] = light[2] * slot.color.b * attColor.b;
        slot.currentMesh.blendMode = slot.blendMode;
      } else if (attachment instanceof ClippingAttachment) {
        if (!slot.currentGraphics) {
          this.createGraphics(slot, attachment);
          slotContainer.addChild(slot.clippingContainer);
          slotContainer.addChild(slot.currentGraphics);
        }
        this.updateGraphics(slot, attachment);
      } else {
        slotContainer.visible = false;
        continue;
      }
      slotContainer.visible = true;

      // pixi has double tint
      if (spriteColor) {
        let r0 = slot.color.r * attColor.r;
        let g0 = slot.color.g * attColor.g;
        let b0 = slot.color.b * attColor.b;

        //YAY! double-tint!
        spriteColor.setLight(
          light[0] * r0 + dark[0] * (1.0 - r0),
          light[1] * g0 + dark[1] * (1.0 - g0),
          light[2] * b0 + dark[2] * (1.0 - b0),
        );
        if (slot.darkColor) {
          r0 = slot.darkColor.r;
          g0 = slot.darkColor.g;
          b0 = slot.darkColor.b;
        } else {
          r0 = 0.0;
          g0 = 0.0;
          b0 = 0.0;
        }
        spriteColor.setDark(
          light[0] * r0 + dark[0] * (1 - r0),
          light[1] * g0 + dark[1] * (1 - g0),
          light[2] * b0 + dark[2] * (1 - b0),
        );
      }

      slotContainer.alpha = slot.color.a;
    }

    //== this is clipping implementation ===
    //TODO: remove parent hacks when pixi masks allow it
    const drawOrder = this.skeleton.drawOrder;
    let clippingAttachment = null;
    let clippingContainer = null;

    for (let i = 0, n = drawOrder.length; i < n; i++) {
      const slot = slots[drawOrder[i].data.index];
      const slotContainer = this.slotContainers[drawOrder[i].data.index];

      if (!clippingContainer) {
        //Adding null check as it is possible for slotContainer.parent to be null in the event of a spine being disposed off in its loop callback
        if (slotContainer.parent !== null && slotContainer.parent !== this) {
          slotContainer.parent.removeChild(slotContainer);
          //silend add hack
          slotContainer.parent = this;
        }
      }
      if (slot.currentGraphics && slot.getAttachment()) {
        clippingContainer = slot.clippingContainer;
        clippingAttachment = slot.getAttachment();
        clippingContainer.children.length = 0;
        this.children[i] = slotContainer;

        if (clippingAttachment.endSlot === slot.data) {
          clippingAttachment.endSlot = null;
        }
      } else {
        if (clippingContainer) {
          let c = this.tempClipContainers[i];

          if (!c) {
            c = this.tempClipContainers[i] = this.newContainer();
            c.visible = false;
          }
          this.children[i] = c;

          //silent remove hack
          slotContainer.parent = null;
          clippingContainer.addChild(slotContainer);
          if (clippingAttachment.endSlot === slot.data) {
            clippingContainer.renderable = true;
            clippingContainer = null;
            clippingAttachment = null;
          }
        } else {
          this.children[i] = slotContainer;
        }
      }
    }
  }

  /**
   * @private
   * @param {Tiny.spine.RegionAttachment} attachment
   * @param {Tiny.spine.SpineSprite} sprite
   * @param {Tiny.spine.TextureRegion} region
   */
  setSpriteRegion(attachment, sprite, region) {
    sprite.region = region;
    sprite.texture = region.texture;
    if (!region.size) {
      sprite.scale.x = attachment.scaleX * attachment.width / region.originalWidth;
      sprite.scale.y = -attachment.scaleY * attachment.height / region.originalHeight;
    } else {
      //hacked!
      sprite.scale.x = region.size.width / region.originalWidth;
      sprite.scale.y = -region.size.height / region.originalHeight;
    }
  }

  /**
   * @private
   * @param {Tiny.spine.MeshAttachment} attachment
   * @param {Tiny.spine.SpineMesh} mesh
   * @param {Tiny.spine.TextureRegion} region
   */
  setMeshRegion(attachment, mesh, region) {
    mesh.region = region;
    mesh.texture = region.texture;
    region.texture._updateUvs();
    attachment.updateUVs(region, mesh.uvs);
    mesh.dirty++;
  }

  /**
   * When autoupdate is set to yes this function is used as pixi's updateTransform function
   *
   * @private
   */
  autoUpdateTransform() {
    if (Spine.globalAutoUpdate) {
      this.lastTime = this.lastTime || Date.now();

      const timeDelta = (Date.now() - this.lastTime) * 0.001;

      this.lastTime = Date.now();
      this.update(timeDelta);
    } else {
      this.lastTime = 0;
    }

    this.containerUpdateTransform();
  }

  /**
   * Create a new sprite to be used with core.RegionAttachment
   *
   * @private
   * @param {Tiny.spine.Slot} slot - The slot to which the attachment is parented
   * @param {Tiny.spine.RegionAttachment} attachment - The attachment that the sprite will represent
   * @param {string} defName
   * @return {Tiny.Sprite}
   */
  createSprite(slot, attachment, defName) {
    let region = attachment.region;

    if (slot.hackAttachment === attachment) {
      region = slot.hackRegion;
    }

    const texture = region.texture;
    const sprite = this.newSprite(texture);

    sprite.rotation = attachment.rotation * degRad;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.position.x = attachment.x;
    sprite.position.y = attachment.y;
    sprite.alpha = attachment.color.a;

    sprite.region = attachment.region;
    this.setSpriteRegion(attachment, sprite, attachment.region);

    slot.sprites = slot.sprites || {};
    slot.sprites[defName] = sprite;

    return sprite;
  }

  /**
   * Creates a Strip from the spine data
   *
   * @private
   * @param {Tiny.spine.Slot} slot - The slot to which the attachment is parented
   * @param {Tiny.spine.RegionAttachment} attachment - The attachment that the sprite will represent
   * @return {Tiny.spine.SpineMesh}
   */
  createMesh(slot, attachment) {
    let region = attachment.region;

    if (slot.hackAttachment === attachment) {
      region = slot.hackRegion;
      slot.hackAttachment = null;
      slot.hackRegion = null;
    }

    const strip = this.newMesh(
      region.texture,
      new Float32Array(attachment.regionUVs.length),
      new Float32Array(attachment.regionUVs.length),
      new Uint16Array(attachment.triangles),
      mesh.Mesh.DRAW_MODES.TRIANGLES
    );

    strip.canvasPadding = 1.5;
    strip.alpha = attachment.color.a;
    strip.region = attachment.region;
    this.setMeshRegion(attachment, strip, region);

    slot.meshes = slot.meshes || {};
    slot.meshes[attachment.name] = strip;

    return strip;
  }

  /**
   *
   * @param {Tiny.spine.Slot} slot
   * @param {Tiny.spine.ClippingAttachment} clip
   * @return {Tiny.Graphics}
   */
  createGraphics(slot, clip) {
    const graphics = this.newGraphics();
    const poly = new Tiny.Polygon([]);

    graphics.clear();
    graphics.beginFill(0xffffff, 1);
    graphics.drawPolygon(poly);
    graphics.renderable = false;
    slot.currentGraphics = graphics;
    slot.clippingContainer = this.newContainer();
    slot.clippingContainer.mask = slot.currentGraphics;

    return graphics;
  }

  /**
   *
   * @param {Tiny.spine.Slot} slot
   * @param {Tiny.spine.ClippingAttachment} clip
   */
  updateGraphics(slot, clip) {
    const vertices = slot.currentGraphics.graphicsData[0].shape.points;
    const n = clip.worldVerticesLength;

    vertices.length = n;
    clip.computeWorldVertices(slot, 0, n, vertices, 0, 2);
    slot.currentGraphics.dirty++;
    slot.currentGraphics.clearDirty++;
  }

  /**
   * Changes texture in attachment in specific slot.
   *
   * Tiny runtime feature, it was made to satisfy our users.
   *
   * @param {number} slotIndex
   * @param {Tiny.Texture} [texture=null] - If null, take default (original) texture
   * @param {Tiny.Point} [size=null] - sometimes we need new size for region attachment, you can pass 'texture.orig' there
   * @return {boolean} Success flag
   */
  hackTextureBySlotIndex(slotIndex, texture = null, size = null) {
    const slot = this.skeleton.slots[slotIndex];

    if (!slot) {
      return false;
    }

    const attachment = slot.getAttachment();
    let region = attachment.region;

    if (texture) {
      region = new TextureRegion();
      region.texture = texture;
      region.size = size;
      slot.hackRegion = region;
      slot.hackAttachment = attachment;
    } else {
      slot.hackRegion = null;
      slot.hackAttachment = null;
    }
    if (slot.currentSprite && slot.currentSprite.region !== region) {
      this.setSpriteRegion(attachment, slot.currentSprite, region);
      slot.currentSprite.region = region;
    } else if (slot.currentMesh && slot.currentMesh.region !== region) {
      this.setMeshRegion(attachment, slot.currentMesh, region);
    }
    return true;
  }

  /**
   * Changes texture in attachment in specific slot.
   *
   * TinyJS runtime feature, it was made to satisfy our users.
   *
   * @param {string} slotName
   * @param {Tiny.Texture} [texture=null] - If null, take default (original) texture
   * @param {Tiny.Point} [size=null] - sometimes we need new size for region attachment, you can pass 'texture.orig' there
   * @return {boolean} Success flag
   */
  hackTextureBySlotName(slotName, texture = null, size = null) {
    const index = this.skeleton.findSlotIndex(slotName);

    if (index === -1) {
      return false;
    }
    return this.hackTextureBySlotIndex(index, texture, size);
  }

  // those methods can be overriden to spawn different classes
  /**
   * @return {Tiny.Container}
   */
  newContainer() {
    return new Tiny.Container();
  }

  /**
   *
   * @param {Tiny.Texture} tex
   * @return {Tiny.spine.SpineSprite}
   */
  newSprite(tex) {
    return new SpineSprite(tex);
  }

  /**
   * @return {Tiny.Graphics}
   */
  newGraphics() {
    return new Tiny.Graphics();
  }

  /**
   *
   * @param {Tiny.Texture} texture
   * @param {?Float32Array} vertices
   * @param {?Float32Array} uvs
   * @param {?Uint16Array} indices
   * @param {?number} drawMode
   * @return {Tiny.spine.SpineMesh}
   */
  newMesh(texture, vertices, uvs, indices, drawMode) {
    return new SpineMesh(texture, vertices, uvs, indices, drawMode);
  }

  /**
   * @return {number} 1
   */
  transformHack() {
    return 1;
  }

  /**
   * Hack for display and lights. Every attachment name ending with a suffix will be added to different layer
   *
   * @param {string} nameSuffix
   * @param {*} group
   * @param {*} outGroup
   */
  hackAttachmentGroups(nameSuffix, group, outGroup) {
    if (!nameSuffix) {
      return;
    }

    const listd = [];
    const listn = [];

    for (let i = 0, len = this.skeleton.slots.length; i < len; i++) {
      const slot = this.skeleton.slots[i];
      const name = slot.currentSpriteName || slot.currentMeshName || '';
      const target = slot.currentSprite || slot.currentMesh;

      if (name.endsWith(nameSuffix)) {
        target.parentGroup = group;
        listn.push(target);
      } else if (outGroup && target) {
        target.parentGroup = outGroup;
        listd.push(target);
      }
    }
    return [listd, listn];
  };

  /**
   *
   * @param {*} options
   */
  destroy(options) {
    for (let i = 0, n = this.skeleton.slots.length; i < n; i++) {
      const slot = this.skeleton.slots[i];

      for (let name in slot.meshes) {
        slot.meshes[name].destroy(options);
      }
      slot.meshes = null;

      for (let name in slot.sprites) {
        slot.sprites[name].destroy(options);
      }
      slot.sprites = null;
    }

    for (let i = 0, n = this.slotContainers.length; i < n; i++) {
      this.slotContainers[i].destroy(options);
    }
    this.spineData = null;
    this.skeleton = null;
    this.slotContainers = null;
    this.stateData = null;
    this.state = null;
    this.tempClipContainers = null;

    super.destroy(options);
  }
}

/**
 * @static
 * @type {boolean}
 */
Spine.globalAutoUpdate = true;
/**
 * @static
 * @type {number}
 */
Spine.globalDelayLimit = 0;
/**
 * @static
 * @type {number[]}
 */
Spine.clippingPolygon = [];

export {
  SpineSprite,
  SpineMesh,
  Spine,
};
