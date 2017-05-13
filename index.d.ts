/// <reference types="angular" />
/// <reference types="angular-ui-router" />

import * as angular from 'angular';

declare var _: string;
export = _;

declare module 'angular' {

  export namespace stormpath {

    /**
     * STORMPATH_CONFIG
     */

    interface IStormpathConfig {
      AUTHENTICATION_ENDPOINT: string;
      AUTHENTICATION_FAILURE_EVENT_NAME: string;
      AUTHENTICATION_SUCCESS_EVENT_NAME: string;
      AUTH_SERVICE_NAME: string;
      CHANGE_PASSWORD_ENDPOINT: string;
      CURRENT_USER_URI: string;
      DESTROY_SESSION_ENDPOINT: string;
      EMAIL_VERIFICATION_ENDPOINT: string;
      ENDPOINT_PREFIX: string;
      FORGOT_PASSWORD_ENDPOINT: string;
      FORM_CONTENT_TYPE: string;
      GET_USER_EVENT: string;
      NOT_LOGGED_IN_EVENT: string;
      REGISTERED_EVENT_NAME: string;
      REGISTER_URI: string;
      ROUTE_CHANGE_UNAUTHENTICATED: string;
      ROUTE_CHANGE_UNAUTHORIZED: string;
      SESSION_END_EVENT: string;
      SOCIAL_LOGIN_SERVICE_NAME: string;
      STATE_CHANGE_UNAUTHENTICATED: string;
      STATE_CHANGE_UNAUTHORIZED: string;
    }

    /**
     * $stormpath
     */

    interface IStormpathService {
      ngRouter(config: INgRouterConfig): void;
      uiRouter(config: IUiRouterConfig): void;
    }

    interface IRouterConfig {
      autoRedirect?: boolean;
      defaultPostLoginState?: string;
      forbiddenState?: string;
      loginState?: string;
    }

    interface INgRouterConfig extends IRouterConfig {}

    interface IUiRouterConfig extends IRouterConfig {}

    /**
     * sp config
     */

    interface ISpConfig {
      authenticate?: boolean;
      authorize?: {
        group: string;
      };
      waitForUser?: boolean;
    }

    interface ISpStateConfig extends ISpConfig {}

    interface ISpRouteConfig extends ISpConfig {}

    /**
     * $auth
     */

    interface IAuthService {
      authenticate<T>(credentialData: any): angular.IPromise<angular.IHttpPromiseCallbackArg<T>>;
      endSession<T>(): angular.IPromise<angular.IHttpPromiseCallbackArg<T>>;
    }

    interface IAuthProvider extends angular.IServiceProvider {}

    /**
     * $user
     */

    interface IUserService {
      currentUser: IUser;
      create(accountData: IUserAccountData): angular.IPromise<IUser>;
      get(bypassCache: boolean): angular.IPromise<IUser>;
      passwordResetRequest<T>(data: any): angular.IPromise<angular.IHttpPromiseCallbackArg<T>>;
      resendVerificationEmail<T>(data: any): angular.IPromise<angular.IHttpPromiseCallbackArg<T>>;
      resetPassword<T>(token: string, data: any): angular.IPromise<angular.IHttpPromiseCallbackArg<T>>;
      verify<T>(sptoken: string): angular.IPromise<angular.IHttpPromiseCallbackArg<T>>;
      verifyPasswordResetToken<T>(sptoken: string): angular.IPromise<angular.IHttpPromiseCallbackArg<T>>;
    }

    interface IUserProvider extends angular.IServiceProvider {}

    interface IUserAccountData {
      givenName: string;
      surname: string;
      email: string;
      password: string;
    }

    interface IUser {
      href: string;
      username: string;
      email: string;
      givenName: string;
      middleName: string;
      surname: string;
      fullName: string;
      status: 'ENABLED' | 'UNVERIFIED';
      createdAt: string;
      modifiedAt: string;
    }

    /**
     * $socialLogin
     */

    interface ISocialLoginService {}

    interface ISocialLoginProvider extends angular.IServiceProvider {}

    /**
     * $spJsLoader
     */

    interface ISpJsLoader {}

  }

  /**
   * Augment ui-router state
   */
  export namespace ui {
    interface IState {
      sp?: stormpath.ISpStateConfig;
    }
  }

}
