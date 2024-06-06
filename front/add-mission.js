$(document).ready(function () {
    $('#add-mission-form').submit(function (e) {
        e.preventDefault();

        const name = $('#mission-name').val();
        const details = $('#mission-details').val();
        const beforeImageFile = $('#before-image')[0].files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            const beforeImageBase64 = event.target.result;

            const missions = JSON.parse(localStorage.getItem('missions')) || [];
            missions.push({ name, details, beforeImage: beforeImageBase64, status: 'Not Done' });
            localStorage.setItem('missions', JSON.stringify(missions));

            window.location.href = 'index.html';
        };
        reader.readAsDataURL(beforeImageFile);
    });
});
