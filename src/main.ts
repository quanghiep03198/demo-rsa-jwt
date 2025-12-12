import 'dotenv/config'
import express from 'express'
import { DatabaseModule } from './database/database.module'
import { RouteModule } from './modules/route.module'

const bootstrap = async () => {
	const app = express()

	const HOST: string = process.env.HOST || '127.0.0.1'
	const PORT: string | number = process.env.PORT || 2004

	app.use(express.json())
	app.use(express.urlencoded())

	await Promise.all([DatabaseModule.register(), RouteModule.forRootAsync({ prefix: '/v1/api', app })])

	await app.listen(PORT, () => {
		console.log(`Server is running on http://${HOST}:${PORT}`)
	})
}

bootstrap()
