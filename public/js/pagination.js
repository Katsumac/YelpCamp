const paginate = document.querySelector("#paginate");
const $campgroundsContainer = $("#campgrounds-container");
paginate.addEventListener("click", function (e) {
    e.preventDefault();
    fetch(this.href)
        .then(response => response.json())
        .then(data => {
            for(let campground of data.docs) {
                let template = generateCampground(campground);
                $campgroundsContainer.append(template);
            }
            let {nextPage} = data;
            this.href = this.href.replace(/page=\d+/, `page=${nextPage}`);
        })
        .catch(err => console.log(err));
})

function generateCampground(campground) {
    let template = ` <div class="card mb-3">
    <div class="row">
        <div class="col-md-4">
            <img src="${campground.images.length ? campground.images[0].url : "https://res.cloudinary.com/dehadt57g/image/upload/v1661126128/YelpCamp/Japan_Camp_srsqkw.jpg"}" class="img-fluid" alt="campImg" crossorigin="anonymous">
        </div>
        <div class="col-md-8">
            <div class="card-body">
                <h5 class="card-title">${campground.title}</h5>
                <p class="card-text">${campground.description}</p>
                <p class="car-text">
                    <small class="text-muted">${campground.location}</small>
                </p>
                <a href="/campgrounds/${campground.id}" class="btn btn-primary">View ${campground.title}</a>
            </div>
        </div>
    </div>

</div>`;

return template;
}