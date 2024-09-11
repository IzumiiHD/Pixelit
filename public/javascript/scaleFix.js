// Function to create and apply the wrapper
function createWrapper() {
  // Create a new div element to serve as the wrapper
  const wrapper = document.createElement('div');
  wrapper.id = 'content-wrapper';

  // Set the wrapper's style
  wrapper.style.minHeight = '100vh';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.transformOrigin = 'top center';

  // Move all body children into the wrapper
  while (document.body.firstChild) {
    wrapper.appendChild(document.body.firstChild);
  }

  // Append the wrapper to the body
  document.body.appendChild(wrapper);

  return wrapper;
}

// Function to adjust the scale
function adjustScale(wrapper) {
  const viewportHeight = window.innerHeight;
  const baseHeight = 1080; // Base height for scaling (1080p)

  if (viewportHeight < baseHeight) {
    // Calculate scale based on viewport height
    let scale = viewportHeight / baseHeight;

    // Limit the minimum scale to 0.7
    scale = Math.max(scale, 0.7);

    // Apply the scale transform
    wrapper.style.transform = `scale(${scale})`;

    // Adjust the body height to account for scaling
    document.body.style.height = `${viewportHeight / scale}px`;
  } else {
    // Reset styles if viewport is larger than or equal to 1080p
    wrapper.style.transform = 'none';
    document.body.style.height = 'auto';
  }
}

// Function to initialize the scaling
function initScaling() {
  // Set body styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflowX = 'hidden';

  // Create the wrapper
  const wrapper = createWrapper();

  // Initial scale adjustment
  adjustScale(wrapper);

  // Add resize event listener
  window.addEventListener('resize', () => adjustScale(wrapper));
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initScaling);