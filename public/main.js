$(function () {
    var socket = io();
    let myId;

    sayHello();


    function sayHello() {
        var userName = prompt("Wpisz swoję imię (max. 8 znaków):");
        if (userName == '' || userName.length > 8) {
            sayHello()
        } else {
            userName = userName.split(" ")
            socket.emit('sayHello', userName[0]);
            socket.on('userID', function (msg) {
                myId = msg;
            })
            return false;
        }
    }

    $('#ready-button').click(function (event) {
        socket.emit('playerIsReady');
        $(event.target).css('display', 'none')
    })

    socket.on('playerListUpload', function (msg) {
        $('#player-list').html('');
        $('#player-list-red').html('');
        $('#player-list-blue').html('');
        console.log(msg);
        msg.forEach(element => {
            if (element.team == "red") {
                $('#player-list-red').append(`<li class="player" id=${element.name}>${element.name}</li>`);
            } else if (element.team == "blue") {
                $('#player-list-blue').append(`<li class="player" id=${element.name}>${element.name}</li>`);
            } else {
                $('#player-list').append(`<li class="player" id=${element.name}>${element.name}</li>`);
            }
        });
    });

    socket.on('sendQuestion', function (question, numberOfQuestion, stage) {
        // Show question and answers for everyone (Stage 1)
        $('#questions').fadeIn();
        $('#answers').fadeIn();
        $(`#player-list`).fadeOut()
        $(`#player-list-red li`).css('borderColor', 'white');
        $(`#player-list-blue li`).css('borderColor', 'white');
        $('#answers').html('')
        $('#question').html(`<p>${question.question}</p>`);
        $('#answers').append(`<li id="A">${question.answerA}</li>`);
        $('#answers').append(`<li id="B">${question.answerB}</li>`);
        $('#answers').append(`<li id="C">${question.answerC}</li>`);
        $('#answers').append(`<li id="D">${question.answerD}</li>`);


        // Show question countdown
        $('#question-timer span').text('8');
        $('#question-timer span').fadeIn().css({
            "display": "block",
            "animation": "timerCountdown 8s forwards"
        })
        let countdownTimeout = setInterval(function () {
            let actualTime = $('#question-timer span').text();
            if (actualTime == 0) {
                clearInterval(countdownTimeout);
                $('#question-timer span').fadeOut().css({
                    "animation": "none"
                })
            } else {
                actualTime--;
                $('#question-timer span').html(actualTime);

            }
        }, 1000)

        // Show question to all, and answer only to volentueer (Stage 2)

        if (stage == 2) {
            $('#answers').css({
                "transform": "translateX(-2500px)",
                "animation": "none"
            });
        }
        $('#buzzer').click(function () {
            socket.emit('buzzerHitted');

        })
        $('#answers li').click(function (event) {
            console.log("Wysłano")
            socket.emit('playerAnswer', event.target.id);

        })
    })

    socket.on('buzzerResponse', function (id) {
        if (myId == id) {
            $('#answers').css({
                "animation": "showAnswers 1.5s forwards"
            })
        }
    })

    socket.on('lockAnswer', function (msg, id, name, stage) {
        if (myId == id) {
            $(`#answers #${msg}`).css('backgroundColor', '#ffa500');
        }
        $(`#${name}`).css('borderColor', '#ffa500');
        if (stage == 2) {
            $('#answers').css({
                "animation": "showAnswers 1.5s forwards"
            })
            $(`#answers #${msg}`).css('backgroundColor', '#ffa500');
        }

    })
    socket.on('correctAnswer', function (msg, id, name) {
        if (myId == id) {
            $(`#answers #${msg}`).css('backgroundColor', '#00ff00');
        }
        setTimeout(function () {
            $(`#${name}`).css('borderColor', '#00ff00');
        }, 1000)
    })
    socket.on('invalidAnswer', function (msg, id, name, correctAnswer, stage) {
        if (myId == id) {
            $(`#answers #${msg}`).css('backgroundColor', '#ff0000');

            $(`#answers #${correctAnswer}`).css('backgroundColor', '#00ff00');
        }
        if (stage == 1) {
            setTimeout(function () {
                $(`#${name}`).css('borderColor', '#ff0000');
            }, 1000)
        }
    })

    socket.on('statusUpdate', function (msg) {
        $('#game-status span').text(msg);
    })


    socket.on('updatePoints', function (actualScoreRed, actualScoreBlue) {
        $(`#actual-score-red`).text(actualScoreRed);
        $(`#actual-score-blue`).text(actualScoreBlue);
    })

    socket.on('endOfGame', function () {
        $('#questions').fadeOut();
        $('#answers').fadeOut();
    })

});