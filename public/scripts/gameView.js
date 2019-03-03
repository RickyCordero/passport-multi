fetch('/users/game', { credentials: "include" })
    .then(function (response) {
        return response.json();
    })
    .then(function (game) {
        renderGame(game);
    });


const renderGame = (game) => {
    if (game.name) {
        document.title = game.name;
    }
    if (game.pin) {
        const pinHtml = `
        Share pin '${game.pin}' with your friends so they can join the game!
        `;
        document.getElementById('sharepin').innerHTML = pinHtml;
    }
    if (game.guests) {
        const listHtml = `
        <div class="card" style="width: 18rem;">
            <ul class="list-group list-group-flush">
            ${
            game.guests.reduce((html, guest) =>
                html + `<li class="list-group-item">${guest.name}</li>`, '')
            }
            </ul>
        </div>
        `;
        document.getElementById('guests').innerHTML = listHtml;
    }
};

