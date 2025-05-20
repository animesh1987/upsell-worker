const apiHeaders = (env) => {
	return {
		'X-Auth-Token': env.X_AUTH_TOKEN,
		'X-Auth-Client': env.X_Auth_Client,
		'Content-Type': 'application/json'
	}
};

export default {
	async fetch(request, env, ctx) {
		console.log('incoming request');
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(),
			});
		}

		switch (url.pathname) {
			case '/getProduct':
				const productId = 111;
				const productUrl = `https://api.bigcommerce.com/stores/${env.STORE_HASH}/v3/catalog/products/${productId}`;
				const imageUrl = `https://api.bigcommerce.com/stores/${env.STORE_HASH}/v3/catalog/products/${productId}/images`;
				const headers = {
					'X-Auth-Token': env.X_AUTH_TOKEN,
					'X-Auth-Client': env.X_Auth_Client,
					'Content-Type': 'application/json'
				};

				const [productResponse, imageResponse] = await Promise.all([
					fetch(productUrl, { method: 'GET', headers }),
					fetch(imageUrl, { method: 'GET', headers })
				]);

				const [productData, imageData] = await Promise.all([productResponse.json(), imageResponse.json()]);
				let product = JSON.stringify({ ...productData.data, images: imageData.data });

				return new Response(product, {
					status: productResponse.status,
					headers: {
						...corsHeaders(),
						'Content-Type': productResponse.headers.get('Content-Type') || 'application/json'
					}
				});
			
			case '/addToCart':
				/* Test curl -X POST http://localhost:8787/addToCart -H "Content-Type: application/json" -d '{
				"cart_id": "0578e447-ebeb-4a3d-86f9-160e56ab386a",
                "line_items": [
        			{
            			"name": "test",
            			"quantity": 1,
            			"product_id": 107
        			}
    			]
			}'*/
				
				const payload = await request.json();
				console.log('payload is', payload);
				console.log('payload is', payload.cart_id);
				console.log('payload is', payload.line_items);
				const cartItemsApi = `https://api.bigcommerce.com/stores/${env.STORE_HASH}/v3/carts/${payload.cart_id}/items`;

				const updatedCart = await fetch(cartItemsApi, {
					method: 'POST',
					headers: apiHeaders(env),
					body: JSON.stringify({line_items: payload.line_items}),
				});

				const data = await updatedCart.json();

				return new Response(JSON.stringify(data), {
					status: updatedCart.status,
					headers: {
						...corsHeaders(),
						'Content-Type': 'application/json'
					}
				});

			default:
				return new Response('Not found', { status: 404, headers: corsHeaders() });
		}
	},
};

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*", // Or specify your frontend origin instead of "*"
		"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
	};
}
