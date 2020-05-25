import { Color, setArraySize, newArray, toFloatArray, newFloatArray } from './utils';
import { TransformMode, BoneData } from './BoneData';
import { AttachmentType } from './attachments/Attachment';
import { PositionMode, SpacingMode, RotateMode, PathConstraintData } from './PathConstraintData';
import IKConstraintData from './IKConstraintData';
import TransformConstraintData from './TransformConstraintData';
import BlendMode from './BlendMode';
import SkeletonData from './SkeletonData';
import SlotData from './SlotData';
import Event from './Event';
import EventData from './EventData';
import { Skin } from './Skin';
import {
  Animation,
  AttachmentTimeline,
  ColorTimeline,
  TwoColorTimeline,
  RotateTimeline,
  ShearTimeline,
  ScaleTimeline,
  TranslateTimeline,
  IKConstraintTimeline,
  TransformConstraintTimeline,
  PathConstraintSpacingTimeline,
  PathConstraintPositionTimeline,
  PathConstraintMixTimeline,
  DeformTimeline,
  DrawOrderTimeline,
  EventTimeline,
} from './Animation';

/**
 * Loads skeleton data in the Spine binary format.
 *
 * See [Spine binary format](http://esotericsoftware.com/spine-binary-format) and
 * [JSON and binary data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the Spine
 * Runtimes Guide.
 *
 * @class
 * @memberof Tiny.spine
 */
class SkeletonBinary {
  /**
   *
   * @param {Tiny.spine.AttachmentLoader} attachmentLoader
   */
  constructor(attachmentLoader) {
    /**
     * Scales bone positions, image sizes, and translations as they are loaded. This allows different size images to be used at
     * runtime than were used in Spine.
     *
     * See [Scaling](http://esotericsoftware.com/spine-loading-skeleton-data#Scaling) in the Spine Runtimes Guide.
     *
     * @type {number}
     * @default 1
     */
    this.scale = 1;
    /**
     * @private
     * @type {Tiny.spine.LinkedMesh[]}
     * @default []
     */
    this.linkedMeshes = [];
    /**
     * @type {Tiny.spine.AttachmentLoader}
     */
    this.attachmentLoader = attachmentLoader;
  }

  /**
   *
   * @param {Uint8Array} binary
   * @return {Tiny.spine.SkeletonData}
   */
  readSkeletonData(binary) {
    const scale = this.scale;
    const skeletonData = new SkeletonData();

    skeletonData.name = ''; // BOZO

    const input = new BinaryInput(binary);

    skeletonData.hash = input.readString();
    skeletonData.version = input.readString();
    if (skeletonData.version === '3.8.75') {
      console.error(`Unsupported skeleton data, 3.8.75 is deprecated, please export with a newer version of Spine.`);
    }
    skeletonData.x = input.readFloat();
    skeletonData.y = input.readFloat();
    skeletonData.width = input.readFloat();
    skeletonData.height = input.readFloat();

    const nonessential = input.readBoolean();

    if (nonessential) {
      skeletonData.fps = input.readFloat();

      skeletonData.imagesPath = input.readString();
      skeletonData.audioPath = input.readString();
    }

    let n = 0;
    // Strings.
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      input.strings.push(input.readString());
    }

    // Bones.
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      const name = input.readString();
      const parent = i === 0 ? null : skeletonData.bones[input.readInt(true)];
      const data = new BoneData(i, name, parent);

      data.rotation = input.readFloat();
      data.x = input.readFloat() * scale;
      data.y = input.readFloat() * scale;
      data.scaleX = input.readFloat();
      data.scaleY = input.readFloat();
      data.shearX = input.readFloat();
      data.shearY = input.readFloat();
      data.length = input.readFloat() * scale;
      data.transformMode = SkeletonBinary.TransformModeValues[input.readInt(true)];
      data.skinRequired = input.readBoolean();
      if (nonessential) {
        Color.rgba8888ToColor(data.color, input.readInt32());
      }
      skeletonData.bones.push(data);
    }

    // Slots.
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      const slotName = input.readString();
      const boneData = skeletonData.bones[input.readInt(true)];
      const data = new SlotData(i, slotName, boneData);

      Color.rgba8888ToColor(data.color, input.readInt32());

      const darkColor = input.readInt32();

      if (darkColor !== -1) {
        Color.rgb888ToColor(data.darkColor = new Color(), darkColor);
      }

      data.attachmentName = input.readStringRef();
      data.blendMode = SkeletonBinary.BlendModeValues[input.readInt(true)];
      skeletonData.slots.push(data);
    }

    // IK constraints.
    n = input.readInt(true);
    for (let i = 0, nn; i < n; i++) {
      const data = new IKConstraintData(input.readString());

      data.order = input.readInt(true);
      data.skinRequired = input.readBoolean();
      nn = input.readInt(true);
      for (let ii = 0; ii < nn; ii++) {
        data.bones.push(skeletonData.bones[input.readInt(true)]);
      }
      data.target = skeletonData.bones[input.readInt(true)];
      data.mix = input.readFloat();
      data.softness = input.readFloat() * scale;
      data.bendDirection = input.readByte();
      data.compress = input.readBoolean();
      data.stretch = input.readBoolean();
      data.uniform = input.readBoolean();
      skeletonData.ikConstraints.push(data);
    }

    // Transform constraints.
    n = input.readInt(true);
    for (let i = 0, nn; i < n; i++) {
      const data = new TransformConstraintData(input.readString());

      data.order = input.readInt(true);
      data.skinRequired = input.readBoolean();
      nn = input.readInt(true);
      for (let ii = 0; ii < nn; ii++) {
        data.bones.push(skeletonData.bones[input.readInt(true)]);
      }
      data.target = skeletonData.bones[input.readInt(true)];
      data.local = input.readBoolean();
      data.relative = input.readBoolean();
      data.offsetRotation = input.readFloat();
      data.offsetX = input.readFloat() * scale;
      data.offsetY = input.readFloat() * scale;
      data.offsetScaleX = input.readFloat();
      data.offsetScaleY = input.readFloat();
      data.offsetShearY = input.readFloat();
      data.rotateMix = input.readFloat();
      data.translateMix = input.readFloat();
      data.scaleMix = input.readFloat();
      data.shearMix = input.readFloat();
      skeletonData.transformConstraints.push(data);
    }

    // Path constraints.
    n = input.readInt(true);
    for (let i = 0, nn; i < n; i++) {
      const data = new PathConstraintData(input.readString());

      data.order = input.readInt(true);
      data.skinRequired = input.readBoolean();
      nn = input.readInt(true);
      for (let ii = 0; ii < nn; ii++) {
        data.bones.push(skeletonData.bones[input.readInt(true)]);
      }
      data.target = skeletonData.slots[input.readInt(true)];
      data.positionMode = SkeletonBinary.PositionModeValues[input.readInt(true)];
      data.spacingMode = SkeletonBinary.SpacingModeValues[input.readInt(true)];
      data.rotateMode = SkeletonBinary.RotateModeValues[input.readInt(true)];
      data.offsetRotation = input.readFloat();
      data.position = input.readFloat();
      if (data.positionMode === PositionMode.Fixed) {
        data.position *= scale;
      }
      data.spacing = input.readFloat();
      if (data.spacingMode === SpacingMode.Length || data.spacingMode === SpacingMode.Fixed) {
        data.spacing *= scale;
      }
      data.rotateMix = input.readFloat();
      data.translateMix = input.readFloat();
      skeletonData.pathConstraints.push(data);
    }

    // Default skin.
    const defaultSkin = this.readSkin(input, skeletonData, true, nonessential);

    if (defaultSkin != null) {
      skeletonData.defaultSkin = defaultSkin;
      skeletonData.skins.push(defaultSkin);
    }

    // Skins.
    {
      let i = skeletonData.skins.length;

      setArraySize(skeletonData.skins, n = i + input.readInt(true));
      for (; i < n; i++) {
        skeletonData.skins[i] = this.readSkin(input, skeletonData, false, nonessential);
      }
    }

    // Linked meshes.
    n = this.linkedMeshes.length;
    for (let i = 0; i < n; i++) {
      const linkedMesh = this.linkedMeshes[i];
      const skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);

      if (skin == null) {
        throw new Error(`Skin not found: ${linkedMesh.skin}`);
      }

      const parent = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);

      if (parent == null) {
        throw new Error(`Parent mesh not found: ${linkedMesh.parent}`);
      }
      linkedMesh.mesh.deformAttachment = linkedMesh.inheritDeform ? parent : linkedMesh.mesh;
      linkedMesh.mesh.setParentMesh(parent);
      // linkedMesh.mesh.updateUVs();
    }
    this.linkedMeshes.length = 0;

    // Events.
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      const data = new EventData(input.readStringRef());

      data.intValue = input.readInt(false);
      data.floatValue = input.readFloat();
      data.stringValue = input.readString();
      data.audioPath = input.readString();
      if (data.audioPath != null) {
        data.volume = input.readFloat();
        data.balance = input.readFloat();
      }
      skeletonData.events.push(data);
    }

    // Animations.
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      skeletonData.animations.push(this.readAnimation(input, input.readString(), skeletonData));
    }
    return skeletonData;
  }

  /**
   * @private
   * @param {Tiny.spine.BinaryInput} input
   * @param {Tiny.spine.SkeletonData} skeletonData
   * @param {boolean} defaultSkin
   * @param {boolean} nonessential
   * @return {Tiny.spine.Skin}
   */
  readSkin(input, skeletonData, defaultSkin, nonessential) {
    let skin = null;
    let slotCount = 0;

    if (defaultSkin) {
      slotCount = input.readInt(true);
      if (slotCount === 0) {
        return null;
      }
      skin = new Skin('default');
    } else {
      skin = new Skin(input.readStringRef());
      skin.bones.length = input.readInt(true);
      for (let i = 0, n = skin.bones.length; i < n; i++) {
        skin.bones[i] = skeletonData.bones[input.readInt(true)];
      }
      for (let i = 0, n = input.readInt(true); i < n; i++) {
        skin.constraints.push(skeletonData.ikConstraints[input.readInt(true)]);
      }
      for (let i = 0, n = input.readInt(true); i < n; i++) {
        skin.constraints.push(skeletonData.transformConstraints[input.readInt(true)]);
      }
      for (let i = 0, n = input.readInt(true); i < n; i++) {
        skin.constraints.push(skeletonData.pathConstraints[input.readInt(true)]);
      }

      slotCount = input.readInt(true);
    }

    for (let i = 0; i < slotCount; i++) {
      const slotIndex = input.readInt(true);

      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        const name = input.readStringRef();
        const attachment = this.readAttachment(input, skeletonData, skin, slotIndex, name, nonessential);

        if (attachment != null) {
          skin.setAttachment(slotIndex, name, attachment);
        }
      }
    }
    return skin;
  }

  /**
   * @private
   * @param {Tiny.spine.BinaryInput} input
   * @param {Tiny.spine.SkeletonData} skeletonData
   * @param {Tiny.spine.Skin} skin
   * @param {number} slotIndex
   * @param {string} attachmentName
   * @param {boolean} nonessential
   * @return {Tiny.spine.Attachment}
   */
  readAttachment(input, skeletonData, skin, slotIndex, attachmentName, nonessential) {
    const scale = this.scale;
    let name = input.readStringRef();

    if (name == null) {
      name = attachmentName;
    }

    const typeIndex = input.readByte();
    const type = SkeletonBinary.AttachmentTypeValues[typeIndex];

    switch (type) {
      case AttachmentType.Region: {
        let path = input.readStringRef();
        const rotation = input.readFloat();
        const x = input.readFloat();
        const y = input.readFloat();
        const scaleX = input.readFloat();
        const scaleY = input.readFloat();
        const width = input.readFloat();
        const height = input.readFloat();
        const color = input.readInt32();

        if (path == null) {
          path = name;
        }

        let region = this.attachmentLoader.newRegionAttachment(skin, name, path);

        if (region == null) {
          return null;
        }
        region.path = path;
        region.x = x * scale;
        region.y = y * scale;
        region.scaleX = scaleX;
        region.scaleY = scaleY;
        region.rotation = rotation;
        region.width = width * scale;
        region.height = height * scale;
        Color.rgba8888ToColor(region.color, color);
        region.updateOffset();
        return region;
      }
      case AttachmentType.BoundingBox: {
        const vertexCount = input.readInt(true);
        const vertices = this.readVertices(input, vertexCount);
        const color = nonessential ? input.readInt32() : 0;

        const box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);

        if (box == null) {
          return null;
        }
        box.worldVerticesLength = vertexCount << 1;
        box.vertices = vertices.vertices;
        box.bones = vertices.bones;
        if (nonessential) {
          Color.rgba8888ToColor(box.color, color);
        }
        return box;
      }
      case AttachmentType.Mesh: {
        let path = input.readStringRef();
        const color = input.readInt32();
        const vertexCount = input.readInt(true);
        const uvs = this.readFloatArray(input, vertexCount << 1, 1);
        const triangles = this.readShortArray(input);
        const vertices = this.readVertices(input, vertexCount);
        const hullLength = input.readInt(true);
        let edges = null;
        let width = 0;
        let height = 0;

        if (nonessential) {
          edges = this.readShortArray(input);
          width = input.readFloat();
          height = input.readFloat();
        }

        if (path == null) {
          path = name;
        }

        const mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);

        if (mesh == null) {
          return null;
        }
        mesh.path = path;
        Color.rgba8888ToColor(mesh.color, color);
        mesh.bones = vertices.bones;
        mesh.vertices = vertices.vertices;
        mesh.worldVerticesLength = vertexCount << 1;
        mesh.triangles = triangles;
        mesh.regionUVs = new Float32Array(uvs);
        // mesh.updateUVs();
        mesh.hullLength = hullLength << 1;
        if (nonessential) {
          mesh.edges = edges;
          mesh.width = width * scale;
          mesh.height = height * scale;
        }
        return mesh;
      }
      case AttachmentType.LinkedMesh: {
        let path = input.readStringRef();
        const color = input.readInt32();
        const skinName = input.readStringRef();
        const parent = input.readStringRef();
        const inheritDeform = input.readBoolean();
        let width = 0;
        let height = 0;
        if (nonessential) {
          width = input.readFloat();
          height = input.readFloat();
        }

        if (path == null) {
          path = name;
        }

        const mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);

        if (mesh == null) {
          return null;
        }
        mesh.path = path;
        Color.rgba8888ToColor(mesh.color, color);
        if (nonessential) {
          mesh.width = width * scale;
          mesh.height = height * scale;
        }
        this.linkedMeshes.push(new LinkedMesh(mesh, skinName, slotIndex, parent, inheritDeform));
        return mesh;
      }
      case AttachmentType.Path: {
        const closed = input.readBoolean();
        const constantSpeed = input.readBoolean();
        const vertexCount = input.readInt(true);
        const vertices = this.readVertices(input, vertexCount);
        const lengths = newArray(vertexCount / 3, 0);

        for (let i = 0, n = lengths.length; i < n; i++) {
          lengths[i] = input.readFloat() * scale;
        }

        const color = nonessential ? input.readInt32() : 0;

        const path = this.attachmentLoader.newPathAttachment(skin, name);

        if (path == null) {
          return null;
        }
        path.closed = closed;
        path.constantSpeed = constantSpeed;
        path.worldVerticesLength = vertexCount << 1;
        path.vertices = vertices.vertices;
        path.bones = vertices.bones;
        path.lengths = lengths;
        if (nonessential) {
          Color.rgba8888ToColor(path.color, color);
        }
        return path;
      }
      case AttachmentType.Point: {
        const rotation = input.readFloat();
        const x = input.readFloat();
        const y = input.readFloat();
        const color = nonessential ? input.readInt32() : 0;

        const point = this.attachmentLoader.newPointAttachment(skin, name);

        if (point == null) {
          return null;
        }
        point.x = x * scale;
        point.y = y * scale;
        point.rotation = rotation;
        if (nonessential) {
          Color.rgba8888ToColor(point.color, color);
        }
        return point;
      }
      case AttachmentType.Clipping: {
        const endSlotIndex = input.readInt(true);
        const vertexCount = input.readInt(true);
        const vertices = this.readVertices(input, vertexCount);
        const color = nonessential ? input.readInt32() : 0;

        const clip = this.attachmentLoader.newClippingAttachment(skin, name);

        if (clip == null) {
          return null;
        }
        clip.endSlot = skeletonData.slots[endSlotIndex];
        clip.worldVerticesLength = vertexCount << 1;
        clip.vertices = vertices.vertices;
        clip.bones = vertices.bones;
        if (nonessential) {
          Color.rgba8888ToColor(clip.color, color);
        }
        return clip;
      }
    }
    return null;
  }

  /**
   * @private
   * @param {Tiny.spine.BinaryInput} input
   * @param {number} vertexCount
   * @return {Tiny.spine.Vertices}
   */
  readVertices(input, vertexCount) {
    const verticesLength = vertexCount << 1;
    const vertices = new Vertices();
    const scale = this.scale;

    if (!input.readBoolean()) {
      vertices.vertices = this.readFloatArray(input, verticesLength, scale);
      return vertices;
    }

    const weights = [];
    const bonesArray = [];

    for (let i = 0; i < vertexCount; i++) {
      const boneCount = input.readInt(true);

      bonesArray.push(boneCount);
      for (let ii = 0; ii < boneCount; ii++) {
        bonesArray.push(input.readInt(true));
        weights.push(input.readFloat() * scale);
        weights.push(input.readFloat() * scale);
        weights.push(input.readFloat());
      }
    }
    vertices.vertices = toFloatArray(weights);
    vertices.bones = bonesArray;
    return vertices;
  }

  /**
   * @private
   * @param {Tiny.spine.BinaryInput} input
   * @param {number} n
   * @param {number} scale
   * @return {number[]}
   */
  readFloatArray(input, n, scale) {
    const array = new Array(n);

    if (scale === 1) {
      for (let i = 0; i < n; i++) {
        array[i] = input.readFloat();
      }
    } else {
      for (let i = 0; i < n; i++) {
        array[i] = input.readFloat() * scale;
      }
    }
    return array;
  }

  /**
   * @private
   * @param {Tiny.spine.BinaryInput} input
   * @return {number[]}
   */
  readShortArray(input) {
    const n = input.readInt(true);
    const array = new Array(n);

    for (let i = 0; i < n; i++) {
      array[i] = input.readShort();
    }
    return array;
  }

  /**
   * @private
   * @param {Tiny.spine.BinaryInput} input
   * @param {string} name
   * @param {Tiny.spine.SkeletonData} skeletonData
   * @return {Tiny.spine.Animation}
   */
  readAnimation(input, name, skeletonData) {
    const timelines = [];
    const scale = this.scale;
    let duration = 0;
    const tempColor1 = new Color();
    const tempColor2 = new Color();

    // Slot timelines.
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      const slotIndex = input.readInt(true);

      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        const timelineType = input.readByte();
        const frameCount = input.readInt(true);

        switch (timelineType) {
          case SkeletonBinary.SLOT_ATTACHMENT: {
            const timeline = new AttachmentTimeline(frameCount);

            timeline.slotIndex = slotIndex;
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              timeline.setFrame(frameIndex, input.readFloat(), input.readStringRef());
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[frameCount - 1]);
            break;
          }
          case SkeletonBinary.SLOT_COLOR: {
            const timeline = new ColorTimeline(frameCount);

            timeline.slotIndex = slotIndex;
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              const time = input.readFloat();

              Color.rgba8888ToColor(tempColor1, input.readInt32());
              timeline.setFrame(frameIndex, time, tempColor1.r, tempColor1.g, tempColor1.b, tempColor1.a);
              if (frameIndex < frameCount - 1) {
                this.readCurve(input, frameIndex, timeline);
              }
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(frameCount - 1) * ColorTimeline.ENTRIES]);
            break;
          }
          case SkeletonBinary.SLOT_TWO_COLOR: {
            const timeline = new TwoColorTimeline(frameCount);

            timeline.slotIndex = slotIndex;
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              const time = input.readFloat();

              Color.rgba8888ToColor(tempColor1, input.readInt32());
              Color.rgb888ToColor(tempColor2, input.readInt32());
              timeline.setFrame(frameIndex, time, tempColor1.r, tempColor1.g, tempColor1.b, tempColor1.a, tempColor2.r, tempColor2.g, tempColor2.b);
              if (frameIndex < frameCount - 1) {
                this.readCurve(input, frameIndex, timeline);
              }
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(frameCount - 1) * TwoColorTimeline.ENTRIES]);
            break;
          }
        }
      }
    }

    // Bone timelines.
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      const boneIndex = input.readInt(true);

      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        const timelineType = input.readByte();
        const frameCount = input.readInt(true);

        switch (timelineType) {
          case SkeletonBinary.BONE_ROTATE: {
            const timeline = new RotateTimeline(frameCount);

            timeline.boneIndex = boneIndex;
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              timeline.setFrame(frameIndex, input.readFloat(), input.readFloat());
              if (frameIndex < frameCount - 1) {
                this.readCurve(input, frameIndex, timeline);
              }
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(frameCount - 1) * RotateTimeline.ENTRIES]);
            break;
          }
          case SkeletonBinary.BONE_TRANSLATE:
          case SkeletonBinary.BONE_SCALE:
          case SkeletonBinary.BONE_SHEAR: {
            let timeline;
            let timelineScale = 1;

            if (timelineType === SkeletonBinary.BONE_SCALE) {
              timeline = new ScaleTimeline(frameCount);
            } else if (timelineType === SkeletonBinary.BONE_SHEAR) {
              timeline = new ShearTimeline(frameCount);
            } else {
              timeline = new TranslateTimeline(frameCount);
              timelineScale = scale;
            }
            timeline.boneIndex = boneIndex;
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              timeline.setFrame(frameIndex, input.readFloat(), input.readFloat() * timelineScale, input.readFloat() * timelineScale);
              if (frameIndex < frameCount - 1) {
                this.readCurve(input, frameIndex, timeline);
              }
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(frameCount - 1) * TranslateTimeline.ENTRIES]);
            break;
          }
        }
      }
    }

    // IK constraint timelines.
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      const index = input.readInt(true);
      const frameCount = input.readInt(true);
      const timeline = new IKConstraintTimeline(frameCount);

      timeline.ikConstraintIndex = index;
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        timeline.setFrame(frameIndex, input.readFloat(), input.readFloat(), input.readFloat() * scale, input.readByte(), input.readBoolean(), input.readBoolean());
        if (frameIndex < frameCount - 1) {
          this.readCurve(input, frameIndex, timeline);
        }
      }
      timelines.push(timeline);
      duration = Math.max(duration, timeline.frames[(frameCount - 1) * IKConstraintTimeline.ENTRIES]);
    }

    // Transform constraint timelines.
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      const index = input.readInt(true);
      const frameCount = input.readInt(true);
      const timeline = new TransformConstraintTimeline(frameCount);

      timeline.transformConstraintIndex = index;
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        timeline.setFrame(frameIndex, input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat());
        if (frameIndex < frameCount - 1) {
          this.readCurve(input, frameIndex, timeline);
        }
      }
      timelines.push(timeline);
      duration = Math.max(duration, timeline.frames[(frameCount - 1) * TransformConstraintTimeline.ENTRIES]);
    }

    // Path constraint timelines.
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      const index = input.readInt(true);
      const data = skeletonData.pathConstraints[index];

      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        const timelineType = input.readByte();
        const frameCount = input.readInt(true);

        switch (timelineType) {
          case SkeletonBinary.PATH_POSITION:
          case SkeletonBinary.PATH_SPACING: {
            let timeline;
            let timelineScale = 1;

            if (timelineType === SkeletonBinary.PATH_SPACING) {
              timeline = new PathConstraintSpacingTimeline(frameCount);
              if (data.spacingMode === SpacingMode.Length || data.spacingMode === SpacingMode.Fixed) {
                timelineScale = scale;
              }
            } else {
              timeline = new PathConstraintPositionTimeline(frameCount);
              if (data.positionMode === PositionMode.Fixed) {
                timelineScale = scale;
              }
            }
            timeline.pathConstraintIndex = index;
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              timeline.setFrame(frameIndex, input.readFloat(), input.readFloat() * timelineScale);
              if (frameIndex < frameCount - 1) {
                this.readCurve(input, frameIndex, timeline);
              }
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(frameCount - 1) * PathConstraintPositionTimeline.ENTRIES]);
            break;
          }
          case SkeletonBinary.PATH_MIX: {
            const timeline = new PathConstraintMixTimeline(frameCount);

            timeline.pathConstraintIndex = index;
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              timeline.setFrame(frameIndex, input.readFloat(), input.readFloat(), input.readFloat());
              if (frameIndex < frameCount - 1) {
                this.readCurve(input, frameIndex, timeline);
              }
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[(frameCount - 1) * PathConstraintMixTimeline.ENTRIES]);
            break;
          }
        }
      }
    }

    // Deform timelines.
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      const skin = skeletonData.skins[input.readInt(true)];

      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        const slotIndex = input.readInt(true);

        for (let iii = 0, nnn = input.readInt(true); iii < nnn; iii++) {
          const attachment = skin.getAttachment(slotIndex, input.readStringRef());
          const weighted = attachment.bones != null;
          const vertices = attachment.vertices;
          const deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;

          const frameCount = input.readInt(true);
          const timeline = new DeformTimeline(frameCount);

          timeline.slotIndex = slotIndex;
          timeline.attachment = attachment;

          for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const time = input.readFloat();
            let deform;
            let end = input.readInt(true);

            if (end === 0) {
              deform = weighted ? newFloatArray(deformLength) : vertices;
            } else {
              deform = newFloatArray(deformLength);

              const start = input.readInt(true);

              end += start;
              if (scale === 1) {
                for (let v = start; v < end; v++) {
                  deform[v] = input.readFloat();
                }
              } else {
                for (let v = start; v < end; v++) {
                  deform[v] = input.readFloat() * scale;
                }
              }
              if (!weighted) {
                for (let v = 0, vn = deform.length; v < vn; v++) {
                  deform[v] += vertices[v];
                }
              }
            }

            timeline.setFrame(frameIndex, time, deform);
            if (frameIndex < frameCount - 1) {
              this.readCurve(input, frameIndex, timeline);
            }
          }
          timelines.push(timeline);
          duration = Math.max(duration, timeline.frames[frameCount - 1]);
        }
      }
    }

    // Draw order timeline.
    const drawOrderCount = input.readInt(true);

    if (drawOrderCount > 0) {
      const timeline = new DrawOrderTimeline(drawOrderCount);
      const slotCount = skeletonData.slots.length;

      for (let i = 0; i < drawOrderCount; i++) {
        const time = input.readFloat();
        const offsetCount = input.readInt(true);
        const drawOrder = newArray(slotCount, 0);

        for (let ii = slotCount - 1; ii >= 0; ii--) {
          drawOrder[ii] = -1;
        }

        const unchanged = newArray(slotCount - offsetCount, 0);
        let originalIndex = 0;
        let unchangedIndex = 0;

        for (let ii = 0; ii < offsetCount; ii++) {
          let slotIndex = input.readInt(true);
          // Collect unchanged items.
          while (originalIndex !== slotIndex) {
            unchanged[unchangedIndex++] = originalIndex++;
          }
          // Set changed items.
          drawOrder[originalIndex + input.readInt(true)] = originalIndex++;
        }
        // Collect remaining unchanged items.
        while (originalIndex < slotCount) {
          unchanged[unchangedIndex++] = originalIndex++;
        }
        // Fill in unchanged items.
        for (let ii = slotCount - 1; ii >= 0; ii--) {
          if (drawOrder[ii] === -1) {
            drawOrder[ii] = unchanged[--unchangedIndex];
          }
        }
        timeline.setFrame(i, time, drawOrder);
      }
      timelines.push(timeline);
      duration = Math.max(duration, timeline.frames[drawOrderCount - 1]);
    }

    // Event timeline.
    const eventCount = input.readInt(true);

    if (eventCount > 0) {
      const timeline = new EventTimeline(eventCount);

      for (let i = 0; i < eventCount; i++) {
        const time = input.readFloat();
        const eventData = skeletonData.events[input.readInt(true)];
        const event = new Event(time, eventData);

        event.intValue = input.readInt(false);
        event.floatValue = input.readFloat();
        event.stringValue = input.readBoolean() ? input.readString() : eventData.stringValue;
        if (event.data.audioPath != null) {
          event.volume = input.readFloat();
          event.balance = input.readFloat();
        }
        timeline.setFrame(i, event);
      }
      timelines.push(timeline);
      duration = Math.max(duration, timeline.frames[eventCount - 1]);
    }

    return new Animation(name, timelines, duration);
  }

  /**
   * @private
   * @param {Tiny.spine.BinaryInput} input
   * @param {number} frameIndex
   * @param {Tiny.spine.CurveTimeline} timeline
   */
  readCurve(input, frameIndex, timeline) {
    switch (input.readByte()) {
      case SkeletonBinary.CURVE_STEPPED:
        timeline.setStepped(frameIndex);
        break;
      case SkeletonBinary.CURVE_BEZIER:
        this.setCurve(timeline, frameIndex, input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat());
        break;
    }
  }

  /**
   *
   * @param {Tiny.spine.CurveTimeline} timeline
   * @param {number} frameIndex
   * @param {number} cx1
   * @param {number} cy1
   * @param {number} cx2
   * @param {number} cy2
   */
  setCurve(timeline, frameIndex, cx1, cy1, cx2, cy2) {
    timeline.setCurve(frameIndex, cx1, cy1, cx2, cy2);
  }
}

SkeletonBinary.AttachmentTypeValues = [
  0, /*AttachmentType.Region*/
  1, /*AttachmentType.BoundingBox*/
  2, /*AttachmentType.Mesh*/
  3, /*AttachmentType.LinkedMesh*/
  4, /*AttachmentType.Path*/
  5, /*AttachmentType.Point*/
  6, /*AttachmentType.Clipping*/
];
SkeletonBinary.TransformModeValues = [TransformMode.Normal, TransformMode.OnlyTranslation, TransformMode.NoRotationOrReflection, TransformMode.NoScale, TransformMode.NoScaleOrReflection];
SkeletonBinary.PositionModeValues = [PositionMode.Fixed, PositionMode.Percent];
SkeletonBinary.SpacingModeValues = [SpacingMode.Length, SpacingMode.Fixed, SpacingMode.Percent];
SkeletonBinary.RotateModeValues = [RotateMode.Tangent, RotateMode.Chain, RotateMode.ChainScale];
SkeletonBinary.BlendModeValues = [BlendMode.Normal, BlendMode.Additive, BlendMode.Multiply, BlendMode.Screen];

SkeletonBinary.BONE_ROTATE = 0;
SkeletonBinary.BONE_TRANSLATE = 1;
SkeletonBinary.BONE_SCALE = 2;
SkeletonBinary.BONE_SHEAR = 3;

SkeletonBinary.SLOT_ATTACHMENT = 0;
SkeletonBinary.SLOT_COLOR = 1;
SkeletonBinary.SLOT_TWO_COLOR = 2;

SkeletonBinary.PATH_POSITION = 0;
SkeletonBinary.PATH_SPACING = 1;
SkeletonBinary.PATH_MIX = 2;

SkeletonBinary.CURVE_LINEAR = 0;
SkeletonBinary.CURVE_STEPPED = 1;
SkeletonBinary.CURVE_BEZIER = 2;

/**
 * @private
 * @class
 * @memberof Tiny.spine
 */
class BinaryInput {
  /**
   *
   * @param {Uint8Array} data
   * @param {string[]} strings=[]
   * @param {number} index=0
   * @param {DataView} buffer
   */
  constructor(data, strings = [], index = 0, buffer) {
    /**
     * @type {string[]}
     */
    this.strings = strings;
    /**
     * @private
     * @type {number}
     * @default 0
     */
    this.index = index;
    /**
     * @private
     * @type {DataView}
     */
    this.buffer = buffer || new DataView(data.buffer);
  }

  /**
   * @return {number}
   */
  readByte() {
    return this.buffer.getInt8(this.index++);
  }

  /**
   * @return {number}
   */
  readShort() {
    const value = this.buffer.getInt16(this.index);

    this.index += 2;

    return value;
  }

  /**
   * @return {number}
   */
  readInt32() {
    const value = this.buffer.getInt32(this.index);

    this.index += 4;

    return value;
  }

  /**
   * @param {boolean} optimizePositive
   * @return {number}
   */
  readInt(optimizePositive) {
    let b = this.readByte();
    let result = b & 0x7F;

    if ((b & 0x80) !== 0) {
      b = this.readByte();
      result |= (b & 0x7F) << 7;
      if ((b & 0x80) !== 0) {
        b = this.readByte();
        result |= (b & 0x7F) << 14;
        if ((b & 0x80) !== 0) {
          b = this.readByte();
          result |= (b & 0x7F) << 21;
          if ((b & 0x80) !== 0) {
            b = this.readByte();
            result |= (b & 0x7F) << 28;
          }
        }
      }
    }
    return optimizePositive ? result : ((result >>> 1) ^ -(result & 1));
  }

  /**
   * @return {string}
   */
  readStringRef() {
    const index = this.readInt(true);

    return index === 0 ? null : this.strings[index - 1];
  }

  /**
   * @return {string}
   */
  readString() {
    let byteCount = this.readInt(true);

    switch (byteCount) {
      case 0:
        return null;
      case 1:
        return '';
    }
    byteCount--;

    let chars = '';

    for (let i = 0; i < byteCount;) {
      const b = this.readByte();

      switch (b >> 4) {
        case 12:
        case 13:
          chars += String.fromCharCode(((b & 0x1F) << 6 | this.readByte() & 0x3F));
          i += 2;
          break;
        case 14:
          chars += String.fromCharCode(((b & 0x0F) << 12 | (this.readByte() & 0x3F) << 6 | this.readByte() & 0x3F));
          i += 3;
          break;
        default:
          chars += String.fromCharCode(b);
          i++;
      }
    }
    return chars;
  }

  /**
   * @return {number}
   */
  readFloat() {
    const value = this.buffer.getFloat32(this.index);

    this.index += 4;

    return value;
  }

  /**
   * @return {boolean}
   */
  readBoolean() {
    return this.readByte() !== 0;
  }
}

/**
 * @private
 * @class
 * @memberof Tiny.spine
 */
class LinkedMesh {
  /**
   *
   * @param {Tiny.spine.MeshAttachment} mesh
   * @param {string} skin
   * @param {number} slotIndex
   * @param {string} parent
   * @param {boolean} inheritDeform
   */
  constructor(mesh, skin, slotIndex, parent, inheritDeform) {
    /**
     * @type {Tiny.spine.MeshAttachment}
     */
    this.mesh = mesh;
    /**
     * @type {string}
     */
    this.skin = skin;
    /**
     * @type {number}
     */
    this.slotIndex = slotIndex;
    /**
     * @type {string}
     */
    this.parent = parent;
    /**
     * @type {boolean}
     */
    this.inheritDeform = inheritDeform;
  }
}

/**
 * @private
 * @class
 * @memberof Tiny.spine
 */
class Vertices {
  /**
   *
   * @param {number[]} bones=null
   * @param {number[]|Float32Array} vertices=null
   */
  constructor(bones = null, vertices = null) {
    /**
     * @type {number[]}
     */
    this.bones = bones;
    /**
     * @type {number[]|Float32Array}
     */
    this.vertices = vertices;
  }
}

export {
  SkeletonBinary,
};
