window.addEventListener('DOMContentLoaded', function() {
    var pronunciationElement = document.getElementById('pronunciation');

    if (pronunciationElement) {
        var audio = new Audio('/sounds/pronounceButton.mp3');
        pronunciationElement.addEventListener('click', function() {
            audio.play();
        });
    }
});