$('#usedstuff-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/?' + search, function(data) {
    $('#usedstuff-grid').html('');
    data.reverse().forEach(function(usedstuff) {
      $('#usedstuff-grid').append(`
        <div class="col-md-3 col-sm-4 col-xs-6">
          <a href="/${ usedstuff._id }">
            <div class="thumbnail">
              <div class="imgbackground" style='background-image: url("${ usedstuff.image.url }")'></div>
              <div class="caption" class="row">   
                <p>
                    <span class="left" style="color:green; font-size:medium; font-weight:bold">
                        $${ usedstuff.cost }
                    </span>
                </p>
              </div>                    
              <div class="caption" class="row">                        
                  <p>
                      <span class="left" style="color:black; font-size:medium;">`
                      +
                      displayName(usedstuff.name)
                      +
                      `</span>
                      <br>
                  </p>
              </div>
            </div>
          </a>
        </div>
      `);
    });
  });
});

$('#usedstuff-search').submit(function(event) {
  event.preventDefault();
});


function displayName(name) {
  var stuffName = name;
  if(name.length > 20) {
    stuffName = name.substring(0,20) + "...";
  }
  return stuffName;
}
