const fs = require('fs/promises')
const path = require('path')

class Chat {
	constructor(filename) {
		this.filename = 'mensajes.json';
	}

	async createFile() {
		let file;
		try {
			file = await fs.readFile(this.filename, 'utf-8');
			return JSON.parse(file);
		} catch (error) {
			if (error.code == 'ENOENT') {
				await fs.writeFile(this.filename, '[]');
				file = await fs.readFile(this.filename, 'utf-8');
			} else {
				console.log(error);
			}
		}

		return JSON.parse(file);
	}

	async save(newData) {
		let file = await this.createFile();
		if (Array.isArray(newData)) {
			try {
				const data = JSON.parse(file);

				let currentId = 1;

				newData.forEach(item => {
					if (data.length > 0) {
						item.id = data.at(-1).id + 1;
					} else {
						item.id = currentId;
						currentId++;
					}
					data.push(item);
				});
				await fs.writeFile(path.join(__dirname, this.filename), JSON.stringify(data, null, 2));
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				const data = await this.createFile();

				newData.id = data.length > 0 ? data[data.length - 1].id + 1 : 1;

				data.push(newData);

				await fs.writeFile(path.join(__dirname, this.filename), JSON.stringify(data, null, 2));
			} catch (err) {
				console.log(err);
			}
		}
	}

	async getById(id) {
		try {
			const data = await this.createFile();

			const match = data.filter((item, index) => item.id === id);
			if (match.length) {
				return match;
			}
			return 'No se encontro producto';
		} catch (err) {
			console.log(err);
		}
	}

	async getAll() {
		try {
			const data = await this.createFile();

			return data;
		} catch (err) {
			console.log(err);
		}
	}

	async deleteById(id) {
		try {
			const data = await this.createFile();

			const newData = data.filter((item, index) => item.id !== id);


			await fs.writeFile(path.join(__dirname, this.filename), JSON.stringify(newData, null, 2));
		} catch (err) {
			console.log(err);
		}
	}

	async deleteAll() {
		try {
			await fs.writeFile(path.join(__dirname, this.filename), '[]');
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = Chat;