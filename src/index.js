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
				const productUrl = `https://api.bigcommerce.com/stores/uri9d2bvwu/v3/catalog/products/${111}`;
				const response = await fetch(productUrl, {
					method: 'GET',
					headers: {
						'X-Auth-Token': env.X_AUTH_TOKEN,
						'X-Auth-Client': env.X_Auth_Client,
						'Content-Type': 'application/json'
					}
				});

				const data = await response.json();

				return new Response(JSON.stringify(data), {
					status: response.status,
					headers: {
						...corsHeaders(),
						'Content-Type': response.headers.get('Content-Type') || 'application/json'
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
