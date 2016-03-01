'use strict';

angular.module('stormpath')

.controller('SpLoginFormCtrl', ['$scope','$auth','$socialLogin',function ($scope,$auth,$socialLogin) {
  $scope.socialLoginProviders = [];

  // Load list of social login providers from server.
  $socialLogin.getProviders().then(function(providers) {
    // Convert into an array.
    $scope.socialLoginProviders = Object.keys(providers).map(function(providerName) {
      var provider = providers[providerName];
      provider.name = providerName;
      return provider;
    });

    // Filter out the enabled providers.
    $scope.socialLoginProviders = $scope.socialLoginProviders.filter(function(provider) {
      return provider.enabled;
    });
  }).catch(function(err) {
    throw new Error('Could not load social providers from back-end: ' + err.message);
  });

  $scope.formModel = {
    username: '',
    password: ''
  };
  $scope.posting = false;
  $scope.submit = function(){
    $scope.posting = true;
    $scope.error = null;
    $auth.authenticate($scope.formModel)
      .catch(function(err){
        $scope.posting = false;
        $scope.error = err.message;
      });
  };
}])


/**
 * @ngdoc directive
 *
 * @name stormpath.spLoginForm:spLoginForm
 *
 * @param {string} template-url
 *
 * An alternate template URL if you want
 * to use your own template for the form.
 *
 * @description
 *
 * This directive will render a pre-built login form with all
 * the necessary fields.  After the login is a success, the following
 * will happen:
 *
 * * The {@link stormpath.authService.$auth#events_$authenticated $authenticated} event will
 * be fired.
 * *  If you have configured the {@link stormpath.$stormpath#methods_uiRouter UI Router Integration},
 * the following can happen:
 *  * The user is sent back to the view they originally requested.
 *  * The user is sent to a default view of your choice.
 *
 * @example
 *
 * <pre>
 * <!-- If you want to use the default template -->
 * <div class="container">
 *   <div sp-login-form></div>
 * </div>
 *
 * <!-- If you want to use your own template -->
 * <div class="container">
 *   <div sp-login-form template-url="/path/to/my-custom-template.html"></div>
 * </div>
 * </pre>
 */
.directive('spLoginForm',function(){
  return {
    templateUrl: function(tElemenet,tAttrs){
      return tAttrs.templateUrl || 'spLoginForm.tpl.html';
    },
    controller: 'SpLoginFormCtrl'
  };
});
