import { SkeletonJSON, SkeletonBinary, AtlasAttachmentLoader, TextureAtlas } from './core';

/**
 * @method
 * @memberof Tiny.spine
 */
function atlasParser() {
  const Resource = Tiny.loaders.Resource;

  return function atlasParser(resource, next) {
    // skip if no data, its not json, or it isn't atlas data
    if (!resource.data) {
      return next();
    }

    const isJSONSpineModel = isJSON(resource) && resource.data.bones;
    const isBinarySpineModel = isBuffer(resource) && (resource.extension === 'skel' || resource.metadata.spineMetadata);

    if (!isJSONSpineModel && !isBinarySpineModel) {
      return next();
    }

    let parser = null;
    let dataToParse = resource.data;

    if (isJSONSpineModel) {
      parser = new SkeletonJSON(null);
    } else {
      parser = new SkeletonBinary(null);
      if (resource.data instanceof ArrayBuffer) {
        dataToParse = new Uint8Array(resource.data);
      }
    }

    const metadata = resource.metadata || {};
    const metadataSkeletonScale = metadata ? resource.metadata.spineSkeletonScale : null;

    if (metadataSkeletonScale) {
      parser.scale = metadataSkeletonScale;
    }

    const metadataAtlas = metadata ? resource.metadata.spineAtlas : null;

    if (metadataAtlas === false) {
      return next();
    }
    // it's an atlas!
    if (metadataAtlas && metadataAtlas.pages) {
      parser.attachmentLoader = new AtlasAttachmentLoader(metadataAtlas);
      resource.spineData = parser.readSkeletonData(dataToParse);
      resource.spineAtlas = metadataAtlas;

      return next();
    }

    const metadataAtlasSuffix = metadata.spineAtlasSuffix || '.atlas';

    /**
     * use a bit of hackery to load the atlas file, here we assume that the .json, .atlas and .png files
     * that correspond to the spine file are in the same base URL and that the .json and .atlas files
     * have the same name
     */
    let atlasPath = resource.url;
    const queryStringPos = atlasPath.indexOf('?');

    if (queryStringPos > 0) {
      // remove querystring
      atlasPath = atlasPath.substr(0, queryStringPos);
    }
    atlasPath = atlasPath.substr(0, atlasPath.lastIndexOf('.')) + metadataAtlasSuffix;
    // use atlas path as a params. (no need to use same atlas file name with json file name)
    if (resource.metadata && resource.metadata.spineAtlasFile) {
      atlasPath = resource.metadata.spineAtlasFile;
    }

    // remove the baseUrl
    atlasPath = atlasPath.replace(this.baseUrl, '');

    const atlasOptions = {
      crossOrigin: resource.crossOrigin,
      xhrType: Resource.XHR_RESPONSE_TYPE.TEXT,
      metadata: metadata.spineMetadata || null,
      parentResource: resource,
    };
    const imageOptions = {
      crossOrigin: resource.crossOrigin,
      metadata: metadata.imageMetadata || null,
      parentResource: resource,
    };
    let baseUrl = resource.url.substr(0, resource.url.lastIndexOf('/') + 1);

    // remove the baseUrl
    baseUrl = baseUrl.replace(this.baseUrl, '');

    const namePrefix = metadata.imageNamePrefix || (resource.name + '_atlas_page_');

    const adapter = metadata.images ? staticImageLoader(metadata.images) : metadata.image ? staticImageLoader({ 'default': metadata.image }) : metadata.imageLoader ? metadata.imageLoader(this, namePrefix, baseUrl, imageOptions) : imageLoaderAdapter(this, namePrefix, baseUrl, imageOptions);
    const createSkeletonWithRawAtlas = function(rawData) {
      return new TextureAtlas(rawData, adapter, function(spineAtlas) {
        if (spineAtlas) {
          parser.attachmentLoader = new AtlasAttachmentLoader(spineAtlas);
          resource.spineData = parser.readSkeletonData(dataToParse);
          resource.spineAtlas = spineAtlas;
        }
        next();
      });
    };

    if (resource.metadata && resource.metadata.atlasRawData) {
      createSkeletonWithRawAtlas(resource.metadata.atlasRawData);
    } else {
      this.add(resource.name + '_atlas', atlasPath, atlasOptions, function(atlasResource) {
        if (!atlasResource.error) {
          createSkeletonWithRawAtlas(atlasResource.data);
        } else {
          next();
        }
      });
    }
  };
}

/**
 * @method
 * @memberof Tiny.spine
 * @param {*} loader
 * @param {*} namePrefix
 * @param {*} baseUrl
 * @param {*} imageOptions
 */
function imageLoaderAdapter(loader, namePrefix, baseUrl, imageOptions) {
  if (baseUrl && baseUrl.lastIndexOf('/') !== (baseUrl.length - 1)) {
    baseUrl += '/';
  }
  return function(line, callback) {
    const name = namePrefix + line;
    const url = baseUrl + line;
    const cachedResource = loader.resources[name];

    function done() {
      callback(cachedResource.texture.baseTexture);
    }
    if (cachedResource) {
      if (cachedResource.texture) {
        done();
      } else {
        cachedResource.onAfterMiddleware.add(done);
      }
    } else {
      loader.add(name, url, imageOptions, (resource) => {
        if (!resource.error) {
          callback(resource.texture.baseTexture);
        } else {
          callback(null);
        }
      });
    }
  };
}

/**
 * @method
 * @memberof Tiny.spine
 * @param {*} pages
 */
function staticImageLoader(pages) {
  return function(line, callback) {
    const page = pages[line] || pages['default'];

    if (page && page.baseTexture) {
      callback(page.baseTexture);
    } else {
      callback(page);
    }
  };
}

/**
 * @private
 * @param {*} resource
 */
function isJSON(resource) {
  return resource.type === Tiny.loaders.Resource.TYPE.JSON;
}

/**
 * @private
 * @param {*} resource
 */
function isBuffer(resource) {
  return resource.xhrType === Tiny.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER;
}

if (Tiny.loaders.Loader) {
  Tiny.loaders.Loader.addTinyMiddleware(atlasParser);
  Tiny.loaders.Resource.setExtensionXhrType('skel', Tiny.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER);
}

export {
  atlasParser,
  imageLoaderAdapter,
  staticImageLoader,
};
