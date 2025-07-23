export function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode(element.props.nodeValue)
      : document.createElement(element.type);
  container.appendChild(dom);

  renderAttr(dom, element.props);

  element.props.children.forEach((child) => {
    render(child, dom);
  });
}

function renderAttr(dom, props) {
  Object.keys(props)
    .filter((key) => key !== 'children')
    .forEach((key) => {
      if (key === 'style') {
        Object.keys(props[key]).forEach((styleKey) => {
          dom.style[styleKey] = props[key][styleKey];
        });
      } else if (key.startsWith('on')) {
        dom[key.toLowerCase()] = props[key];
      } else {
        dom[key] = props[key];
      }
    });
}

function addEvent(dom, eventName, handler) {
  dom.store = dom.store || {};
  dom.store[eventName] = handler;
  if (!document[eventName]) {
    document[eventName] = dispatchEvent;
  }
}

function dispatchEvent(event){
  
}