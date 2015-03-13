(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .directive('mdTabs', MdTabs);

  function MdTabs ($mdTheming) {
    return {
      scope: {
        selectedIndex: '=?mdSelected',
        stretchTabs: '@?mdStretchTabs'
      },
      transclude: true,
      template: '\
        <md-tab-wrapper ng-class="{ \'md-stretch-tabs\': $mdTabsCtrl.shouldStretchTabs() }">\
          <md-tab-data ng-transclude></md-tab-data>\
          <md-prev-button\
              tabindex="-1"\
              ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageBack() }"\
              ng-if="$mdTabsCtrl.shouldPaginate()"\
              ng-click="$mdTabsCtrl.previousPage()">\
            <md-icon md-svg-icon="tabs-arrow"></md-icon>\
          </md-prev-button>\
          <md-next-button\
              tabindex="-1"\
              ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageForward() }"\
              ng-if="$mdTabsCtrl.shouldPaginate()"\
              ng-click="$mdTabsCtrl.nextPage()">\
            <md-icon md-svg-icon="tabs-arrow"></md-icon>\
          </md-next-button>\
          <md-tab-canvas\
              tabindex="0"\
              ng-focus="$mdTabsCtrl.hasFocus = true"\
              ng-blur="$mdTabsCtrl.hasFocus = false"\
              ng-class="{ \'md-paginated\': $mdTabsCtrl.shouldPaginate() }"\
              ng-keydown="$mdTabsCtrl.keydown($event)">\
            <md-pagination-wrapper\
                ng-style="{ \'left\': \'-\' + $mdTabsCtrl.offsetLeft + \'px\' }"\
                md-tab-scroll="$mdTabsCtrl.scroll($event)">\
              <md-ink-bar ng-hide="noInkBar"></md-ink-bar>\
              <md-tab-item\
                  tabindex="-1"\
                  class="md-tab"\
                  style="max-width: {{ tabWidth ? tabWidth + \'px\' : \'none\' }}"\
                  ng-repeat="tab in $mdTabsCtrl.tabs"\
                  id="tab-item-{{tab.id}}"\
                  aria-controls="tab-content-{{tab.id}}"\
                  role="tab"\
                  ng-class="{ \'md-active\': tab.isActive(),\
                      \'md-focus\': tab.hasFocus(),\
                      \'md-disabled\': tab.scope.disabled }"\
                  ng-disabled="tab.scope.disabled"\
                  aria-selected="{{tab.isActive()}}"\
                  aria-disabled="{{tab.scope.disabled}}"\
                  ng-click="$mdTabsCtrl.select(tab.getIndex())"\
                  md-label-template="tab.label"></md-tab-item>\
            </md-pagination-wrapper>\
          </md-tab-canvas>\
        </md-tab-wrapper>\
        <md-tab-content-wrapper ng-if="$mdTabsCtrl.hasContent">\
          <md-tab-content\
              ng-repeat="(index, tab) in $mdTabsCtrl.tabs" \
              md-tab-data="tab"\
              id="tab-content-{{tab.id}}"\
              aria-labelledby="tab-item-{{tab.id}}"\
              role="tabpanel"\
              ng-class="{\
                \'md-active\': tab.isActive(),\
                \'md-left\':   tab.isLeft(),\
                \'md-right\':  tab.isRight()\
              }"></md-tab-content>\
        </md-tab-content-wrapper>\
      ',
      controller: 'MdTabsController',
      controllerAs: '$mdTabsCtrl',
      link: function (scope, element, attr) {
        //-- watch attributes
        attr.$observe('mdNoBar', function (value) { scope.noInkBar = angular.isDefined(value); });
        //-- set default value for selectedIndex
        scope.selectedIndex = angular.isNumber(scope.selectedIndex) ? scope.selectedIndex : 0;
        //-- apply themes
        $mdTheming(element);
        //-- attach role
        element.attr('role', 'tablist');
      }
    };
  }
})();