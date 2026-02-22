export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
  }

  on(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    if (this.routes[path]) {
      this.currentRoute = path;
      this.routes[path]();
      window.history.pushState({}, '', path);
    }
  }
}
