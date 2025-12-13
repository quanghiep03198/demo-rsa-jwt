import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import { DatabaseModule } from './database/database.module'
import { RouteModule } from './modules/route.module'
import morgan from 'morgan'

const bootstrap = async () => {
	const app = express()

	const HOST: string = process.env.HOST || '127.0.0.1'
	const PORT: string | number = process.env.PORT || 3198

	app.use(express.json())
	app.use(express.urlencoded())
	app.use(morgan('dev'))

	await Promise.all([DatabaseModule.register(), RouteModule.forRootAsync({ prefix: '/v1/api', app })])

	await app.listen(PORT, () => {
		console.log(`[Application] :>>> Server is running on http://${HOST}:${PORT}`)
	})
}

bootstrap()
