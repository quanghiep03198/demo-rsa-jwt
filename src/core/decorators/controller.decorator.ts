import express from "express";
import "reflect-metadata";

const ROUTES_KEY = "routes";

interface RouteDef {
	method: "get" | "post" | "put" | "patch" | "delete";
	path: string;
	handlerName: string;
}

export function Controller<T extends { new (...args: any[]): {} }>(target: T) {
	const router = express.Router();
	const routes = (Reflect.getMetadata(ROUTES_KEY, target) as RouteDef[]) || [];

	for (const route of routes) {
		const instance = new target();
		const handler = (instance as any)[route.handlerName].bind(instance);

		switch (route.method) {
			case "get":
				router.get(route.path, handler);
				break;
			case "post":
				router.post(route.path, handler);
				break;
			case "put":
				router.put(route.path, handler);
				break;
			case "patch":
				router.patch(route.path, handler);
				break;
			case "delete":
				router.delete(route.path, handler);
				break;
		}
	}
	Object.defineProperty(target.prototype, "router", {
		value: router,
		writable: true,
	});
}

export function Get(path: string): MethodDecorator {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const routes: RouteDef[] =
			Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];

		routes.push({
			method: "get",
			path,
			handlerName: propertyKey.toString(),
		});

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
	};
}

/**
 * @publicApi
 * @param path
 * @returns
 */
export function Post(path: string): MethodDecorator {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const routes: RouteDef[] =
			Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];

		routes.push({
			method: "post",
			path,
			handlerName: propertyKey.toString(),
		});

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
	};
}

export function Patch(path: string): MethodDecorator {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const routes: RouteDef[] =
			Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];

		routes.push({
			method: "patch",
			path,
			handlerName: propertyKey.toString(),
		});

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
	};
}
export function Put(path: string): MethodDecorator {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const routes: RouteDef[] =
			Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];

		routes.push({
			method: "put",
			path,
			handlerName: propertyKey.toString(),
		});

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
	};
}

export function Delete(path: string): MethodDecorator {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const routes: RouteDef[] =
			Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];

		routes.push({
			method: "delete",
			path,
			handlerName: propertyKey.toString(),
		});

		Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
	};
}
