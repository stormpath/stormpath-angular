'use strict';

angular.module('stormpath')
.controller('SpPasswordResetRequestCtrl', ['$scope','$user',function ($scope,$user) {
  $scope.sent = false;
  $scope.posting = false;
  $scope.formModel = {
    username: ''
  };
  $scope.requestFailed = false;
  $scope.submit = function(){
    $scope.posting = true;
    $scope.requestFailed = false;
    $user.passwordResetRequest({email: $scope.formModel.email})
      .then(function(){
        $scope.sent = true;
      })
      .catch(function(){
        $scope.requestFailed = true;
      }).finally(function(){
        $scope.posting = false;
      });
  };
}])

.controller('SpPasswordResetCtrl', ['$scope','$location','$user',function ($scope,$location,$user) {
  var sptoken = $location.search().sptoken;
  $scope.showVerificationError = false;
  $scope.verifying = false;
  $scope.verified = false;
  $scope.posting = false;
  $scope.reset = false;
  $scope.error = null;

  $scope.resendFailed = false;
  $scope.formModel = {
    password: '',
    confirmPassword: ''
  };

  if(typeof sptoken==='string'){
    $scope.verifying = true;
    $user.verifyPasswordResetToken(sptoken)
      .then(function(){
        $scope.verified = true;
      })
      .catch(function(){
        $scope.showVerificationError = true;
      })
      .finally(function(){
        $scope.verifying = false;
      });
  }else{
    $scope.showVerificationError = true;
  }
  $scope.submit = function(){
    if($scope.formModel.password!==$scope.formModel.confirmPassword){
      $scope.error = 'Passwords do not match';
      return;
    }
    $scope.posting = true;
    $scope.error = null;
    $scope.showVerificationError = false;
    $user.resetPassword(sptoken, {password: $scope.formModel.password})
      .then(function(){
        $scope.reset = true;
      })
      .catch(function(err){
        $scope.error = err.message;
      }).finally(function(){
        $scope.posting = false;
      });
  };

}])

/**
 * @ngdoc directive
 *
 * @name stormpath.spPasswordResetRequestForm:spPasswordResetRequestForm
 *
 * @param {string} template-url
 *
 * An alternate template URL if you want
 * to use your own template for the form.
 *
 * @description
 *
 * This directive will render a pre-built form which prompts the user for their
 * username/email.  If an account is found, we will send them an email with a
 * password reset link.
 *
 * @example
 *
 * <pre>
 * <!-- If you want to use the default template -->
 * <div class="container">
 *   <div sp-password-reset-request-form></div>
 * </div>
 *
 * <!-- If you want to use your own template -->
 * <div class="container">
 *   <div sp-password-reset-request-form template-url="/path/to/my-custom-template.html"></div>
 * </div>
 * </pre>
 */
.directive('spPasswordResetRequestForm',function(){
  return {
    templateUrl: function(tElemenet,tAttrs){
      return tAttrs.templateUrl || 'spPasswordResetRequestForm.tpl.html';
    },
    controller: 'SpPasswordResetRequestCtrl'
  };
})
/**
 * @ngdoc directive
 *
 * @name stormpath.spPasswordResetForm:spPasswordResetForm
 *
 * @param {string} template-url
 *
 * An alternate template URL if you want
 * to use your own template for the form.
 *
 *
 * @description
 *
 * Use this directive on the page that users land on when they click on a password
 * reset link.  To send users a password reset link, see
 * {@link stormpath.spPasswordResetRequestForm:spPasswordResetRequestForm spPasswordResetRequestForm}.
 *
 * This directive will render a password reset form that does the following:
 * * Verifies that the current URL has an `sptoken` in it.  Shows an error if not.
 * * Verifies the given `sptoken` with Stormpath, then:
 *   * If the token is valid, shows a form that allows the user to enter a new password.
 *   * If the token is invalid (it is expired or malformed), we prompt the user to enter
 *     their email address, so that we can try sending them a new link.
 *
 * @example
 *
 * <pre>
 * <!-- If you want to use the default template -->
 * <div class="container">
 *   <div sp-password-reset-form></div>
 * </div>
 *
 * <!-- If you want to use your own template -->
 * <div class="container">
 *   <div sp-password-reset-form template-url="/path/to/my-custom-template.html"></div>
 * </div>
 * </pre>
 */
.directive('spPasswordResetForm',function(){
  return {
    templateUrl: function(tElemenet,tAttrs){
      return tAttrs.templateUrl || 'spPasswordResetForm.tpl.html';
    },
    controller: 'SpPasswordResetCtrl'
  };
});
