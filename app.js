/* File name : app.js */

(_ => {
	module.paths = [ process.cwd() + '/lib']
	const
		fs = require('fs'),
		{ execSync } = require('child_process'),
		{ files } = require('./blueprints'),
		extentions = ['js', 'json', 'css', 'html'],
		brightGreenColor = '\x1b[1m\x1b[32m',
		resetColor = '\x1b[0m'

	if (!fs.existsSync(process.cwd() + '/Setting.json')) {
		console.log('Creating app')
		files.forEach( bp => {
			var dirname = '/', filename = ''
			bp.path.split('/').slice(1).forEach( path => { /* Checking if it folder or file */
				if (!path.includes('.')) dirname += path+'/' /* Folder */
				else { /* File */
					extentions.forEach( ex => {
						if (ex === path.split('.').pop()) filename = path /* if extentions list equals to the last item of directory's names splited by dot (.) */
					})
				}
				if (!fs.existsSync(process.cwd() + dirname)) { /* if folder doesn't exists */
					try { fs.mkdirSync(process.cwd() + dirname) /* create folder */ } catch (err) { throw err }
				}
				if (filename && !fs.existsSync(process.cwd() + dirname + filename)) {
					console.log('Writing file : ', process.cwd() + dirname + filename)
					try { fs.writeFileSync(process.cwd() + dirname + filename, bp.data) /* if filename not empty, create file */ } catch (err) { throw err }
				}
			})
		})
		console.log('App frame created successfully!')
		console.log('Wait a minutes...')
		execSync('npm init -y && npm i node-session')
	}
	console.clear()
	const write = string => {
		var x = 0
		const writing = setInterval(_ => {
			if (x < string.length) {
				process.stdout.write(brightGreenColor + string[x] + resetColor)
				x++
			} else clearInterval(writing)
		}, 50)
		setTimeout( _ => {
			console.log(process.cwd())
		}, 50 * string.length + 200)
	}
	setTimeout(_ => {
		write('Working on ')
	}, 50)
})()

const
	fs               = require('fs'),
	qs               = require('querystring'),
	setting          = JSON.parse(fs.readFileSync(process.cwd() + '/Setting.json')),
	DATABASE         = _ => fs.readFileSync(process.cwd() + '/node_modules/noda-fw/DATABASE.ben', 'utf8'),
	brightGreenColor = '\x1b[1m\x1b[32m',
	brightRedColor   = '\x1b[1m\x1b[31m',
	resetColor       = '\x1b[0m',
	NodeSession      = require('../node-session'),
	session          = new NodeSession({ secret : 'secret' })

String.prototype.insertAt = function (index, data) {
  if (index > this.length) return this.valueOf()
  return this.substr(0, index) + data + this.substr(index)
}
Object.prototype.stringify = function () {
	return JSON.stringify(this)
}

class Router {

	routes = []
	status = 0

	spa(request, response) {
		console.log('SPA Client-Script\t:\t' + request.url)
		const { scripts } = require('./blueprints')
		response.end(scripts.spa)
		return 1
	}

	static(request, response) {
		response.writeHead(200)
		response.end(fs.readFileSync(process.cwd() + request.url))
		return 1
	}

	start(request, response) {
		this.request        = request
		this.response       = response
		const url           = request.url.split('?')
		this.request.url    = url[0] || request.url
		this.request.params = url[1] ? qs.parse(url[1]) : {}
		if (this.request.url.includes(setting.paths.spa_script)) return this.spa(this.request, this.response)
		if (this.request.url.includes(setting.paths.static)) return this.static(this.request, this.response)
		this.suitableRoute     = this.findRoutes(this.request, this.response)
		this.response.view     = (path, data) => this.response.end(new Template(this.request, this.response).view(path, data))
		this.response.redirect = (url, message) => {
			this.response.writeHead(302, {
			  'Location': url + '?message=' + message
			})
			this.response.end()
		}
		if (!this.suitableRoute) {
			console.log(brightRedColor + 'Unregistered route' + resetColor + '\t:\t' +
				{ method : this.request.method, url : this.request.url, params : this.request.params }.stringify())
			this.response.view('404', { title : 'Page not found!' })
			return
		}
		console.log(brightGreenColor + 'Suitable route' + resetColor + '\t\t:\t' + this.suitableRoute.stringify())
		this.request.on('data', data => this.request.form = qs.parse(data.toString()))
		if (this.request.method === 'GET') { this.request.form = this.request.params }
		this.request.on('end', _ => this.suitableRoute?.callback?.(this.request, this.response))
	}

	findRoutes(request, response) {
		console.log('Finding match route for\t:\t' + request.url)
		if (request.url.includes('?message=')) {
			this.request.params = qs.parse('message='+request.url.split('?message=')[1])
			console.log('Message : ', this.request.params.message)
		}
		this.request.url = request.url.split('?message=')[0]
		var status = 0
		for ( let x = 0; x < this.routes.length; x++ ) {
			if (request.method === this.routes[x].method) {
				if (request.url === this.routes[x].url) {
					var y = x
					x = this.routes.length;
					status = 1
					return this.routes[y]
				}
				else if (this.routes[x].url.includes(':') && !request.url.includes('.') && this.routes[x].url.split('/').length === request.url.split('/').length && status !== 1) return this.checkParameter(x, request, response)
			}
		}
	}

	checkParameter(x, request, response) {
		var compared = { route : '', request : '', params : {} }
		this.routes[x].url.split('/').forEach( (rp, i) => {
			compared.params[rp.slice(1)]  = request.url.split('/')[i]
			compared.route               += rp.includes(':') ? '-=[param]=-' : `${rp}/`
			compared.request             += rp.includes(':') ? '-=[param]=-' : `${request.url.split('/')[i]}/`
		})
		this.request.params = Object.assign({}, this.request.params, compared.params)
		if (compared.route  === compared.request) return this.routes[x]
	}

	add(method, url, callback) { this.routes.push({ method, url, params : {}, callback }) }
	get(url, callback) { this.add('GET', url, callback) }
	post(url, callback) { this.add('POST', url, callback) }

}

class Template {

	script = {
		text : `
/* Default functions */
const
	echo = data => this.script.output += data,
	include = (path_include, data_include) => this.include(path_include, data_include);
		`,
		output : '' /* this.script.output will be filled when this.view called */
	}

	constructor(request, response) {
		/* this.request and this.response will be able to called in the view files */
		this.request  = request
		this.response = response
	}

	view(path, data) {
		console.log(`Rendering script \t:\t${process.cwd() + setting.paths.view + path}.html`)
		if (!data.title) data.title = this.request.url + '@' + this.request.method
		try {
			this.script.text += `const spa_views = "${path}"`
			// const fullPage = this.getoutput(process.cwd() + setting.paths.view + 'SPA.html', data)
			const output = this.getoutput(process.cwd() + setting.paths.view + (this.request.params?.spa ? path : 'SPA') + '.html', data)
			return this.request.params?.spa ? JSON.stringify({ /*fullPage, */output, data, redirect : this.request.params?.redirect }) : output
		} catch (err) {
			console.log(brightRedColor + 'SPA ERROR! :' + resetColor + err.toString())
			return this.request.params?.spa ? JSON.stringify({ output : '<div class="err-area"><b>' + err.toString() + '</b></div>', data }) : err.toString()
		}
	}

	include(path, data = {}) {
		console.log(`Including script \t:\t${process.cwd() + setting.paths.view + path}.html`)
		return this.getoutput(process.cwd() + setting.paths.view + path + '.html', data)
	}

	getoutput(filename, data) {
		const
			file   = fs.readFileSync(filename, 'utf8'),
			script = this.parseScript(file),
			output = this.evalScript(script, data)
		return output
	}

	parseScript(view_file) {
		return `
			${this.script.text}
			echo(\`${view_file
			.replace(/`/g, '\\`') /* avoid from echo(`something`) */
			.replace(/-={/g, '`);\necho(').replace(/}=-/g, ');\necho(`') /* replacing -={ 'hello' }=- into echo('hello')*/
			.replace(/-=\[/g, '`);\n').replace(/]=-/g, '\necho(`') /* replacing -=[ var x = 10 ]=- into var x = 10*/
		}\`);`
	}

	evalScript(script, data) {
		try {
			eval(script);
			return this.script.output
		} catch (err) {
			console.log('Script failed to be evaluated')
			console.log(err.toString())
			console.log(script)
			return `
				<html>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
					* { margin: 0; padding: 0;}
					.err-area {
						width: 96vw;
						height: 96vh;
						overflow: scroll;
						padding: 2vh 2vw;
					}
				</style>
				<div class="err-area">
					<br>
					<h1>
						View : "${err.toString().split('/').pop().slice(0, -1)}" not found!
					</h1>
					Create a new file named "${err.toString().split('/').pop().slice(0, -1)}" in the "${setting.paths.view}" directory <hr>
					<b>${err.toString()}</b>
				</div>
				</html>
			`
		}
	}

}

class DB { /* Local db */

	constructor(dbName = '', tableName = '') {
		// pass
	}

	databaseExist(callback) {
		if (DATABASE().includes('DATABASE='+this.dbName)) return `Database ${this.dbName} already exist!`
		callback(this.dbName)
	}

	createDatabase(dbName) {
		this.dbName = dbName
		if (DATABASE().includes('DATABASE='+this.dbName)) {
			console.log(`Database exist!\t\t:\tUsing "${dbName}" database`)
			return new Promise( (res, rej) => { res(new Model(dbName)) })
		}
		return new Promise( (res, rej) => {
			try { fs.appendFileSync(process.cwd() + '/node_modules/noda-fw/DATABASE.ben', `\nDATABASE=${dbName}`) } catch (err) { throw err }
			console.log(`Creating database\t:\t Using "${dbName}" database`)
			res(new Model(dbName))
		})
	}

}

class Model extends DB {

	whereObject = {}
	statuses    = {}

	constructor(dbName, tableName = '') {
		super(dbName, tableName)
		this.dbName = dbName
	}

	createTable(tableName) {
		this.tableName = tableName

		/* Mengambil data dari file DATABASE.ben dan kemudian mengurai nya menjadi objek array */
		this.tableData = _ => eval('[' + DATABASE()
			.split('\tTABLE='+tableName)[1]
			.split('DATABASE=')[0]
			.replace(/\t/g, '')
			.split('\n')
			.join(',') + ']')
		/* Membersihkan element array yang berupa objek kosong <1 empty item> */
		.filter( value => Object.keys(value).length > 0 )

		if (DATABASE().includes('\n\tTABLE='+tableName)) {
			console.log(`Table exist!\t\t:\tUsing "${tableName}" table`)
			return new Promise( (res, rej) => { res(this) })
		}
		return new Promise( (res, rej) => {
			this.insert('\n\tTABLE='+this.tableName, '\nDATABASE='+this.dbName /*, Empty indentation mean, it's not json data */)
			console.log(`Creating table\t\t:\t Using "${tableName}" table`)
			res(this)
		})
	}

	create(data, option = {}) {
		if (option.increment) {
			const all = this.read()
			const increment = all.length > 0 ? all[all.length-1][option.increment] : 1
			data[option.increment] = increment
		}
		if (Array.isArray(data)) {
			data.forEach( (d, x) => this.create(d, option[x]))
		} else {
			if (this.tableData().filter( td => td.stringify() === JSON.stringify(data) ).length > 0) {
				this.pushState(option.init || undefined, 'exist', data); return { status : 'exist' }
			}

			this.insert(data, '\n\tTABLE='+this.tableName, '\n\t\t')
			this.pushState(option.init || undefined, 'created', data)
			return { status : 'created' }
		}

	}

	pushState(init = Object.keys(this.statuses).length, status, data) { this.statuses[init] = { status, data } }

	insert(data, separator, indentData) {
		const
			newData = indentData ? indentData + JSON.stringify(data) : data,
			index   = DATABASE().indexOf(separator) + separator.length
		try { fs.writeFileSync(process.cwd() + '/node_modules/noda-fw/DATABASE.ben', DATABASE().insertAt(index, newData)) } catch (err) { throw err }
	}

	remove(data) {
		try { fs.writeFileSync(process.cwd() + '/node_modules/noda-fw/DATABASE.ben', DATABASE().replace('\n\t\t' + data.stringify(), '')) } catch (err) { throw err }
	}

	read() {
		console.log(`Reading "${this.tableName}" table`)
		const
			/* Mengevaluasi string objek array yang isi didapat dari file DATABASE.ben dan menampung nya di konstanta data */
			data                 = this.tableData(),
			/* memfilter data berdasarkan whereObject */
			whereObject          = this.whereObject,
			filterText           = 'value[whereObject.key] -=[separator]=- whereObject.value'

		this.whereObject = {}

		/* Mengembalikan data yang di filter karena whereObject tidak kosong */
		if (Object.keys(whereObject).length > 1) return data.filter( value => eval(filterText.replace('-=[separator]=-', whereObject.separator)))
		/* Mengembalikan semua data tanpa di filter */
		else return data
	}

	readFirst() {
		return this.read()[0]
	}

	where(a, b, c) {
		if (!b) throw 'Where clause need 2 parameter'

		/* Inisialisasi key, separator, dan value pada whereObject */
		this.whereObject = { key : a, separator : c?.toString() ? b : '=', value : c?.toString() ? c : b }

		/* memanipulasi value whereObject.separator */
		switch (this.whereObject.separator) {
			case '=' : this.whereObject.separator = '==='; break
		}

		return this
	}

	update(data) {
		const currentTableData = this.read()
		this.delete(currentTableData)
		for ( let[key, value] of Object.entries(data) ) {
			currentTableData.forEach( (od, x) => currentTableData[x][key] = value)
		}
		currentTableData.forEach( ctd => this.insert(ctd, '\n\tTABLE='+this.tableName, '\n\t\t'))
		return { status : 'updated', updated : true }
	}

	delete(data) {
		if (!data) data = this.read()
		console.log('D : ', data)
		data.forEach( ctd => this.remove(ctd))
		return { status : 'deleted', deleted : true }
	}

}

exports.Route      = new Router()
exports.DB         = new DB()
exports.Controller = require(`${process.cwd() + setting.paths.controller.replace('.', '')}/Controller`)
exports.Start      = (ROUTES, PORT, CALLBACK) => {
	require('http').createServer( (req, res) => {
		session.startSession(req, res, _ => {
			ROUTES.start(req, res)
		})
	}).listen(PORT, CALLBACK)
}