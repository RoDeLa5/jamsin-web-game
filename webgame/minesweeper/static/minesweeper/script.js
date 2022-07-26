const socket = new WebSocket(
    'ws://' + window.location.host + '/ws/minesweeper/'
);

document.body.oncontextmenu = () => { return false; };
document.body.onselectstart = () => { return false; };
document.body.ondragstart = () => { return false; };

let num;
let tableElm;
let point = 0;

const title = document.getElementById('title');

const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', set_game);

const sizeWidthInput = document.getElementById('size-width');
const sizeHeightInput = document.getElementById('size-height');
const numInput = document.getElementById('num');

const inputList = [sizeWidthInput, sizeHeightInput, numInput];
document.addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
        if (inputList.every((element) => { return element.value; })) {
            set_game();
            //document.removeEventListener('keypress');
        }
    }
});

function set_game() {
    width = parseInt(sizeWidthInput.value); // Board width (cells)
    height = parseInt(sizeHeightInput.value); // Board height (cells)
    num = parseInt(numInput.value); // Number of mines

    send_command('set', { 'width': width, 'height': height, 'num': num });

    set_table(width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            tableElm.rows[y].cells[x].addEventListener('click', left_click(x, y));
            tableElm.rows[y].cells[x].addEventListener('contextmenu', right_click(x, y));
        }
    }
}

function set_table(width, height) {
    tableElm = document.createElement('table');
    tableElm.classList.add('table-border');
    tableElm.id = 'game-table';
    for (let y = 1; y <= height; y++) {
        const tr = document.createElement('tr');
        for (let x = 1; x <= width; x++) {
            const td = document.createElement('td');
            td.classList.add('covered');
            td.classList.add(`color${((x + y) & 1) + 1}`);
            tr.appendChild(td);
        }
        tableElm.appendChild(tr);
    }
    const areaDiv = document.getElementById('area');
    areaDiv.innerHTML = '';
    areaDiv.appendChild(tableElm);
}

function left_click(x, y) {
    return function () {
        if (this.classList.contains('covered')) {
            if (this.innerHTML != '🚩') {
                send_command('uncover', { pos: [x, y] });
            }
        } else {
            const num = parseInt(this.innerHTML);
            if (num != NaN) {
                /* 주변 깃발 합 vs 현재 칸 숫자*/
                let flags = 0;
                let adjacentCells = [];
                for (let i = 0; i < 9; i++) {
                    const _x = x - 1 + i % 3;
                    const _y = y - 1 + parseInt(i / 3);
                    if (_x >= 0 && _x < width && _y >= 0 && _y < height) {
                        adjacentCells.push([tableElm.rows[_y].cells[_x], [_x, _y]]);
                    }
                }
                adjacentCells.forEach(element => {
                    if (element[0].innerHTML == '🚩') {
                        flags++;
                    }
                });
                if (flags == num) {
                    adjacentCells.forEach(element => {
                        if (element[0].classList.contains('covered') && element[0].innerHTML != '🚩') {
                            send_command('uncover', { pos: element[1] });
                            console.log(element);
                        }
                    });
                }
            }
        }
    };
}

function right_click(x, y) {
    return function () {
        if (this.classList.contains('covered')) {
            if (this.innerHTML == '') {
                send_command('flag', { pos: [x, y] });
                this.innerHTML = '🚩';
            } else {
                send_command('unflag', { pos: [x, y] });
                this.innerHTML = '';
            }
        }
    };
}

function send_command(command, data) { // string, object (can be empty)
    data['command'] = command;
    socket.send(JSON.stringify(data));
}

function uncover(x, y, value) {
    const cell = tableElm.rows[y].cells[x];
    if (!cell.classList.contains('covered')) {
        return;
    }
    cell.classList.remove('covered');
    cell.classList.add('uncovered');
    switch (value) {
        case -1:
            cell.innerHTML = '💥';
            break;
        case -2:
            cell.innerHTML = '🎆';
            break;
        default:
            if (value == 0) {
                cell.innerHTML = '';
            } else {
                cell.innerHTML = value;
                cell.classList.add(`num${value}`);
            }
            point++;

    }
    if (value == -1) { // mine
    } else if (value == -2) { // clicked mine
    } else if (value == 0) {
    } else {
    }
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.command) {
        case 'uncover':
            const cells = data.cells;
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                uncover(cell.x, cell.y, cell.value);
            }
            if (point == width * height - num) {
                title.innerHTML = `클리어 🎉🎉\n점수: ${point}`;
                socket.close();
            }
            break;

        case 'end':
            const mines = data.mines;
            const click = data.click;

            for (let i = 0; i < mines.length; i++) {
                const mine = mines[i];
                uncover(mine.x, mine.y, -1);
            }

            uncover(click.x, click.y, -2);
            title.innerHTML = `지뢰를 밟았습니다\n점수: ${point}`;
            socket.close();
            break;
        default:
            console.log(data);
            break;
    }
};
