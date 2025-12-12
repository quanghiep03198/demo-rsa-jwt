import { generateKeyPairSync } from 'crypto'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import createHttpError from 'http-errors'

export class JwtService {
	static createKeyPairs(userId: string): { publicKey: string; privateKey: string } {
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

		// Tạo thư mục keys nếu chưa tồn tại
		const keysDir = join(process.cwd(), 'keys')
		if (!existsSync(keysDir)) {
			mkdirSync(keysDir, { recursive: true })
		}

		// Lưu private key với tên file là userId
		const privateKeyPath = join(keysDir, `${userId}.pem`)
		writeFileSync(privateKeyPath, privateKey, 'utf-8')
		console.log('publicKey', publicKey.export({ type: 'spki', format: 'pem' }))
		// Trả về publicKey và privateKey dưới dạng chuỗi PEM
		return {
			publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
			privateKey
		}
	}

	static sign<T extends Parameters<(typeof jwt)['sign']>[0]>(
		payload: T,
		rsaPrivateKey: string,
		expiresIn?: Parameters<(typeof jwt)['sign']>[2]['expiresIn']
	): string {
		return jwt.sign(payload, rsaPrivateKey, { algorithm: 'RS256', expiresIn: expiresIn || '5s' })
	}

	static verify<T>(token: string, rsaPublicKey: string) {
		try {
			return jwt.verify(token, rsaPublicKey, { algorithms: ['RS256'] }) as T
		} catch (error) {
			throw createHttpError.Forbidden(error instanceof JsonWebTokenError ? error.message : 'Invalid token')
		}
	}
}
