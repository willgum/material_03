(function () {
  'use strict';
  angular
      .module('material.components.tabs')
      .directive('mdTabContent', MdTabContent);

  function MdTabContent ($compile, $mdUtil) {
    return {
      terminal: true,
      scope: {
        tab: '=mdTabData',
        active: '=mdActive'
      },
      link: link
    };
    function link (scope, element) {
      var div = angular.element('<div>' + scope.tab.template + '</div>');
      $compile(div)(scope.tab.parent);
      element.html(div.html());
    }
  }
})();
