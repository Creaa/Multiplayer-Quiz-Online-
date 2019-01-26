// Connection Settings
import questionsList from "./public/questionList"
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg);
    });
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});

// Connection Settings End

// Players List Functions 

var playersList = []

io.on('connection', function (socket) {
    //SayHello - user join to server.
    socket.on('sayHello', function (msg) {
        playersList.push({
            name: msg,
            id: socket.id,
            status: "none",
            points: 0,
        })
        io.sockets.connected[socket.id].emit('userID', socket.id)
        sendPlayerList();
        console.log(playersList);
        io.emit('statusUpdate', `${msg} dołączył do serwera.`);
    });
});

io.on('connection', function (socket) {
    console.log(`${socket.id} connected`);
    socket.on('disconnect', function () {
        //sayGoodBye - user left.
        let index = 0;
        playersList.forEach(el => {
            if (el.id == socket.id) {
                playersList.splice(index, 1)

            } else {
                index++;
            }

        });
        sendPlayerList();
        if (playersList.length <= 2) {
            io.emit('endOfGame');
            gamesIsOn = false;
        }
        console.log(`${socket.id} disconnected`);
        console.log(playersList);
    });
});

io.on('connection', function (socket) {
    if (!gamesIsOn) {
        socket.on('playerIsReady', function (msg) {
            playersList.forEach(el => {
                if (el.id == socket.id) {
                    el.status = "ready";
                    io.emit('statusUpdate', `${el.name} jest gotowy.`);
                }
            })
            checkStatus();
            sendPlayerList();
        });
    }
});

function sendPlayerList() {
    io.emit('playerListUpload', playersList);

}

function checkStatus() {
    let playersNoneActive = 0;
    playersList.forEach(el => {
        if (el.status !== "ready") {
            playersNoneActive++;
        }
    });
    if (playersNoneActive > 0) {
        io.emit('statusUpdate', `Pozostało ${playersNoneActive} graczy niegotowych do rozpoczecia gry.`);
    } else {
        makeTeams();
        setTimeout(function () {
            startGame();
        }, 3000)
    }
}
// Pre-Game Functions 

function makeTeams() {
    let temporaryPlayerList = playersList.slice();
    for (let i = 0; i < playersList.length; i++) {
        if (i % 2 == 0) {
            temporaryPlayerList[i].team = "red"
        } else {
            temporaryPlayerList[i].team = "blue"
        }
    }
}
let gamesIsOn = false;
let totalRedScore = 0;
let totalBlueScore = 0;
let stage;
let numberOfQuestion;
let questionTimeIsUp;
let buzzerIsActive;

function startGame() {
    io.emit('statusUpdate', "Gra się rozpoczyna");
    gamesIsOn = true;
    totalRedScore = 0;
    totalBlueScore = 0;
    stage = 1;
    numberOfQuestion = 1;

    gameController();
}

// Game Functions

var questionsList = [{
        question: "Kwas askorbinowy to inaczej witamina:",
        answerA: "A",
        answerB: "B",
        answerC: "D",
        answerD: "C",
        correctAnswer: "D"
    }, {
        question: `Kto zagrał Tadeusza Norka w serialu "Miodowe Lata"?`,
        answerA: "Artur Barciś",
        answerB: "Cezary Żak",
        answerC: "Jacek Braciak",
        answerD: "Waldemar Obłoza",
        correctAnswer: "A"
    },
    {
        question: `Symbol "Ca" w układzie okresowym oznacza:`,
        answerA: "Cynk",
        answerB: "Miedź",
        answerC: "Wapń",
        answerD: "Cyrkoń",
        correctAnswer: "C"
    },
    {
        question: `W którym roku premierę miała gra "Wiedźmin 3: Dziki Gon"?`,
        answerA: "2015",
        answerB: "2014",
        answerC: "2016",
        answerD: "2013",
        correctAnswer: "A"
    },
    {
        question: `Dokończ piosenkę Tadeusza Woźniaka: "A kiedy przyjdzie takze po mnie..."`,
        answerA: "Bóg jedyny, przenajświętszy",
        answerB: "Zegarmistrz światła purpurowy",
        answerC: "Jaskrawa kostucha wieczności",
        answerD: "Kolejny urzędnik państwowy",
        correctAnswer: "B"
    },
    {
        question: `Która z planet układu słonecznego jest największa?`,
        answerA: "Jowisz",
        answerB: "Saturn",
        answerC: "Uran",
        answerD: "Mars",
        correctAnswer: "A"
    },
    {
        question: `Proces przeprowadzany przez rośliny, w którym efektem ubocznym powstaje tlen:`,
        answerA: "Oddychanie",
        answerB: "Fotosynteza",
        answerC: "Dyfuzja tlenowa",
        answerD: "Skraplanie",
        correctAnswer: "B"
    },
    {
        question: "W jakim kraju leży Lwów?",
        answerA: "Białoruś",
        answerB: "Ukraina",
        answerC: "Polska",
        answerD: "Litwa",
        correctAnswer: "B"

    }, {
        question: "Komu podlegało Generalne Gubernatorstwo?",
        answerA: "Austrii",
        answerB: "ZSRR",
        answerC: "Wielkiej Brytanii",
        answerD: "III Rzeszy",
        correctAnswer: "D"
    }, {
        question: "Który legendarny ptak odradzał się ze swojego popiołu?",
        answerA: "Kiwi",
        answerB: "Feniks",
        answerC: "Dodo",
        answerD: "Rudzik",
        correctAnswer: "B"
    }, {
        question: "Z czym kojarzymy zwrot Sodoma i Gomora",
        answerA: "Mitologia grecka",
        answerB: "Mitologia egipska",
        answerC: "Don Kichot",
        answerD: "Biblia",
        correctAnswer: "D"

    }, {
        question: "Co mierzymy w niutonach [N]?",
        answerA: "Siłę",
        answerB: "Ciśnienie",
        answerC: "Ładunek elektryczny",
        answerD: "Pracę",
        correctAnswer: "A"

    }, {
        question: "Błędnik odpowiada za:",
        answerA: "Równowagę ",
        answerB: "Menstruację ",
        answerC: "Mowę ",
        answerD: "Wzrok",
        correctAnswer: "A"

    }, {
        question: "Kto jest autorem książki Solaris",
        answerA: "Arthur Conan Doyle",
        answerB: "Stanisław Lem",
        answerC: "Adam Mickiewicz ",
        answerD: "Mikołaj Rej",
        correctAnswer: "B"
    }, {
        question: "Gdzie znajduje się Morskie Oko",
        answerA: "Na północy Polski",
        answerB: "Na południu Polski",
        answerC: "Na zachodzie Polski",
        answerD: "Na wschodzie Polski",
        correctAnswer: "B"
    }, {
        question: "Co oznacza skrót ONZ?",
        answerA: "Organizacja Nacji Zjednoczonych",
        answerB: "Opcja Narodów Zjednoczonych",
        answerC: "Organizacja Narodów Zjednoczonych",
        answerD: "Organizacja Narodów Zniszczonych",
        correctAnswer: "C"
    }, {
        question: "Jakie nazwisko nosił główny bohater Lalki?",
        answerA: "Wokulski",
        answerB: "Włodarczyk",
        answerC: "Wolski",
        answerD: "Wołodyjowski",
        correctAnswer: "A"
    }, {
        question: "Co oznacza litera m we wzorze e=mc2",
        answerA: "Grawitacja",
        answerB: "Ciśnienie",
        answerC: "Masa spoczynkowa",
        answerD: "Siła",
        correctAnswer: "C"
    }, {
        question: "W którym roku odbyła się koronacja Bolesława Chrobrego?",
        answerA: "1024",
        answerB: "1020",
        answerC: "1026",
        answerD: "1025",
        correctAnswer: "D"
    }, {
        question: "W którym roku uchwalono konstytucję 3 Maja?",
        answerA: "1791",
        answerB: "1772",
        answerC: "1775",
        answerD: "1772",
        correctAnswer: "A"

    }, {
        question: 'Cest la vie',
        answerA: "Myślę, więc jestem",
        answerB: "Życie jest pięknę",
        answerC: "Takie jest życie",
        answerD: "Kości zostały rzucone",
        correctAnswer: "C"
    },
    {
        question: "Kim jest Tomasz Sikora?",
        answerA: "Biathlonista ",
        answerB: "Kierowca F1",
        answerC: "Piłkarz",
        answerD: "Łyżwiarz",
        correctAnswer: "A"

    },
    {
        question: "Jaki pseudonim otrzymał Wład Palownik",
        answerA: "Atylla ",
        answerB: "Drakula",
        answerC: "Hanibal",
        answerD: "Mustafa",
        correctAnswer: "B"
    },
    {
        question: "Jak nazywa się najgłębszy rów oceaniczny ziemi?",
        answerA: "Rów Romański",
        answerB: "Rów Elżbietański",
        answerC: "Rów Mariański",
        answerD: "Rów Januszowy",
        correctAnswer: "C"

    },
    {
        question: "Które z tych zdań pasują do Edypa?",
        answerA: "Przekazywał ludzkie wyroki",
        answerB: "Poślubił swoją matkę",
        answerC: "Zdecydował się na zmianę płci",
        answerD: "Poślubił swoją córkę ",
        correctAnswer: "D"
    },
    {
        question: "Batuta to: ",
        answerA: "Instrument smyczkowy",
        answerB: "Pałeczka przekazywana przez dyrygenta",
        answerC: "Mała gitara",
        answerD: "Urządzenie do strojenia fortepianiu",
        correctAnswer: "B"

    },
    {
        question: "Kto wymyślił układ okresowy?",
        answerA: "Dmitrj Mendelejew",
        answerB: "Leonid Breżniew",
        answerC: "Michaił Gorbaczow",
        answerD: "Włodzimierz Lenin",
        correctAnswer: "A"

    },
    {
        question: "Kim był Ryszard Wagner?",
        answerA: "Astronomem",
        answerB: "Pisarzem",
        answerC: "Fizykiem",
        answerD: "Kompozytorem",
        correctAnswer: "D"

    },
    {
        question: "Co oznacza w języku niemieckim słowo Hund? ",
        answerA: "Rower",
        answerB: "Kota",
        answerC: "Pies",
        answerD: "Taniec",
        correctAnswer: "C"

    },
    {
        question: "Co oznacza, że piłkarz nurkuje?",
        answerA: "Strzela",
        answerB: "Fauluje",
        answerC: "Nie obronił karnego",
        answerD: "Symuluje",
        correctAnswer: "D"

    }
]

function sendQuestion() {
    console.log("Pytanie");
    io.emit('statusUpdate', "Oto pytanie:");
    let question = questionsList[Math.floor(Math.random() * (questionsList.length - 0) + 0)];
    io.emit('sendQuestion', question, numberOfQuestion, stage);
    questionTimeIsUp = false;
    if (stage == 2) {
        buzzerIsActive = true;
    } else {
        buzzerIsActive = false;
    }
    setTimeout(function () {
        questionTimeIsUp = true;
        io.emit('statusUpdate', "Koniec czasu");
    }, 8000);
    setTimeout(function () {
        validateAnswer(question);
    }, 13000)
}

function answer(msg, id) {
    if (!questionTimeIsUp) {
        playersList.forEach(el => {
            if (el.id == id && el.answer == undefined && el.team) {
                console.log("Odpowiedź udzielona");
                el.answer = msg;
                io.emit('lockAnswer', msg, id, el.name, stage);
                io.emit('statusUpdate', `Gracz ${el.name} zaznaczył odpowiedź!`);
                console.log(playersList);
            }
        })


    }
}

function validateAnswer(question) {
    playersList.forEach(el => {
        if (el.answer == question.correctAnswer) {
            el.status = "Correct";
            io.emit('correctAnswer', el.answer, el.id, el.name);
            console.log(el.name + "Poprawna odpowiedź!");
        } else {
            io.emit('invalidAnswer', el.answer, el.id, el.name, question.correctAnswer, stage);

        }
    })
    addPoints();
}

function addPoints() {
    // Scores Ranking for Stage 1
    if (stage == 1) {
        let redScore = 0;
        let blueScore = 0;
        playersList.forEach(el => {
            if (el.status == "Correct" && el.team == "red") {
                redScore++;
                el.points++;
            } else if (el.status == "Correct" && el.team == "blue") {
                blueScore++;
                el.points++;
            }
            el.status = "Playing";
            el.answer = undefined;
        })
        if (redScore > blueScore) {
            totalRedScore++
            io.emit('statusUpdate', "Druzyna Red zdobywa punkt!");
            io.emit('updatePoints', totalRedScore, totalBlueScore);
        } else if (redScore < blueScore) {
            totalBlueScore++;
            io.emit('updatePoints', totalRedScore, totalBlueScore);
        } else {
            io.emit('statusUpdate', "Remis!");
        }
    }
    // Score Ranking for Stage 2
    if (stage == 2 || stage == 3) {
        playersList.forEach(el => {
            if (el.status == "Correct") {
                el.points++;
                el.team == "red" ? totalRedScore++ : totalBlueScore++;
                io.emit('statusUpdate', `${el.name} udzielił prawidłowej odpowiedz. Druzyna ${el.team} zdobywa punkt!`);
                io.emit('updatePoints', totalRedScore, totalBlueScore);
            }
            el.status = "Playing";
            el.answer = undefined;
        })
    }
    console.log(totalRedScore, totalBlueScore);

    // Go to Next Question
    setTimeout(function () {
        numberOfQuestion++;
        gameController();
    }, 10000)
}
io.on('connection', function (socket) {
    socket.on('playerAnswer', function (msg) {
        answer(msg, socket.id)
    })
});

io.on('connection', function (socket) {
    socket.on('buzzerHitted', function () {
        if (buzzerIsActive) {
            buzzerIsActive = false;
            playersList.forEach(el => {
                if (socket.id == el.id) {
                    io.emit('buzzerResponse', socket.id);
                    io.emit('statusUpdate', `${el.name} udziela odpowiedzi!`);
                } else {
                    el.answer = "None"
                }
            })
        }
    })
});




function gameController() {
    if (numberOfQuestion == 1 && stage == 1) {
        io.emit('statusUpdate', `Etap 1: kazda osoba udziela odpowiedzi, druzyna, która zdobędzie więcej poprawnych odpowiedz zdobywa punkt.`);
    }
    if (numberOfQuestion == 5 && stage == 1) {
        stage++;
        numberOfQuestion = 1;
        io.emit('statusUpdate', `Etap 2: Kto pierwszy, ten lepszy. Kto zna odpowiedź wciska buzzer i odpowiada. Udzielenie poprawnej odpowiedzi jest nagradzane punktem.`);
    }
    if (numberOfQuestion == 5 && stage == 2) {
        io.emit('statusUpdate', `Koniec meczu, wygrywa druzyna ${ totalBlueScore > totalRedScore? 'Blue' : 'Red'}`);
        setTimeout(function () {
            io.emit('endOfGame');
            gamesIsOn = false;
        })
    }
    if (gamesIsOn) {
        setTimeout(function () {
            sendQuestion();
        }, 3000);

    }
}