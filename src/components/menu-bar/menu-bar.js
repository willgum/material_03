/**
 * @ngdoc module
 * @name material.components.menu-bar
 */

angular.module('material.components.menuBar', [
  'material.core',
  'material.components.menu'
])
.directive('mdMenuBar', MenuBarDirective);

function MenuBarDirective() {
  return {
    restrict: 'E',
    require: 'mdMenuBar',
    controller: MenuBarCtrl,
    link: function(scope, el, attrs, ctrl) {
      ctrl.init();
    }
  };
}

function MenuBarCtrl($element, $attrs, $mdConstant, $document, $mdUtil) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$mdConstant = $mdConstant;
  this.$mdUtil = $mdUtil;
  this.$document = $document;
}

MenuBarCtrl.prototype.init = function() {
  this.$element.on('keydown', angular.bind(this, this.handleKeyDown));
};

MenuBarCtrl.prototype.handleKeyDown = function(e) {
  var keyCodes = this.$mdConstant.KEY_CODE;
  switch (e.keyCode) {
    case keyCodes.DOWN_ARROW: return this.openFocusedMenu();
    case keyCodes.LEFT_ARROW: return this.focusMenu(-1);
    case keyCodes.RIGHT_ARROW: return this.focusMenu(+1);
  }
};

MenuBarCtrl.prototype.focusMenu = function(direction) {
  var menus = this.getMenus();
  var focusedIndex = this.getFocusedMenuIndex();

  var changed = false;

  if (focusedIndex == -1) { focusedIndex = 0; }
  else if (
    direction < 0 && focusedIndex > 0 ||
    direction > 0 && focusedIndex < menus.length - direction
  ) {
    focusedIndex += direction;
    changed = true;
  }
  if (changed) {
    menus[focusedIndex].querySelector('button').focus();
  }
};

MenuBarCtrl.prototype.openFocusedMenu = function() {
  var menu = this.getFocusedMenu();
  menu && menu.querySelector('button').click();
};

MenuBarCtrl.prototype.getMenus = function() {
  var $element = this.$element;
  return this.$mdUtil.nodesToArray($element[0].querySelectorAll('md-menu'));
};

MenuBarCtrl.prototype.getFocusedMenu = function() {
  return this.getMenus()[this.getFocusedMenuIndex()];
};

MenuBarCtrl.prototype.getFocusedMenuIndex = function() {
  var $mdUtil = this.$mdUtil;
  var $element = this.$element;
  var focusedEl = $mdUtil.getClosest(
    this.$document[0].activeElement,
    'MD-MENU'
  );
  if (!focusedEl) return -1;

  var focusedIndex = this.getMenus().indexOf(focusedEl);
  return focusedIndex;

};
