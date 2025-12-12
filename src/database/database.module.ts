import 'dotenv/config'
import mongoose from 'mongoose'

export class DatabaseModule {
	static async register() {
		const uri = process.env.MONGO_URI
		const dbName = process.env.MONGO_DB

		if (!uri) {
			console.error('MONGO_URI is not defined in environment variables.')
			return
		}

		try {
			await mongoose.connect(uri, {
				connectTimeoutMS: 5000,
				dbName
			})
			console.log('MongoDB connected successfully.')
		} catch (error) {
			console.error('Error from database module:>>>', error instanceof Error ? error.message : error)
		}
	}
}