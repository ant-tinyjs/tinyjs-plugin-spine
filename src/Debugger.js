import PathAttachment from './core/attachments/PathAttachment';
import MeshAttachment from './core/attachments/MeshAttachment';
import RegionAttachment from './core/attachments/RegionAttachment';
import ClippingAttachment from './core/attachments/ClippingAttachment';
import { setArraySize, newFloatArray } from './core/utils';

const COLOR_GRAY = Tiny.rgb2hex([192 / 255, 192 / 255, 192 / 255]);
const COLOR_CONTROL_BONES = Tiny.rgb2hex([0.8, 0, 0]);
const COLOR_BONE_LINE = Tiny.rgb2hex([1, 0, 0]);
const COLOR_BONE_ORIGIN = Tiny.rgb2hex([0, 1, 0]);
const COLOR_TRIANGLE_LINE = Tiny.rgb2hex([1, 0.64, 0]);
const COLOR_ATTACHMENT_LINE = Tiny.rgb2hex([0, 0, 1]);
const COLOR_PATH = 0xff7f00;
const COLOR_CLIP_LINE = Tiny.rgb2hex([0.8, 0, 0]);

/**
 * @class
 * @memberof Tiny.spine
 */
class Debugger {
  /**
   *
   * @param {Tiny.spine.Spine} spine
   * @param {object} opt
   * @param {string[]} [opt.controlBones=[]]
   * @param {booloan} [opt.drawRegionAttachments=false]
   * @param {booloan} [opt.drawMeshHull=false]
   * @param {booloan} [opt.drawMeshTriangles=false]
   * @param {booloan} [opt.drawPaths=false]
   * @param {booloan} [opt.drawBones=false]
   * @param {booloan} [opt.drawClipping=false]
   * @param {booloan} [opt.drawSkeletonXY=false]
   */
  constructor(spine, opt = {}) {
    this.controlBones = opt.controlBones || [];
    this.drawBones = opt.drawBones || false;
    this.drawSkeletonXY = opt.drawSkeletonXY || false;
    this.drawPaths = opt.drawPaths || false;
    this.drawMeshHull = opt.drawMeshHull || false;
    this.drawMeshTriangles = opt.drawMeshTriangles || false;
    this.drawRegionAttachments = opt.drawRegionAttachments || false;
    this.drawClipping = opt.drawClipping || false;
    this.skeleton = spine.skeleton;
    this.container = new Tiny.Container();
    this.controlBonesContainer = new Tiny.Container();

    this.temp = [];
    this.vertices = newFloatArray(2 * 1024);

    if (this.controlBones.length) {
      this.controlBones.forEach(name => {
        var g = new Tiny.Graphics();

        g.name = `${name}-graphics`;
        this.controlBonesContainer.addChild(g);
      });
    }
    if (this.drawBones) {
      this.bonesGraphics = new Tiny.Graphics();
      this.container.addChild(this.bonesGraphics);
    }
    if (this.drawPaths) {
      this.pathsGraphics = new Tiny.Graphics();
      this.container.addChild(this.pathsGraphics);
    }
    if (this.drawMeshHull || this.drawMeshTriangles) {
      this.meshsGraphics = new Tiny.Graphics();
      this.container.addChild(this.meshsGraphics);
    }
    if (this.drawRegionAttachments) {
      this.regionAttachmentsGraphics = new Tiny.Graphics();
      this.container.addChild(this.regionAttachmentsGraphics);
    }
    if (this.drawClipping) {
      this.clippingGraphics = new Tiny.Graphics();
      this.container.addChild(this.clippingGraphics);
    }
    spine.addChild(this.container);
    spine.addChild(this.controlBonesContainer);

    const self = this;

    this.container.updateTransform = function() {
      self.drawBones && self._drawBones(self.controlBones);
      self.drawPaths && self._drawPaths();
      (self.drawMeshHull || self.drawMeshTriangles) && self._drawMeshs();
      self.drawRegionAttachments && self._drawRegionAttachments();
      self.drawClipping && self._drawClipping();
      self.controlBones.length && self._drawControlBones(self.controlBones);
      this.containerUpdateTransform();
    };
  }

  _drawControlBones(bones) {
    const { skeleton, controlBonesContainer } = this;
    const { x: skeletonX, y: skeletonY } = skeleton;

    bones.forEach(name => {
      const g = controlBonesContainer.getChildByName(`${name}-graphics`);
      const bone = skeleton.findBone(name);
      const { worldX, worldY } = bone;

      g.clear();
      g.lineStyle(1, COLOR_CONTROL_BONES, 0.8);
      g.beginFill(COLOR_CONTROL_BONES, 0.5);
      g.drawCircle(skeletonX + worldX, skeletonY + worldY, 10);
      g.endFill();
    });
  }
  _drawBones(ignoredBones) {
    const { bonesGraphics: g, skeleton } = this;
    const { x: skeletonX, y: skeletonY, bones } = skeleton;
    const ponits = [];

    for (let i = 0, n = bones.length; i < n; i++) {
      const bone = bones[i];
      const { worldX, worldY } = bone;

      if (ignoredBones && ignoredBones.indexOf(bone.data.name) > -1) {
        continue;
      }
      if (bone.parent == null) {
        continue;
      }

      let dx = skeletonX + bone.data.length * bone.matrix.a + worldX;
      let dy = skeletonY + bone.data.length * bone.matrix.b + worldY;

      ponits.push([skeletonX + worldX, skeletonY + worldY, dx, dy]);
    }

    g.clear();

    // 骨骼连接线
    g.lineStyle(1, COLOR_BONE_LINE, 1);
    ponits.forEach(([x, y, dx, dy], i) => {
      g.moveTo(x, y);
      g.lineTo(dx, dy);
    });

    // 骨骼节点
    g.beginFill(COLOR_BONE_ORIGIN, 1);
    g.lineStyle(0);
    ponits.forEach(([x, y]) => {
      g.drawCircle(x, y, 2);
    });

    // 中心点
    if (this.drawSkeletonXY) {
      g.beginFill(COLOR_BONE_LINE);
      g.drawStar(skeletonX, skeletonY, 4, 1, 5);
    }
    g.endFill();
  }
  _drawPaths() {
    const { pathsGraphics: g, skeleton } = this;
    const { slots } = skeleton;

    g.clear();
    g.moveTo(0, 0);
    for (let i = 0, n = slots.length; i < n; i++) {
      const slot = slots[i];

      if (!slot.bone.active) {
        continue;
      }

      const attachment = slot.getAttachment();

      if (!(attachment instanceof PathAttachment)) {
        continue;
      }

      const path = attachment;
      let nn = path.worldVerticesLength;
      const world = this.temp = setArraySize(this.temp, nn, 0);

      path.computeWorldVertices(slot, 0, nn, world, 0, 2);

      let x1 = world[2];
      let y1 = world[3];
      let x2 = 0;
      let y2 = 0;

      if (path.closed) {
        let cx1 = world[0];
        let cy1 = world[1];
        let cx2 = world[nn - 2];
        let cy2 = world[nn - 1];

        x2 = world[nn - 4];
        y2 = world[nn - 3];
        g.lineStyle(1, COLOR_PATH, 1);
        g.moveTo(x1, y1);
        g.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        g.lineStyle(1, COLOR_GRAY, 1);
        g.moveTo(x1, y1);
        g.lineTo(cx1, cy1);
        g.moveTo(x2, y2);
        g.lineTo(cx2, cy2);
        g.moveTo(x2, y2);
      }
      nn -= 4;
      for (let ii = 4; ii < nn; ii += 6) {
        let cx1 = world[ii];
        let cy1 = world[ii + 1];
        let cx2 = world[ii + 2];
        let cy2 = world[ii + 3];

        x2 = world[ii + 4];
        y2 = world[ii + 5];
        g.lineStyle(1, COLOR_PATH, 1);
        g.moveTo(x1, y1);
        g.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        g.lineStyle(1, COLOR_GRAY, 1);
        g.moveTo(x1, y1);
        g.lineTo(cx1, cy1);
        g.moveTo(x2, y2);
        g.lineTo(cx2, cy2);
        g.moveTo(x2, y2);
        x1 = x2;
        y1 = y2;
      }
    }
  }
  _drawMeshs() {
    const { meshsGraphics: g, skeleton } = this;
    const { slots } = skeleton;

    g.clear();
    for (let i = 0, n = slots.length; i < n; i++) {
      const slot = slots[i];

      if (!slot.bone.active) {
        continue;
      }

      const attachment = slot.getAttachment();

      if (!(attachment instanceof MeshAttachment)) {
        continue;
      }

      const mesh = attachment;
      const vertices = this.vertices;

      mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, vertices, 0, 2);

      let { triangles, hullLength } = mesh;

      if (this.drawMeshTriangles) {
        g.lineStyle(1, COLOR_TRIANGLE_LINE, 0.5);

        for (let ii = 0, nn = triangles.length; ii < nn; ii += 3) {
          let v1 = triangles[ii] * 2;
          let v2 = triangles[ii + 1] * 2;
          let v3 = triangles[ii + 2] * 2;

          g.moveTo(vertices[v1], vertices[v1 + 1]);
          g.lineTo(vertices[v2], vertices[v2 + 1]);
          g.lineTo(vertices[v3], vertices[v3 + 1]);
        }
      }
      if (this.drawMeshHull && hullLength > 0) {
        hullLength = (hullLength >> 1) * 2;

        let lastX = vertices[hullLength - 2];
        let lastY = vertices[hullLength - 1];

        g.lineStyle(1, COLOR_ATTACHMENT_LINE, 0.5);
        for (let ii = 0, nn = hullLength; ii < nn; ii += 2) {
          const x = vertices[ii];
          const y = vertices[ii + 1];

          g.moveTo(x, y);
          g.lineTo(lastX, lastY);
          lastX = x;
          lastY = y;
        }
      }
    }
  }
  _drawRegionAttachments() {
    const { regionAttachmentsGraphics: g, skeleton } = this;
    const { slots } = skeleton;

    g.clear();
    g.lineStyle(1, COLOR_ATTACHMENT_LINE, 0.5);

    for (let i = 0, n = slots.length; i < n; i++) {
      const slot = slots[i];
      const attachment = slot.getAttachment();

      if (attachment instanceof RegionAttachment) {
        const regionAttachment = attachment;
        const vertices = this.vertices;

        regionAttachment.computeWorldVertices(slot.bone, vertices, 0, 2);

        g.moveTo(vertices[0], vertices[1]);
        g.lineTo(vertices[2], vertices[3]);
        g.lineTo(vertices[4], vertices[5]);
        g.lineTo(vertices[6], vertices[7]);
        g.lineTo(vertices[0], vertices[1]);
      }
    }
  }
  _drawClipping() {
    const { clippingGraphics: g, skeleton } = this;
    const { slots } = skeleton;

    g.clear();
    g.lineStyle(1, COLOR_CLIP_LINE, 1);
    for (let i = 0, n = slots.length; i < n; i++) {
      const slot = slots[i];

      if (!slot.bone.active) {
        continue;
      }

      const attachment = slot.getAttachment();

      if (!(attachment instanceof ClippingAttachment)) {
        continue;
      }

      const clip = attachment;
      const nn = clip.worldVerticesLength;
      const world = setArraySize(this.temp, nn, 0);

      clip.computeWorldVertices(slot, 0, nn, world, 0, 2);
      for (let i = 0, n = world.length; i < n; i += 2) {
        let x = world[i];
        let y = world[i + 1];
        let x2 = world[(i + 2) % world.length];
        let y2 = world[(i + 3) % world.length];

        g.moveTo(x, y);
        g.lineTo(x2, y2);
      }
    }
  }
  clear(clearContainer) {
    this.bonesGraphics && this.bonesGraphics.clear();
    this.pathsGraphics && this.pathsGraphics.clear();
    this.meshsGraphics && this.meshsGraphics.clear();
    this.regionAttachmentsGraphics && this.regionAttachmentsGraphics.clear();
    this.clippingGraphics && this.clippingGraphics.clear();

    if (clearContainer) {
      this.container.removeChildren();
      this.controlBonesContainer.removeChildren();
    }
  }
}

export default Debugger;
