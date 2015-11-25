# Stormpath Angular SDK Example

This folder contains an example application that is built with the [Stormpath Angular SDK][]
and [Stormpath Express][].

This application is the same one that is built when you follow the [Yeoman Guide][],
but instead of [UI Router][], it uses the [ngRoute][] module.

#### Running the Example Application

1. To run this application, you will need Bower and Grunt as global packages:

  ```bash
  npm install -g grunt bower
  ```

2. Clone this repo to your computer, and enter the directory for this example:

  ```bash
  git clone git@github.com:stormpath/stormpath-sdk-angularjs.git
  cd stormpath-sdk-angularjs/example/ng-route-app
  ```

3. Install the dependencies:

  ```bash
  npm install
  bower install
  ```
4. Export your environment variables for your Stormpath Tenant and Application:

  ```bash
  export STORMPATH_CLIENT_APIKEY_ID=xxx
  export STORMPATH_CLIENT_APIKEY_SECRET=xxx
  export STORMPATH_APPLICATION_HREF=xxx
  ```

5. Start the server with Grunt, this should start the server and open the Angular
  application in your browser:

  ```bash
  grunt serve
  ```

[Stormpath Angular SDK]: https://github.com/stormpath/stormpath-sdk-angularjs
[Stormpath Express]: https://github.com/stormpath/stormpath-express
[Yeoman Guide]: https://docs.stormpath.com/angularjs/guide
[UI Router]: https://github.com/angular-ui/ui-router
[ngRoute]: https://docs.angularjs.org/api/ngRoute
