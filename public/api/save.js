// This file will be deleted soon

ge("banner").parentElement.addEventListener("click", () => {
  if (user.role !== "Common") {
    const overlayDiv = document.createElement("div");
    overlayDiv.classList.add("banner-selection-overlay");
    overlayDiv.style.display = "flex";
    overlayDiv.style.justifyContent = "center";
    overlayDiv.style.alignItems = "center";
    overlayDiv.style.position = "fixed";
    overlayDiv.style.top = "0";
    overlayDiv.style.left = "0";
    overlayDiv.style.width = "100%";
    overlayDiv.style.height = "100%";
    overlayDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";

    const bannerSelectionDiv = document.createElement("div");
    bannerSelectionDiv.classList.add("banner-selection-content");
    bannerSelectionDiv.style.backgroundColor = "#fff";
    bannerSelectionDiv.style.padding = "30px";
    bannerSelectionDiv.style.borderRadius = "5px";
    bannerSelectionDiv.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.5)";

    const images = ["chocolate.svg", "clockwork.svg", "fire.svg", "outerSpace.svg"];
    images.forEach((image) => {
      const imgElement = document.createElement("img");
      imgElement.src = `/img/banner/${image}`;
      imgElement.classList.add("banner-image");
      imgElement.style.width = "150px";
      imgElement.style.height = "150px";
      imgElement.style.display = "inline-block";
      imgElement.style.cursor = "pointer";
      imgElement.addEventListener("click", () => {
        user.banner = image;
        ge("banner").src = `/img/banner/${image}`;
        document.body.removeChild(overlayDiv);
      });
      bannerSelectionDiv.appendChild(imgElement);
    });

    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(overlayDiv);
    });
    bannerSelectionDiv.appendChild(cancelButton);

    overlayDiv.appendChild(bannerSelectionDiv);
    document.body.appendChild(overlayDiv);
  }
    // Save the newly selected banner to the database
    fetch('/updateBanner', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username, banner: user.banner }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Failed to update banner.');
        } else {
            alert('Banner updated successfully!');
        }
    })
    .catch(error => {
        console.error('Error updating banner:', error);
        alert('An error occurred while updating the banner.');
    });
});