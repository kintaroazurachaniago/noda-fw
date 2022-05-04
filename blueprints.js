exports.scripts = { spa : `/* Spa class */
class SPA {

	constructor(autoAddElement=false) {
		if (autoAddElement) {
			const div     = document.createElement('div')
			div.innerHTML = '-=[ include(spa_views, data) ]=-'
			div.setAttribute('class', 'spa-element')
			document.body.appendChild(div)
		}
	}

	async go(url, data) {
		const response = await fetch(url + '?' + new URLSearchParams({ spa : true }))
		this.finish(url, response, data)
	}

	async post(url, data, redirect=undefined) {
		const newData = new URLSearchParams();
		for (let pair of new FormData(data)) {
		    newData.append(pair[0], pair[1]);
		}
		const response = await fetch(url + '?' + new URLSearchParams({ spa : true, redirect }), {
			method : 'POST',
			body : newData
		})
		this.finish(url, response, data)
	}

	async finish(url, response, data) {
		const json     = await response.json()
		document.title = json.data.title;
		document.querySelector('.spa-element').innerHTML = json.output || '<h1>404 NOT FOUND!</h1>'
		window.history.pushState({ "url":url, "html":json.output, "pageTitle":json.data.title }, "", json.redirect ? json.redirect : url)
		data?.callback?.(json.data)
	}

	async back(url=location.href) {
		const response = await fetch(url + '?' + new URLSearchParams({ spa : false }))
		const json = await response.json()
		document.querySelector('.spa-element').innerHTML = json.output
	}

	change(element, data) {
		(typeof element === 'string' ? document.querySelector(element) : element).innerHTML = typeof data === 'string' ? data : 'The data should be a string'
	}

}

const Spa = new SPA(false)` }

exports.files = [{ path : '/Controller.js', data : `/* File name : Controller.js */

const { DB } = require('noda-fw') /* require db */

/* Setting db */
var App, User /* Deklarasi database dan table */
setTimeout(async _ => { /* Menggunakan asyncronus programming serta timeout */
	App = await DB.createDatabase('app') /* Menginisialisasi database */
	User = await App.createTable('users') /* Menginisialisasi table */
})

const Controller = {
	home : {
		index : (req, res) => {
			res.view('home.spa', { title : 'Home page' })
		},
		about : (req, res) => {
			res.view('about.spa', { title : 'About page' })
		},
		contact : (req, res) => {
			res.view('contact.spa', { title : 'Contact page' })
		}
	}
}

module.exports = Controller` }, { path : '/Setting.json', data : `{
	"paths" : {
		"view" : "/views/",
		"controller" : "/",
		"static" : "/asset/",
		"spa_script" : "/asset/js/spa/",
		"not_found" : "404.html"
	}
}`}, { path : '/asset/css/style.css', data : `/* Style file */
* { margin: 0; padding: 0; font-family: monospace; }
.err-area {
	width: 100vw;
	height: 100vh;
	overflow: scroll;
	text-align : center;
	font-weight: 1000;
	color      : red;
	font-family: monospace;
	margin-top : 40vh;
}
.container {
	max-width: 550px; margin: auto;
}
.not-found {
	text-align : center;
	font-weight: 1000;
	font-size  : 5vh;
	color      : red;
	font-family: monospace;
	margin-top : 40vh;
}
.bg-home .a {
	background: orange;
	border-radius: 50%;
	width: 150px;
	height: 150px;
	position: relative; right: 50px; bottom: 100px;
	z-index: 3;
}
.bg-home .b {
	background: pink;
	border-radius: 50%;
	width: 175px;
	height: 175px;
	position: relative; bottom: 200px;
	z-index: 2;
}
.bg-home .c {
	background: white;
	border-radius: 50%;
	width: 200px;
	height: 200px;
	position: relative; bottom: 350px; right: 80px;
	z-index: 1;
}
.home {
	display: flex; justify-content: center;
	text-align: center;
	margin-top: 150px;
	height: 0px;
}
.home .text {
	position: relative; left: 100px; top: 30px;
	z-index: 99;
}
.about {
	text-align:  center;
	margin-top: 40vh;
}
.contact {
	text-align:  center;
	margin-top: 40vh;
}
.navigation {
	background: white;
	position: fixed; bottom: 0px; left: 0;
	width: 90vw;
	padding: 0px 5vw;
	text-align: center;
	box-shadow: 2px -1px 15px #999999;
}
.navigation button {
	text-align: center;
	/*width: 70px;*/
	min-width: 70px;
	height: 70px;
	background: none;
	color: black;
	padding: 0px 3vw;
	border: none;
	/*border-bottom: px solid white;*/
	border-radius: 50% 50% 0px 0px;
}
.navigation .active {
	background: white; color: black;
	box-shadow: 0px -10px 15px #999999;
	position: relative; bottom: 10px;
}
.copyright {
	position: fixed; bottom: 10vh; right: 3vw;
}
.time {
	margin-left: 10px; margin-top: 10px;
}
.calendar {
	width: 50vw;
	/*background: green;*/
	margin-left: 10px; margin-top: 10px;
	text-align: center;
}
.calendar .day {
	font-size: 50px; position: relative; top: 15px;
}
.calendar .date {
	font-size: 150px; font-weight: 1000;
}
.calendar .month-and-year {
	font-size: 30px; position: relative; bottom: 15px;
}
.links {
	float: right;
	margin-top: -15px;
	margin-right: 10px;
}
.links a {
	color: white;
}`}, { path : '/asset/js/script.js', data : `/* Script file */
const run_time = _ => {
	var i = 0
	const timing = setInterval( _ => {
		if (i === 20) console.clear()
		
		var
			r = Math.floor(Math.random() * 256),
			g = Math.floor(Math.random() * 256),
			b = Math.floor(Math.random() * 256),
			x = Math.floor(Math.random() * 4) + 2

		const
			days            = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			months          = ['January', 'February', 'March', 'April', 'Mei', 'Mune', 'Muly', 'August', 'September', 'November', 'December'],

			newDate         = new Date(),
			time_element    = document.querySelector('.time'),

			year_element    = document.querySelector('.year'),
			month_element   = document.querySelector('.month'),
			date_element		= document.querySelector('.date'),
			day_element     = document.querySelector('.day'),
			hours_element   = document.querySelector('.hours'),
			minutes_element = document.querySelector('.minutes'),
			seconds_element = document.querySelector('.seconds'),
			year            = newDate.getFullYear(),
			month           = newDate.getMonth(),
			date            = newDate.getDate(),
			day             = newDate.getDay(),
			hours           = newDate.getHours(),
			minutes         = newDate.getMinutes(),
			seconds         = newDate.getSeconds()

		if (time_element) {
			year_element.innerHTML    = year
			month_element.innerHTML   = months[month]
			date_element.innerHTML    = date
			day_element.innerHTML     = days[day]
			hours_element.innerHTML   = hours < 10 ? '0' + hours : hours /* Hours */
			minutes_element.innerHTML = minutes < 10 ? '0' + minutes : minutes /* Minutes */
			seconds_element.innerHTML = seconds < 10 ? '0' + seconds : seconds /* Seconds */

			document.body.setAttribute('style', 'background: rgba('+r+', '+g+', '+b+', .'+x+');')
		} else {
			// Skip interval
			// clearInterval(timing)
		}
		
		i++
	}, 1000)
}

const change_active_state = element => {
	document.querySelector('.active').classList.remove('active')
	element.classList.add('active')
}, change_color = element => {
	var
	r = Math.floor(Math.random() * 256),
	g = Math.floor(Math.random() * 256),
	b = Math.floor(Math.random() * 256),
	x = Math.floor(Math.random() * 4) + 2
	element.setAttribute('style', \`background: rgba(\${r}, \${g}, \${b}, \${x});\`)
}, home = element => {
	Spa.go('/home')
	change_active_state(element)
}, about = element => {
	Spa.go('/about')
	change_active_state(element)
}, contact = element => {
	Spa.go('/contact')
	change_active_state(element)
}, users = element => {
	Spa.go('/users')
	change_active_state(element)
}`}, { path : '/views/404.html', data : `<div class="not-found">UNREGISTERED ROUTE!</div>` }, { path : '/views/index.html', data : `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
	<link rel="stylesheet" href="/asset/css/style.css">
	<title>-={ data.title }=-</title>
</head>
<body>
	<div class="container">
		<div class="d-flex justify-content-end my-5">
			<button class="btn btn-primary" onclick="Spa.go('/home')">Enter <i class="fa-solid fa-arrow-right-to-bracket"></i></button>
		</div>
		<div class="d-flex justify-content-center mt-5">
			<div class="col-md-4 mt-5 px-3 py-4 bg-light shadow rounded">
				<center>
					<div class="time" style="font-weight: 1000;">
						<div style="font-size: 45px;">00:00</div>
						<div style="font-size: 100px;">00</div>
					</div>
					<div class="day" style="font-size: 35px;">Hello world</div>
				</center>
				<hr>
				-=[ include('partials/links') ]=-
			</div>
		</div>
		<div style="font-size: 20px; font-weight: bold; color: #999999; text-align: center; position: absolute; bottom: 100px; left:  0px; width: 100vw;">
			&copy;KINTARO<span class="tahun">0000</span>
		</div>
	</div>
	<script src="https://kit.fontawesome.com/d094627c71.js" crossorigin="anonymous"></script>
	<script>
		var date = new Date()
		var day = date.getDay()
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		document.querySelector('.day').innerHTML = days[day]
		document.querySelector('.tahun').innerHTML = date.getFullYear()
		var i = 0
		const timing = setInterval( _ => {
			if (i === 30) console.clear()
			var r = Math.floor(Math.random() * 256)
			var g = Math.floor(Math.random() * 256)
			var b = Math.floor(Math.random() * 256)
			var x = Math.floor(Math.random() * 4) + 2
			console.log(x, r, g, b)
			var date = new Date()
			var h = date.getHours()
			var m = date.getMinutes()
			var s = date.getSeconds()
			const time = document.querySelector('.time')
			if (time) {
				time.innerHTML = '<div style="font-size: 45px;">' +
					(h < 10 ? '0' + h : h) + /* Hours */
					':' + (m < 10 ? '0' + m : m) + '</div><div style="font-size: 100px;">' + /* Minutes */
					(s < 10 ? '0' + s : s) + /* Seconds */
					'</div>'
				document.body.setAttribute('style', 'background: rgba('+r+', '+g+', '+b+', .'+x+');')
			} else {
				clearInterval(timing)
			}
			i++
		}, 1000)
	</script>
	<script src="/asset/js/script.js"></script>
</body>
</html>`}, { path : '/views/about.spa.html', data : `<h1 class="about">About page</h1>` }, { path : '/views/home.spa.html', data : `<div class="container">
	<div class="time">
		<span class="hours">00</span>:<span class="minutes">00</span>:<span class="seconds">00</span>
	</div>
	-=[ include('links') ]=-
	<div class="calendar">
		<span class="day">day</span><br>
		<span class="date">00</span><br>
		<div class="month-and-year">
			<span class="month">Month</span>/<span class="year">0000</span>
		</div>
	</div>
	<div class="home">
		<h1 class="text">Home page</h1>
		<div class="bg-home">
			<div class="a" onmouseover="change_color(this)"></div>
			<div class="b" onmouseover="change_color(this)"></div>
			<div class="c" onmouseover="change_color(this)"></div>
		</div>
	</div>
</div>` }, { path : '/views/links.html', data : `<div class="links">
	<a class="mx-2" href="https://facebook.com/kintaro.azura">Facebook</a>
	<a class="mx-2" href="https://instagram.com/kintaro_azura">Instagram</a>
	<a class="mx-2" href="https://wa.me/6289633948126?text=Permisi bang, Lagi sibuk gak?">whatsapp</a>
</div>` }, { path : '/views/navbar.html', data : `<div class="navigation">
	<button class="-={ this.request.url === '/home' || this.request.url === '/' ? 'active' : '' }=-" onclick="home(this)">Home</button>
	<button class="-={ this.request.url === '/about' ? 'active' : '' }=-" onclick="about(this)">About</button>
	<button class="-={ this.request.url === '/contact' ? 'active' : '' }=-" onclick="contact(this)">Contact</button>
	<button class="-={ this.request.url === '/users' ? 'active' : '' }=-" onclick="users(this)">Users</button>
</div>` }, { path : '/views/SPA.html', data : `<!-- File name : SPA.html -->
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="/asset/css/style.css">
	<title>-={ data.title }=-</title>
</head>
<body onload="run_time()">
	<div class="copyright">&copy;KINTARO<span class="tahun">0000</span></div>
	-=[ include('navbar') ]=-
	<div class="spa-element">
		-=[ include(spa_views, data) ]=-
	</div>
	<script src="/asset/js/script.js"></script>
	<script src="-={ setting.paths.spa_script }=-"></script>
</body>
</html>` }, { path : '/views/x-contact.spa.html', data : `<h1 class="contact">Contact page</h1>` }]