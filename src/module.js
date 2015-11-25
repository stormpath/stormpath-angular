'use strict';

/**
 * @ngdoc object
 *
 * @name stormpath.SpStateConfig:SpStateConfig
 *
 * @property {boolean} authenticate
 *
 * If `true`, the user must be authenticated in order to view this state.
 * If the user is not authenticated, they will
 * be redirected to the `login` state.  After they login, they will be redirected to
 * the state that was originally requested.
 *
 * @property {object} authorize
 *
 * An object that defines access control rules.  Currently, it supports a group-based
 * check.  See the example below.
 *
 * @property {boolean} waitForUser
 *
 * If `true`, delay the state transition until we know
 * if the user is authenticated or not.  This is useful for situations where
 * you want everyone to see this state, but the state may look different
 * depending on the user's authentication state.
 *
 *
 * @description
 *
 * The Stormpath State Config is an object that you can define on a UI Router
 * state.  Use this configuration to define access control for your routes, as
 * defined by UI Router.
 *
 * You will need to be using the UI Router module, and you need
 * to enable the integration by calling
 * {@link stormpath.$stormpath#methods_uiRouter $stormpath.uiRouter()} in your
 * application's config block.
 *
 * If you're using Angular's built-in `$routeProvider` instead of UI Router, please
 * use {@link stormpath.$stormpath#methods_ngRouter $stormpath.ngRouter()} instead.
 *
 * **NOTE:** Do not define this configuration on a abstract state, it must go on
 * the child state.  However, the controller of the abstract state will be
 * initialized AFTER any configuration rules of the child state have been met.
 *
 * @example
 *
 * <pre>
 *
 * angular.module('myApp')
 *   .config(function ($stateProvider) {
 *
 *     // Wait until we know if the user is logged in before showing the homepage
 *     $stateProvider
 *       .state('main', {
 *         url: '/',
 *         sp: {
 *           waitForUser: true
 *         }
 *       });
 *
 *     // Require a user to be authenticated in order to see this state
 *     $stateProvider
 *       .state('secrets', {
 *         url: '/secrets',
 *         controller: 'SecretsCtrl',
 *         sp: {
 *           authenticate: true
 *         }
 *       });
 *
 *     // Require a user to be in the admins group in order to see this state
 *     $stateProvider
 *       .state('secrets', {
 *         url: '/admin',
 *         controller: 'AdminCtrl',
 *         sp: {
 *           authorize: {
 *             group: 'admins'
 *           }
 *         }
 *       });
 * });
 * </pre>
 */

 /**
 * @ngdoc object
 *
 * @name stormpath.SpRouteConfig:SpRouteConfig
 *
 * @property {boolean} authenticate
 *
 * If `true`, the user must be authenticated in order to view this route.
 * If the user is not authenticated, they will
 * be redirected to the `login` route.  After they login, they will be redirected to
 * the route that was originally requested.
 *
 * @property {object} authorize
 *
 * An object that defines access control rules.  Currently, it supports a group-based
 * check.  See the example below.
 *
 * @property {boolean} waitForUser
 *
 * If `true`, delay the route transition until we know
 * if the user is authenticated or not.  This is useful for situations where
 * you want everyone to see this route, but the route may look different
 * depending on the user's authentication route.
 *
 *
 * @description
 *
 * The Stormpath Route Config is an object that you can define on a route.
 * Use this configuration to define access control for your routes, as
 * defined by the ngRoute module.
 *
 * You will need to be using the ngRoute module, and you need
 * to enable the integration by calling
 * {@link stormpath.$stormpath#methods_ngRouter $stormpath.ngRouter()} in your
 * application's config block.
 *
 * If you're using UI Router instead of Angular's built-in `$routeProvider`, please
 * use {@link stormpath.$stormpath#methods_uiRouter $stormpath.uiRouter()} instead.
 *
 * @example
 *
 * <pre>
 *
 * angular.module('myApp')
 *   .config(function ($routeProvider) {
 *     // Wait until we know if the user is logged in before showing the homepage
 *     $routeProvider
 *       .when('/main', {
*         controller: 'MainCtrl',
 *         sp: {
 *           waitForUser: true
 *         }
 *       });
 *
 *     // Require a user to be authenticated in order to see this route
 *     $routeProvider
 *       .when('/secrets', {
 *         controller: 'SecretsCtrl',
 *         sp: {
 *           authenticate: true
 *         }
 *       });
 *
 *     // Require a user to be in the admins group in order to see this route
 *     $routeProvider
 *       .when('/secrets', {
 *         controller: 'AdminCtrl',
 *         sp: {
 *           authorize: {
 *             group: 'admins'
 *           }
 *         }
 *       });
 * });
 * </pre>
 */
angular.module('stormpath', [
  'stormpath.CONFIG',
  'stormpath.auth',
  'stormpath.userService',
  'stormpath.socialLogin',
  'stormpath.facebookLogin',
  'stormpath.googleLogin'
])
.factory('SpAuthInterceptor',[function(){
  function SpAuthInterceptor(){

  }
  SpAuthInterceptor.prototype.request = function(config){
    config.withCredentials=true;
    return config;
  };

  return new SpAuthInterceptor();
}])
.config(['$httpProvider',function($httpProvider){
  $httpProvider.interceptors.push('SpAuthInterceptor');
}])
.provider('$stormpath', [function $stormpathProvider(){
  /**
   * @ngdoc object
   *
   * @name stormpath.$stormpath
   *
   * @description
   *
   * This service allows you to enable application-wide features of the library.
   *
   * At the moment the only feature is the UI Router integration, which is
   * documented below.
   */

  this.$get = [
    '$user', '$injector', 'STORMPATH_CONFIG', '$rootScope', '$location',
    function stormpathServiceFactory($user, $injector, STORMPATH_CONFIG, $rootScope, $location) {
      var $state;

      function StormpathService(){
        var encoder = new UrlEncodedFormParser();
        this.encodeUrlForm = encoder.encode.bind(encoder);

        if ($injector.has('$state')) {
          $state = $injector.get('$state');
        }

        return this;
      }
      function stateChangeUnauthenticatedEvent(toState, toParams){
        /**
         * @ngdoc event
         *
         * @name stormpath.$stormpath#$stateChangeUnauthenticated
         *
         * @eventOf stormpath.$stormpath
         *
         * @eventType broadcast on root scope
         *
         * @param {Object} event
         *
         * Angular event object.
         *
         * @param {Object} toState The state that the user attempted to access.
         *
         * @param {Object} toParams The state params of the state that the user
         * attempted to access.
         *
         * @description
         *
         * This event is broadcast when a UI state change is prevented,
         * because the user is not logged in.
         *
         * Use this event if you want to implement your own strategy for
         * presenting the user with a login form.
         *
         * To receive this event, you must be using the UI Router integration.
         *
         * @example
         *
         * <pre>
         *   $rootScope.$on('$stateChangeUnauthenticated',function(e,toState,toParams){
         *     // Your custom logic for deciding how the user should login, and
         *     // if you want to redirect them to the desired state afterwards
         *   });
         * </pre>
         */
        $rootScope.$broadcast(STORMPATH_CONFIG.STATE_CHANGE_UNAUTHENTICATED,toState,toParams);
      }
      function stateChangeUnauthorizedEvent(toState,toParams){
        /**
         * @ngdoc event
         *
         * @name stormpath.$stormpath#$stateChangeUnauthorized
         *
         * @eventOf stormpath.$stormpath
         *
         * @eventType broadcast on root scope
         *
         * @param {Object} event
         *
         * Angular event object.
         *
         * @param {Object} toState The state that the user attempted to access.
         *
         * @param {Object} toParams The state params of the state that the user
         * attempted to access.
         *
         * @description
         *
         * This event is broadcast when a UI state change is prevented,
         * because the user is not authorized by the rules defined in the
         * {@link stormpath.SpStateConfig:SpStateConfig Stormpath State Configuration}
         * for the requested state.
         *
         * Use this event if you want to implement your own strategy for telling
         * the user that they are forbidden from viewing that state.
         *
         * To receive this event, you must be using the UI Router integration.
         *
         * @example
         *
         * <pre>
         *   $rootScope.$on('$stateChangeUnauthorized',function(e,toState,toParams){
         *     // Your custom logic for deciding how the user should be
         *     // notified that they are forbidden from this state
         *   });
         * </pre>
         */
        $rootScope.$broadcast(STORMPATH_CONFIG.STATE_CHANGE_UNAUTHORIZED,toState,toParams);
      }
      StormpathService.prototype.stateChangeInterceptor = function stateChangeInterceptor(config) {
        $rootScope.$on('$stateChangeStart', function(e,toState,toParams){
          var sp = toState.sp || {}; // Grab the sp config for this state

          if((sp.authenticate || sp.authorize) && (!$user.currentUser)){
            e.preventDefault();
            $user.get().then(function(){
              // The user is authenticated, continue to the requested state
              if(sp.authorize){
                if(authorizeStateConfig(sp)){
                  $state.go(toState.name,toParams);
                }else{
                  stateChangeUnauthorizedEvent(toState,toParams);
                }
              }else{
                $state.go(toState.name,toParams);
              }
            },function(){
              // The user is not authenticated, emit the necessary event
              stateChangeUnauthenticatedEvent(toState,toParams);
            });
          }else if(sp.waitForUser && ($user.currentUser===null)){
            e.preventDefault();
            $user.get().finally(function(){
              $state.go(toState.name,toParams);
            });
          }
          else if($user.currentUser && sp.authorize){
            if(!authorizeStateConfig(sp)){
              e.preventDefault();
              stateChangeUnauthorizedEvent(toState,toParams);
            }
          }else if(toState.name===config.loginState){
            /*
              If the user is already logged in, we will redirect
              away from the login page and send the user to the
              post login state.
             */
            if($user.currentUser && $user.currentUser.href){
              e.preventDefault();
              $state.go(config.defaultPostLoginState);
            }
          }
        });
      };

      function authorizeStateConfig(spStateConfig){
        var sp = spStateConfig;
        if(sp && sp.authorize && sp.authorize.group) {
          return $user.currentUser.inGroup(sp.authorize.group);
        }else{
          console.error('Unknown authorize configuration for spStateConfig',spStateConfig);
          return false;
        }

      }

      function routeChangeUnauthenticatedEvent(toRoute) {
        /**
         * @ngdoc event
         *
         * @name stormpath.$stormpath#$routeChangeUnauthenticated
         *
         * @eventOf stormpath.$stormpath
         *
         * @eventType broadcast on root scope
         *
         * @param {Object} event
         *
         * Angular event object.
         *
         * @param {Object} toRoute The route that the user attempted to access.
         *
         * @description
         *
         * This event is broadcast when a route change is prevented,
         * because the user is not logged in.
         *
         * Use this event if you want to implement your own strategy for
         * presenting the user with a login form.
         *
         * To receive this event, you must be using the ngRoute module.
         *
         * @example
         *
         * <pre>
         *   $rootScope.$on('$routeChangeUnauthenticated', function(event, toRoute) {
         *     // Your custom logic for deciding how the user should login, and
         *     // if you want to redirect them to the desired route afterwards
         *   });
         * </pre>
         */
        $rootScope.$broadcast(STORMPATH_CONFIG.ROUTE_CHANGE_UNAUTHENTICATED, toRoute);
      }

      function routeChangeUnauthorizedEvent(toRoute) {
        /**
         * @ngdoc event
         *
         * @name stormpath.$stormpath#$routeChangeUnauthorized
         *
         * @eventOf stormpath.$stormpath
         *
         * @eventType broadcast on root scope
         *
         * @param {Object} event
         *
         * Angular event object.
         *
         * @param {Object} toRoute The route that the user attempted to access.
         *
         * @description
         *
         * This event is broadcast when a route change is prevented,
         * because the user is not authorized by the rules defined in the
         * {@link stormpath.SpRouteConfig:SpRouteConfig Stormpath Route Configuration}
         * for the requested route.
         *
         * Use this event if you want to implement your own strategy for telling
         * the user that they are forbidden from viewing that route.
         *
         * To receive this event, you must be using the ngRoute module.
         *
         * @example
         *
         * <pre>
         *   $rootScope.$on('$routeChangeUnauthorized', function(event, toRoute) {
         *     // Your custom logic for deciding how the user should be
         *     // notified that they are forbidden from this route
         *   });
         * </pre>
         */
        $rootScope.$broadcast(STORMPATH_CONFIG.ROUTE_CHANGE_UNAUTHORIZED, toRoute);
      }

      StormpathService.prototype.routeChangeInterceptor = function routeChangeInterceptor(config) {
        function goToRoute(route) {
          setTimeout(function() {
            $location.path(route);
          });
        }

        $rootScope.$on('$routeChangeStart', function(event, toRoute) {
          if (!toRoute.$$route) {
            return;
          }

          var sp = toRoute.$$route.sp || {}; // Grab the sp config for this route

          if ((sp.authenticate || sp.authorize) && !$user.currentUser) {
            event.preventDefault();

            $user.get().then(function() {
              // The user is authenticated, continue to the requested route
              if (sp.authorize) {
                if (authorizeStateConfig(sp)) {
                  goToRoute(toRoute);
                } else {
                  stateChangeUnauthorizedEvent(toRoute);
                }
              } else {
                goToRoute(toRoute);
              }
            }, function() {
              // The user is not authenticated, emit the necessary event
              routeChangeUnauthenticatedEvent(toRoute);
            });
          } else if (sp.waitForUser && $user.currentUser === null) {
            event.preventDefault();

            $user.get().finally(function() {
              goToRoute(toRoute);
            });
          } else if ($user.currentUser && sp.authorize) {
            if (!authorizeStateConfig(sp)) {
              event.preventDefault();
              routeChangeUnauthorizedEvent(toRoute);
            }
          } else if (toRoute.$$route.originalPath === config.loginRoute) {
            /*
              If the user is already logged in, we will redirect
              away from the login page and send the user to the
              post login route.
             */
            if ($user.currentUser && $user.currentUser.href) {
              event.preventDefault();
              goToRoute(config.defaultPostLoginRoute);
            }
          }
        });
      };

      function authorizeRouteConfig(spRouteConfig) {
        var sp = spRouteConfig;

        if (sp && sp.authorize && sp.authorize.group) {
          return $user.currentUser.inGroup(sp.authorize.group);
        } else {
          console.error('Unknown authorize configuration for spRouteConfig', spRouteConfig);
          return false;
        }
      }

      /**
       * @ngdoc function
       *
       * @name stormpath#uiRouter
       *
       * @methodOf stormpath.$stormpath
       *
       * @param {object} config
       *
       * * **`autoRedirect`** - Defaults to true.  After the user logs in at
       * the state defined by `loginState`, they will be redirected back to the
       * state that was originally requested.
       *
       * * **`defaultPostLoginState`**  - Where the user should be sent, after login,
       * if they have visited the login page directly.  If you do not define a value,
       * nothing will happen at the login state.  You can alternatively use the
       * {@link stormpath.authService.$auth#events_$authenticated $authenticated} event to know
       * that login is successful.
       *
       * * **`forbiddenState`** - The UI state name that we should send the user
       * to if they try to an access a view that they are not authorized to view.
       * This happens in response to an `authorize` rule in one of your
       * {@link stormpath.SpStateConfig:SpStateConfig Stormpath State Configurations}
       *
       * * **`loginState`** - The UI state name that we should send the user
       * to if they need to login.  You'll probably use `login` for this value.
       *
       * @description
       *
       * Call this method to enable the integration with the UI Router module.
       *
       * When enabled, you can define {@link stormpath.SpStateConfig:SpStateConfig Stormpath State Configurations} on your UI states.
       * This object allows you to define access control for the state.
       *
       * You can pass config options to this integration, the options control the
       * default behavior around "need to login" and "forbidden" situations.
       * If you wish to implement your own logic for these situations, simply
       * omit the options and use the events (documented below) to know
       * what is happening in the application.
       *
       * @example
       *
       * <pre>
       * angular.module('myApp')
       *   .run(function($stormpath){
       *     $stormpath.uiRouter({
       *       forbiddenState: 'forbidden',
       *       defaultPostLoginState: 'main',
       *       loginState: 'login'
       *     });
       *   });
       * </pre>
       */
      StormpathService.prototype.uiRouter = function uiRouter(config){
        var self = this;
        config = typeof config === 'object' ? config : {};
        this.stateChangeInterceptor(config);

        if(config.loginState){
          self.unauthenticatedWather = $rootScope.$on(STORMPATH_CONFIG.STATE_CHANGE_UNAUTHENTICATED,function(e,toState,toParams){
            self.postLogin = {
              toState: toState,
              toParams: toParams
            };
            $state.go(config.loginState);
          });
        }

        $rootScope.$on(STORMPATH_CONFIG.AUTHENTICATION_SUCCESS_EVENT_NAME,function(){
          if(self.postLogin && (config.autoRedirect !== false)){
            $state.go(self.postLogin.toState,self.postLogin.toParams).then(function(){
              self.postLogin = null;
            });
          }else if(config.defaultPostLoginState){
            $state.go(config.defaultPostLoginState);
          }
        });

        if(config.forbiddenState){
          self.forbiddenWatcher = $rootScope.$on(STORMPATH_CONFIG.STATE_CHANGE_UNAUTHORIZED,function(){
            $state.go(config.forbiddenState);
          });
        }
      };

      /**
       * @ngdoc function
       *
       * @name stormpath#ngRouter
       *
       * @methodOf stormpath.$stormpath
       *
       * @param {object} config
       *
       * * **`autoRedirect`** - Defaults to true.  After the user logs in at
       * the route defined by `loginRoute`, they will be redirected back to the
       * route that was originally requested.
       *
       * * **`defaultPostLoginRoute`**  - Where the user should be sent, after login,
       * if they have visited the login page directly.  If you do not define a value,
       * nothing will happen at the login route.  You can alternatively use the
       * {@link stormpath.authService.$auth#events_$authenticated $authenticated} event to know
       * that login is successful.
       *
       * * **`forbiddenRoute`** - The route that we should send the user
       * to if they try to an access a view that they are not authorized to view.
       * This happens in response to an `authorize` rule in one of your
       * {@link stormpath.SpRouteConfig:SpRouteConfig Stormpath Route Configurations}
       *
       * * **`loginRoute`** - The route name that we should send the user
       * to if they need to login.  You'll probably use `login` for this value.
       *
       * @description
       *
       * Call this method to enable the integration with the ngRoute module.
       *
       * When enabled, you can define {@link stormpath.SpRouteConfig:SpRouteConfig Stormpath Route Configurations} on your routes.
       * This object allows you to define access control for the route.
       *
       * You can pass config options to this integration, the options control the
       * default behavior around "need to login" and "forbidden" situations.
       * If you wish to implement your own logic for these situations, simply
       * omit the options and use the events (documented below) to know
       * what is happening in the application.
       *
       * @example
       *
       * <pre>
       * angular.module('myApp')
       *   .run(function($stormpath){
       *     $stormpath.ngRouter({
       *       forbiddenRoute: '/forbidden',
       *       defaultPostLoginRoute: '/home',
       *       loginRoute: '/login'
       *     });
       *   });
       * </pre>
       */
      StormpathService.prototype.ngRouter = function ngRouter(config) {
        var self = this;

        config = typeof config === 'object' ? config : {};

        this.routeChangeInterceptor(config);

        if (config.loginRoute) {
          this.unauthenticatedWather = $rootScope.$on(STORMPATH_CONFIG.ROUTE_CHANGE_UNAUTHENTICATED, function(event, toRoute) {
            self.postLogin = {
              toRoute: toRoute
            };

            $location.path(config.loginRoute);
          });
        }

        $rootScope.$on(STORMPATH_CONFIG.AUTHENTICATION_SUCCESS_EVENT_NAME, function() {
          if (self.postLogin && config.autoRedirect !== false) {
            $location.path(self.postLogin.toRoute);
            self.postLogin = null;
          } else if (config.defaultPostLoginRoute) {
            $location.path(config.defaultPostLoginRoute);
          }
        });

        if (config.forbiddenRoute) {
          this.forbiddenWatcher = $rootScope.$on(STORMPATH_CONFIG.ROUTE_CHANGE_UNAUTHORIZED, function() {
            $location.path(config.forbiddenRoute);
          });
        }
      };

      StormpathService.prototype.regexAttrParser = function regexAttrParser(value){
        var expr;
        if(value instanceof RegExp){
          expr = value;
        }else if(value && /^\/.+\/[gim]?$/.test(value)){
          expr = new RegExp(value.split('/')[1],value.split('/')[2]);
        }else{
          expr = value;
        }
        return expr;
      };

      function UrlEncodedFormParser(){

        // Copy & modify from https://github.com/hapijs/qs/blob/master/lib/stringify.js

        this.delimiter = '&';
        this.arrayPrefixGenerators = {
          brackets: function (prefix) {
            return prefix + '[]';
          },
          indices: function (prefix, key) {
            return prefix + '[' + key + ']';
          },
          repeat: function (prefix) {
            return prefix;
          }
        };
        return this;
      }
      UrlEncodedFormParser.prototype.stringify = function stringify(obj, prefix, generateArrayPrefix) {

        if (obj instanceof Date) {
          obj = obj.toISOString();
        }
        else if (obj === null) {
          obj = '';
        }

        if (typeof obj === 'string' ||
          typeof obj === 'number' ||
          typeof obj === 'boolean') {

          return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
        }

        var values = [];

        if (typeof obj === 'undefined') {
          return values;
        }

        var objKeys = Object.keys(obj);
        for (var i = 0, il = objKeys.length; i < il; ++i) {
          var key = objKeys[i];
          if (Array.isArray(obj)) {
            values = values.concat(this.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix));
          }
          else {
            values = values.concat(this.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix));
          }
        }

        return values;
      };
      UrlEncodedFormParser.prototype.encode = function encode(obj, options) {

        options = options || {};
        var delimiter = typeof options.delimiter === 'undefined' ? this.delimiter : options.delimiter;

        var keys = [];

        if (typeof obj !== 'object' ||
          obj === null) {

          return '';
        }

        var arrayFormat;
        if (options.arrayFormat in this.arrayPrefixGenerators) {
          arrayFormat = options.arrayFormat;
        }
        else if ('indices' in options) {
          arrayFormat = options.indices ? 'indices' : 'repeat';
        }
        else {
          arrayFormat = 'indices';
        }

        var generateArrayPrefix = this.arrayPrefixGenerators[arrayFormat];

        var objKeys = Object.keys(obj);
        for (var i = 0, il = objKeys.length; i < il; ++i) {
          var key = objKeys[i];
          keys = keys.concat(this.stringify(obj[key], key, generateArrayPrefix));
        }

        return keys.join(delimiter);
      };

      return new StormpathService();
    }
  ];
}])
.run(['$rootScope','$user','STORMPATH_CONFIG',function($rootScope,$user,STORMPATH_CONFIG){
  $rootScope.user = $user.currentUser || null;
  $user.get().finally(function(){
    $rootScope.user = $user.currentUser;
  });
  $rootScope.$on(STORMPATH_CONFIG.GET_USER_EVENT,function(){
    $rootScope.user = $user.currentUser;
  });
  $rootScope.$on(STORMPATH_CONFIG.SESSION_END_EVENT,function(){
    $rootScope.user = $user.currentUser;
  });
}])

/**
 * @ngdoc directive
 *
 * @name stormpath.ifUser:ifUser
 *
 * @description
 *
 * Use this directive to conditionally show an element if the user is logged in.
 *
 * @example
 *
 * <pre>
 * <div class="container">
 *   <h3 if-user>Hello, {{user.fullName}}</h3>
 * </div>
 * </pre>
 */
.directive('ifUser',['$user','$rootScope',function($user,$rootScope){
  return {
    link: function(scope,element){
      $rootScope.$watch('user',function(user){
        if(user && user.href){
          element.removeClass('ng-hide');
        }else{
          element.addClass('ng-hide');
        }
      });
    }
  };
}])

/**
 * @ngdoc directive
 *
 * @name stormpath.ifNotUser:ifNotUser
 *
 * @description
 *
 * Use this directive to conditionally show an element if the user is NOT logged in.
 *
 * @example
 *
 * <pre>
 * <div class="container">
 *   <h3 if-not-user>Hello, you need to login</h3>
 * </div>
 * </pre>
 */
.directive('ifNotUser',['$user','$rootScope',function($user,$rootScope){
  return {
    link: function(scope,element){
      $rootScope.$watch('user',function(user){
        if(user && user.href){
          element.addClass('ng-hide');
        }else{
          element.removeClass('ng-hide');
        }
      });
    }
  };
}])

/**
 * @ngdoc directive
 *
 * @name stormpath.ifUserInGroup:ifUserInGroup
 *
 * @description
 *
 * Use this directive to conditionally show an element if the user is logged in
 * and is a member of the group that is specified by the expression.
 *
 * The attribute value MUST be one of:
 *
 * * A string expression, surrounded by quotes
 * * A reference to a property on the $scope.  That property can be a string or
 * regular expression.
 *
 * **Note**: This feature depends on the data that is returned by the
 * {@link api/stormpath.STORMPATH_CONFIG:STORMPATH_CONFIG#properties_CURRENT_USER_URI CURRENT_USER_URI}.
 * Your server should expand the account's groups before returning the user.
 * If you are using [express-stormpath](https://github.com/stormpath/express-stormpath), simply use
 * [Automatic Expansion](http://docs.stormpath.com/nodejs/express/latest/user_data.html#automatic-expansion)
 *
 * # Using Regular Expressions
 *
 * If using a string expression as the attribute value, you can pass a regular
 * expression by wrapping it in the literal
 * syntax, e.g.
 *  * `'/admins/'` would match any group which has *admins* in the name
 *  * `'/admin$/'` would match any group were the name **ends with** *admin*
 *
 * If referencing a scope property, you should create the value as a RegExp type,
 * e.g.:
 *
 *  <pre>
 *    $scope.matchGroup = new RegExp(/admins/);
 *  </pre>
 *
 * All regular expressions are evaluated via
 * [RegExp.prototype.test](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test)
 *
 * @example
 *
 * <pre>
 *   <script type="text/javascript">
 *     function SomeController($scope){
 *       $scope.matchGroup = /admins/;
 *     }
 *   <script>
 *   <div ng-controller="SomeController">
 *     <h3 if-user-in-group="'admins'">
 *       Hello, {{user.fullName}}, you are an administrator
 *     </h3>
 *
 *     <div if-user-in-group="'/admins/'">
 *        <!-- would match any group which has *admins* in the name -->
 *     </div>
 *     <div if-user-in-group="matchGroup">
 *        <!-- equivalent to the last example -->
 *     </div>
 *     <div if-user-in-group="'/admin$/'">
 *        <!-- would match any group were the name **ends with** *admin* -->
 *     </div>
 *   </div>
 * </pre>
 */
.directive('ifUserInGroup',['$user','$rootScope','$parse','$stormpath',function($user,$rootScope,$parse,$stormpath){

  return {
    link: function(scope,element,attrs){

      var expr;
      var attrExpr = attrs.ifUserInGroup;

      function evalElement(){
        var user = $user.currentUser;
        if(user && user.groupTest(expr || attrExpr)){
          element.removeClass('ng-hide');
        }else{
          element.addClass('ng-hide');
        }
      }

      if(attrExpr){
        scope.$watch($parse(attrExpr),function(value){
          expr = $stormpath.regexAttrParser(value);
          evalElement();
        });
        $rootScope.$watch('user',function(){
          evalElement();
        });
      }
    }
  };
}])

/**
 * @ngdoc directive
 *
 * @name stormpath.ifUserNotInGroup:ifUserNotInGroup
 *
 * @description
 *
 * Use this directive to conditionally show an element if the user is logged in
 * and is NOT a member of the group that is specified by the expression.
 *
 * This is the inverse of {@link stormpath.ifUserInGroup:ifUserInGroup ifUserInGroup},
 * please refer to that directive for full usage information.
 *
 * **Note**: This feature depends on the data that is returned by the
 * {@link api/stormpath.STORMPATH_CONFIG:STORMPATH_CONFIG#properties_CURRENT_USER_URI CURRENT_USER_URI}.
 * Your server should expand the account's groups before returning the user.
 * If you are using [express-stormpath](https://github.com/stormpath/express-stormpath), simply use
 * [Automatic Expansion](http://docs.stormpath.com/nodejs/express/latest/user_data.html#automatic-expansion)
 *
 * @example
 *
 * <pre>
 *   <div class="container">
 *     <h3 if-user-not-in-group="'admins'">
 *       Hello, {{user.fullName}}, please request administrator access
 *     </h3>
 *   </div>
 * </pre>
 */
.directive('ifUserNotInGroup',['$user','$rootScope','$parse','$stormpath',function($user,$rootScope,$parse,$stormpath){
  return {
    link: function(scope,element,attrs){

      var expr;
      var attrExpr = attrs.ifUserNotInGroup;

      function evalElement(){
        var user = $user.currentUser;
        if(user && user.groupTest(expr || attrExpr)){
          element.addClass('ng-hide');
        }else{
          element.removeClass('ng-hide');
        }
      }

      if(attrExpr){
        scope.$watch($parse(attrExpr),function(value){
          expr = $stormpath.regexAttrParser(value);
          evalElement();
        });
        $rootScope.$watch('user',function(){
          evalElement();
        });
      }
    }
  };
}])

/**
 * @ngdoc directive
 *
 * @name stormpath.whileResolvingUser:while-resolving-user
 *
 * @description
 *
 * # [DEPRECATED]
 * Please use {@link stormpath.ifUserStateUnknown:ifUserStateUnknown ifUserStateUnknown} instead.
 *
 */
.directive('whileResolvingUser',['$user','$rootScope',function($user,$rootScope){
  return {
    link: function(scope,element){
      $rootScope.$watch('user',function(){
        if($user.currentUser || ($user.currentUser===false)){
          element.addClass('ng-hide');
        }else{
          element.removeClass('ng-hide');
        }
      });
    }
  };
}])
/**
 * @ngdoc directive
 *
 * @name stormpath.ifUserStateKnown:ifUserStateKnown
 *
 * @description
 *
 * Use this directive to show an element once the user state is known.
 * The inverse of {@link stormpath.ifUserStateUnknown:ifUserStateUnknown ifUserStateUnknown}. You can
 * use this directive to show an element after we know if the user is logged in
 * or not.
 *
 * @example
 *
 * <pre>
 * <div if-user-state-known>
 *   <li if-not-user>
 *      <a ui-sref="login">Login</a>
 *    </li>
 *    <li if-user>
 *        <a ui-sref="main" sp-logout>Logout</a>
 *    </li>
 * </div>
 * </pre>
 */
.directive('ifUserStateKnown',['$user','$rootScope',function($user,$rootScope){
  return {
    link: function(scope,element){
      $rootScope.$watch('user',function(){
        if($user.currentUser || ($user.currentUser===false)){
          element.removeClass('ng-hide');
        }else{
          element.addClass('ng-hide');
        }
      });
    }
  };
}])
/**
 * @ngdoc directive
 *
 * @name stormpath.ifUserStateUnknown:ifUserStateUnknown
 *
 * @description
 *
 * Use this directive to show an element while waiting to know if the user
 * is logged in or not.  This is useful if you want to show a loading graphic
 * over your application while you are waiting for the user state.
 *
 * @example
 *
 * <pre>
 * <div if-user-state-unknown>
 *   <p>Loading.. </p>
 * </div>
 * </pre>
 */
.directive('ifUserStateUnknown',['$user','$rootScope',function($user,$rootScope){
  return {
    link: function(scope,element){
      $rootScope.$watch('user',function(){
        if($user.currentUser === null){
          element.removeClass('ng-hide');
        }else{
          element.addClass('ng-hide');
        }
      });
    }
  };
}])

/**
 * @ngdoc directive
 *
 * @name stormpath.spLogout:spLogout
 *
 * @description
 *
 * This directive adds a click handler to the element.  When clicked, the user will be logged out.
 *
 * **Note**: the click action triggers the logout request to the server and
 * deletes your authentication information, it does not automatically redirect
 * you to any view (we leave this in your control).
 *
 * The common use-case is to redirect users to the login view after they
 * logout.  This can be done by observing the
 * {@link stormpath.authService.$auth#events_$sessionEnd $sessionEnd} event.
 * For example, if you are using UI Router:
 *
 * ```javascript
 * $rootScope.$on('$sessionEnd',function () {
 *   $state.transitionTo('login');
 * });
 * ```
 *
 * @example
 *
 * <pre>
 *   <a ui-sref="main" sp-logout>Logout</a>
 * </pre>
 */
.directive('spLogout',['$auth',function($auth){
  return{
    link: function(scope,element){
      element.on('click',function(){
        $auth.endSession();
      });
    }
  };
}]);
