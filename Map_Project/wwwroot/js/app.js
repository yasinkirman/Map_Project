// Haritanın oluşturulması
var map = L.map('map').setView([37.05612, 29.10999], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
}).addTo(map);

// Kaydedilen noktaların tutulacağı dizi
var savedPoints = [];
var markers = [];

// Merkez noktanın kaydedilmesi
function savePoint() {
    var center = map.getCenter();
    var lat = center.lat.toFixed(6);
    var lng = center.lng.toFixed(6);
    var date = new Date().toISOString();

    var point = {
        id: savedPoints.length,
        lat: lat,
        lng: lng,
        datetime: date
    };

    savedPoints.push(point);
    createPointListItem(point);

    fetch('api/save-point', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(point)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Nokta başarıyla kaydedildi.', data);
        })
        .catch(error => {
            console.error('Nokta kaydedilirken bir hata oluştu.', error);
        });
}


// Kaydedilen noktaların listesini oluşturma
function createPointList() {
    var pointListContainer = document.getElementById('pointList');

    savedPoints.forEach(function (point) {
        createPointListItem(point);
    });
}

// Kaydedilen noktaların listesine yeni bir nokta öğesi eklenmesi
function createPointListItem(point) {
    var pointListContainer = document.getElementById('pointList');

    var listItem = document.createElement('div');
    listItem.className = 'listItem';

    var pointInfo = document.createElement('span');
    pointInfo.textContent = 'Latitude: ' + point.lat + ', Longitude: ' + point.lng + ', Date: ' + point.datetime;

    var deleteButton = document.createElement('button');
    deleteButton.className = 'deleteButton';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';

    deleteButton.addEventListener('click', function () {
        event.stopPropagation();
        deletePoint(point);
    });

    listItem.appendChild(pointInfo);
    listItem.appendChild(deleteButton);
    pointListContainer.appendChild(listItem);

    listItem.addEventListener('click', function () {
        addMarkerToMap(point);
    });
}

// Bir noktanın silinmesi
function deletePoint(point) {
    var index = savedPoints.indexOf(point);
    if (index > -1) {
        savedPoints.splice(index, 1);
        refreshPointList();
        removeMarkerFromMap(point);

        // Noktayı sunucudan da silme
        fetch('/api/delete-point/' + point.id, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    console.log('Nokta başarıyla silindi.');
                } else {
                    console.error('Nokta silinirken bir hata oluştu.');
                }
            })
            .catch(error => {
                console.error('Nokta silinirken bir hata oluştu.', error);
            });
    }
}

// Haritadan marker'ı kaldırma
function removeMarkerFromMap(point) {
    var index = markers.findIndex(function (marker) {
        return marker.getLatLng().equals([point.lat, point.lng]);
    });
    if (index > -1) {
        var marker = markers[index];
        map.removeLayer(marker);
        markers.splice(index, 1);
    }
}

// Kaydedilen noktaların listesini güncelleme
function refreshPointList() {
    var pointListContainer = document.getElementById('pointList');
    pointListContainer.innerHTML = '';
    createPointList();
}

// Haritaya marker ekleme
function addMarkerToMap(point) {
    markers.forEach(function (marker) {
        marker.removeFrom(map);
    });
    markers = [];

    var marker = L.marker([point.lat, point.lng]).addTo(map);
    markers.push(marker);
}

// .json dosyasını indirme
function downloadJson() {
    var data = JSON.stringify(savedPoints, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var downloadButton = document.getElementById('downloadButton');
    downloadButton.href = url;
}

var saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', savePoint);

var downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', downloadJson);

// Sayfa yüklendiğinde noktaları getirme
window.addEventListener('DOMContentLoaded', function () {
    fetch('api/get-point')
        .then(response => response.json())
        .then(data => {
            savedPoints = data;
            createPointList();
        })
        .catch(error => {
            console.error('Noktalar getirilirken bir hata oluştu.', error);
        });
});
