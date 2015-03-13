(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .controller('MdTabsController', MdTabsController);

  function MdTabsController ($scope, $element, $window, $timeout, $mdConstant, $mdInkRipple, $mdUtil) {
    var ctrl = this,
        elements = {
          tabs:    $element[0].getElementsByTagName('md-tab-item'),
          canvas:  $element[0].getElementsByTagName('md-tab-canvas')[0],
          inkBar:  $element[0].getElementsByTagName('md-ink-bar')[0],
          wrapper: $element[0].getElementsByTagName('md-pagination-wrapper')[0]
        };

    ctrl.scope = $scope;
    ctrl.parent = $scope.$parent;
    ctrl.tabs = [];
    ctrl.lastSelectedIndex = null;
    ctrl.focusIndex = null;
    ctrl.offsetLeft = 0;
    ctrl.hasContent = true;
    ctrl.hasFocus = false;

    ctrl.attachRipple = attachRipple;
    ctrl.shouldStretchTabs = shouldStretchTabs;
    ctrl.shouldPaginate = shouldPaginate;
    ctrl.insertTab = insertTab;
    ctrl.removeTab = removeTab;
    ctrl.select = select;
    ctrl.scroll = scroll;
    ctrl.nextPage = nextPage;
    ctrl.previousPage = previousPage;
    ctrl.keydown = keydown;
    ctrl.canPageForward = canPageForward;
    ctrl.canPageBack = canPageBack;
    ctrl.refreshIndex = refreshIndex;

    init();

    function init () {
      $scope.$watch('selectedIndex', handleSelectedIndexChange);
      $scope.$watch('$mdTabsCtrl.focusIndex', handleFocusIndexChange);
      angular.element($window).on('resize', function () { $scope.$apply(handleWindowResize); });
      $timeout(updateInkBarStyles, 0, false);
    }

    function keydown (event) {
      var newIndex;
      switch (event.keyCode) {
        case $mdConstant.KEY_CODE.LEFT_ARROW:
          handleArrowKey(-1);
          break;
        case $mdConstant.KEY_CODE.RIGHT_ARROW:
          handleArrowKey(1);
          break;
        case $mdConstant.KEY_CODE.SPACE:
        case $mdConstant.KEY_CODE.ENTER:
          event.preventDefault();
          $scope.selectedIndex = ctrl.focusIndex;
          break;
      }
      function handleArrowKey (inc) {
        event.preventDefault();
        for (newIndex = ctrl.focusIndex + inc;
             ctrl.tabs[newIndex] && ctrl.tabs[newIndex].scope.disabled;
             newIndex += inc) {}
        if (ctrl.tabs[newIndex]) ctrl.focusIndex = newIndex;
      }
    }

    function handleFocusIndexChange (newIndex, oldIndex) {
      if (newIndex === oldIndex) return;
      if (!elements.tabs[newIndex]) return;
      adjustOffset();
    }

    function adjustOffset () {
      var tab = elements.tabs[ctrl.focusIndex],
          left = tab.offsetLeft,
          right = tab.offsetWidth + left;
      ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements.canvas.clientWidth));
      ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
    }

    function handleWindowResize () {
      ctrl.lastSelectedIndex = $scope.selectedIndex;
      updateInkBarStyles();
    }

    function insertTab (tabData, index) {
      var proto = {
            getIndex: function () { return ctrl.tabs.indexOf(tab); },
            isActive: function () { return this.getIndex() === $scope.selectedIndex; },
            isLeft:   function () { return this.getIndex() < $scope.selectedIndex; },
            isRight:  function () { return this.getIndex() > $scope.selectedIndex; },
            hasFocus: function () { return ctrl.hasFocus && this.getIndex() === ctrl.focusIndex; },
            id:       $mdUtil.nextUid()
          },
          tab = angular.extend(proto, tabData);
      if (!angular.isString(tabData.template)) {
        ctrl.hasContent = false;
      }
      if (angular.isDefined(index)) {
        ctrl.tabs.splice(index, 0, tab);
      } else {
        ctrl.tabs.push(tab);
      }
      return tab;
    }

    function removeTab (tabData) {
      ctrl.tabs.splice(tabData.getIndex(), 1);
      refreshIndex();
      $timeout(updateInkBarStyles);
    }

    function refreshIndex () {
      $scope.selectedIndex = getNearestSafeIndex($scope.selectedIndex);
    }

    function handleSelectedIndexChange (newValue, oldValue) {
      if (newValue === oldValue) return;
      $scope.selectedIndex = getNearestSafeIndex(newValue);
      ctrl.lastSelectedIndex = oldValue;
      updateInkBarStyles();
      elements.canvas.focus();
    }

    function updateInkBarStyles () {
      if (!ctrl.tabs.length) return;
      var index = $scope.selectedIndex,
          totalWidth = elements.wrapper.offsetWidth,
          tab = elements.tabs[index],
          left = tab.offsetLeft,
          right = totalWidth - left - tab.offsetWidth;
      updateInkBarClassName();
      angular.element(elements.inkBar).css({ left: left + 'px', right: right + 'px' });

    }

    function updateInkBarClassName () {
      var newIndex = $scope.selectedIndex,
          oldIndex = ctrl.lastSelectedIndex,
          ink = angular.element(elements.inkBar);
      ink.removeClass('md-left md-right');
      if (!angular.isNumber(oldIndex)) return;
      if (newIndex < oldIndex) {
        ink.addClass('md-left');
      } else if (newIndex > oldIndex) {
        ink.addClass('md-right');
      }
    }

    function getNearestSafeIndex(newIndex) {
      var maxOffset = Math.max(ctrl.tabs.length - newIndex, newIndex),
          i, tab;
      for (i = 0; i <= maxOffset; i++) {
        tab = ctrl.tabs[newIndex + i];
        if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
        tab = ctrl.tabs[newIndex - i];
        if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
      }
      return newIndex;
    }

    function shouldStretchTabs () {
      switch ($scope.stretchTabs) {
        case 'always': return true;
        case 'never':  return false;
        default:       return !shouldPaginate() && $window.matchMedia('(max-width: 600px)').matches;
      }
    }

    function shouldPaginate () {
      var canvasWidth = $element.prop('clientWidth');
      angular.forEach(elements.tabs, function (tab) {
        canvasWidth -= tab.offsetWidth;
      });
      return canvasWidth < 0;
    }

    function select (index) {
      ctrl.focusIndex = $scope.selectedIndex = index;
    }

    function scroll (event) {
      if (!shouldPaginate()) return;
      event.preventDefault();
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft - event.wheelDelta);
    }

    function fixOffset (value) {
      var lastTab = elements.tabs[elements.tabs.length - 1],
          totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;
      value = Math.max(0, value);
      value = Math.min(totalWidth - elements.canvas.clientWidth, value);
      return value;
    }

    function nextPage () {
      var viewportWidth = elements.canvas.clientWidth,
          totalWidth = viewportWidth + ctrl.offsetLeft,
          i, tab;
      for (i = 0; i < elements.tabs.length; i++) {
        tab = elements.tabs[i];
        if (tab.offsetLeft + tab.offsetWidth > totalWidth) break;
      }
      ctrl.offsetLeft = fixOffset(tab.offsetLeft);
    }

    function previousPage () {
      var i, tab;
      for (i = 0; i < elements.tabs.length; i++) {
        tab = elements.tabs[i];
        if (tab.offsetLeft + tab.offsetWidth >= ctrl.offsetLeft) break;
      }
      ctrl.offsetLeft = fixOffset(tab.offsetLeft + tab.offsetWidth - elements.canvas.clientWidth);
    }

    function canPageBack () {
      return ctrl.offsetLeft > 0;
    }

    function canPageForward () {
      var lastTab = elements.tabs[elements.tabs.length - 1];
      return lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth + ctrl.offsetLeft;
    }

    function attachRipple (scope, element) {
      var options = { colorElement: angular.element(elements.inkBar) };
      $mdInkRipple.attachTabBehavior(scope, element, options);
    }
  }
})();