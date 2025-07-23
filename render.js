let nextUnitOfWork = null;

let workInProgressRoot = null;

export function render(element, container) {
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };

  nextUnitOfWork = workInProgressRoot;
}

function commitRoot() {
  commitWork(workInProgressRoot.child);
  workInProgressRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  console.log('2. 每次执行工作单元后的Fiber树', fiber);

  if (fiber.child) {
    return fiber.child;
  }

  while (fiber) {
    if (fiber.sibling) {
      return fiber.sibling;
    }
    fiber = fiber.parent;
  }
}

export function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  renderAttr(dom, fiber.props);

  return dom;
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

function dispatchEvent(event) {}
