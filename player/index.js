var player;
var mainDom = document.getElementById('J-main');
var chooseFilesBtn = document.getElementById('J-chooseFilesBtn');
var playerContainer = document.getElementById('J-playerContainer');
var premultipliedAlphaCheckbox = document.getElementById('J-premultipliedAlphaCheckbox');
var playerHeight = 488 * window.innerWidth / 960;

mainDom.insertAdjacentHTML(
  'beforeend',
  '<input style="display:none;" type="file" multiple accept=".json,.skel,.atlas,.png" />'
);
playerContainer.style.height = playerHeight + 'px';

var fileBtn = mainDom.lastElementChild;

fileBtn.onchange = function(e) {
  playerContainer.innerHTML = '';

  spineGenerator.Loader.loadSkeletonFiles(fileBtn.files, function(data) {
    console.log(`Loaded files ${data.jsonFile} ${data.skelFile} ${data.atlasFile}`);
    console.log(`${data.version} ${data.majorVersion} ${data.minorVersion} ${data.patchVersion}`);

    showFilsList(data);
    setupPlayer(data, function(p) {
      player = p;
    }, function(message) {
      showError(message);
    });
  }, showError);

  fileBtn.value = '';
};

chooseFilesBtn.addEventListener('click', function() {
  player && player.stopRendering();
  fileBtn.click();
});

function showFilsList(data) {
  var html = [];
  var prefix = '<div class="am-list-brief am-list-cell-noellips">';
  var suffix = '</div>';

  html.push(prefix + 'Version:' + data.version + suffix);
  data.jsonFile && html.push(prefix + 'JSON:' + data.jsonFile + suffix);
  data.skelFile && html.push(prefix + 'SKEL:' + data.skelFile + suffix);
  html.push(prefix + 'ATLAS:' + data.atlasFile + suffix);

  document.getElementById('J-fileLinkList').innerHTML = html.join('');
}

function setupPlayer(data, success, error) {
  playerContainer.insertAdjacentHTML(
    'beforeend',
    '<div id="J-player"></div>'
  );

  var playerElement = playerContainer.lastElementChild;
  var config = {
    jsonUrl: data.jsonFile,
    skelUrl: data.skelFile,
    atlasUrl: data.atlasFile,
    rawDataURIs: data.dataUrls,
    success: success,
    error: error,
    alpha: true,
    viewport: {
      debugRender: true,
    },
  };

  if (premultipliedAlphaCheckbox) {
    config.premultipliedAlpha = premultipliedAlphaCheckbox.checked;
  }

  if (!window.__OFFICIAL__) {
    config.width = window.innerWidth;
    config.height = playerHeight;
  }

  return new spine.SpinePlayer(playerElement, config);
}

function showError(message) {
  alert(typeof message === 'string' ? message : JSON.stringify(message));
}
