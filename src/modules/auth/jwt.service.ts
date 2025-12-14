import 'reflect-metadata'

import { generateKeyPairSync } from 'crypto'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { Service } from 'typedi'

type TokenExpiration = Parameters<(typeof jwt)['sign']>[2]['expiresIn']

@Service()
export class JwtService {
	/**
	 * Create RSA key pairs and save the private key to a file
	 * @param userId
	 * @returns
	 */
	public createKeyPairs(userId: string): { publicKey: string; privateKey: string } {
		const start = performance.now()
		const { publicKey, privateKey } = generateKeyPairSync('rsa', {
			modulusLength: 2048,
			staticKeyEncoding: {
				type: 'spki',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem'
			}
		})
		const end = performance.now()
		const duration = end - start
		console.log(`Key pair generated in ${duration} milliseconds`)

		// * Create keys directory if not exists
		const keysDir = join(process.cwd(), 'keys')
		if (!existsSync(keysDir)) {
			mkdirSync(keysDir, { recursive: true })
		}

		// * Save private key to a file
		const privateKeyPath = join(keysDir, `${userId}.pem`)
		writeFileSync(privateKeyPath, privateKey, 'utf-8')
		console.log('publicKey', publicKey.export({ type: 'spki', format: 'pem' }))

		// * Return public and private keys in PEM format
		return {
			publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
			privateKey
		}
	}

	public sign<T extends Parameters<(typeof jwt)['sign']>[0]>(
		payload: T,
		rsaPrivateKey: string,
		expiresIn?: TokenExpiration
	): string {
		const start = performance.now()
		const token = jwt.sign(payload, rsaPrivateKey, { algorithm: 'RS256', expiresIn: expiresIn || '5s' })
		const end = performance.now()
		const duration = end - start
		console.log(`Token signed in ${duration} milliseconds`)
		return token
	}

	public verify<T>(token: string, rsaPublicKey: string) {
		try {
			const start = performance.now()
			const result = jwt.verify(token, rsaPublicKey, { algorithms: ['RS256'] }) as T
			const end = performance.now()
			const duration = end - start
			console.log(`Token verified in ${duration} milliseconds`)
			return result
		} catch (error) {
			throw createHttpError.Forbidden(error instanceof JsonWebTokenError ? error.message : 'Invalid token')
		}
	}
}
