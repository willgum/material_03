angular
  .module('menuBarDemoBasic', ['ngMaterial'])
  .config(function($mdIconProvider) {
    $mdIconProvider
      .iconSet('call', '/dist/docs/img/icons/sets/communication-icons.svg', 24);
  })
  .controller('DemoBasicCtrl', function DemoCtrl() {
  });

