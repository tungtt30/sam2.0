

//init selections
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, "slot_input");
});
const name_p = document.querySelectorAll(".name_p")
const input_name = document.querySelector(".input_name")
const input_score = document.querySelectorAll(".input_score")
const btn_add = document.querySelector('.btn_add')
const total = document.querySelectorAll('.total')
const tbody = document.querySelector(".tbody")
const btn_clr = document.querySelector(".btn_clr")
const btn_audio = document.querySelector(".btn_audio")
const audio = document.querySelector(".audio")

const res_add = document.querySelector(".add_responsive")
const res_clr = document.querySelector(".clear_responsive")

let isPlaying = false

btn_audio.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause()
    }
    audio.play()
    isPlaying = true
})
audio.addEventListener('ended', () => {
    isPlaying = false

})

let namearr = ['s1', 's2', 's3', 's4', 's5']
let s = null
let dataupdate = [0, 0, 0, 0, 0]
const slot = document.querySelector(".slit")
slot.addEventListener('change', (e) => {
    s = e.target.value - 1
    input_name.value = ''
})

input_name.addEventListener('input', () => {
    if (s == null) {
        alert('pick slot ??')
        input_name.value = ''
    }
    name_p[s].innerHTML = input_name.value
    namearr[s] = input_name.value
    chart.update()
})

let p1 = []
let p2 = []
let p3 = []
let p4 = []
let p5 = []
const tr = []

const clearinput = () => {
    for (let i = 0; i < input_score.length; i++) {
        input_score[i].value = null
    }
}

const push = () => {
    let p1score = Number(input_score[0].value)
    let p2score = Number(input_score[1].value)
    let p3score = Number(input_score[2].value)
    let p4score = Number(input_score[3].value)
    let p5score = Number(input_score[4].value)

    const pushe = () => {
        p1.push(p1score)
        p2.push(p2score)
        p3.push(p3score)
        p4.push(p4score)
        p5.push(p5score)
        tr.push(` <tr>
        <td>${p1score}</td>
        <td>${p2score}</td>
        <td>${p3score}</td>
        <td>${p4score}</td>
        <td>${p5score}</td>
        </tr>
        `)
    }
    switch (!0) {
        case p1score !== 0 && p2score !== 0 && p3score !== 0 && p4score !== 0 && p5score !== 0:
            alert("Nhập ngu")
            break;
        case p2score !== 0 && p3score !== 0 && p4score !== 0 && p5score !== 0:
            p1score = -(p2score + p3score + p4score + p5score)
            pushe()
            totem()
            break;
        case p1score !== 0 && p3score !== 0 && p4score !== 0 && p5score !== 0:
            p2score = -(p1score + p3score + p4score + p5score)
            pushe()
            totem()
            break;
        case p2score !== 0 && p1score !== 0 && p4score !== 0 && p5score !== 0:
            p3score = -(p2score + p1score + p4score + p5score)
            pushe()
            totem()
            break;
        case p2score !== 0 && p3score !== 0 && p1score !== 0 && p5score !== 0:
            p4score = -(p2score + p3score + p1score + p5score)
            pushe()
            totem()
            break;
        case p2score !== 0 && p3score !== 0 && p4score !== 0 && p1score !== 0:
            p5score = -(p2score + p3score + p4score + p1score)
            pushe()
            totem()
            break;
        default:
            alert("Nhập ngu")
    }
}

const totem = () => {

    let a1 = p1.reduce((a, b) => (a + b))
    total[0].innerText = a1

    let a2 = p2.reduce((a, b) => (a + b))

    total[1].innerText = a2
    let a3 = p3.reduce((a, b) => (a + b))

    total[2].innerText = a3
    let a4 = p4.reduce((a, b) => (a + b))

    total[3].innerText = a4
    let a5 = p5.reduce((a, b) => (a + b))

    total[4].innerText = a5

    dataupdate = [a1, a2, a3, a4, a5]
}

const key = "key"
let dock = {
    p1: p1, p2: p2, p3: p3, p4: p4, p5: p5
}

const stored = () => {
    window.localStorage.setItem(key, JSON.stringify(dock))
}


const getStore = () => {
    var data = window.localStorage.getItem(key)
    var item = JSON.parse(data)
    p1 = item.p1
    p2 = item.p2
    p3 = item.p3
    p4 = item.p4
    p5 = item.p5
}

const data = {
    labels: namearr
    ,
    datasets: [{
        label: 'Sâm lốc analyze',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
            'red',
            'green',
            'violet',
            'orange',
            'blue'
        ],
        borderWidth: 1
    }]
};
const chart = new Chart("myChart", {
    type: "bar",
    data: data,
    options: {
        legend: { display: false }
    }
});

const render = () => {
    let ehe = tr.map(e => e)
    tbody.innerHTML = ehe.join('')
}
render()

btn_clr.addEventListener('click', () => {
    if (confirm('mất hết dữ liệu đấy !!') == true) {
        window.location.reload(true)
    }
    return
})

btn_add.addEventListener('click', () => {
    push()
    data.datasets[0].data = dataupdate
    chart.update()
    clearinput()
    render()
})

res_add.addEventListener('click', () => {
    push()
    clearinput()
    render()
})
res_clr.addEventListener('click', () => {
    if (confirm('mất hết dữ liệu đấy !!') = true) {
        window.location.reload(true)
    }
    return
})



