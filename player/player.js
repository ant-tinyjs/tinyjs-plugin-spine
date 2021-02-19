var spine;
(function(spine) {
  var TimeKeeper = (function() {
    function TimeKeeper() {
      this.maxDelta = 0.064;
      this.framesPerSecond = 0;
      this.delta = 0;
      this.totalTime = 0;
      this.lastTime = Date.now() / 1000;
      this.frameCount = 0;
      this.frameTime = 0;
    }
    TimeKeeper.prototype.update = function() {
      var now = Date.now() / 1000;
      this.delta = now - this.lastTime;
      this.frameTime += this.delta;
      this.totalTime += this.delta;
      if (this.delta > this.maxDelta) {
        this.delta = this.maxDelta;
      }
      this.lastTime = now;
      this.frameCount++;
      if (this.frameTime > 1) {
        this.framesPerSecond = this.frameCount / this.frameTime;
        this.frameTime = 0;
        this.frameCount = 0;
      }
    };
    return TimeKeeper;
  }());
  var Input = (function() {
    function Input(element) {
      this.lastX = 0;
      this.lastY = 0;
      this.buttonDown = false;
      this.currTouch = null;
      this.touchesPool = new Tiny.spine.Pool(function() {
        return new Touch(0, 0, 0);
      });
      this.listeners = [];
      this.element = element;
      this.setupCallbacks(element);
    }
    Input.prototype.setupCallbacks = function(element) {
      var _this = this;
      var mouseDown = function(ev) {
        if (ev instanceof MouseEvent) {
          var rect = element.getBoundingClientRect();
          var x = ev.clientX - rect.left;
          var y = ev.clientY - rect.top;
          var listeners = _this.listeners;
          for (var i = 0; i < listeners.length; i++) {
            if (listeners[i].down) {
              listeners[i].down(x, y);
            }
          }
          _this.lastX = x;
          _this.lastY = y;
          _this.buttonDown = true;
          document.addEventListener('mousemove', mouseMove);
          document.addEventListener('mouseup', mouseUp);
        }
      };
      var mouseMove = function(ev) {
        if (ev instanceof MouseEvent) {
          var rect = element.getBoundingClientRect();
          var x = ev.clientX - rect.left;
          var y = ev.clientY - rect.top;
          var listeners = _this.listeners;
          for (var i = 0; i < listeners.length; i++) {
            if (_this.buttonDown) {
              if (listeners[i].dragged) {
                listeners[i].dragged(x, y);
              }
            } else {
              if (listeners[i].moved) {
                listeners[i].moved(x, y);
              }
            }
          }
          _this.lastX = x;
          _this.lastY = y;
        }
      };
      var mouseUp = function(ev) {
        if (ev instanceof MouseEvent) {
          var rect = element.getBoundingClientRect();
          var x = ev.clientX - rect.left;
          var y = ev.clientY - rect.top;
          var listeners = _this.listeners;
          for (var i = 0; i < listeners.length; i++) {
            if (listeners[i].up) {
              listeners[i].up(x, y);
            }
          }
          _this.lastX = x;
          _this.lastY = y;
          _this.buttonDown = false;
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('mouseup', mouseUp);
        }
      };
      element.addEventListener('mousedown', mouseDown, true);
      element.addEventListener('mousemove', mouseMove, true);
      element.addEventListener('mouseup', mouseUp, true);
      element.addEventListener('touchstart', function(ev) {
        if (_this.currTouch != null) {
          return;
        }
        var touches = ev.changedTouches;
        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          var rect = element.getBoundingClientRect();
          var x = touch.clientX - rect.left;
          var y = touch.clientY - rect.top;
          _this.currTouch = _this.touchesPool.obtain();
          _this.currTouch.identifier = touch.identifier;
          _this.currTouch.x = x;
          _this.currTouch.y = y;
          break;
        }
        var listeners = _this.listeners;
        for (var ii = 0; ii < listeners.length; ii++) {
          if (listeners[ii].down) {
            listeners[ii].down(_this.currTouch.x, _this.currTouch.y);
          }
        }
        _this.lastX = _this.currTouch.x;
        _this.lastY = _this.currTouch.y;
        _this.buttonDown = true;
        ev.preventDefault();
      }, false);
      element.addEventListener('touchend', function(ev) {
        var touches = ev.changedTouches;
        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          if (_this.currTouch.identifier === touch.identifier) {
            var rect = element.getBoundingClientRect();
            var x = _this.currTouch.x = touch.clientX - rect.left;
            var y = _this.currTouch.y = touch.clientY - rect.top;
            _this.touchesPool.free(_this.currTouch);
            var listeners = _this.listeners;
            for (var iii = 0; iii < listeners.length; iii++) {
              if (listeners[iii].up) {
                listeners[iii].up(x, y);
              }
            }
            _this.lastX = x;
            _this.lastY = y;
            _this.buttonDown = false;
            _this.currTouch = null;
            break;
          }
        }
        ev.preventDefault();
      }, false);
      element.addEventListener('touchcancel', function(ev) {
        var touches = ev.changedTouches;
        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          if (_this.currTouch.identifier === touch.identifier) {
            var rect = element.getBoundingClientRect();
            var x = _this.currTouch.x = touch.clientX - rect.left;
            var y = _this.currTouch.y = touch.clientY - rect.top;
            _this.touchesPool.free(_this.currTouch);
            var listeners = _this.listeners;
            for (var iiii = 0; iiii < listeners.length; iiii++) {
              if (listeners[iiii].up) {
                listeners[iiii].up(x, y);
              }
            }
            _this.lastX = x;
            _this.lastY = y;
            _this.buttonDown = false;
            _this.currTouch = null;
            break;
          }
        }
        ev.preventDefault();
      }, false);
      element.addEventListener('touchmove', function(ev) {
        if (_this.currTouch == null) {
          return;
        }
        var touches = ev.changedTouches;
        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          if (_this.currTouch.identifier === touch.identifier) {
            var rect = element.getBoundingClientRect();
            var x = touch.clientX - rect.left;
            var y = touch.clientY - rect.top;
            var listeners = _this.listeners;
            for (var i5 = 0; i5 < listeners.length; i5++) {
              if (listeners[i5].dragged) {
                listeners[i5].dragged(x, y);
              }
            }
            _this.lastX = _this.currTouch.x = x;
            _this.lastY = _this.currTouch.y = y;
            break;
          }
        }
        ev.preventDefault();
      }, false);
    };
    Input.prototype.addListener = function(listener) {
      this.listeners.push(listener);
    };
    Input.prototype.removeListener = function(listener) {
      var idx = this.listeners.indexOf(listener);
      if (idx > -1) {
        this.listeners.splice(idx, 1);
      }
    };
    return Input;
  }());
  var Touch = (function() {
    function Touch(identifier, x, y) {
      this.identifier = identifier;
      this.x = x;
      this.y = y;
    }
    return Touch;
  }());
  var Popup = (function() {
    function Popup(player, parent, htmlContent) {
      this.player = player;
      this.dom = createElement('<div class="spine-player-popup spine-player-hidden"></div>');
      this.dom.innerHTML = htmlContent;
      parent.appendChild(this.dom);
    }
    Popup.prototype.show = function(dismissedListener) {
      var _this = this;
      this.dom.classList.remove('spine-player-hidden');
      var dismissed = false;
      var resize = function() {
        if (!dismissed) {
          requestAnimationFrame(resize);
        }
        var bottomOffset = Math.abs(_this.dom.getBoundingClientRect().bottom - _this.player.getBoundingClientRect().bottom);
        var rightOffset = Math.abs(_this.dom.getBoundingClientRect().right - _this.player.getBoundingClientRect().right);
        var maxHeight = _this.player.clientHeight - bottomOffset - rightOffset;
        _this.dom.style.maxHeight = maxHeight + 'px';
      };
      requestAnimationFrame(resize);
      var justClicked = true;
      var windowClickListener = function(event) {
        if (justClicked) {
          justClicked = false;
          return;
        }
        if (!isContained(_this.dom, event.target)) {
          _this.dom.remove();
          window.removeEventListener('click', windowClickListener);
          dismissedListener();
          dismissed = true;
        }
      };
      window.addEventListener('click', windowClickListener);
    };
    return Popup;
  }());
  var Switch = (function() {
    function Switch(text) {
      this.text = text;
      this.enabled = false;
    }
    Switch.prototype.render = function() {
      var _this = this;
      this['switch'] = createElement('<div class="spine-player-switch"><span class="spine-player-switch-text">' + this.text + '</span><div class="spine-player-switch-knob-area"><div class="spine-player-switch-knob"></div></div></div>');
      this['switch'].addEventListener('click', function() {
        _this.setEnabled(!_this.enabled);
        if (_this.change) {
          _this.change(_this.enabled);
        }
      });
      return this['switch'];
    };
    Switch.prototype.setEnabled = function(enabled) {
      if (enabled) {
        this['switch'].classList.add('active');
      } else {
        this['switch'].classList.remove('active');
      }
      this.enabled = enabled;
    };
    Switch.prototype.isEnabled = function() {
      return this.enabled;
    };
    return Switch;
  }());
  var Slider = (function() {
    function Slider(snaps, snapPercentage, big) {
      if (snaps === void 0) { snaps = 0; }
      if (snapPercentage === void 0) { snapPercentage = 0.1; }
      if (big === void 0) { big = false; }
      this.snaps = snaps;
      this.snapPercentage = snapPercentage;
      this.big = big;
    }
    Slider.prototype.render = function() {
      var _this = this;
      this.slider = createElement('<div class="spine-player-slider ' + (this.big ? 'big' : '') + '"><div class="spine-player-slider-value"></div><!--<div class="spine-player-slider-knob"></div>--></div>');
      this.value = findWithClass(this.slider, 'spine-player-slider-value')[0];
      this.setValue(0);
      var input = new Input(this.slider);
      var dragging = false;
      input.addListener({
        down: function(x, y) {
          dragging = true;
          _this.value.classList.add('hovering');
        },
        up: function(x, y) {
          dragging = false;
          var percentage = x / _this.slider.clientWidth;
          percentage = percentage = Math.max(0, Math.min(percentage, 1));
          _this.setValue(x / _this.slider.clientWidth);
          if (_this.change) {
            _this.change(percentage);
          }
          _this.value.classList.remove('hovering');
        },
        moved: function(x, y) {
          if (dragging) {
            var percentage = x / _this.slider.clientWidth;
            percentage = Math.max(0, Math.min(percentage, 1));
            percentage = _this.setValue(x / _this.slider.clientWidth);
            if (_this.change) {
              _this.change(percentage);
            }
          }
        },
        dragged: function(x, y) {
          var percentage = x / _this.slider.clientWidth;
          percentage = Math.max(0, Math.min(percentage, 1));
          percentage = _this.setValue(x / _this.slider.clientWidth);
          if (_this.change) {
            _this.change(percentage);
          }
        },
      });
      return this.slider;
    };
    Slider.prototype.setValue = function(percentage) {
      percentage = Math.max(0, Math.min(1, percentage));
      if (this.snaps > 0) {
        var modulo = percentage % (1 / this.snaps);
        if (modulo < (1 / this.snaps) * this.snapPercentage) {
          percentage = percentage - modulo;
        } else if (modulo > (1 / this.snaps) - (1 / this.snaps) * this.snapPercentage) {
          percentage = percentage - modulo + (1 / this.snaps);
        }
        percentage = Math.max(0, Math.min(1, percentage));
      }
      this.value.style.width = '' + (percentage * 100) + '%';
      return percentage;
    };
    return Slider;
  }());
  var LoadingScreen = (function() {
    function LoadingScreen(container) {
      this.cell = new Tiny.Container();
      this.logo = Tiny.Sprite.fromImage(LoadingScreen.SPINE_LOGO_DATA);
      this.loading = Tiny.Sprite.fromImage(LoadingScreen.SPINNER_DATA);

      this.logo.setAnchor(0.5);
      this.loading.setAnchor(0.5);
      this.cell.setScale(2);
      this.cell.addChild(this.loading, this.logo);
      this.cell.setPosition(Tiny.WIN_SIZE.width / 2, Tiny.WIN_SIZE.height / 2);
      this.cell.renderable = true;
      container.addChild(this.cell);
      this.draw();
    }
    LoadingScreen.prototype.draw = function(complete) {
      var action = Tiny.RotateBy(100, { rotation: Tiny.deg2radian(5) });
      if (complete) {
        this.loading.removeActions();
      } else {
        this.loading.runAction(Tiny.RepeatForever(action));
      }
      this.cell.renderable = !complete;
    };
    LoadingScreen.SPINNER_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKMAAACjCAYAAADmbK6AAAAACXBIWXMAAAsTAAALEwEAmpwYAAALB2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTYtMDktMDhUMTQ6MjU6MTIrMDI6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMTEtMTVUMTY6NDA6NTkrMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTExLTE1VDE2OjQwOjU5KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpmZDhlNTljMC02NGJjLTIxNGQtODAyZi1jZDlhODJjM2ZjMGMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpmYmNmZWJlYS03MjY2LWE0NGQtOTI4NS0wOTJmNGNhYzk4ZWEiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowODMzNWIyYy04NzYyLWQzNGMtOTBhOS02ODJjYjJmYTQ2M2UiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHRpZmY6T3JpZW50YXRpb249IjEiIHRpZmY6WFJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpZUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOlJlc29sdXRpb25Vbml0PSIyIiBleGlmOkNvbG9yU3BhY2U9IjY1NTM1IiBleGlmOlBpeGVsWERpbWVuc2lvbj0iMjk3IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iMjQyIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowODMzNWIyYy04NzYyLWQzNGMtOTBhOS02ODJjYjJmYTQ2M2UiIHN0RXZ0OndoZW49IjIwMTYtMDktMDhUMTQ6MjU6MTIrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1LjUgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiNThlMTlkNi0xYTRjLTQyNDEtODU0ZC01MDVlZjYxMjRhODQiIHN0RXZ0OndoZW49IjIwMTgtMTEtMTVUMTY6NDA6MjMrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ3YzYzYzIwLWJkYjgtYzM0YS1hYzMyLWQ5MDdjOWEyOTA0MCIgc3RFdnQ6d2hlbj0iMjAxOC0xMS0xNVQxNjo0MDo1OSswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZmQ4ZTU5YzAtNjRiYy0yMTRkLTgwMmYtY2Q5YTgyYzNmYzBjIiBzdEV2dDp3aGVuPSIyMDE4LTExLTE1VDE2OjQwOjU5KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0N2M2M2MyMC1iZGI4LWMzNGEtYWMzMi1kOTA3YzlhMjkwNDAiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo2OWRmZjljYy01YzFiLWE5NDctOTc3OS03ODgxZjM0ODk3MDMiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowODMzNWIyYy04NzYyLWQzNGMtOTBhOS02ODJjYjJmYTQ2M2UiLz4gPHBob3Rvc2hvcDpEb2N1bWVudEFu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';
    LoadingScreen.SPINE_LOGO_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAABsCAYAAAALzHKmAAAACXBIWXMAAAsTAAALEwEAmpwYAAALB2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTYtMDktMDhUMTQ6MjU6MTIrMDI6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMTEtMTVUMTY6NDA6NTkrMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTExLTE1VDE2OjQwOjU5KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowMTdhZGQ3Ni04OTZlLThlNGUtYmM5MS00ZjEyNjI1YjA3MjgiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDplMTViNGE2ZS1hMDg3LWEzNDktODdhOS1mNDYzYjE2MzQ0Y2MiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowODMzNWIyYy04NzYyLWQzNGMtOTBhOS02ODJjYjJmYTQ2M2UiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHRpZmY6T3JpZW50YXRpb249IjEiIHRpZmY6WFJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpZUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOlJlc29sdXRpb25Vbml0PSIyIiBleGlmOkNvbG9yU3BhY2U9IjY1NTM1IiBleGlmOlBpeGVsWERpbWVuc2lvbj0iMjk3IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iMjQyIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowODMzNWIyYy04NzYyLWQzNGMtOTBhOS02ODJjYjJmYTQ2M2UiIHN0RXZ0OndoZW49IjIwMTYtMDktMDhUMTQ6MjU6MTIrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1LjUgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiNThlMTlkNi0xYTRjLTQyNDEtODU0ZC01MDVlZjYxMjRhODQiIHN0RXZ0OndoZW49IjIwMTgtMTEtMTVUMTY6NDA6MjMrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjJlNjJiMWM2LWIxYzQtNDk0MC04MDMxLWU4ZDkyNTBmODJjNSIgc3RFdnQ6d2hlbj0iMjAxOC0xMS0xNVQxNjo0MDo1OSswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDE3YWRkNzYtODk2ZS04ZTRlLWJjOTEtNGYxMjYyNWIwNzI4IiBzdEV2dDp3aGVuPSIyMDE4LTExLTE1VDE2OjQwOjU5KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyZTYyYjFjNi1iMWM0LTQ5NDAtODAzMS1lOGQ5MjUwZjgyYzUiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo2OWRmZjljYy01YzFiLWE5NDctOTc3OS03ODgxZjM0ODk3MDMiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowODMzNWIyYy04NzYyLWQzNGMtOTBhOS02ODJjYjJmYTQ2M2UiLz4gPHBob3Rvc2hvcDpEb2N1bWVudEFu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';
    return LoadingScreen;
  }());
  var SpinePlayer = (function() {
    function SpinePlayer(parent, config) {
      this.config = config;
      this.time = new TimeKeeper();
      this.paused = true;
      this.playTime = 0;
      this.speed = 1;
      this.animationViewports = {};
      this.currentViewport = null;
      this.previousViewport = null;
      this.viewportTransitionStart = 0;
      this.cancelId = 0;
      if (typeof parent === 'string') {
        this.parent = document.getElementById(parent);
      } else {
        this.parent = parent;
      }
      if (this.app) {
        this.app.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true,
        });
      }
      this.parent.appendChild(this.render());
    }
    SpinePlayer.prototype.validateConfig = function(config) {
      if (!config) {
        throw new Error('Please pass a configuration to new.spine.SpinePlayer().');
      }
      if (!config.jsonUrl && !config.skelUrl) {
        throw new Error('Please specify the URL of the skeleton JSON or .skel file.');
      }
      if (!config.atlasUrl) {
        throw new Error('Please specify the URL of the atlas file.');
      }
      if (!config.alpha) {
        config.alpha = false;
      }
      if (!config.backgroundColor) {
        config.backgroundColor = '#000000';
      }
      if (!config.fullScreenBackgroundColor) {
        config.fullScreenBackgroundColor = config.backgroundColor;
      }
      if (typeof config.premultipliedAlpha === 'undefined') {
        config.premultipliedAlpha = true;
      }
      if (!config.success) {
        config.success = function(widget) {};
      }
      if (!config.error) {
        config.error = function(widget, msg) {};
      }
      if (!config.debug) {
        config.debug = {
          bones: false,
          regions: false,
          meshes: false,
          bounds: false,
          clipping: false,
          paths: false,
          points: false,
          hulls: false,
        };
      }
      if (typeof config.debug.bones === 'undefined') {
        config.debug.bones = false;
      }
      if (typeof config.debug.bounds === 'undefined') {
        config.debug.bounds = false;
      }
      if (typeof config.debug.clipping === 'undefined') {
        config.debug.clipping = false;
      }
      if (typeof config.debug.hulls === 'undefined') {
        config.debug.hulls = false;
      }
      if (typeof config.debug.paths === 'undefined') {
        config.debug.paths = false;
      }
      if (typeof config.debug.points === 'undefined') {
        config.debug.points = false;
      }
      if (typeof config.debug.regions === 'undefined') {
        config.debug.regions = false;
      }
      if (typeof config.debug.meshes === 'undefined') {
        config.debug.meshes = false;
      }
      if (config.animations && config.animation) {
        if (config.animations.indexOf(config.animation) < 0) {
          throw new Error("Default animation '" + config.animation + "' is not contained in the list of selectable animations " + escapeHtml(JSON.stringify(this.config.animations)) + '.');
        }
      }
      if (config.skins && config.skin) {
        if (config.skins.indexOf(config.skin) < 0) {
          throw new Error("Default skin '" + config.skin + "' is not contained in the list of selectable skins " + escapeHtml(JSON.stringify(this.config.skins)) + '.');
        }
      }
      if (!config.controlBones) {
        config.controlBones = [];
      }
      if (typeof config.showControls === 'undefined') {
        config.showControls = true;
      }
      if (typeof config.defaultMix === 'undefined') {
        config.defaultMix = 0.25;
      }
      return config;
    };
    SpinePlayer.prototype.showError = function(error) {
      var errorDom = findWithClass(this.dom, 'spine-player-error')[0];
      errorDom.classList.remove('spine-player-hidden');
      errorDom.innerHTML = '<p style="text-align: center; align-self: center;">' + error + '</p>';
      this.config.error(this, error);
    };
    SpinePlayer.prototype.render = function() {
      var _this = this;
      var config = this.config;
      var dom = this.dom = createElement(`
      <div class="spine-player">
        <canvas class="spine-player-canvas"></canvas>
        <div class="spine-player-error spine-player-hidden"></div>
        <div class="spine-player-controls spine-player-popup-parent spine-player-controls-hidden">
          <div class="spine-player-timeline">
          </div>
          <div class="spine-player-buttons">
            <button id="spine-player-button-play-pause" class="spine-player-button spine-player-button-icon-pause"></button>
            <div class="spine-player-button-spacer"></div>
            <button id="spine-player-button-speed" class="spine-player-button spine-player-button-icon-speed"></button>
            <button id="spine-player-button-animation" class="spine-player-button spine-player-button-icon-animations"></button>
            <button id="spine-player-button-skin" class="spine-player-button spine-player-button-icon-skins"></button>
            <button id="spine-player-button-settings" class="spine-player-button spine-player-button-icon-settings"></button>
            <button id="spine-player-button-fullscreen" class="spine-player-button spine-player-button-icon-fullscreen"></button>
            <img id="spine-player-button-logo" class="spine-player-button-icon-spine-logo" src="data:image/svg+xml,%3Csvg%20id%3D%22Spine_Logo%22%20data-name%3D%22Spine%20Logo%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20104%2031.16%22%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill%3A%23fff%3B%7D.cls-2%7Bfill%3A%23ff4000%3B%7D%3C%2Fstyle%3E%3C%2Fdefs%3E%3Ctitle%3Espine-logo-white%3C%2Ftitle%3E%3Cpath%20id%3D%22e%22%20class%3D%22cls-1%22%20d%3D%22M104%2C12.68a1.31%2C1.31%2C0%2C0%2C1-.37%2C1%2C1.28%2C1.28%2C0%2C0%2C1-.85.31H91.57a10.51%2C10.51%2C0%2C0%2C0%2C.29%2C2.55%2C4.92%2C4.92%2C0%2C0%2C0%2C1%2C2A4.27%2C4.27%2C0%2C0%2C0%2C94.5%2C19.8a6.89%2C6.89%2C0%2C0%2C0%2C2.6.44%2C10.66%2C10.66%2C0%2C0%2C0%2C2.17-.2%2C12.81%2C12.81%2C0%2C0%2C0%2C1.64-.44q.69-.25%2C1.14-.44a1.87%2C1.87%2C0%2C0%2C1%2C.68-.2A.44.44%2C0%2C0%2C1%2C103%2C19a.43.43%2C0%2C0%2C1%2C.16.2%2C1.38%2C1.38%2C0%2C0%2C1%2C.09.37%2C4.89%2C4.89%2C0%2C0%2C1%2C0%2C.58%2C4.14%2C4.14%2C0%2C0%2C1%2C0%2C.43v.32a.83.83%2C0%2C0%2C1-.09.26%2C1.1%2C1.1%2C0%2C0%2C1-.17.22%2C2.77%2C2.77%2C0%2C0%2C1-.61.34%2C8.94%2C8.94%2C0%2C0%2C1-1.32.46%2C18.54%2C18.54%2C0%2C0%2C1-1.88.41%2C13.78%2C13.78%2C0%2C0%2C1-2.28.18%2C10.55%2C10.55%2C0%2C0%2C1-3.68-.59%2C6.82%2C6.82%2C0%2C0%2C1-2.66-1.74%2C7.44%2C7.44%2C0%2C0%2C1-1.63-2.89%2C13.48%2C13.48%2C0%2C0%2C1-.55-4%2C12.76%2C12.76%2C0%2C0%2C1%2C.57-3.94%2C8.35%2C8.35%2C0%2C0%2C1%2C1.64-3%2C7.15%2C7.15%2C0%2C0%2C1%2C2.58-1.87%2C8.47%2C8.47%2C0%2C0%2C1%2C3.39-.65%2C8.19%2C8.19%2C0%2C0%2C1%2C3.41.64%2C6.46%2C6.46%2C0%2C0%2C1%2C2.32%2C1.73A7%2C7%2C0%2C0%2C1%2C103.59%2C9a11.17%2C11.17%2C0%2C0%2C1%2C.43%2C3.13Zm-3.14-.93a5.69%2C5.69%2C0%2C0%2C0-1.09-3.86%2C4.17%2C4.17%2C0%2C0%2C0-3.42-1.4%2C4.52%2C4.52%2C0%2C0%2C0-2%2C.44%2C4.41%2C4.41%2C0%2C0%2C0-1.47%2C1.15A5.29%2C5.29%2C0%2C0%2C0%2C92%2C9.75a7%2C7%2C0%2C0%2C0-.36%2C2Z%22%2F%3E%3Cpath%20id%3D%22n%22%20class%3D%22cls-1%22%20d%3D%22M80.68%2C21.94a.42.42%2C0%2C0%2C1-.08.26.59.59%2C0%2C0%2C1-.25.18%2C1.74%2C1.74%2C0%2C0%2C1-.47.11%2C6.31%2C6.31%2C0%2C0%2C1-.76%2C0%2C6.5%2C6.5%2C0%2C0%2C1-.78%2C0%2C1.74%2C1.74%2C0%2C0%2C1-.47-.11.59.59%2C0%2C0%2C1-.25-.18.42.42%2C0%2C0%2C1-.08-.26V12a9.8%2C9.8%2C0%2C0%2C0-.23-2.35%2C4.86%2C4.86%2C0%2C0%2C0-.66-1.53%2C2.88%2C2.88%2C0%2C0%2C0-1.13-1%2C3.57%2C3.57%2C0%2C0%2C0-1.6-.34%2C4%2C4%2C0%2C0%2C0-2.35.83A12.71%2C12.71%2C0%2C0%2C0%2C69.11%2C10v11.9a.42.42%2C0%2C0%2C1-.08.26.59.59%2C0%2C0%2C1-.25.18%2C1.74%2C1.74%2C0%2C0%2C1-.47.11%2C6.51%2C6.51%2C0%2C0%2C1-.78%2C0%2C6.31%2C6.31%2C0%2C0%2C1-.76%2C0%2C1.88%2C1.88%2C0%2C0%2C1-.48-.11.52.52%2C0%2C0%2C1-.25-.18.46.46%2C0%2C0%2C1-.07-.26v-17A.53.53%2C0%2C0%2C1%2C66%2C4.69a.5.5%2C0%2C0%2C1%2C.23-.19%2C1.28%2C1.28%2C0%2C0%2C1%2C.44-.11%2C8.53%2C8.53%2C0%2C0%2C1%2C1.39%2C0%2C1.12%2C1.12%2C0%2C0%2C1%2C.43.11.6.6%2C0%2C0%2C1%2C.22.19.47.47%2C0%2C0%2C1%2C.07.26V7.2a10.46%2C10.46%2C0%2C0%2C1%2C2.87-2.36%2C6.17%2C6.17%2C0%2C0%2C1%2C2.88-.75%2C6.41%2C6.41%2C0%2C0%2C1%2C2.87.58%2C5.16%2C5.16%2C0%2C0%2C1%2C1.88%2C1.54%2C6.15%2C6.15%2C0%2C0%2C1%2C1%2C2.26%2C13.46%2C13.46%2C0%2C0%2C1%2C.31%2C3.11Z%22%2F%3E%3Cg%20id%3D%22i%22%3E%3Cpath%20class%3D%22cls-2%22%20d%3D%22M43.35%2C2.86c.09%2C2.6%2C1.89%2C4%2C5.48%2C4.61%2C3%2C.48%2C5.79.24%2C6.69-2.37%2C1.75-5.09-2.4-3.82-6-4.39S43.21-1.32%2C43.35%2C2.86Z%22%2F%3E%3Cpath%20class%3D%22cls-2%22%20d%3D%22M44.43%2C13.55c.33%2C1.94%2C2.14%2C3.06%2C4.91%2C3s4.84-1.16%2C5.13-3.25c.53-3.88-2.53-2.38-5.3-2.3S43.77%2C9.74%2C44.43%2C13.55Z%22%2F%3E%3Cpath%20class%3D%22cls-2%22%20d%3D%22M48%2C22.44c.55%2C1.45%2C2.06%2C2.06%2C4.1%2C1.63s3.45-1.11%2C3.33-2.76c-.21-3.06-2.22-2.1-4.26-1.66S47%2C19.6%2C48%2C22.44Z%22%2F%3E%3Cpath%20class%3D%22cls-2%22%20d%3D%22M49.78%2C29.22c.16%2C1.22%2C1.22%2C2%2C2.88%2C1.93s2.92-.67%2C3.13-2c.4-2.43-1.46-1.53-3.12-1.51S49.5%2C26.82%2C49.78%2C29.22Z%22%2F%3E%3C%2Fg%3E%3Cpath%20id%3D%22p%22%20class%3D%22cls-1%22%20d%3D%22M35.28%2C13.16a15.33%2C15.33%2C0%2C0%2C1-.48%2C4%2C8.75%2C8.75%2C0%2C0%2C1-1.42%2C3%2C6.35%2C6.35%2C0%2C0%2C1-2.32%2C1.91%2C7.14%2C7.14%2C0%2C0%2C1-3.16.67%2C6.1%2C6.1%2C0%2C0%2C1-1.4-.15%2C5.34%2C5.34%2C0%2C0%2C1-1.26-.47A7.29%2C7.29%2C0%2C0%2C1%2C24%2C21.31q-.61-.49-1.29-1.15v8.51a.47.47%2C0%2C0%2C1-.08.26.56.56%2C0%2C0%2C1-.25.19%2C1.74%2C1.74%2C0%2C0%2C1-.47.11%2C6.47%2C6.47%2C0%2C0%2C1-.78%2C0%2C6.26%2C6.26%2C0%2C0%2C1-.76%2C0%2C1.89%2C1.89%2C0%2C0%2C1-.48-.11.49.49%2C0%2C0%2C1-.25-.19.51.51%2C0%2C0%2C1-.07-.26V4.91a.57.57%2C0%2C0%2C1%2C.06-.27.46.46%2C0%2C0%2C1%2C.23-.18%2C1.47%2C1.47%2C0%2C0%2C1%2C.44-.1%2C7.41%2C7.41%2C0%2C0%2C1%2C1.3%2C0%2C1.45%2C1.45%2C0%2C0%2C1%2C.43.1.52.52%2C0%2C0%2C1%2C.24.18.51.51%2C0%2C0%2C1%2C.07.27V7.2a18.06%2C18.06%2C0%2C0%2C1%2C1.49-1.38%2C9%2C9%2C0%2C0%2C1%2C1.45-1%2C6.82%2C6.82%2C0%2C0%2C1%2C1.49-.59%2C7.09%2C7.09%2C0%2C0%2C1%2C4.78.52%2C6%2C6%2C0%2C0%2C1%2C2.13%2C2%2C8.79%2C8.79%2C0%2C0%2C1%2C1.2%2C2.9A15.72%2C15.72%2C0%2C0%2C1%2C35.28%2C13.16ZM32%2C13.52a15.64%2C15.64%2C0%2C0%2C0-.2-2.53%2C7.32%2C7.32%2C0%2C0%2C0-.69-2.17%2C4.06%2C4.06%2C0%2C0%2C0-1.3-1.51%2C3.49%2C3.49%2C0%2C0%2C0-2-.57%2C4.1%2C4.1%2C0%2C0%2C0-1.2.18%2C4.92%2C4.92%2C0%2C0%2C0-1.2.57%2C8.54%2C8.54%2C0%2C0%2C0-1.28%2C1A15.77%2C15.77%2C0%2C0%2C0%2C22.76%2C10v6.77a13.53%2C13.53%2C0%2C0%2C0%2C2.46%2C2.4%2C4.12%2C4.12%2C0%2C0%2C0%2C2.44.83%2C3.56%2C3.56%2C0%2C0%2C0%2C2-.57A4.28%2C4.28%2C0%2C0%2C0%2C31%2C18a7.58%2C7.58%2C0%2C0%2C0%2C.77-2.12A11.43%2C11.43%2C0%2C0%2C0%2C32%2C13.52Z%22%2F%3E%3Cpath%20id%3D%22s%22%20class%3D%22cls-1%22%20d%3D%22M12%2C17.3a5.39%2C5.39%2C0%2C0%2C1-.48%2C2.33%2C4.73%2C4.73%2C0%2C0%2C1-1.37%2C1.72%2C6.19%2C6.19%2C0%2C0%2C1-2.12%2C1.06%2C9.62%2C9.62%2C0%2C0%2C1-2.71.36%2C10.38%2C10.38%2C0%2C0%2C1-3.21-.5%2C7.63%2C7.63%2C0%2C0%2C1-1.11-.45%2C3.25%2C3.25%2C0%2C0%2C1-.66-.43%2C1.09%2C1.09%2C0%2C0%2C1-.3-.53A3.59%2C3.59%2C0%2C0%2C1%2C0%2C19.93a4.06%2C4.06%2C0%2C0%2C1%2C0-.61%2C2%2C2%2C0%2C0%2C1%2C.09-.4.42.42%2C0%2C0%2C1%2C.16-.22.43.43%2C0%2C0%2C1%2C.24-.07%2C1.35%2C1.35%2C0%2C0%2C1%2C.61.26q.41.26%2C1%2C.56A9.22%2C9.22%2C0%2C0%2C0%2C3.51%2C20a6.25%2C6.25%2C0%2C0%2C0%2C1.87.26%2C5.62%2C5.62%2C0%2C0%2C0%2C1.44-.17%2C3.48%2C3.48%2C0%2C0%2C0%2C1.12-.5%2C2.23%2C2.23%2C0%2C0%2C0%2C.73-.84%2C2.68%2C2.68%2C0%2C0%2C0%2C.26-1.21%2C2%2C2%2C0%2C0%2C0-.37-1.21%2C3.55%2C3.55%2C0%2C0%2C0-1-.87A8.09%2C8.09%2C0%2C0%2C0%2C6.2%2C14.8l-1.56-.61a16%2C16%2C0%2C0%2C1-1.57-.73%2C6%2C6%2C0%2C0%2C1-1.37-1%2C4.52%2C4.52%2C0%2C0%2C1-1-1.4%2C4.69%2C4.69%2C0%2C0%2C1-.37-2A4.88%2C4.88%2C0%2C0%2C1%2C.72%2C7.19%2C4.46%2C4.46%2C0%2C0%2C1%2C1.88%2C5.58%2C5.83%2C5.83%2C0%2C0%2C1%2C3.82%2C4.47%2C8.06%2C8.06%2C0%2C0%2C1%2C6.53%2C4a8.28%2C8.28%2C0%2C0%2C1%2C1.36.11%2C9.36%2C9.36%2C0%2C0%2C1%2C1.23.28%2C5.92%2C5.92%2C0%2C0%2C1%2C.94.37%2C4.09%2C4.09%2C0%2C0%2C1%2C.59.35%2C1%2C1%2C0%2C0%2C1%2C.26.26.83.83%2C0%2C0%2C1%2C.09.26%2C1.32%2C1.32%2C0%2C0%2C0%2C.06.35%2C3.87%2C3.87%2C0%2C0%2C1%2C0%2C.51%2C4.76%2C4.76%2C0%2C0%2C1%2C0%2C.56%2C1.39%2C1.39%2C0%2C0%2C1-.09.39.5.5%2C0%2C0%2C1-.16.22.35.35%2C0%2C0%2C1-.21.07%2C1%2C1%2C0%2C0%2C1-.49-.21%2C7%2C7%2C0%2C0%2C0-.83-.44%2C9.26%2C9.26%2C0%2C0%2C0-1.2-.44A5.49%2C5.49%2C0%2C0%2C0%2C6.5%2C6.48a4.93%2C4.93%2C0%2C0%2C0-1.4.18%2C2.69%2C2.69%2C0%2C0%2C0-1%2C.51A2.16%2C2.16%2C0%2C0%2C0%2C3.51%2C8a2.43%2C2.43%2C0%2C0%2C0-.2%2C1%2C2%2C2%2C0%2C0%2C0%2C.38%2C1.24%2C3.6%2C3.6%2C0%2C0%2C0%2C1%2C.88%2C8.25%2C8.25%2C0%2C0%2C0%2C1.38.68l1.58.62q.8.32%2C1.59.72a6%2C6%2C0%2C0%2C1%2C1.39%2C1%2C4.37%2C4.37%2C0%2C0%2C1%2C1%2C1.36A4.46%2C4.46%2C0%2C0%2C1%2C12%2C17.3Z%22%2F%3E%3C%2Fsvg%3E"/>
          </div>
        </div>
      </div>
      `);
      try {
        this.config = this.validateConfig(config);
      } catch (e) {
        this.showError(e);
        return dom;
      }
      this.canvas = findWithClass(dom, 'spine-player-canvas')[0];
      this.app = new Tiny.Application({
        dpi: 2,
        showFPS: true,
        width: config.width,
        height: config.height,
        fixSize: true,
        canvasId: this.canvas,
        renderOptions: {
          antialias: true,
          transparent: true,
        },
      });

      // Setup rendering loop
      this.container = new Tiny.Container();
      this.loadingScreen = new LoadingScreen(this.container);
      this.container.updateTransform = function() {
        _this.drawFrame();
        this.containerUpdateTransform();
      };
      this.app.run(this.container);

      // Setup the event listeners for UI elements
      var timeline = findWithClass(dom, 'spine-player-timeline')[0];
      var speedButton = findWithId(dom, 'spine-player-button-speed')[0];
      var settingsButton = findWithId(dom, 'spine-player-button-settings')[0];
      var fullscreenButton = findWithId(dom, 'spine-player-button-fullscreen')[0];
      var logoButton = findWithId(dom, 'spine-player-button-logo')[0];
      this.timelineSlider = new Slider();
      this.playerControls = findWithClass(dom, 'spine-player-controls')[0];
      timeline.appendChild(this.timelineSlider.render());
      this.playButton = findWithId(dom, 'spine-player-button-play-pause')[0];
      this.animationButton = findWithId(dom, 'spine-player-button-animation')[0];
      this.skinButton = findWithId(dom, 'spine-player-button-skin')[0];
      this.playButton.onclick = function() {
        if (_this.paused) {
          _this.play();
        } else {
          _this.pause();
        }
      };
      speedButton.onclick = function() {
        _this.showSpeedDialog(speedButton);
      };
      this.animationButton.onclick = function() {
        _this.showAnimationsDialog(_this.animationButton);
      };
      this.skinButton.onclick = function() {
        _this.showSkinsDialog(_this.skinButton);
      };
      settingsButton.onclick = function() {
        _this.showSettingsDialog(settingsButton);
      };
      fullscreenButton.onclick = function() {
        alert('Sorry, current runtime does not support fullscreen.');
      };
      logoButton.onclick = function() {
        window.open('http://esotericsoftware.com');
      };
      return dom;
    };
    SpinePlayer.prototype.showSpeedDialog = function(speedButton) {
      var _this = this;
      if (this.lastPopup) {
        this.lastPopup.dom.remove();
      }
      if (this.lastPopup && findWithClass(this.lastPopup.dom, 'spine-player-popup-title')[0].textContent === 'Speed') {
        this.lastPopup = null;
        speedButton.classList.remove('spine-player-button-icon-speed-selected');
        return;
      }
      var popup = new Popup(this.dom, this.playerControls, `
      <div class="spine-player-popup-title">Speed</div>
      <hr>
      <div class="spine-player-row" style="user-select: none; align-items: center; padding: 8px;">
        <div class="spine-player-column">
          <div class="spine-player-speed-slider" style="margin-bottom: 4px;"></div>
          <div class="spine-player-row" style="justify-content: space-between;">
            <div>0.1x</div>
            <div>1x</div>
            <div>2x</div>
          </div>
        </div>
      </div>
      `);
      var sliderParent = findWithClass(popup.dom, 'spine-player-speed-slider')[0];
      var slider = new Slider(2, 0.1, true);
      sliderParent.appendChild(slider.render());
      slider.setValue(this.speed / 2);
      slider.change = function(percentage) {
        _this.speed = percentage * 2;
      };
      speedButton.classList.add('spine-player-button-icon-speed-selected');
      popup.show(function() {
        speedButton.classList.remove('spine-player-button-icon-speed-selected');
        popup.dom.remove();
        _this.lastPopup = null;
      });
      this.lastPopup = popup;
    };
    SpinePlayer.prototype.showAnimationsDialog = function(animationsButton) {
      var _this = this;
      if (this.lastPopup) {
        this.lastPopup.dom.remove();
      }
      if (this.lastPopup && findWithClass(this.lastPopup.dom, 'spine-player-popup-title')[0].textContent === 'Animations') {
        this.lastPopup = null;
        animationsButton.classList.remove('spine-player-button-icon-animations-selected');
        return;
      }
      if (!this.skeleton || this.skeleton.data.animations.length === 0) {
        return;
      }
      var popup = new Popup(this.dom, this.playerControls, '<div class="spine-player-popup-title">Animations</div><hr><ul class="spine-player-list"></ul>');
      var rows = findWithClass(popup.dom, 'spine-player-list')[0];
      this.skeleton.data.animations.forEach(function(animation) {
        if (_this.config.animations && _this.config.animations.indexOf(animation.name) < 0) {
          return;
        }
        var row = createElement(`
        <li class="spine-player-list-item selectable">
          <div class="selectable-circle">
          </div>
          <div class="selectable-text">
          </div>
        </li>
        `);
        if (animation.name === _this.config.animation) {
          row.classList.add('selected');
        }
        findWithClass(row, 'selectable-text')[0].innerText = animation.name;
        rows.appendChild(row);
        row.onclick = function() {
          removeClass(rows.children, 'selected');
          row.classList.add('selected');
          _this.config.animation = animation.name;
          _this.playTime = 0;
          _this.setAnimation(animation.name);
        };
      });
      animationsButton.classList.add('spine-player-button-icon-animations-selected');
      popup.show(function() {
        animationsButton.classList.remove('spine-player-button-icon-animations-selected');
        popup.dom.remove();
        _this.lastPopup = null;
      });
      this.lastPopup = popup;
    };
    SpinePlayer.prototype.showSkinsDialog = function(skinButton) {
      var _this = this;
      if (this.lastPopup) {
        this.lastPopup.dom.remove();
      }
      if (this.lastPopup && findWithClass(this.lastPopup.dom, 'spine-player-popup-title')[0].textContent === 'Skins') {
        this.lastPopup = null;
        skinButton.classList.remove('spine-player-button-icon-skins-selected');
        return;
      }
      if (!this.skeleton || this.skeleton.data.animations.length === 0) {
        return;
      }
      var popup = new Popup(this.dom, this.playerControls, `
      <div class="spine-player-popup-title">Skins</div>
        <hr>
      <ul class="spine-player-list"></ul>
      `);
      var rows = findWithClass(popup.dom, 'spine-player-list')[0];
      this.skeleton.data.skins.forEach(function(skin) {
        if (_this.config.skins && _this.config.skins.indexOf(skin.name) < 0) {
          return;
        }
        var row = createElement(`
        <li class="spine-player-list-item selectable">
          <div class="selectable-circle">
          </div>
          <div class="selectable-text">
          </div>
        </li>
        `);
        if (skin.name === _this.config.skin) {
          row.classList.add('selected');
        }
        findWithClass(row, 'selectable-text')[0].innerText = skin.name;
        rows.appendChild(row);
        row.onclick = function() {
          removeClass(rows.children, 'selected');
          row.classList.add('selected');
          _this.config.skin = skin.name;
          _this.skeleton.setSkinByName(_this.config.skin);
          _this.skeleton.setSlotsToSetupPose();
        };
      });
      skinButton.classList.add('spine-player-button-icon-skins-selected');
      popup.show(function() {
        skinButton.classList.remove('spine-player-button-icon-skins-selected');
        popup.dom.remove();
        _this.lastPopup = null;
      });
      this.lastPopup = popup;
    };
    SpinePlayer.prototype.showSettingsDialog = function(settingsButton) {
      var _this = this;
      if (this.lastPopup) {
        this.lastPopup.dom.remove();
      }
      if (this.lastPopup && findWithClass(this.lastPopup.dom, 'spine-player-popup-title')[0].textContent === 'Debug') {
        this.lastPopup = null;
        settingsButton.classList.remove('spine-player-button-icon-settings-selected');
        return;
      }
      if (!this.skeleton || this.skeleton.data.animations.length === 0) {
        return;
      }
      var popup = new Popup(this.dom, this.playerControls, `
        <div class="spine-player-popup-title">Debug</div>
        <hr>
        <ul class="spine-player-list"></ul>
      `);
      var rows = findWithClass(popup.dom, 'spine-player-list')[0];
      var makeItem = function(label, name) {
        var row = createElement('<li class="spine-player-list-item"></li>');
        var s = new Switch(label);
        row.appendChild(s.render());
        s.setEnabled(_this.config.debug[name]);
        s.change = function(value) {
          _this.config.debug[name] = value;
        };
        rows.appendChild(row);
      };
      makeItem('Bones', 'bones');
      makeItem('Regions', 'regions');
      makeItem('Meshes', 'meshes');
      makeItem('Bounds', 'bounds');
      makeItem('Paths', 'paths');
      makeItem('Clipping', 'clipping');
      makeItem('Points', 'points');
      settingsButton.classList.add('spine-player-button-icon-settings-selected');
      popup.show(function() {
        settingsButton.classList.remove('spine-player-button-icon-settings-selected');
        popup.dom.remove();
        _this.lastPopup = null;
      });
      this.lastPopup = popup;
    };
    SpinePlayer.prototype.drawFrame = function() {
      if (!this.isLoadingSkeleton && !this.spineData) {
        this.loadSkeleton();
      }
      // Update and draw the skeleton
      if (this.loaded) {
        // Update animation and skeleton based on user selections
        if (!this.paused && this.config.animation) {
          this.time.update();
          var delta = this.time.delta * this.speed;
          var animationDuration = this.animationState.getCurrent(0).animation.duration;
          this.playTime += delta;
          while (this.playTime >= animationDuration && animationDuration !== 0) { // eslint-disable-line
            this.playTime -= animationDuration;
          }
          this.playTime = Math.max(0, Math.min(this.playTime, animationDuration));
          this.timelineSlider.setValue(this.playTime / animationDuration);
          this.spineInstance.update(delta);
        }

        var viewport = {
          x: this.currentViewport.x - this.currentViewport.padLeft,
          y: this.currentViewport.y - this.currentViewport.padBottom,
          width: this.currentViewport.width + this.currentViewport.padLeft + this.currentViewport.padRight,
          height: this.currentViewport.height + this.currentViewport.padBottom + this.currentViewport.padTop,
        };
        var transitionAlpha = ((performance.now() - this.viewportTransitionStart) / 1000) / this.config.viewport.transitionTime;

        if (this.previousViewport && transitionAlpha < 1) {
          var oldViewport = {
            x: this.previousViewport.x - this.previousViewport.padLeft,
            y: this.previousViewport.y - this.previousViewport.padBottom,
            width: this.previousViewport.width + this.previousViewport.padLeft + this.previousViewport.padRight,
            height: this.previousViewport.height + this.previousViewport.padBottom + this.previousViewport.padTop,
          };
          viewport = {
            x: oldViewport.x + (viewport.x - oldViewport.x) * transitionAlpha,
            y: oldViewport.y + (viewport.y - oldViewport.y) * transitionAlpha,
            width: oldViewport.width + (viewport.width - oldViewport.width) * transitionAlpha,
            height: oldViewport.height + (viewport.height - oldViewport.height) * transitionAlpha,
          };
        }

        var viewportSize = this.scale(viewport.width, viewport.height, this.canvas.width, this.canvas.height);
        var radio = viewport.width / viewportSize.x;

        this.spineInstance.setScale(1 / radio);
        this.spineInstance.setPosition(
          Tiny.WIN_SIZE.width / 2 - (viewport.x + viewport.width / 2) / radio,
          Tiny.WIN_SIZE.height / 2 - (viewport.y + viewport.height / 2) / radio
        );

        // Draw background image if given
        if (this.config.backgroundImage && this.config.backgroundImage.url) {
          // TODO: background image
        }

        // Draw skeleton and debug output
        var debuggerInstance = this.debuggerInstance;
        debuggerInstance.bonesGraphics.renderable = this.config.debug.bones;
        debuggerInstance.clippingGraphics.renderable = this.config.debug.clipping;
        debuggerInstance.pathsGraphics.renderable = this.config.debug.paths;
        debuggerInstance.regionAttachmentsGraphics.renderable = this.config.debug.regions;
        debuggerInstance.meshsGraphics.renderable = this.config.debug.meshes;
        debuggerInstance.meshsGraphics.renderable = this.config.debug.meshes;

        // Render the viewport bounds
        if (this.config.viewport.debugRender) {
          var greenRectName = 'green-bound';
          var greenRect = new Tiny.Graphics();
          greenRect.name = greenRectName;
          greenRect.lineStyle(1, 0x00ff00, 1);
          greenRect.drawRect(this.currentViewport.x / radio, this.currentViewport.y / radio, this.currentViewport.width / radio, this.currentViewport.height / radio);
          greenRect.endFill();
          var greenBoundRect = this.container.getChildByName(greenRectName);
          if (greenBoundRect) {
            this.container.removeChild(greenBoundRect);
          }
          this.container.addChild(greenRect);
          greenRect.setPosition(
            Tiny.WIN_SIZE.width / 2 - this.currentViewport.x / radio - this.currentViewport.width / radio / 2,
            Tiny.WIN_SIZE.height / 2 - this.currentViewport.y / radio - this.currentViewport.height / radio / 2,
          );

          var redRectName = 'red-bound';
          var redRect = new Tiny.Graphics();
          redRect.name = redRectName;
          redRect.lineStyle(1, 0xff0000, 1);
          redRect.drawRect(viewport.x / radio, viewport.y / radio, viewport.width / radio, viewport.height / radio);
          redRect.endFill();
          var redBoundRect = this.container.getChildByName(redRectName);
          if (redBoundRect) {
            this.container.removeChild(redBoundRect);
          }
          this.container.addChild(redRect);
          redRect.setPosition(
            Tiny.WIN_SIZE.width / 2 - viewport.x / radio - viewport.width / radio / 2,
            Tiny.WIN_SIZE.height / 2 - viewport.y / radio - viewport.height / radio / 2,
          );
        }
      }
    };
    SpinePlayer.prototype.scale = function (sourceWidth, sourceHeight, targetWidth, targetHeight) {
      var targetRatio = targetHeight / targetWidth;
      var sourceRatio = sourceHeight / sourceWidth;
      var scale = targetRatio > sourceRatio ? targetWidth / sourceWidth : targetHeight / sourceHeight;
      var temp = new Tiny.spine.Vector2();
      temp.x = sourceWidth * scale;
      temp.y = sourceHeight * scale;
      return temp;
    };
    SpinePlayer.prototype.loadSkeleton = function() {
      if (this.loaded) {
        return;
      }
      var _this = this;
      var config = this.config;
      var setupSpine = function(skeletonData) {
        var spineInstance = new Tiny.spine.Spine(skeletonData);
        spineInstance.autoUpdate = false;
        _this.container.addChild(spineInstance);

        spineInstance.stateData.defaultMix = config.defaultMix;
        _this.spineInstance = spineInstance;
        _this.animationState = spineInstance.state;
        _this.skeleton = spineInstance.skeleton;
        _this.debuggerInstance = new Tiny.spine.Debugger(spineInstance, {
          drawRegionAttachments: true,
          drawMeshHull: true,
          drawMeshTriangles: true,
          drawPaths: true,
          drawBones: true,
          drawClipping: true,
          drawSkeletonXY: true,
        });

        // Check if all controllable bones are in the skeleton
        if (config.controlBones) {
          config.controlBones.forEach(function(bone) {
            if (!skeletonData.findBone(bone)) {
              _this.showError("Error: control bone '" + bone + "' does not exist in skeleton.");
            }
          });
        }

        // Setup skin
        if (!config.skin) {
          if (skeletonData.skins.length > 0) {
            config.skin = skeletonData.skins[0].name;
          }
        }

        if (config.skins && config.skin.length > 0) {
          config.skins.forEach(function(skin) {
            if (!_this.skeleton.data.findSkin(skin)) {
              _this.showError("Error: skin '" + skin + "' in selectable skin list does not exist in skeleton.");
            }
          });
        }

        if (config.skin) {
          if (!_this.skeleton.data.findSkin(config.skin)) {
            _this.showError("Error: skin '" + config.skin + "' does not exist in skeleton.");
            return;
          }
          _this.skeleton.setSkinByName(config.skin);
          _this.skeleton.setSlotsToSetupPose();
        }

        // Setup empty viewport if none is given and check if all animations for which viewports where given exist.
        if (!config.viewport) {
          config.viewport = {
            animations: {},
            debugRender: false,
            transitionTime: 0.2,
          };
        }
        if (typeof config.viewport.debugRender === 'undefined') {
          config.viewport.debugRender = false;
        }
        if (typeof config.viewport.transitionTime === 'undefined') {
          config.viewport.transitionTime = 0.2;
        }
        if (!config.viewport.animations) {
          config.viewport.animations = {};
        } else {
          Object.getOwnPropertyNames(config.viewport.animations).forEach(function(animation) {
            if (!skeletonData.findAnimation(animation)) {
              _this.showError("Error: animation '" + animation + "' for which a viewport was specified does not exist in skeleton.");
            }
          });
        }

        // Setup the animations after viewport, so default bounds don't get messed up.
        if (config.animations && config.animations.length > 0) {
          config.animations.forEach(function(animation) {
            if (!_this.skeleton.data.findAnimation(animation)) {
              _this.showError("Error: animation '" + animation + "' in selectable animation list does not exist in skeleton.");
            }
          });
          if (!config.animation) {
            config.animation = config.animations[0];
          }
        }

        if (!config.animation) {
          if (skeletonData.animations.length > 0) {
            config.animation = skeletonData.animations[0].name;
          }
        }

        if (config.animation) {
          if (!skeletonData.findAnimation(config.animation)) {
            _this.showError("Error: animation '" + config.animation + "' does not exist in skeleton.");
            return;
          }
          _this.play();
          _this.timelineSlider.change = function(percentage) {
            _this.pause();
            var animationDuration = _this.animationState.getCurrent(0).animation.duration;
            var time = animationDuration * percentage;
            _this.spineInstance.update(time - _this.playTime);
            _this.playTime = time;
          };
        }

        // Setup the input processor and controllable bones
        _this.setupInput();

        // Hide skin and animation if there's only the default skin / no animation
        if (skeletonData.skins.length === 1 || (config.skins && config.skins.length === 1)) {
          _this.skinButton.classList.add('spine-player-hidden');
        }
        if (skeletonData.animations.length === 1 || (config.animations && config.animations.length === 1)) {
          _this.animationButton.classList.add('spine-player-hidden');
        }

        config.success(_this);
        _this.loaded = true;
        _this.loadingScreen.draw(true);
      };

      this.isLoadingSkeleton = true;
      downloadText(config.rawDataURIs[config.atlasUrl], function(data) {
        var rawAtlasData = data;
        var spineAtlas = new Tiny.spine.TextureAtlas(rawAtlasData, function(line, callback) {
          callback(Tiny.BaseTexture.fromImage(config.rawDataURIs[line]));
        });
        var spineAtlasLoader = new Tiny.spine.AtlasAttachmentLoader(spineAtlas);
        if (config.jsonUrl) {
          downloadText(config.rawDataURIs[config.jsonUrl], function(data) {
            var rawSkeletonData = JSON.parse(data);
            var spineJSONParser = new Tiny.spine.SkeletonJSON(spineAtlasLoader);
            _this.spineData = spineJSONParser.readSkeletonData(rawSkeletonData);
            setupSpine(_this.spineData);
          });
        } else {
          downloadBinary(config.rawDataURIs[config.skelUrl], function(data) {
            var rawSkeletonData = data;
            var spineBinaryParser = new Tiny.spine.SkeletonBinary(spineAtlasLoader);
            _this.spineData = spineBinaryParser.readSkeletonData(rawSkeletonData);
            setupSpine(_this.spineData);
          });
        }
      });
    };
    SpinePlayer.prototype.setupInput = function() {
      var _this = this;
      var canvas = this.canvas;
      var input = new Input(canvas);
      var target = null;
      input.addListener({
        up: function (x, y) {
          if (target) {
            target = null;
          } else {
            if (!_this.config.showControls) {
              return;
            }
            if (_this.paused) {
              _this.play();
            } else {
              _this.pause();
            }
          }
        },
      });
      var mouseOverControls = true;
      var mouseOverCanvas = false;
      document.addEventListener('mousemove', function(ev) {
        if (ev instanceof MouseEvent) {
          handleHover(ev.clientX, ev.clientY);
        }
      });
      document.addEventListener('touchmove', function(ev) {
        if (ev instanceof TouchEvent) {
          var touches = ev.changedTouches;
          if (touches.length > 0) {
            var touch = touches[0];
            handleHover(touch.clientX, touch.clientY);
          }
        }
      });
      var handleHover = function(mouseX, mouseY) {
        if (!_this.config.showControls) {
          return;
        }
        var popup = findWithClass(_this.dom, 'spine-player-popup');
        mouseOverControls = overlap(mouseX, mouseY, _this.playerControls.getBoundingClientRect());
        mouseOverCanvas = overlap(mouseX, mouseY, _this.canvas.getBoundingClientRect());
        clearTimeout(_this.cancelId);
        var hide = popup.length === 0 && !mouseOverControls && !mouseOverCanvas && !_this.paused;
        if (hide) {
          _this.playerControls.classList.add('spine-player-controls-hidden');
        } else {
          _this.playerControls.classList.remove('spine-player-controls-hidden');
        }
        if (!mouseOverControls && popup.length === 0 && !_this.paused) {
          var remove = function() {
            if (!_this.paused) {
              _this.playerControls.classList.add('spine-player-controls-hidden');
            }
          };
          _this.cancelId = setTimeout(remove, 1000);
        }
      };
      var overlap = function(mouseX, mouseY, rect) {
        var x = mouseX - rect.left;
        var y = mouseY - rect.top;
        return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      };
    };
    SpinePlayer.prototype.play = function() {
      var _this = this;
      this.paused = false;
      var remove = function() {
        if (!_this.paused) {
          _this.playerControls.classList.add('spine-player-controls-hidden');
        }
      };
      this.cancelId = setTimeout(remove, 1000);
      this.playButton.classList.remove('spine-player-button-icon-play');
      this.playButton.classList.add('spine-player-button-icon-pause');
      if (this.config.animation) {
        if (!this.animationState.getCurrent(0)) {
          this.setAnimation(this.config.animation);
        }
      }
    };
    SpinePlayer.prototype.pause = function() {
      this.paused = true;
      this.playerControls.classList.remove('spine-player-controls-hidden');
      clearTimeout(this.cancelId);
      this.playButton.classList.remove('spine-player-button-icon-pause');
      this.playButton.classList.add('spine-player-button-icon-play');
    };
    SpinePlayer.prototype.setAnimation = function(animation) {
      this.previousViewport = this.currentViewport;
      var animViewport = this.calculateAnimationViewport(animation);
      var viewport = {
        x: animViewport.x,
        y: animViewport.y,
        width: animViewport.width,
        height: animViewport.height,
        padLeft: '10%',
        padRight: '10%',
        padTop: '10%',
        padBottom: '10%',
      };
      var globalViewport = this.config.viewport;
      if (typeof globalViewport.x !== 'undefined' && typeof globalViewport.y !== 'undefined' && typeof globalViewport.width !== 'undefined' && typeof globalViewport.height !== 'undefined') {
        viewport.x = globalViewport.x;
        viewport.y = globalViewport.y;
        viewport.width = globalViewport.width;
        viewport.height = globalViewport.height;
      }
      if (typeof globalViewport.padLeft !== 'undefined') {
        viewport.padLeft = globalViewport.padLeft;
      }
      if (typeof globalViewport.padRight !== 'undefined') {
        viewport.padRight = globalViewport.padRight;
      }
      if (typeof globalViewport.padTop !== 'undefined') {
        viewport.padTop = globalViewport.padTop;
      }
      if (typeof globalViewport.padBottom !== 'undefined') {
        viewport.padBottom = globalViewport.padBottom;
      }
      var userAnimViewport = this.config.viewport.animations[animation];
      if (userAnimViewport) {
        if (typeof userAnimViewport.x !== 'undefined' && typeof userAnimViewport.y !== 'undefined' && typeof userAnimViewport.width !== 'undefined' && typeof userAnimViewport.height !== 'undefined') {
          viewport.x = userAnimViewport.x;
          viewport.y = userAnimViewport.y;
          viewport.width = userAnimViewport.width;
          viewport.height = userAnimViewport.height;
        }
        if (typeof userAnimViewport.padLeft !== 'undefined') {
          viewport.padLeft = userAnimViewport.padLeft;
        }
        if (typeof userAnimViewport.padRight !== 'undefined') {
          viewport.padRight = userAnimViewport.padRight;
        }
        if (typeof userAnimViewport.padTop !== 'undefined') {
          viewport.padTop = userAnimViewport.padTop;
        }
        if (typeof userAnimViewport.padBottom !== 'undefined') {
          viewport.padBottom = userAnimViewport.padBottom;
        }
      }
      viewport.padLeft = this.percentageToWorldUnit(viewport.width, viewport.padLeft);
      viewport.padRight = this.percentageToWorldUnit(viewport.width, viewport.padRight);
      viewport.padBottom = this.percentageToWorldUnit(viewport.height, viewport.padBottom);
      viewport.padTop = this.percentageToWorldUnit(viewport.height, viewport.padTop);
      this.currentViewport = viewport;
      this.viewportTransitionStart = performance.now();
      this.animationState.clearTracks();
      this.skeleton.setToSetupPose();
      this.animationState.setAnimation(0, animation, true);
    };
    SpinePlayer.prototype.percentageToWorldUnit = function(size, percentageOrAbsolute) {
      if (typeof percentageOrAbsolute === 'string') {
        return size * parseFloat(percentageOrAbsolute.substr(0, percentageOrAbsolute.length - 1)) / 100;
      } else {
        return percentageOrAbsolute;
      }
    };
    SpinePlayer.prototype.calculateAnimationViewport = function(animationName) {
      var animation = this.skeleton.data.findAnimation(animationName);
      this.animationState.clearTracks();
      this.skeleton.setToSetupPose();
      this.animationState.setAnimationWith(0, animation, true);
      var steps = 100;
      var stepTime = animation.duration > 0 ? animation.duration / steps : 0;
      var minX = 100000000;
      var maxX = -100000000;
      var minY = 100000000;
      var maxY = -100000000;
      var offset = new Tiny.spine.Vector2();
      var size = new Tiny.spine.Vector2();
      for (var i = 0; i < steps; i++) {
        this.animationState.update(stepTime);
        this.animationState.apply(this.skeleton);
        this.skeleton.updateWorldTransform();
        this.skeleton.getBounds(offset, size);
        minX = Math.min(offset.x, minX);
        maxX = Math.max(offset.x + size.x, maxX);
        minY = Math.min(offset.y, minY);
        maxY = Math.max(offset.y + size.y, maxY);
      }
      offset.x = minX;
      offset.y = minY;
      size.x = maxX - minX;
      size.y = maxY - minY;

      return {
        x: offset.x,
        y: offset.y,
        width: size.x,
        height: size.y,
      };
    };
    SpinePlayer.prototype.stopRendering = function() {
      this.pause();
    };
    SpinePlayer.HOVER_COLOR_INNER = new Tiny.spine.Color(0.478, 0, 0, 0.25);
    SpinePlayer.HOVER_COLOR_OUTER = new Tiny.spine.Color(1, 1, 1, 1);
    SpinePlayer.NON_HOVER_COLOR_INNER = new Tiny.spine.Color(0.478, 0, 0, 0.5);
    SpinePlayer.NON_HOVER_COLOR_OUTER = new Tiny.spine.Color(1, 0, 0, 0.8);
    return SpinePlayer;
  }());
  spine.SpinePlayer = SpinePlayer;

  function downloadText(url, success, error) {
    var request = new XMLHttpRequest();
    request.overrideMimeType('text/html');
    request.open('GET', url, true);
    request.onload = function() {
      if (request.status === 200) {
        success(request.responseText);
      } else {
        error(request.status, request.responseText);
      }
    };
    request.onerror = function() {
      error(request.status, request.responseText);
    };
    request.send();
  }

  function downloadBinary(url, success, error) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      if (request.status === 200) {
        success(new Uint8Array(request.response));
      } else {
        error(request.status, request.responseText);
      }
    };
    request.onerror = () => {
      error(request.status, request.responseText);
    };
    request.send();
  }

  function isContained(dom, needle) {
    if (dom === needle) {
      return true;
    }
    var findRecursive = function(dom, needle) {
      for (var i = 0; i < dom.children.length; i++) {
        var child = dom.children[i];
        if (child === needle) {
          return true;
        }
        if (findRecursive(child, needle)) {
          return true;
        }
      }
      return false;
    };
    return findRecursive(dom, needle);
  }

  function findWithId(dom, id) {
    var found = [];
    var findRecursive = function(dom, id, found) {
      for (var i = 0; i < dom.children.length; i++) {
        var child = dom.children[i];
        if (child.id === id) {
          found.push(child);
        }
        findRecursive(child, id, found);
      }
    };
    findRecursive(dom, id, found);
    return found;
  }

  function findWithClass(dom, className) {
    var found = [];
    var findRecursive = function(dom, className, found) {
      for (var i = 0; i < dom.children.length; i++) {
        var child = dom.children[i];
        if (child.classList.contains(className)) {
          found.push(child);
        }
        findRecursive(child, className, found);
      }
    };
    findRecursive(dom, className, found);
    return found;
  }

  function createElement(html) {
    var dom = document.createElement('div');
    dom.innerHTML = html;
    return dom.children[0];
  }

  function removeClass(elements, clazz) {
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove(clazz);
    }
  }

  function escapeHtml(str) {
    if (!str) {
      return '';
    }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&#34;')
      .replace(/'/g, '&#39;');
  }
})(spine || (spine = {}));
