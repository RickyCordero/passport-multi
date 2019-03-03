fetch('/users/game', { credentials: "include" })
    .then(function (response) {
        return response.json();
    })
    .then(function (game) {
        renderGame(game);
    });


const renderGame = (game) => {
    if (game.name) {
        const cardHtml = `
        <div class="card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">${game.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${game.pin}</h6>
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/users/game/${game.pin}" class="card-link">Go to game</a>
                <a href="/users/deleteGame/${game.pin}" class="card-link">Delete game</a>
            </div>
        </div>
        `;
        document.getElementById('game').innerHTML = cardHtml;
    }
};