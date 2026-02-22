export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  render() {
    throw new Error('Component must implement render()');
  }

  mount(parent) {
    const html = this.render();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    this.element = temp.firstElementChild;
    parent.appendChild(this.element);
    this.afterMount();
  }

  afterMount() {}

  unmount() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
