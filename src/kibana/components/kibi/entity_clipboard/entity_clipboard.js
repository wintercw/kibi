define(function (require) {

  require('css!components/kibi/entity_clipboard/entity_clipboard.css');

  require('modules').get('kibana').directive('kibiEntityClipboard', function ($rootScope, $route, globalState, $http, configFile) {

    return {
      restrict: 'E',
      template: require('text!components/kibi/entity_clipboard/entity_clipboard.html'),
      replace: true,
      link: function ($scope, $el) {

        var updateSelectedEntity = function () {
          $scope.disabled = !!globalState.entityDisabled;
          if (globalState.se && globalState.se.length > 0) {
            // for now we support a single entity
            $scope.entityURI = globalState.se[0];
            var parts = globalState.se[0].split('/');
            if (parts.length === 4) {
              var index = parts[0];
              var type = parts[1];
              var id = parts[2];
              var column = parts[3];
              // fetch document and grab the field value to populate the label
              $http.get(configFile.elasticsearch + '/' + index + '/' + type + '/' + id).then(function (doc) {
                if (doc.data && doc.data._source && doc.data._source[column]) {
                  $scope.label = doc.data._source[column];
                }
              });
            } else {
              $scope.label = globalState.se[0];
            }
          }
        };

        $scope.removeAllEntities = function () {
          delete $scope.entityURI;
          delete $scope.label;
          delete $scope.disabled;
          delete globalState.entityDisabled;
          delete globalState.se;
          globalState.save();
          $route.reload();
        };

        $scope.toggleClipboard = function () {
          $scope.disabled = !$scope.disabled;
          globalState.entityDisabled = !globalState.entityDisabled;
          globalState.save();
        };

        var removeHandler = $rootScope.$on('kibi:selectedEntities:changed', function (se) {
          updateSelectedEntity();
        });

        $scope.$on('$destroy', function () {
          removeHandler();
        });

        updateSelectedEntity();
      }
    };
  });
});
