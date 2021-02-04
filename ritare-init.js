Ritare.start({
    parentel: "painter",
    onFinish: function(e) {
        Ritare.canvas.toBlob((blob)=>{
            let formData = new FormData()
            formData.append("drawing",blob,"blob.png")
            fetch("https://david-guestbook.ayampenyet.rodeo/submission",{method:"POST", mode: 'no-cors', body:formData})
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    location.href = "/guestbook_entries.html"
                    return response;
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
        }, "image/png")
        
    },
    width:512,
    height:512
});
