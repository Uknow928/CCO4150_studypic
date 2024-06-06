$(document).ready(function () {
    const missions = JSON.parse(localStorage.getItem('missions')) || [];
    const missionList = $('#mission-list');

    missions.forEach((mission, index) => {
        const missionItem = $(`
            <li class="mission-item ${mission.status.toLowerCase().replace(" ", "-")}">
                <h2>${mission.name}</h2>
                <p>${mission.details}</p>
                <img class="mission-image" src="${mission.beforeImage}" alt="Before ${mission.name}">
                <input type="file" class="after-image-upload" id="after-image-${index}" data-index="${index}" style="display: none;">
                <button class="upload-after-button" data-index="${index}">Upload After Photo</button>
                <button class="delete-button" data-index="${index}">&times;</button>
                <p>Status: ${mission.status}</p>
            </li>
        `);
        missionList.append(missionItem);
    });

    $(document).on('click', '.upload-after-button', function () {
        const index = $(this).data('index');
        console.log(`Clicked Upload After Photo button for index ${index}`);
        $(`#after-image-${index}`).click();
    });

    $(document).on('change', '.after-image-upload', function (e) {
        const index = $(this).data('index');
        const file = e.target.files[0];
        console.log(`Selected file for index ${index}:`, file);
        uploadAfterImage(index, file);
    });

    $(document).on('click', '.delete-button', function () {
        const index = $(this).data('index');
        deleteMission(index);
    });

    $('#add-mission-button').click(function () {
        window.location.href = 'add-mission.html';
    });

    function uploadAfterImage(index, afterImageFile) {
        const missions = JSON.parse(localStorage.getItem('missions')) || [];
        const mission = missions[index];

        if (!mission) {
            console.error(`Mission not found at index ${index}`);
            return;
        }

        // Convert base64 beforeImage to a File object
        fetch(mission.beforeImage)
            .then(res => res.blob())
            .then(blob => {
                const beforeImageFile = new File([blob], `before-${index}.png`, { type: blob.type });

                const formData = new FormData();
                formData.append('before', beforeImageFile);
                formData.append('after', afterImageFile);

                $.ajax({
                    url: 'https://f000-1-235-77-88.ngrok-free.app/upload',
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (data) {
                        console.log(`Upload success:`, data);                
                        console.log('Before Text:', data.before_text);
                        console.log('After Text:', data.after_text);

                        if (data.result === 'changed') {
                            // Show modal with buttons
                            $('#statusModal').data('index', index).show();
                        } else {
                            alert('No significant changes detected.');
                        }
                    },
                    error: function (error) {
                        console.error('Error uploading image:', error);
                        console.log('Response:', error.responseText);
                    }
                });
            });
    }

    function deleteMission(index) {
        const missions = JSON.parse(localStorage.getItem('missions')) || [];
        missions.splice(index, 1);
        localStorage.setItem('missions', JSON.stringify(missions));
        location.reload();
    }

    // Handle status update buttons
    $('#statusComplete').click(function() {
        updateMissionStatus('Complete');
    });

    $('#statusHalfway').click(function() {
        updateMissionStatus('Halfway');
    });

    $('#statusNotDone').click(function() {
        updateMissionStatus('Not Done');
    });

    function updateMissionStatus(status) {
        const index = $('#statusModal').data('index');
        const missions = JSON.parse(localStorage.getItem('missions')) || [];
        const mission = missions[index];
        
        if (mission) {
            mission.status = status;
            localStorage.setItem('missions', JSON.stringify(missions));
            location.reload();
        }

        $('#statusModal').hide(); // Hide modal after status update
    }

    // Close modal when clicking on <span> (x)
    $('.close').click(function() {
        $('#statusModal').hide();
    });

    // Resize images after rendering
    $('.mission-image').css('max-width', '200px'); // Adjust the max width as needed
    $('.mission-image').css('max-height', '200px'); // Adjust the max height as needed
});
